import copy
import json
import os
import tempfile
import threading
import time
import unittest
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from http.server import ThreadingHTTPServer
from pathlib import Path
from dispatch import Policy, Store, GateError, ROOT, run_one, provider_call, handler_for
from commercial_gate import evaluate


class DispatchTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.policy = Policy(ROOT / 'policy.json')
        self.store = Store(Path(self.tmp.name) / 'test.db', self.policy)
        self.task = {'idempotency_key': 'test-001', 'workspace': 'mrl', 'scope': 'review_only',
                     'prompt': 'Review evidence only.', 'source_refs': ['fixture:test-evidence'],
                     'policy_sha256': self.policy.sha256}

    def test_concurrent_idempotency_and_conflict(self):
        with ThreadPoolExecutor(max_workers=8) as pool:
            ids = list(pool.map(lambda _: self.store.submit(self.task), range(20)))
        self.assertEqual(len(set(ids)), 1)
        changed = {**self.task, 'prompt': 'Changed'}
        with self.assertRaisesRegex(GateError, 'IDEMPOTENCY_CONFLICT'):
            self.store.submit(changed)
        self.assertEqual(len(self.store.result(ids[0], 'mrl')['receipts']), 3)

    def test_scope_and_policy_gates(self):
        for changed in ({'scope': 'production'}, {'policy_sha256': 'wrong'}, {'source_refs': []}):
            with self.assertRaises(GateError):
                self.store.submit({**self.task, **changed})

    def test_default_is_blocked_not_fake_success(self):
        task_id = self.store.submit(self.task)
        while run_one(self.store):
            pass
        result = self.store.result(task_id, 'mrl')
        self.assertTrue(result['complete'])
        self.assertEqual({j['status'] for j in result['jobs']}, {'BLOCKED'})
        self.assertTrue(result['chain_valid'])

    def test_concurrent_claim_and_stale_completion(self):
        task_id = self.store.submit(self.task)
        with ThreadPoolExecutor(max_workers=8) as pool:
            claims = [c for c in pool.map(lambda _: self.store.claim(), range(20)) if c]
        self.assertEqual(len(claims), 3)
        self.assertEqual(len({c[1] for c in claims}), 3)
        for _, provider, _ in claims:
            self.store.finish(task_id, provider, 'SUCCEEDED', {'execution_mode': 'TEST_FIXTURE'})
        with self.assertRaisesRegex(GateError, 'STALE_COMPLETION'):
            self.store.finish(task_id, claims[0][1], 'SUCCEEDED', {})
        self.assertTrue(self.store.result(task_id, 'mrl')['chain_valid'])

    def test_crash_recovery_no_resend(self):
        task_id = self.store.submit(self.task)
        claim = self.store.claim()
        self.store.recover()
        status = {j['provider']: j['status'] for j in self.store.result(task_id, 'mrl')['jobs']}
        self.assertEqual(status[claim[1]], 'UNKNOWN')
        with self.assertRaises(GateError):
            self.store.finish(task_id, claim[1], 'SUCCEEDED', {})

    def test_provider_payloads_and_parsers_use_fixture_transport(self):
        self.policy.data.update(live_enabled=True, valid_until_epoch=time.time() + 60,
                                models={p: 'fixture-model' for p in ('openai', 'anthropic', 'gemini')})
        responses = [
          {'id': 'fixture-openai', 'status': 'completed', 'output': [{'content': [{'type': 'output_text', 'text': 'A'}]}]},
          {'id': 'fixture-claude', 'stop_reason': 'end_turn', 'content': [{'type': 'text', 'text': 'B'}]},
          {'responseId': 'fixture-gemini', 'candidates': [{'finishReason': 'STOP', 'content': {'parts': [{'text': 'C'}]}}]}
        ]
        calls = []
        def transport(url, body, headers):
            calls.append((url, body, headers))
            return responses[len(calls)-1]
        with patch.dict(os.environ, {'MRL_POLICY_SHA256': self.policy.sha256,
                                     'OPENAI_API_KEY': 'fixture', 'ANTHROPIC_API_KEY': 'fixture', 'GEMINI_API_KEY': 'fixture'}):
            for p, expected in zip(('openai', 'anthropic', 'gemini'), ('A', 'B', 'C')):
                value = provider_call(p, self.task, self.policy, transport)
                self.assertEqual(value['output'], expected)
            self.assertFalse(calls[0][1]['store'])
            self.assertIn('x-goog-api-key', calls[2][2])
            with self.assertRaisesRegex(GateError, 'PROVIDER_OUTPUT_INCOMPLETE'):
                provider_call('anthropic', self.task, self.policy, lambda *a: {'content': [], 'stop_reason': 'max_tokens'})

    def test_http_workspace_isolation_and_reader_permissions(self):
        task_id = self.store.submit(self.task)
        tokens = {'a'*32: {'role': 'reader', 'workspace': 'mrl'},
                  'b'*32: {'role': 'dispatcher', 'workspace': 'other'}}
        server = ThreadingHTTPServer(('127.0.0.1', 0), handler_for(self.store, tokens))
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        def close():
            server.shutdown(); server.server_close(); worker.join()
        self.addCleanup(close)
        base = 'http://127.0.0.1:' + str(server.server_port)
        for key, method, path, code in [('wrong','GET','/v1/policy',401),
          ('a'*32,'POST','/v1/tasks',403), ('b'*32,'GET','/v1/tasks/'+task_id,404)]:
            with self.assertRaises(HTTPError) as error:
                urlopen(Request(base+path, headers={'x-api-key':key}, method=method))
            self.assertEqual(error.exception.code, code)
        with urlopen(Request(base+'/v1/tasks/'+task_id, headers={'x-api-key':'a'*32})) as response:
            self.assertEqual(json.load(response)['task_id'], task_id)

    def test_commercial_registry_cannot_self_approve(self):
        result = evaluate({'origin_signature': 'MrLiouWord'})
        self.assertEqual(result['check_state'], 'BLOCKED')
        self.assertEqual(result['commercial_state'], 'COMMERCIAL_UNRESOLVED')
        self.assertIn('rights_granted.core_technology', result['missing'])

    def test_receipts_append_only(self):
        self.store.submit(self.task)
        with self.assertRaises(Exception):
            with self.store.connect() as db:
                db.execute('DELETE FROM receipts')


if __name__ == '__main__':
    unittest.main(verbosity=2)
