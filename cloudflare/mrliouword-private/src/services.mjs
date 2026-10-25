// origin_signature: MrLiouWord; external names are interface/provenance only.
import { sha256, simhash64 } from './memory.mjs';
const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };

export async function boundedBytes(stream, maximum) {
  if (!stream) fail('Request body is required');
  const reader = stream.getReader(), chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); fail('Body exceeds configured byte limit', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}

export async function runtime(env, operation, body) {
  if (!env.MRL_API_BASE_URL || !env.MRL_RUNTIME_API_KEY) fail('Owner runtime URL and credential are not configured', 503);
  const base = new URL(env.MRL_API_BASE_URL);
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) fail('Runtime URL must be HTTPS without embedded credentials, query or fragment', 503);
  const target = new URL(base.href.replace(/\/$/, '') + (operation === 'models' ? '/v1/models' : '/v1/chat/completions'));
  let payload;
  if (operation === 'generate') {
    if (typeof body.model !== 'string' || !body.model) fail('model is required');
    const messages = body.messages ?? (typeof body.prompt === 'string' ? [{ role: 'user', content: body.prompt }] : null);
    if (!Array.isArray(messages) || !messages.length || messages.length > 100 || messages.some(m => !['system', 'user', 'assistant'].includes(m.role) || typeof m.content !== 'string')) fail('Valid messages or prompt are required');
    payload = { model: body.model, messages, stream: false };
    if (body.max_tokens !== undefined) {
      if (!Number.isSafeInteger(body.max_tokens) || body.max_tokens < 1 || body.max_tokens > 32768) fail('Invalid max_tokens');
      payload.max_tokens = body.max_tokens;
    }
    if (JSON.stringify(payload).length > 262144) fail('Runtime request is too large', 413);
  }
  let response;
  try {
    response = await fetch(target, { method: payload ? 'POST' : 'GET', redirect: 'error', signal: AbortSignal.timeout(30000), headers: { Authorization: 'Bearer ' + env.MRL_RUNTIME_API_KEY, 'Content-Type': 'application/json' }, ...(payload ? { body: JSON.stringify(payload) } : {}) });
  } catch { fail('Runtime connection failed or timed out', 502); }
  if (!response.ok) { await response.body?.cancel(); fail('Runtime returned HTTP ' + response.status, 502); }
  let result;
  try { result = JSON.parse(new TextDecoder().decode(await boundedBytes(response.body, 2097152))); }
  catch { fail('Runtime returned invalid or oversized JSON', 502); }
  if (operation === 'models') {
    if (!Array.isArray(result.data) || result.data.some(m => typeof m.id !== 'string' || !m.id)) fail('Runtime model response is invalid', 502);
    return result.data.map(m => ({ id: m.id, name: m.id, type: 'text', source: 'owner-configured-runtime' }));
  }
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || result.model !== body.model) fail('Runtime generation receipt is invalid', 502);
  return { model: result.model, content, usage: result.usage ?? null, source: 'owner-configured-runtime', upstream_id: result.id ?? null };
}

export async function uploadFile(env, request) {
  if (!env.MRLIOUBOOK) fail('MRLIOUBOOK file storage is not configured', 503);
  const bytes = await boundedBytes(request.body, 8 * 1024 * 1024);
  if (!bytes.length) fail('Empty file');
  const digest = await sha256(bytes), id = crypto.randomUUID();
  const key = 'Mrliou_core/uploads/' + id;
  const stored = await env.MRLIOUBOOK.put(key, bytes, { sha256: digest, httpMetadata: { contentType: request.headers.get('Content-Type') || 'application/octet-stream' }, customMetadata: { origin_signature: 'MrLiouWord', sha256: digest } });
  if (!stored) fail('Storage did not return a receipt', 502);
  const verify = await env.MRLIOUBOOK.get(key);
  if (!verify || verify.size !== bytes.length || await sha256(await verify.arrayBuffer()) !== digest) fail('Stored file readback failed', 502);
  return { key, size: bytes.length, sha256: digest, etag: stored.etag, readback_verified: true, origin_signature: 'MrLiouWord' };
}

export async function executeTool(memory, input) {
  if (!input || typeof input.tool !== 'string') fail('tool is required');
  const args = input.arguments ?? input.args ?? {};
  if (input.tool === 'memory.stats') return memory.stats();
  if (input.tool === 'memory.verify') return memory.verify();
  if (input.tool === 'memory.recall') return memory.recall(args.query, args.limit ?? 10);
  if (['sha256', 'simhash64'].includes(input.tool)) {
    if (typeof args.text !== 'string' || new TextEncoder().encode(args.text).length > 65536) fail('text must be a string of at most 65536 bytes');
    return { value: input.tool === 'sha256' ? await sha256(args.text) : simhash64(args.text) };
  }
  fail('Unknown tool; available: memory.stats, memory.verify, memory.recall, sha256, simhash64', 404);
}
