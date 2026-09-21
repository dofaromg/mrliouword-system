// mrl-origin: MrLiouWord
// canonical_authority: Mr.liou
// origin_signature: MrLiouWord
// derivative_role: implementation
// Codex contribution: deployment and verification; no upstream Worker source changes.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
assert(account && token, 'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN deployment secret');
assert.equal(account, '0b36a4577da7fced6df2e062fa5f6fa2', 'Deployment account differs from the existing particle-api account');

async function api(path, payload) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
    method: payload ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.json();
  // Never log raw settings, plain-text vars, secret values, or response bodies.
  assert(response.ok && body.success, `Cloudflare ${path}: HTTP ${response.status}; error codes ${body.errors?.map(e => e.code).join(',')}`);
  return body.result;
}

const worker = '/workers/scripts/particle-api';
const settings = await api(`${worker}/settings`);
const bindings = settings.bindings ?? [];
const expected = [
  { name: 'MRLIOUWORD_VAULT', type: 'kv_namespace', namespace_id: '01275832766148bfbcaa00ee4aeb9946' },
  { name: 'DB', type: 'd1', id: '7980baaf-48d3-43cc-8be7-dd8c9590f3d1' },
  { name: 'PARTICLES', type: 'r2_bucket', bucket_name: 'mrlioubook' },
];
for (const binding of expected) {
  const actual = bindings.find(b => b.name === binding.name);
  assert(actual && Object.entries(binding).every(([key, value]) => actual[key] === value), `Existing ${binding.name} binding differs from imported source configuration`);
}
assert(bindings.some(b => b.name === 'MASTER_KEY' && b.type === 'secret_text'), 'Existing MASTER_KEY secret binding is required to preserve private API access');
assert(bindings.every(b => expected.some(e => e.name === b.name) || ['plain_text', 'secret_text', 'json'].includes(b.type)), 'Additional resource bindings require configuration reconciliation before deployment');

// The imported append-only INSERT implementation is incompatible with old key UNIQUE schemas.
// Read only the index schema; never select, log, migrate, or delete stored user records.
const indexes = await api('/d1/database/7980baaf-48d3-43cc-8be7-dd8c9590f3d1/query', { sql: "PRAGMA index_list('channel_sync')" });
assert(indexes[0]?.success && Array.isArray(indexes[0]?.results), 'Cannot verify existing D1 indexes');
for (const index of indexes[0]?.results ?? []) {
  if (!index.unique) continue;
  const safeName = String(index.name).replaceAll("'", "''");
  const columns = await api('/d1/database/7980baaf-48d3-43cc-8be7-dd8c9590f3d1/query', { sql: `PRAGMA index_info('${safeName}')` });
  assert(columns[0]?.success && Array.isArray(columns[0]?.results), 'Cannot verify existing D1 index columns');
  assert(!columns[0]?.results?.some(c => c.name === 'key'), 'Existing channel_sync key UNIQUE constraint needs an append-only migration before deployment');
}

const deployments = await api(`${worker}/deployments`);
const current = deployments.deployments?.[0];
assert(current?.versions?.length, 'Cannot identify the current deployment for rollback');
const subdomain = await api('/workers/subdomain');
const availability = await api(`${worker}/subdomain`);
assert(availability.enabled && /^[a-z0-9-]+$/.test(subdomain.subdomain), 'Existing workers.dev endpoint is unavailable for verification; do not change routing');
const receipt = {
  stage: 'preflight', source_commit: process.env.GITHUB_SHA,
  worker: 'particle-api', binding_match: true, master_key_present: true,
  compatibility_date: settings.compatibility_date,
  compatibility_flags: settings.compatibility_flags,
  binding_types: bindings.map(b => ({ name: b.name, type: b.type })),
  current_deployment: { id: current.id, versions: current.versions },
  workers_dev_enabled: availability.enabled,
  workers_dev_hostname: subdomain.subdomain ? `particle-api.${subdomain.subdomain}.workers.dev` : null,
  canonical_authority: 'Mr.liou', origin_signature: 'MrLiouWord',
  deployed: false,
};
console.log(JSON.stringify(receipt, null, 2));
if (process.argv.includes('--preflight')) process.exit(0);

