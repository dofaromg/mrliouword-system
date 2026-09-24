#!/usr/bin/env node
// Read-only, redacted endpoint evidence. No POST, no test records, no token output.
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

const target = process.argv[2];
const output = process.argv[3];
if (!target || !output) {
  console.error('Usage: node verify-public.mjs https://<exact-worker-host>/ evidence.json');
  process.exit(2);
}
const base = new URL(target);
if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/') {
  throw new Error('Expected an HTTPS origin with a root path');
}

const paths = ['/', '/health', '/status', '/memory/stats', '/particles', '/frequencies',
  '/persona/list', '/persona/registry', '/api/mrl/runtimeos/ai/models', '/api/mrl/audit/traces'];
const receipt = {
  schema: 'MRL_CORE_PUBLIC_READONLY_RECEIPT_v1', origin_signature: 'MrLiouWord',
  observed_at: new Date().toISOString(), target_origin: base.origin,
  method: 'GET', paths: [],
  limitations: ['No writes were attempted', 'Worker URL does not establish a deployment or commit ID',
    'A 200 response alone cannot prove model inference, persistence, or audit integrity'],
};
const secret = process.env.MRL_CORE_API_KEY;
for (const path of paths) {
  const entry = { path, method: 'GET', verdict: 'UNVERIFIED' };
  try {
    const response = await fetch(new URL(path, base), {
      headers: secret ? { Authorization: `Bearer ${secret}` } : {},
      signal: AbortSignal.timeout(12000), redirect: 'manual',
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    entry.status = response.status;
    entry.content_type = response.headers.get('content-type')?.split(';')[0] ?? null;
    entry.sha256 = createHash('sha256').update(bytes).digest('hex');
    entry.size_bytes = bytes.length;
    let body;
    try { body = JSON.parse(bytes.toString('utf8')); } catch { /* challenge or non-JSON */ }
    if (body && typeof body === 'object') {
      entry.origin_matches = body.origin === 'MrLiouWord' || body.origin_signature === 'MrLiouWord';
      if (path === '/') {
        entry.version = body.version ?? null;
        entry.declared_endpoints = Array.isArray(body.endpoints) ? body.endpoints.length : null;
      }
      if (body.ok === true && /stub|尚未完整實作|尚未完整|請設定|請配置/.test(JSON.stringify(body))) {
        entry.verdict = 'FALSE_SUCCESS_STUB';
      } else if (response.status === 503 && body.ok === false && entry.origin_matches) {
        entry.verdict = 'FAIL_CLOSED_UNAVAILABLE';
      } else if (response.status === 401 && entry.origin_matches) {
        entry.verdict = 'AUTH_GUARDED';
      } else if (response.ok && entry.origin_matches) {
        entry.verdict = 'RESPONSE_ONLY';
      }
    }
  } catch (error) {
    entry.transport_error = error?.name ?? 'NetworkError';
  }
  receipt.paths.push(entry);
}
receipt.coverage = {
  expected_get_paths: paths.length, observed_get_paths: receipt.paths.filter(p => p.status).length,
  verified_full_20_endpoint_cycle: false,
};
await writeFile(output, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
console.log(`Receipt saved: ${output}; inspected ${receipt.coverage.observed_get_paths}/${paths.length} GET responses`);
