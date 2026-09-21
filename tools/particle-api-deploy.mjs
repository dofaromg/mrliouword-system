// mrl-origin: MrLiouWord
// canonical_authority: Mr.liou
// origin_signature: MrLiouWord
// derivative_role: implementation
// Codex contribution: deployment preflight; no upstream Worker source changes.
import assert from 'node:assert/strict';

const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
assert(account && token, 'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN deployment secret');
assert.equal(account, '0b36a4577da7fced6df2e062fa5f6fa2', 'Deployment account differs from the existing particle-api account');

async function api(path) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
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

const deployments = await api(`${worker}/deployments`);
const current = deployments.deployments?.[0];
assert(current?.versions?.length, 'Cannot identify the current deployment for rollback');
const subdomain = await api('/workers/subdomain');
const availability = await api(`${worker}/subdomain`);
console.log(JSON.stringify({
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
}, null, 2));