const workdir = resolve('cloudflare/particle-api');
const temporary = mkdtempSync(join(tmpdir(), 'particle-deploy-'));
const configPath = join(temporary, 'wrangler.json');
const outputPath = join(temporary, 'wrangler-output.jsonl');
const provenance = readFileSync(join(workdir, 'PROVENANCE.yaml'), 'utf8');
assert(/^canonical_authority: Mr\.liou$/m.test(provenance));
assert(/^origin_signature: MrLiouWord$/m.test(provenance));
assert(/^derivative_role: implementation$/m.test(provenance));
// Use the live compatibility settings and retain all dashboard vars/secrets.
// Versions upload/deploy does not rewrite custom domains, routes, or triggers.
const config = {
  name: 'particle-api', main: join(workdir, 'src/index.ts'),
  compatibility_date: settings.compatibility_date,
  compatibility_flags: settings.compatibility_flags ?? [],
  kv_namespaces: [{ binding: 'MRLIOUWORD_VAULT', id: expected[0].namespace_id }],
  d1_databases: [{ binding: 'DB', database_name: 'mrliouword-db', database_id: expected[1].id }],
  r2_buckets: [{ binding: 'PARTICLES', bucket_name: 'mrlioubook' }],
  ...(settings.limits ? { limits: settings.limits } : {}),
  ...(settings.placement ? { placement: settings.placement } : {}),
};
assert(config.compatibility_date, 'Missing current compatibility date');
writeFileSync(configPath, JSON.stringify(config));
const wrangler = process.env.PARTICLE_WRANGLER;
assert(wrangler, 'PARTICLE_WRANGLER must point to the pinned Wrangler executable');
const label = `source=${process.env.GITHUB_SHA};run=${process.env.GITHUB_RUN_ID}`;
assert(/^[0-9a-f]{40}$/.test(process.env.GITHUB_SHA ?? ''), 'Exact source commit is required');
const upload = spawnSync(wrangler, ['versions', 'upload', '--config', configPath, '--keep-vars', '--message', label], {
  cwd: workdir, stdio: 'inherit',
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_OUTPUT_FILE_PATH: outputPath },
});
assert.equal(upload.status, 0, 'Worker version upload failed; live deployment unchanged');
const outputs = readFileSync(outputPath, 'utf8').trim().split('\n').map(line => JSON.parse(line));
const uploaded = outputs.filter(row => row.type === 'version-upload');
assert.equal(uploaded.length, 1, 'Cannot unambiguously identify uploaded version');
const version = uploaded[0].version_id;
assert(/^[0-9a-f-]{36}$/.test(version ?? ''), 'Invalid uploaded version ID');
const versionDetails = await api(`${worker}/versions/${version}`);
assert.equal(versionDetails.annotations?.['workers/message'], label, 'Uploaded version source does not match');
const beforeSwitch = (await api(`${worker}/deployments`)).deployments?.[0];
assert.equal(beforeSwitch?.id, current.id, 'Another deployment occurred; leave traffic unchanged');
const deployed = await api(`${worker}/deployments`, {
  strategy: 'percentage', versions: [{ version_id: version, percentage: 100 }],
  annotations: { 'workers/message': label },
});

async function verify() {
  const active = (await api(`${worker}/deployments`)).deployments?.[0];
  assert.equal(active?.id, deployed.id);
  assert.deepEqual(active.versions, [{ version_id: version, percentage: 100 }]);
  const results = [];
  for (const path of ['/', '/heartbeat', '/status', '/memory/stats']) {
    const response = await fetch(`https://${receipt.workers_dev_hostname}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    const body = await response.json();
    assert.equal(response.status, path === '/memory/stats' ? 401 : 200, `Unexpected HTTP status at ${path}`);
    assert.equal(body.origin_signature, 'MrLiouWord', `Origin signature mismatch at ${path}`);
    assert.equal(body.origin, 'MrLiouWord', `Origin mismatch at ${path}`);
    if (path === '/' || path === '/status') assert.equal(body.version, '3.0.0');
    // Do not publish memory counts, persona state, chain heads, or private response bodies.
    results.push({ path, http_status: response.status, origin_signature_valid: true });
  }
  return results;
}

let failure;
for (let attempt = 0; attempt < 3; attempt++) {
  try {
    receipt.endpoints = await verify();
    failure = undefined;
    break;
  } catch (error) {
    failure = error;
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
if (failure) {
  const latest = (await api(`${worker}/deployments`)).deployments?.[0];
  if (latest?.id === deployed.id) {
    const rollback = await api(`${worker}/deployments`, {
      strategy: 'percentage', versions: current.versions,
      annotations: { 'workers/message': `Rollback failed verification: ${label}` },
    });
    console.error(JSON.stringify({ verification: 'failed', rollback_deployment: rollback.id }));
  }
  throw failure;
}
Object.assign(receipt, { stage: 'verified', deployed: true, deployment_id: deployed.id, version_id: version });
writeFileSync(process.env.PARTICLE_RECEIPT_PATH || 'particle-api-deployment-receipt.json', JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt, null, 2));
