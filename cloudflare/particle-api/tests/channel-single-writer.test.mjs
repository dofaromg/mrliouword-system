/** MRL_CHANNEL_CORE implementation regression tests. origin_signature: MrLiouWord
 * Source/authority: ../PROVENANCE.yaml; these tests do not redefine the core.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { Miniflare, Log, LogLevel } from 'miniflare';

const built = await build({ entryPoints: ['src/index.ts'], bundle: true, write: false, format: 'esm', target: 'es2022' });
const script = built.outputFiles[0].text;
await mkdir('.wrangler/tests', { recursive: true });
await writeFile('.wrangler/tests/worker.mjs', script);
const { default: worker, Mrliou_ChannelChain } = await import(pathToFileURL(join(process.cwd(), '.wrangler/tests/worker.mjs')));
const KEY = 'local-test-key';
const ZERO = '0'.repeat(64);
const digest = value => createHash('sha256').update(value).digest('hex');

async function setup(t, options = {}) {
  const root = options.root || await mkdtemp(join(tmpdir(), 'mrl-channel-'));
  const workers = ['particle-api', 'edge-a', 'edge-b'].map(name => ({
    name, modules: true, script: options.script || script, compatibilityDate: '2024-01-01',
    kvNamespaces: { MRLIOUWORD_VAULT: 'local-mrl-kv' },
    d1Databases: { DB: 'local-mrl-d1' }, r2Buckets: { PARTICLES: 'local-mrl-r2' },
    bindings: { MASTER_KEY: KEY, MRL_BUILD_SHA: 'a'.repeat(40) },
    ...(options.legacy ? {} : { durableObjects: { MRL_CHANNEL_CHAIN: {
      className: 'Mrliou_ChannelChain', scriptName: 'particle-api', useSQLite: true,
    } } }),
  }));
  const mf = new Miniflare({ workers, log: new Log(LogLevel.ERROR),
    kvPersist: join(root, 'kv'), d1Persist: join(root, 'd1'),
    r2Persist: join(root, 'r2'), durableObjectsPersist: join(root, 'do') });
  let disposed = false;
  const close = async () => { if (!disposed) { disposed = true; await mf.dispose(); } };
  t.after(close);
  const edges = await Promise.all(['particle-api', 'edge-a', 'edge-b'].map(n => mf.getWorker(n)));
  const db = await mf.getD1Database('DB');
  const kv = await mf.getKVNamespace('MRLIOUWORD_VAULT');
  const r2 = await mf.getR2Bucket('PARTICLES');
  let edge = 0;
  const request = async (path, body, headers = {}) => {
    const response = await edges[edge++ % edges.length].fetch(`https://mrl.test${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'X-Master-Key': KEY, 'Content-Type': 'application/json', ...headers },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return { status: response.status, data: await response.json() };
  };
  const rows = async () => (await db.prepare('SELECT rowid, * FROM channel_sync ORDER BY synced_at, rowid').all()).results;
  const initialized = await request('/channel/stats');
  assert.equal(initialized.status, 200, JSON.stringify(initialized));
  return { mf, db, kv, r2, request, rows, root, close };
}

function assertChain(rows) {
  let prev = ZERO;
  const predecessors = new Set();
  for (const row of rows) {
    assert.equal(row.prev, prev, `predecessor of ${row.id}`);
    assert.ok(!predecessors.has(row.prev), 'no sibling records');
    predecessors.add(row.prev);
    const input = row.source === 'r2'
      ? row.key + /^\[R2:(\d+)\]$/.exec(row.value)[1] + row.simhash + row.prev
      : row.key + row.value + row.simhash + row.created_at + row.prev;
    assert.equal(row.merkle, digest(input), `historical hash format for ${row.id}`);
    prev = row.merkle;
  }
}

async function assertVerified(s, count) {
  const rows = await s.rows();
  assert.equal(rows.length, count);
  assertChain(rows);
  const result = await s.request('/channel/verify');
  assert.equal(result.status, 200);
  assert.equal(result.data.valid, true, JSON.stringify(result.data));
  assert.equal(result.data.checked, count);
  assert.equal(result.data.origin_signature, 'MrLiouWord');
  return rows;
}

// Force the main-head implementation through the same real runtime on demand.
// Not part of ordinary CI; records a negative control without storing a copy.
if (process.env.MRL_BASELINE_FILE) {
  test('negative control: baseline emit with DDL-only compatibility normalization forks D1', async t => {
    const source = await readFile(process.env.MRL_BASELINE_FILE, 'utf8');
    // The original exec() multiline DDL fails independently on workerd. Normalize
    // only this setup call so the unchanged main-head emit race can be exercised.
    const normalized = source.replace(/await this\.db\.exec\(`([\s\S]*?)`\);/, (_, sql) =>
      'await this.db.batch([' + sql.split(';').map(s => s.trim()).filter(Boolean).map(s => 'this.db.prepare(' + JSON.stringify(s) + ')').join(',') + ']);');
    assert.notEqual(normalized, source, 'DDL normalization must actually apply');
    const old = await build({ stdin: { contents: normalized, loader: 'ts' }, write: false, format: 'esm' });
    const s = await setup(t, { script: old.outputFiles[0].text, legacy: true });
    const results = await Promise.all(Array.from({ length: 32 }, (_, i) => s.request('/channel/emit', { key: `old-${i}`, value: `value ${i}` })));
    assert.ok(results.every(r => r.status === 200));
    const verification = await s.request('/channel/verify');
    assert.equal(verification.data.valid, false);
    console.log(JSON.stringify({ baseline_requests: results.length, baseline_valid: verification.data.valid, baseline_chain_errors: verification.data.errors.length }));
  });
} else {
  test('96 parallel emits across three Worker instances create one linear chain', async t => {
    const s = await setup(t);
    const results = await Promise.all(Array.from({ length: 96 }, (_, i) => s.request('/channel/emit', { key: `event-${i}`, value: `value ${i}` })));
    assert.ok(results.every(r => r.status === 200), JSON.stringify(results.filter(r => r.status !== 200)));
    const rows = await assertVerified(s, 96);
    assert.deepEqual(new Set(rows.map(r => r.id)), new Set(results.map(r => r.data.entry.id)));
  });

  test('same-key emits retain every row and recall the latest committed version', async t => {
    const s = await setup(t);
    await Promise.all(Array.from({ length: 20 }, (_, i) => s.request('/channel/emit', { key: 'same-key', value: `revision ${i}` })));
    const rows = await assertVerified(s, 20);
    assert.equal(new Set(rows.map(r => r.key)).size, 1);
    const recalled = await s.request('/channel/recall', { key: 'same-key' });
    assert.equal(recalled.data.meta.id, rows.at(-1).id);
    assert.equal(recalled.data.value, rows.at(-1).value);
  });

  test('emit, KV sync, and multi-batch R2 indexing use the same writer', async t => {
    const s = await setup(t);
    for (let i = 0; i < 8; i++) await s.kv.put(`kv-${i}`, `stored ${i}`);
    for (let i = 0; i < 205; i++) await s.r2.put(`r2-${String(i).padStart(3, '0')}`, `object ${i}`);
    const results = await Promise.all([
      s.request('/channel/sync/kv-to-d1', { prefix: 'kv-' }),
      s.request('/channel/sync/r2-index', { prefix: 'r2-' }),
      ...Array.from({ length: 12 }, (_, i) => s.request('/channel/emit', { key: `emit-${i}`, value: 'live' })),
    ]);
    assert.ok(results.every(r => r.status === 200), JSON.stringify(results));
    assert.equal(results[0].data.synced, 8);
    assert.equal(results[1].data.synced, 205);
    await assertVerified(s, 225);
  });

  test('restart resumes the existing D1 head and preserves historical rows byte-for-byte', async t => {
    const first = await setup(t);
    for (let i = 0; i < 4; i++) await first.request('/channel/emit', { key: `before-${i}`, value: 'historical' });
    const before = await first.rows();
    await first.close();
    const next = await setup(t, { root: first.root });
    await Promise.all(Array.from({ length: 16 }, (_, i) => next.request('/channel/emit', { key: `after-${i}`, value: 'new' })));
    const after = await assertVerified(next, 20);
    assert.deepEqual(after.slice(0, before.length), before);
  });

  test('D1 rejection leaves KV untouched and does not poison the queue', async t => {
    const s = await setup(t);
    await s.db.prepare("CREATE TRIGGER fail_emit BEFORE INSERT ON channel_sync WHEN NEW.key = 'reject-me' BEGIN SELECT RAISE(ABORT, 'injected failure'); END;").run();
    const failed = await s.request('/channel/emit', { key: 'reject-me', value: 'must not escape' });
    assert.equal(failed.status, 500);
    assert.equal(await s.kv.get('reject-me'), null);
    assert.equal(await s.kv.get('channel:meta:reject-me'), null);
    assert.equal((await s.rows()).length, 0);
    assert.equal((await s.request('/channel/emit', { key: 'next', value: 'works' })).status, 200);
    await assertVerified(s, 1);
  });

  test('R2 batch failure rolls back its batch, retains earlier batches and resumes from committed head', async t => {
    const s = await setup(t);
    for (let i = 0; i < 105; i++) await s.r2.put(`batch-${String(i).padStart(3, '0')}`, 'object');
    await s.db.prepare("CREATE TRIGGER fail_r2 BEFORE INSERT ON channel_sync WHEN NEW.key = 'batch-102' BEGIN SELECT RAISE(ABORT, 'injected batch failure'); END;").run();
    const failed = await s.request('/channel/sync/r2-index', { prefix: 'batch-' });
    assert.equal(failed.status, 500);
    await assertVerified(s, 100);
    assert.equal((await s.request('/channel/emit', { key: 'after-batch-failure', value: 'recover' })).status, 200);
    await assertVerified(s, 101);
  });

  test('pre-existing sibling history is retained and all new writes fail closed', async t => {
    const s = await setup(t);
    await s.request('/channel/emit', { key: 'first', value: 'history' });
    const first = (await s.rows())[0];
    const merkle = digest('sibling' + 'history' + first.simhash + first.created_at + ZERO);
    await s.db.prepare('INSERT INTO channel_sync (id,key,value,layer,simhash,merkle,prev,source,created_at,synced_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
      .bind('old-sibling', 'sibling', 'history', 'L7', first.simhash, merkle, ZERO, 'kv', first.created_at, first.synced_at).run();
    const before = await s.rows();
    for (const [path, body] of [['/channel/emit', { key: 'blocked', value: 'new' }], ['/channel/sync/kv-to-d1', {}], ['/channel/sync/r2-index', {}]]) {
      const result = await s.request(path, body);
      assert.equal(result.status, 409);
      assert.equal(result.data.error, 'CHANNEL_HISTORY_INVALID');
    }
    assert.deepEqual(await s.rows(), before);
    assert.equal((await s.request('/channel/verify')).data.valid, false);
  });

  test('legacy UNIQUE(key) is reported without rewriting the schema or history', async t => {
    const s = await setup(t);
    await s.db.prepare('CREATE UNIQUE INDEX legacy_key_unique ON channel_sync(key);').run();
    const r = await s.request('/channel/emit', { key: 'legacy', value: 'blocked' });
    assert.equal(r.status, 409);
    assert.equal(r.data.error, 'CHANNEL_LEGACY_UNIQUE_KEY');
    assert.equal((await s.rows()).length, 0);
    assert.ok((await s.db.prepare('PRAGMA index_list(channel_sync)').all()).results.some(i => i.name === 'legacy_key_unique'));
  });

  test('old future timestamp does not reorder a new emit behind the chain head', async t => {
    const s = await setup(t);
    await s.request('/channel/emit', { key: 'future', value: 'clock drift' });
    // Fixture simulates a historical host clock, never applied to remote data.
    await s.db.prepare('UPDATE channel_sync SET synced_at = ?').bind(Date.now() + 86_400_000).run();
    const before = await s.rows();
    await s.request('/channel/emit', { key: 'today', value: 'real timestamp' });
    const rows = await assertVerified(s, 2);
    assert.deepEqual(rows[0], before[0]);
    assert.ok(rows[1].synced_at >= rows[0].synced_at);
    assert.ok(rows[1].created_at < rows[0].synced_at);
  });

  test('KV failure returns the committed receipt; D1-backed recall is consistent', async t => {
    const s = await setup(t);
    const badKV = { get: (...args) => s.kv.get(...args), put: async () => { throw Error('injected KV failure'); } };
    const actor = new Mrliou_ChannelChain({}, { DB: s.db, MRLIOUWORD_VAULT: badKV, PARTICLES: s.r2 });
    const failed = await actor.fetch(new Request('https://mrl.test/channel/emit', { method: 'POST', body: JSON.stringify({ key: 'receipt', value: 'durable' }) }));
    const receipt = await failed.json();
    assert.equal(failed.status, 503);
    assert.equal(receipt.committed, true);
    assert.equal(receipt.kv_sync, false);
    assert.equal((await s.rows())[0].id, receipt.entry.id);
    const recalled = await s.request('/channel/recall', { key: 'receipt' });
    assert.equal(recalled.data.meta.id, receipt.entry.id);
    assert.equal(recalled.data.value, 'durable');
    await s.request('/channel/emit', { key: 'after-kv-failure', value: 'next' });
    await assertVerified(s, 2);
  });

  test('missing DO binding fails closed without a direct-D1 fallback', async () => {
    const response = await worker.fetch(new Request('https://mrl.test/channel/emit', { method: 'POST', body: '{}' }), {});
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'CHANNEL_SINGLE_WRITER_UNAVAILABLE');
  });

  test('auth, public routes, input rejection, response provenance and unknown routes remain compatible', async t => {
    const s = await setup(t);
    const denied = await s.request('/channel/emit', { key: 'unauthorized', value: 'no' }, { 'X-Master-Key': 'wrong' });
    assert.equal(denied.status, 401);
    assert.equal((await s.request('/channel/emit', { key: '', value: 'no' })).status, 400);
    for (const path of ['/', '/status', '/heartbeat']) {
      const r = await s.request(path, undefined, { 'X-Master-Key': '' });
      assert.equal(r.status, 200);
      assert.equal(r.data.origin, 'MrLiouWord');
      assert.equal(r.data.origin_signature, 'MrLiouWord');
    }
    assert.equal((await s.request('/channel/unknown')).status, 404);
    assert.equal((await s.rows()).length, 0);
  });
  test('deployment verifier writes exact-SHA concurrency receipt against the local runtime', async t => {
    const s = await setup(t);
    const url = (await s.mf.ready).origin;
    const receiptPath = join(s.root, 'deployment-receipt.json');
    const { stdout } = await promisify(execFile)(process.execPath, [
      'scripts/verify-channel-deployment.mjs', '--url', url,
      '--expected-sha', 'a'.repeat(40), '--append', '12', '--receipt', receiptPath,
    ], { env: { ...process.env, MRL_MASTER_KEY: KEY } });
    const result = JSON.parse(stdout);
    assert.equal(result.result, 'CHANNEL_DEPLOYMENT_CONCURRENCY_PASS');
    assert.equal(result.concurrent_appends, 12);
    assert.deepEqual(JSON.parse(await readFile(receiptPath, 'utf8')), result);
    await assertVerified(s, 12);
    // Reusing a receipt must fail before sending any request or appending rows.
    const originalReceipt = await readFile(receiptPath, 'utf8');
    await assert.rejects(promisify(execFile)(process.execPath, [
      'scripts/verify-channel-deployment.mjs', '--url', url,
      '--expected-sha', 'a'.repeat(40), '--append', '2', '--receipt', receiptPath,
    ], { env: { ...process.env, MRL_MASTER_KEY: KEY } }), error => {
      const rejected = JSON.parse(error.stdout);
      assert.equal(rejected.result, 'CHANNEL_VERIFICATION_FAIL');
      assert.deepEqual(rejected.operations, []);
      assert.match(rejected.error, /EEXIST/);
      return true;
    });
    assert.equal(await readFile(receiptPath, 'utf8'), originalReceipt);
    await assertVerified(s, 12);
    await assert.rejects(promisify(execFile)(process.execPath, [
      'scripts/verify-channel-deployment.mjs', '--url', url,
      '--expected-sha', 'b'.repeat(40), '--append', '2',
    ], { env: { ...process.env, MRL_MASTER_KEY: KEY } }));
    await assertVerified(s, 12);
  });

  test('deployment verifier accounts for committed writes whose responses are lost or malformed', async t => {
    const s = await setup(t);
    const seen = [];
    // Forward into real workerd/D1, then lose the response after commit. The
    // verifier cannot infer "not committed" from a transport or JSON error.
    const proxy = createServer(async (req, res) => {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const body = raw ? JSON.parse(raw) : undefined;
      const result = await s.request(req.url, body);
      if (req.url === '/channel/emit') {
        seen.push(body.key);
        const index = JSON.parse(body.value).index;
        if (index === 0) { res.destroy(); return; }
        if (index === 1) { res.writeHead(200); res.end('{'); return; }
      }
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.data));
    });
    await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => proxy.close(resolve)));
    const receiptPath = join(s.root, 'uncertain-receipt.json');
    let receipt;
    await assert.rejects(promisify(execFile)(process.execPath, [
      'scripts/verify-channel-deployment.mjs', '--url', `http://127.0.0.1:${proxy.address().port}`,
      '--expected-sha', 'a'.repeat(40), '--append', '3', '--receipt', receiptPath,
    ], { env: { ...process.env, MRL_MASTER_KEY: KEY } }), error => {
      receipt = JSON.parse(error.stdout);
      assert.equal(receipt.result, 'CHANNEL_VERIFICATION_FAIL');
      return true;
    });
    assert.deepEqual(JSON.parse(await readFile(receiptPath, 'utf8')), receipt);
    await assertVerified(s, 3);
    assert.equal(seen.length, 3, 'no implicit retries after uncertain commits');
    const attempts = receipt.operations.filter(op => op.path === '/channel/emit');
    assert.equal(attempts.length, 3, 'every attempted write must survive transport failures');
    assert.deepEqual(new Set(attempts.map(op => op.key)), new Set(seen));
    const failed = attempts.filter(op => op.outcome === 'failed');
    assert.equal(failed.length, 2);
    assert.ok(failed.every(op => op.commit_state === 'unknown' && op.error));
    assert.equal(attempts.filter(op => op.outcome === 'succeeded').length, 1);
    assert.ok(attempts.every(op => op.started_at && op.finished_at));
    assert.ok(!JSON.stringify(receipt).includes(KEY), 'credentials stay out of receipts');
  });

  test('unavailable DO returns a provenance-bearing 503 and never touches D1', async () => {
    const response = await worker.fetch(new Request('https://mrl.test/channel/emit', { method: 'POST', body: '{}' }), {
      MRL_CHANNEL_CHAIN: { idFromName: () => 'id', get: () => ({ fetch: async () => { throw Error('unavailable'); } }) },
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).origin_signature, 'MrLiouWord');
  });

  test('R2 cursor continues after 1000 objects and an intervening emit', async t => {
    const s = await setup(t);
    for (let i = 0; i < 1001; i++) await s.r2.put(`page-${String(i).padStart(4, '0')}`, 'object');
    const first = await s.request('/channel/sync/r2-index', { prefix: 'page-' });
    assert.equal(first.status, 200);
    assert.equal(first.data.synced, 1000);
    assert.equal(first.data.truncated, true);
    assert.ok(first.data.cursor);
    const middle = await s.request('/channel/emit', { key: 'between-pages', value: 'live' });
    assert.equal(middle.status, 200);
    const next = await s.request('/channel/sync/r2-index', { prefix: 'page-', cursor: first.data.cursor });
    assert.equal(next.status, 200);
    assert.equal(next.data.synced, 1);
    assert.equal(next.data.truncated, false);
    const rows = await assertVerified(s, 1002);
    assert.equal(new Set(rows.filter(r => r.source === 'r2').map(r => r.key)).size, 1001);
  });

  test('late actor write is fenced when the D1 head changes before commit', async t => {
    const s = await setup(t);
    let injected = false;
    const db = {
      batch: (...args) => s.db.batch(...args),
      prepare(sql) {
        const statement = s.db.prepare(sql);
        if (!sql.startsWith('INSERT INTO channel_sync')) return statement;
        return { bind(...values) {
          const bound = statement.bind(...values);
          return { async run() {
            if (!injected) {
              injected = true;
              assert.equal((await s.request('/channel/emit', { key: 'new-actor', value: 'committed first' })).status, 200);
            }
            return bound.run();
          } };
        } };
      },
    };
    const oldActor = new Mrliou_ChannelChain({}, { DB: db, MRLIOUWORD_VAULT: s.kv, PARTICLES: s.r2 });
    const response = await oldActor.fetch(new Request('https://mrl.test/channel/emit', {
      method: 'POST', body: JSON.stringify({ key: 'late-actor', value: 'must not fork' }),
    }));
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error, 'CHANNEL_HEAD_CHANGED');
    assert.equal(await s.kv.get('late-actor'), null);
    await assertVerified(s, 1);
  });

}
