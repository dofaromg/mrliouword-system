import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';
import { createHash } from 'node:crypto';
import { canonical, MEMORY_ID } from '../src/memory.mjs';

const KEY = 'local-test-owner-key-only';
const bundled = (await build({ entryPoints: [new URL('../src/index.ts', import.meta.url).pathname], bundle: true, format: 'esm', write: false, platform: 'browser' })).outputFiles[0].text;
const script = bundled + `
class Mrliou_TestMemory extends Mrliou_CoreMemory {
  async fetch(request) {
    if (new URL(request.url).pathname === '/__test_storage') {
      const { operation, key, value } = await request.json();
      if (operation === 'put') { await this.storage.put(key, value); return Response.json({}); }
      return Response.json({ value: await this.storage.get(key) });
    }
    return super.fetch(request);
  }
}
export { Mrliou_TestMemory };
`;
const options = root => ({ modules: true, script, compatibilityDate: '2024-12-01', bindings: { MRL_CORE_API_KEY: KEY }, kvNamespaces: ['MRLIOUWORD_VAULT'], r2Buckets: ['MRLIOUBOOK'], durableObjects: { MRL_CORE_MEMORY: { className: 'Mrliou_TestMemory', useSQLite: true } }, kvPersist: join(root, 'kv'), r2Persist: join(root, 'r2'), durableObjectsPersist: join(root, 'do') });
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'Mrliou-core-'));
  let mf = new Miniflare(options(root));
  t.after(async () => { await mf.dispose(); await rm(root, { recursive: true, force: true }); });
  return {
    async request(path, body, headers = {}) {
      const response = await mf.dispatchFetch('https://core.test' + path, { method: body === undefined ? 'GET' : 'POST', headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', ...headers }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) });
      return { status: response.status, body: await response.json() };
    },
    async kv() { return mf.getKVNamespace('MRLIOUWORD_VAULT'); },
    async storage() {
      const ns = await mf.getDurableObjectNamespace('MRL_CORE_MEMORY');
      const stub = ns.get(ns.idFromName(MEMORY_ID));
      const call = async (operation, key, value) => (await (await stub.fetch('https://internal/__test_storage', { method: 'POST', body: JSON.stringify({ operation, key, value }) })).json()).value;
      return { get: key => call('get', key), put: (key, value) => call('put', key, value) };
    },
    async restart() { await mf.dispose(); mf = new Miniflare(options(root)); },
  };
}
const migrateEmpty = f => f.request('/memory/migrate', { writers_paused: true, expected_total: 0, expected_head: '' });
const hash = text => createHash('sha256').update(text).digest('hex');

test('real runtime: no writes before explicit migration; auth and validation fail closed', async t => {
  const f = await fixture(t);
  assert.equal((await f.request('/memory/commit', { content: 'blocked' })).status, 503);
  assert.equal((await f.request('/memory/migrate', { expected_total: 0, expected_head: '' })).status, 400);
  assert.equal((await migrateEmpty(f)).status, 200);
  assert.equal((await f.request('/memory/commit', { content: 'blocked' }, { Authorization: 'Bearer wrong' })).status, 401);
  assert.equal((await f.request('/memory/commit', { content: 123 })).status, 400);
  assert.equal((await f.request('/memory/commit', '{broken')).status, 400);
  assert.equal((await f.request('/memory/stats')).body.total, 0);
});

test('32 concurrent writes produce one intact chain and survive restart', async t => {
  const f = await fixture(t); await migrateEmpty(f);
  const results = await Promise.all(Array.from({ length: 32 }, (_, n) => f.request(n % 2 ? '/memory/commit' : '/api/mrl/memory/commit', { content: 'Mrliou concurrency ' + n, tags: ['test'], metadata: { n }, meta: { n } }, { 'Idempotency-Key': 'parallel-' + n })));
  for (const r of results) assert.equal(r.status, 200, JSON.stringify(r.body));
  const entries = results.map(r => r.body.entry ?? r.body.data).sort((a, b) => a.seq - b.seq);
  let previous = '0'.repeat(64);
  for (const entry of entries) {
    assert.equal(entry.prev, previous);
    const { merkle, ...fields } = entry;
    assert.equal(hash(canonical(fields)), merkle);
    assert.equal(entry.origin_signature, 'MrLiouWord'); previous = merkle;
  }
  await f.restart();
  const stats = await f.request('/memory/stats');
  assert.equal(stats.body.total, 32); assert.equal(stats.body.chainHead, previous);
  assert.equal((await f.request('/memory/verify', {})).body.valid, true);
  const read = await f.request('/memory/recall', { query: entries[0].content, limit: 1 });
  assert.deepEqual(read.body.results[0], entries[0]);
  const traces = await f.request('/api/mrl/audit/traces?limit=32');
  assert.equal(traces.body.data.traces.length, 32);
  assert.equal(traces.body.data.traces[0].merkle, previous);
});

test('retry across restart returns original entry; changed payload with same key is rejected', async t => {
  const f = await fixture(t); await migrateEmpty(f);
  const body = { content: 'one logical operation', metadata: { origin_signature: 'MrLiouWord' } }, headers = { 'Idempotency-Key': 'retry-1' };
  const replies = await Promise.all(Array.from({ length: 8 }, () => f.request('/memory/commit', body, headers)));
  for (const r of replies) assert.deepEqual(r.body, replies[0].body);
  await f.restart();
  assert.deepEqual((await f.request('/memory/commit', body, headers)).body, replies[0].body);
  assert.equal((await f.request('/memory/commit', { content: 'different' }, headers)).status, 409);
  assert.equal((await f.request('/memory/stats')).body.total, 1);
});

async function seedLegacy(f, overrides = {}) {
  // Frozen format from the legacy core source. No regenerated IDs/timestamps/hashes on import.
  const entry = { id: 'legacy-origin-id', content: 'abc', type: 'semantic', simhash: 'e71fa2190541574b', tags: ['legacy'], layer: 'L7', ts: 1737462317939, prev: '0'.repeat(64), meta: { origin_signature: 'MrLiouWord', original: true }, ...overrides };
  entry.merkle = hash(entry.content + entry.simhash + entry.ts + entry.prev);
  const index = [{ id: entry.id, simhash: entry.simhash, tags: entry.tags, layer: entry.layer, ts: entry.ts }];
  const raw = JSON.stringify(entry, null, 2), kv = await f.kv();
  await kv.put('mem:' + entry.id, raw); await kv.put('mem:head', entry.merkle); await kv.put('mem:idx', JSON.stringify(index));
  return { entry, raw, kv, request: { writers_paused: true, expected_total: 1, expected_head: entry.merkle } };
}

test('legacy import preserves bytes and hashes and extends original head', async t => {
  const f = await fixture(t), legacy = await seedLegacy(f);
  const migration = await f.request('/memory/migrate', legacy.request);
  assert.equal(migration.status, 200, JSON.stringify(migration.body));
  assert.equal(await legacy.kv.get('mem:' + legacy.entry.id), legacy.raw);
  assert.equal(await (await f.storage()).get('legacy:' + legacy.entry.id), legacy.raw);
  assert.deepEqual((await f.request('/memory/recall', { query: 'abc', limit: 1 })).body.results[0], legacy.entry);
  const added = await f.request('/memory/commit', { content: 'new generation' });
  assert.equal(added.body.entry.prev, legacy.entry.merkle);
  assert.equal((await f.request('/memory/verify', {})).body.valid, true);
  assert.equal((await f.request('/memory/migrate', legacy.request)).body.already_migrated, true);
  assert.equal((await f.request('/memory/stats')).body.total, 2);
});

test('orphan and invalid legacy records block migration without partial import', async t => {
  const f = await fixture(t), legacy = await seedLegacy(f);
  await legacy.kv.put('mem:orphan', JSON.stringify({ id: 'orphan' }));
  const r = await f.request('/memory/migrate', legacy.request);
  assert.equal(r.status, 409); assert.match(r.body.error, /Orphan/);
  assert.equal(await (await f.storage()).get('checkpoint'), undefined);
  assert.equal(await legacy.kv.get('mem:' + legacy.entry.id), legacy.raw);
});

test('tampered metadata and terminal head are detected by verifier', async t => {
  const f = await fixture(t); await migrateEmpty(f);
  await f.request('/memory/commit', { content: 'protected metadata', metadata: { owner: 'Mr.liou' } });
  const storage = await f.storage(), key = 'seq:0000000000000001';
  const entry = await storage.get(key); entry.meta.owner = 'tampered'; await storage.put(key, entry);
  const checkpoint = await storage.get('checkpoint'); checkpoint.head = 'f'.repeat(64); await storage.put('checkpoint', checkpoint);
  const checked = await f.request('/memory/verify', {});
  assert.equal(checked.body.valid, false);
  assert.ok(checked.body.errors.some(e => e.includes('Hash mismatch')));
  assert.ok(checked.body.errors.includes('Checkpoint head mismatch'));
  assert.equal((await f.request('/memory/commit', { content: 'must not extend a broken head' })).status, 409);
});

test('R2 upload has exact byte readback and real tool result; unknown tool rejected', async t => {
  const f = await fixture(t); await migrateEmpty(f);
  const bytes = 'MrLiouWord 檔案逐 byte 回讀';
  const result = await f.request('/api/mrl/files/upload', bytes, { 'Content-Type': 'text/plain' });
  assert.equal(result.status, 200, JSON.stringify(result.body));
  assert.equal(result.body.data.sha256, hash(bytes));
  assert.equal(result.body.data.size, Buffer.byteLength(bytes));
  assert.equal(result.body.data.readback_verified, true);
  const tool = await f.request('/api/mrl/tools/execute', { tool: 'sha256', arguments: { text: bytes } });
  assert.equal(tool.body.data.result.value, hash(bytes));
  assert.equal((await f.request('/api/mrl/tools/execute', { tool: 'shell' })).status, 404);
  assert.equal((await f.request('/particles')).status, 200);
});

test('persona wake and sleep operate across separate requests; no model inference claim', async t => {
  const f = await fixture(t);
  const wake = await f.request('/wake', { message: '夥伴' });
  assert.equal(wake.body.awakened, true);
  await f.restart();
  assert.equal((await f.request('/sleep', {})).body.success, true);
  assert.equal((await f.request('/persona/list')).body.personas[0].state, 'dormant');
  assert.equal((await f.request('/api/mrl/runtimeos/ai/models')).status, 503);
});
