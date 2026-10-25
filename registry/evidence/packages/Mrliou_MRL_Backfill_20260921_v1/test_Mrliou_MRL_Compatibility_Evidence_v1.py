import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from Mrliou_MRL_Compatibility_Evidence_v1 import EvidenceError, canonical_hash, verify


class EvidenceGateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        context = {"source": {"repository": "fixture/runtime", "commit": "1" * 40,
                              "license_ref": "fixture-only"}, "artifact_sha256": "2" * 64,
                   "hardware": {"host_id": "TEST_FIXTURE_NOT_HARDWARE", "gpu": "fixture",
                                "architecture": "fixture", "driver": "fixture", "runtime_sdk": "fixture"},
                   "operation": {"name": "fixture_op", "backend": "fixture", "dtype": "f32",
                                 "shape": [2, 2], "parameters": {}}}
        self.digest = canonical_hash(context)
        self.events = [{"id": 1, "kind": "begin", "kernel": "fixture"},
                       {"id": 1, "kind": "done", "kernel": "fixture"}]
        self.r = {"schema": "Mrliou_MRL_Compatibility_Observation_v1", "observation_kind": "fixture",
                  "context": context, "context_sha256": self.digest, "numeric_tolerance": 1e-5,
                  "trace": self.write("trace.json", {"context_sha256": self.digest, "events": self.events}),
                  "result": self.write("result.json", {"context_sha256": self.digest, "exit_code": 0,
                             "max_abs": 0, "reference_sha256": "3" * 64, "output_sha256": "3" * 64})}

    def write(self, name, obj):
        raw = json.dumps(obj).encode()
        (self.root / name).write_bytes(raw)
        return {"path": name, "sha256": hashlib.sha256(raw).hexdigest()}

    def test_consistent_fixture_never_becomes_hardware_acceptance(self):
        result = verify(self.r, self.root)
        self.assertEqual(result["consistency"], "PASS")
        self.assertEqual(result["hardware_acceptance"], "OPEN")

    def test_digest_tamper(self):
        (self.root / "trace.json").write_text("{}")
        with self.assertRaisesRegex(EvidenceError, "digest mismatch"):
            verify(self.r, self.root)

    def test_exit_zero_without_trace(self):
        self.r["trace"] = self.write("trace.json", {"context_sha256": self.digest, "events": []})
        with self.assertRaisesRegex(EvidenceError, "trace missing"):
            verify(self.r, self.root)

    def test_equal_counts_with_duplicate_id_rejected(self):
        events = [self.events[0], self.events[0], self.events[1], self.events[1]]
        self.r["trace"] = self.write("trace.json", {"context_sha256": self.digest, "events": events})
        with self.assertRaisesRegex(EvidenceError, "duplicate begin"):
            verify(self.r, self.root)

    def test_cross_context_trace(self):
        self.r["trace"] = self.write("trace.json", {"context_sha256": "4" * 64, "events": self.events})
        with self.assertRaisesRegex(EvidenceError, "scope binding mismatch"):
            verify(self.r, self.root)

    def test_error_event(self):
        events = copy.deepcopy(self.events)
        events[1]["kind"] = "sync-error"
        self.r["trace"] = self.write("trace.json", {"context_sha256": self.digest, "events": events})
        with self.assertRaisesRegex(EvidenceError, "trace error"):
            verify(self.r, self.root)

    def test_boolean_success_rejected(self):
        result = json.loads((self.root / "result.json").read_text())
        result["exit_code"] = False
        self.r["result"] = self.write("result.json", result)
        with self.assertRaisesRegex(EvidenceError, "process failed"):
            verify(self.r, self.root)

    def test_nan_error_rejected(self):
        result = json.loads((self.root / "result.json").read_text())
        result["max_abs"] = float("nan")
        self.r["result"] = self.write("result.json", result)
        with self.assertRaisesRegex(EvidenceError, "numerical error"):
            verify(self.r, self.root)

    def test_missing_exact_commit(self):
        self.r["context"]["source"]["commit"] = "main"
        with self.assertRaisesRegex(EvidenceError, "exact source commit"):
            verify(self.r, self.root)

    def test_path_escape(self):
        self.r["trace"]["path"] = "../trace.json"
        with self.assertRaisesRegex(EvidenceError, "escapes root"):
            verify(self.r, self.root)

    def test_kernel_pair_mismatch(self):
        events = copy.deepcopy(self.events)
        events[1]["kernel"] = "wrong"
        self.r["trace"] = self.write("trace.json", {"context_sha256": self.digest, "events": events})
        with self.assertRaisesRegex(EvidenceError, "kernel mismatch"):
            verify(self.r, self.root)

    def test_unfinished_trace(self):
        self.r["trace"] = self.write("trace.json", {"context_sha256": self.digest, "events": self.events[:1]})
        with self.assertRaisesRegex(EvidenceError, "unfinished"):
            verify(self.r, self.root)


if __name__ == "__main__":
    unittest.main()
