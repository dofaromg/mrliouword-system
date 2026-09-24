import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { webcrypto } from 'node:crypto';

globalThis.crypto ??= webcrypto;
const bundle = await build({ entryPoints: [new URL('./src/index.ts', import.meta.url).pathname], bundle: true, format: 'esm', write: false, platform: 'browser' });
const source = bundle.outputFiles[0].text;
const worker = (await import(`data:text/javascript,${encodeURIComponent(source)}`)).default;
const vault = {
  values: new Map(),
  async get(key) { return this.values.get(key) ?? null; },
  async put(key, value) { this.values.set(key, value); },
  async delete(key) { this.values.delete(key); },
};

async function request(path, options = {}, env = {}) {
  const response = await worker.fetch(new Request(`https://worker.example${path}`, options), {
    MRLIOUWORD_VAULT: vault, ...env,
  });
  return { status: response.status, body: await response.json() };
}

test('public metadata and health retain owner origin', async () => {
  const root = await request('/');
  assert.equal(root.status, 200);
  assert.equal(root.body.origin, 'MrLiouWord');
  assert.equal(root.body.endpoints.length, 22);
  assert.equal(root.body.capability_state['runtimeos/ai'], 'unavailable');
  assert.equal((await request('/health')).body.origin_signature, 'MrLiouWord');
});

test('private reads and writes fail closed without an owner key', async () => {
  for (const [path, method] of [['/status', 'GET'], ['/memory/stats', 'GET'], ['/memory/commit', 'POST'], ['/persona/registry', 'GET']]) {
    const r = await request(path, { method });
    assert.equal(r.status, 503, path);
    assert.equal(r.body.ok, false);
  }
  assert.equal(vault.values.size, 0);
});

test('wrong key cannot write and valid key reveals unavailable stubs', async () => {
  const env = { MRL_CORE_API_KEY: 'owner-only-secret' };
  const wrong = await request('/memory/commit', { method: 'POST', headers: { Authorization: 'Bearer wrong' }, body: JSON.stringify({ content: 'probe' }) }, env);
  assert.equal(wrong.status, 401);
  assert.equal(vault.values.size, 0);
  const headers = { Authorization: 'Bearer owner-only-secret' };
  for (const [path, method] of [['/api/mrl/runtimeos/ai/models', 'GET'], ['/api/mrl/runtimeos/ai/generate', 'POST'], ['/api/mrl/files/upload', 'POST'], ['/api/mrl/audit/traces', 'GET']]) {
    const r = await request(path, { method, headers, ...(method === 'POST' ? { body: '{}' } : {}) }, env);
    assert.equal(r.status, 503, path);
    assert.equal(r.body.ok, false);
    assert.equal(r.body.origin_signature, 'MrLiouWord');
  }
  for (const [path, method] of [['/particles', 'GET'], ['/memory/stats', 'GET']]) {
    const r = await request(path, { method, headers, ...(method === 'POST' ? { body: '{}' } : {}) }, env);
    assert.equal(r.status, 503, path);
    assert.equal(r.body.ok, false);
  }
});

