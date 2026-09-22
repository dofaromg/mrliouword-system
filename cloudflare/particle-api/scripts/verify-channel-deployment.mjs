/** Deployment receipt for MRL_CHANNEL_CORE adapter; origin_signature: MrLiouWord.
 * Read-only by default. --append N creates permanent, explicitly named test
 * events; it never deletes history and never retries uncertain writes.
 * Source/authority: ../PROVENANCE.yaml.
 */
import { createHash, randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const args = process.argv.slice(2);
function option(name) { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; }
const receipt = {
  canonical_authority: 'Mr.liou', origin_signature: 'MrLiouWord',
  verification_status: 'partial', started_at: new Date().toISOString(),
  scope: 'Channel single-writer deployment', operations: [],
};
const sha256 = value => createHash('sha256').update(value).digest('hex');
const output = option('--receipt');
let failure;
try {
  const url = new URL(option('--url') || process.env.MRL_CHANNEL_URL);
  assert.ok(!url.username && !url.password && !url.search && !url.hash && url.pathname === '/', 'URL must be a bare origin');
  assert.ok(url.protocol === 'https:' || (url.protocol === 'http:' && ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)), 'HTTPS is required outside loopback');
  const expected = option('--expected-sha');
  const preflight = args.includes('--preflight');
  const count = Number(option('--append') || 0);
  assert.ok(Number.isInteger(count) && count >= 0 && count <= 100, '--append must be between 1 and 100');
  assert.ok(!preflight || count === 0, 'preflight cannot append');
  assert.ok(preflight || /^[a-f0-9]{40}$/.test(expected || ''), 'exact --expected-sha is required');
  const key = process.env.MRL_MASTER_KEY;
  assert.ok(key, 'MRL_MASTER_KEY must be supplied through the environment');
  receipt.origin = url.origin;
  receipt.expected_sha = expected || null;
  async function call(path, body) {
    const response = await fetch(new URL(path, url), {
      method: body === undefined ? 'GET' : 'POST', redirect: 'manual',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': key },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30_000),
    });
    const raw = await response.text();
    receipt.operations.push({ path, http_status: response.status, response_sha256: sha256(raw) });
    assert.ok(![301, 302, 303, 307, 308].includes(response.status), 'redirect rejected; credentials were not forwarded');
    const data = JSON.parse(raw);
    assert.equal(data.origin_signature, 'MrLiouWord');
    if (body?.key) receipt.operations.at(-1).key = body.key;
    if (data.entry) receipt.operations.at(-1).entry = data.entry;
    if (data.committed !== undefined) receipt.operations.at(-1).committed = data.committed;
    assert.equal(response.status, 200, `HTTP ${response.status}: ${data.error || 'request failed'}; inspect receipts before any retry`);
    return data;
  }
  const before = await call('/channel/verify');
  assert.equal(before.valid, true, 'existing chain must verify before any append');
  const stats = await call('/channel/stats');
  receipt.before = { verify: before, stats };
  if (!preflight) {
    assert.equal(stats.single_writer?.class_name, 'Mrliou_ChannelChain');
    assert.equal(stats.single_writer?.object_name, 'MRL_API_Gateway:channel_sync:v1');
    assert.equal(stats.single_writer?.build_sha, expected, 'live build must match exact expected SHA');
  }
  if (count) {
    const prefix = `Mrliou:${randomUUID()}:`;
    receipt.test_prefix = prefix;
    // All requests are accounted for even if one fails. No implicit retries.
    const results = await Promise.allSettled(Array.from({ length: count }, (_, i) => call('/channel/emit', {
      key: `${prefix}${i}`, value: JSON.stringify({ origin_signature: 'MrLiouWord', purpose: 'single-writer-concurrency-validation', expected_sha: expected, index: i }),
    })));
    const failures = results.filter(r => r.status === 'rejected');
    receipt.failed_requests = failures.map(r => String(r.reason));
    receipt.accepted_ids = results.filter(r => r.status === 'fulfilled').map(r => r.value.entry.id);
    const after = await call('/channel/verify');
    receipt.after = after;
    assert.equal(failures.length, 0, 'some appends did not return an unambiguous success; do not retry blindly');
    assert.equal(after.valid, true);
    assert.equal(after.checked, before.checked + count, 'run in a quiescent window so every appended row is accounted for');
    const { results: rows } = await call('/channel/stream', { prefix, limit: count + 1 });
    assert.equal(rows.length, count);
    assert.equal(new Set(rows.map(r => r.id)).size, count);
    assert.equal(new Set(rows.map(r => r.prev)).size, count, 'no sibling predecessors');
    assert.deepEqual(new Set(rows.map(r => r.id)), new Set(receipt.accepted_ids));
    for (const row of rows) assert.equal(row.merkle, sha256(row.key + row.value + row.simhash + row.created_at + row.prev));
    receipt.rows_sha256 = sha256(JSON.stringify(rows));
    receipt.concurrent_appends = count;
  }
  receipt.verification_status = 'verified';
  receipt.result = preflight ? 'READ_ONLY_CHAIN_PREFLIGHT_PASS' : count ? 'CHANNEL_DEPLOYMENT_CONCURRENCY_PASS' : 'CHANNEL_DEPLOYMENT_READ_ONLY_PASS';
} catch (e) {
  failure = e;
  receipt.result = 'CHANNEL_VERIFICATION_FAIL';
  receipt.error = String(e);
} finally {
  receipt.finished_at = new Date().toISOString();
  const text = JSON.stringify(receipt, null, 2) + '\n';
  if (output) await writeFile(output, text, { flag: 'wx' });
  process.stdout.write(text);
}
if (failure) process.exitCode = 1;
