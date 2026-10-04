import test from 'node:test';
import assert from 'node:assert/strict';
import { runtime, boundedBytes } from '../src/services.mjs';

test('runtime adapter forwards only its own secret and validates upstream model receipt', async t => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url: String(url), options }); return Response.json({ model: 'owner-model', choices: [{ message: { content: 'runtime result' } }], usage: { prompt_tokens: 4, completion_tokens: 2 }, id: 'runtime-receipt' }); };
  const result = await runtime({ MRL_API_BASE_URL: 'https://owner-runtime.example', MRL_RUNTIME_API_KEY: 'runtime-only-test-secret' }, 'generate', { model: 'owner-model', prompt: 'test' });
  assert.equal(result.content, 'runtime result');
  assert.equal(result.upstream_id, 'runtime-receipt');
  assert.equal(calls[0].url, 'https://owner-runtime.example/v1/chat/completions');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer runtime-only-test-secret');
  assert.equal(calls[0].options.redirect, 'error');
  assert.equal(JSON.parse(calls[0].options.body).stream, false);
  globalThis.fetch = async () => Response.json({ ok: true, data: 'stub' });
  await assert.rejects(runtime({ MRL_API_BASE_URL: 'https://owner-runtime.example', MRL_RUNTIME_API_KEY: 'test' }, 'generate', { model: 'owner-model', prompt: 'test' }), /invalid/);
});

test('body limiter counts actual streamed bytes', async () => {
  let canceled = false;
  const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(20)); }, cancel() { canceled = true; } });
  await assert.rejects(boundedBytes(stream, 30), /byte limit/);
  assert.equal(canceled, true);
});
