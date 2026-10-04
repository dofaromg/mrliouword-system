// Explicitly authorized one-record write. Never auto-retry a timed-out POST.
import { writeFile } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { canonical } from './src/memory.mjs';
const [target, output, consent] = process.argv.slice(2);
if (!target || !output || consent !== '--write') throw new Error('Usage: node verify-write.mjs HTTPS_ORIGIN RECEIPT.json --write');
const base = new URL(target), key = process.env.MRL_CORE_API_KEY;
if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/') throw new Error('Exact HTTPS origin required');
if (!key) throw new Error('MRL_CORE_API_KEY environment secret required');
const hash = text => createHash('sha256').update(text).digest('hex');
const receipt = { schema: 'Mrliou_CORE_WRITE_RECEIPT_v1', origin_signature: 'MrLiouWord', target: base.origin, probe_id: 'Mrliou_Write_' + randomUUID(), started_at: new Date().toISOString(), events: [], result: 'UNVERIFIED' };
async function request(path, body, headers = {}) {
  const event = { path, method: body === undefined ? 'GET' : 'POST', at: new Date().toISOString() }; receipt.events.push(event);
  const encoded = body === undefined ? undefined : JSON.stringify(body);
  if (encoded) event.request_sha256 = hash(encoded);
  try {
    const response = await fetch(new URL(path, base), { method: event.method, redirect: 'error', signal: AbortSignal.timeout(30000), headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...headers }, body: encoded });
    const raw = await response.text(); event.status = response.status; event.response_sha256 = hash(raw);
    const value = JSON.parse(raw); event.response = value;
    if (!response.ok) throw new Error('HTTP ' + response.status + ' at ' + path);
    return value;
  } catch (error) { event.error = error.message; throw error; }
}
try {
  const before = await request('/memory/stats');
  const content = JSON.stringify({ record_kind: 'owner_authorized_verification', probe_id: receipt.probe_id, origin_signature: 'MrLiouWord' });
  const payload = { content, type: 'audit_verification', tags: ['test', receipt.probe_id], metadata: { canonical_authority: 'Mr.liou', origin_signature: 'MrLiouWord', record_kind: 'test' } };
  receipt.request = payload;
  const write = await request('/memory/commit', payload, { 'Idempotency-Key': receipt.probe_id });
  const entry = write.entry;
  const read = await request('/memory/recall', { query: content, limit: 100 });
  const after = await request('/memory/stats');
  const verification = await request('/memory/verify', {});
  const { merkle, ...fields } = entry;
  const computed = entry.hash_version === 2 ? hash(canonical(fields)) : hash(entry.content + entry.simhash + entry.ts + entry.prev);
  receipt.checks = {
    exact_content: entry.content === content,
    exact_readback: read.results.some(item => canonical(item) === canonical(entry)),
    hash_matches: computed === merkle,
    previous_head_matches: entry.prev === (before.chainHead || '0'.repeat(64)),
    count_increment: after.total === before.total + 1,
    head_matches: after.chainHead === merkle,
    chain_valid: verification.valid === true && verification.errors.length === 0,
  };
  receipt.result = Object.values(receipt.checks).every(Boolean) ? 'WRITE_READBACK_CHAIN_PASS' : 'WRITE_VERIFICATION_FAIL';
} catch (error) { receipt.result = 'WRITE_NOT_FULLY_VERIFIED'; receipt.error = error.message; }
finally {
  receipt.finished_at = new Date().toISOString();
  await writeFile(output, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
}
console.log(JSON.stringify({ result: receipt.result, probe_id: receipt.probe_id, receipt: output }));
if (receipt.result !== 'WRITE_READBACK_CHAIN_PASS') process.exitCode = 1;
