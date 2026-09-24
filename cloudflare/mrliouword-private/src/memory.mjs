// origin_signature: MrLiouWord; canonical_authority: Mr.liou
// One fixed object owns the existing chain. No per-request/per-user chain split.
export const MEMORY_ID = 'MrLiouWord:core-memory:v1';
const ZERO = '0'.repeat(64);
const fail = (message, status = 409) => { throw Object.assign(new Error(message), { status }); };
export const canonical = value => {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
  return JSON.stringify(value);
};
export async function sha256(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x => x.toString(16).padStart(2, '0')).join('');
}
export function simhash64(text) {
  const t = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const vector = Array(64).fill(0);
  if (t.length < 3) return '0'.repeat(16);
  for (let n = 0; n <= t.length - 3; n++) {
    let hash = 14695981039346656037n;
    for (const c of new TextEncoder().encode(t.substring(n, n + 3))) hash = ((hash ^ BigInt(c)) * 1099511628211n) & 0xffffffffffffffffn;
    for (let i = 0; i < 64; i++) vector[i] += ((hash >> BigInt(i)) & 1n) ? 1 : -1;
  }
  let result = 0n;
  for (let i = 0; i < 64; i++) if (vector[i] > 0) result |= 1n << BigInt(i);
  return result.toString(16).padStart(16, '0');
}
function distance(a, b) {
  let bits = BigInt('0x' + a) ^ BigInt('0x' + b), n = 0;
  while (bits) { n += Number(bits & 1n); bits >>= 1n; }
  return n;
}
export async function entryHash(entry) {
  if (entry.hash_version === 2) {
    const { merkle, ...fields } = entry;
    return sha256(canonical(fields));
  }
  if (entry.hash_version !== undefined) fail('Unsupported hash version');
  return sha256(entry.content + entry.simhash + entry.ts + entry.prev);
}
const sequenceKey = seq => 'seq:' + String(seq).padStart(16, '0');
const json = (data, status = 200) => Response.json(data, { status });

export class MemoryClient {
  constructor(env) { this.env = env; }
  async call(operation, body = {}) {
    const ns = this.env.MRL_CORE_MEMORY;
    if (!ns) fail('MRL_CORE_MEMORY binding is missing', 503);
    const response = await ns.get(ns.idFromName(MEMORY_ID)).fetch('https://core-memory/' + operation, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) fail(result.error || 'Memory transaction failed', response.status);
    return result;
  }
  async commit(content, type = 'semantic', tags = [], meta = {}, idempotencyKey) {
    return this.call('commit', { content, type, tags, meta, ...(idempotencyKey ? { idempotencyKey } : {}) });
  }
  async recall(query, limit = 10) { return this.call('recall', { query, limit }); }
  async stats() { return this.call('stats'); }
  async verify() { return this.call('verify'); }
  async migrate(input) { return this.call('migrate', input); }
  async traces(limit = 20) { return this.call('traces', { limit }); }
}

export class Mrliou_CoreMemory {
  constructor(state, env) { this.storage = state.storage; this.env = env; this.tail = Promise.resolve(); }
  // Hashing and legacy KV reads yield the event loop; serialize complete operations.
  async fetch(request) {
    const run = this.tail.then(async () => {
      try {
        if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
        const operation = new URL(request.url).pathname.slice(1);
        let input;
        try { input = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }
        if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ error: 'JSON object required' }, 400);
        if (operation === 'migrate') return json(await this.migrate(input));
        const checkpoint = await this.storage.get('checkpoint');
        if (!checkpoint) fail('Memory migration required before reads or writes', 503);
        if (operation === 'commit') return json(await this.commit(input));
        if (operation === 'stats') return json({ total: checkpoint.total, byLayer: checkpoint.byLayer, chainHead: checkpoint.head, storage: 'durable-object', migration: checkpoint.migration });
        if (operation === 'recall') return json(await this.recall(input));
        if (operation === 'verify') return json(await this.verify(checkpoint));
        if (operation === 'traces') {
          const limit = this.limit(input.limit ?? 20);
          const entries = await this.storage.list({ prefix: 'seq:', reverse: true, limit });
          return json({ traces: [...entries.values()].map(e => ({ event: 'memory.commit', id: e.id, ts: e.ts, merkle: e.merkle, prev: e.prev, hash_version: e.hash_version ?? 1, origin_signature: 'MrLiouWord' })), total: checkpoint.total });
        }
        return json({ error: 'Not found' }, 404);
      } catch (error) { return json({ ok: false, error: error.message, origin_signature: 'MrLiouWord' }, error.status || 500); }
    });
    this.tail = run.catch(() => {});
    return run;
  }
  limit(value) {
    if (!Number.isSafeInteger(value) || value < 1 || value > 100) fail('limit must be an integer between 1 and 100', 400);
    return value;
  }
  async *entries() {
    let last;
    do {
      const page = await this.storage.list({ prefix: 'seq:', limit: 256, ...(last ? { startAfter: last } : {}) });
      if (!page.size) return;
      for (const [key, entry] of page) { last = key; yield entry; }
      if (page.size < 256) return;
    } while (true);
  }
  async commit(input) {
    const { content, type = 'semantic', tags = [], meta = {}, idempotencyKey } = input;
    if (typeof content !== 'string' || !content.trim() || new TextEncoder().encode(content).length > 65536) fail('content must be a nonempty string of at most 65536 bytes', 400);
    if (typeof type !== 'string' || !type || type.length > 128 || !Array.isArray(tags) || tags.length > 64 || tags.some(t => typeof t !== 'string' || t.length > 256)) fail('Invalid type or tags', 400);
    if (!meta || typeof meta !== 'object' || Array.isArray(meta) || new TextEncoder().encode(canonical(meta)).length > 16384) fail('Invalid metadata or metadata exceeds 16384 bytes', 400);
    if (idempotencyKey !== undefined && (typeof idempotencyKey !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(idempotencyKey))) fail('Invalid Idempotency-Key', 400);
    const fingerprint = await sha256(canonical({ content, type, tags, meta }));
    const dedupeKey = idempotencyKey ? 'request:' + await sha256(idempotencyKey) : null;
    return this.storage.transaction(async tx => {
      if (dedupeKey) {
        const seen = await tx.get(dedupeKey);
        if (seen) {
          if (seen.fingerprint !== fingerprint) fail('Idempotency-Key was already used for different content');
          return tx.get(sequenceKey(seen.seq));
        }
      }
      const checkpoint = await tx.get('checkpoint');
      if (!checkpoint) fail('Migration required', 503);
      if (checkpoint.total > 0) {
        const tail = await tx.get(sequenceKey(checkpoint.total));
        if (!tail || tail.merkle !== checkpoint.head || tail.merkle !== await entryHash(tail)) fail('Terminal chain checkpoint is invalid');
      } else if (checkpoint.head !== '') fail('Empty chain checkpoint is invalid');
      const seq = checkpoint.total + 1;
      const entry = { id: crypto.randomUUID(), content, type, simhash: simhash64(content), tags, layer: 'L7', ts: Date.now(), prev: checkpoint.head || ZERO, meta, seq, hash_version: 2, origin_signature: 'MrLiouWord', canonical_authority: 'Mr.liou' };
      entry.merkle = await entryHash(entry);
      await tx.put(sequenceKey(seq), entry);
      await tx.put('checkpoint', { ...checkpoint, total: seq, head: entry.merkle, byLayer: { ...checkpoint.byLayer, L7: (checkpoint.byLayer.L7 || 0) + 1 } });
      if (dedupeKey) await tx.put(dedupeKey, { fingerprint, seq });
      return entry;
    });
  }
  async recall({ query, limit = 10 }) {
    if (typeof query !== 'string' || new TextEncoder().encode(query).length > 65536) fail('query must be a string of at most 65536 bytes', 400);
    this.limit(limit);
    const hash = simhash64(query), best = [];
    for await (const entry of this.entries()) {
      best.push({ entry, distance: distance(hash, entry.simhash) });
      best.sort((a, b) => a.distance - b.distance || a.entry.ts - b.entry.ts);
      if (best.length > limit) best.pop();
    }
    return best.map(x => x.entry);
  }
  async verify(checkpoint) {
    const errors = []; let previous = ZERO, count = 0;
    for await (const entry of this.entries()) {
      count++;
      if (entry.prev !== previous) errors.push('Chain broken at ' + entry.id);
      if (entry.simhash !== simhash64(entry.content)) errors.push('SimHash mismatch at ' + entry.id);
      if (entry.merkle !== await entryHash(entry)) errors.push('Hash mismatch at ' + entry.id);
      if (entry.hash_version === 2 && entry.seq !== count) errors.push('Sequence mismatch at ' + entry.id);
      previous = entry.merkle;
    }
    if (count !== checkpoint.total) errors.push('Checkpoint count mismatch');
    if ((count ? previous : '') !== checkpoint.head) errors.push('Checkpoint head mismatch');
    return { valid: !errors.length, errors, total: count, chainHead: checkpoint.head, storage: 'durable-object' };
  }
  async migrate(input) {
    if (input.writers_paused !== true || !Number.isSafeInteger(input.expected_total) || input.expected_total < 0 || typeof input.expected_head !== 'string') fail('Migration requires writers_paused:true and an exact expected_total/expected_head', 400);
    const existing = await this.storage.get('checkpoint');
    if (existing) {
      if (existing.migration.total !== input.expected_total || existing.migration.head !== input.expected_head) fail('Migration baseline differs from stored receipt');
      return { migrated: true, already_migrated: true, receipt: existing.migration };
    }
    const kv = this.env.MRLIOUWORD_VAULT;
    if (!kv) fail('Legacy KV binding is missing', 503);
    const rawIndex = await kv.get('mem:idx') || '[]';
    const rawHead = await kv.get('mem:head') || '';
    const index = JSON.parse(rawIndex);
    if (!Array.isArray(index) || index.length !== input.expected_total || rawHead !== input.expected_head) fail('Legacy baseline does not match owner expectation');
    // Explicit bounded bootstrap: larger histories need a staged importer.
    if (index.length > 1000) fail('Migration exceeds 1000 entries; staged import required', 413);
    const ids = new Set(index.map(e => e.id));
    if (ids.size !== index.length) fail('Duplicate legacy index IDs');
    const entries = [], rawEntries = [], byLayer = {}; let previous = ZERO, bytes = 0;
    for (const indexed of index) {
      if (typeof indexed.id !== 'string' || !indexed.id) fail('Invalid legacy ID');
      const raw = await kv.get('mem:' + indexed.id);
      if (!raw) fail('Missing legacy entry:' + indexed.id);
      bytes += new TextEncoder().encode(raw).length;
      if (bytes > 8 * 1024 * 1024) fail('Migration exceeds 8 MiB; staged import required', 413);
      const entry = JSON.parse(raw);
      if (entry.id !== indexed.id || entry.prev !== previous || entry.merkle !== await entryHash(entry) || entry.simhash !== simhash64(entry.content)) fail('Invalid legacy chain:' + indexed.id);
      for (const key of ['simhash', 'tags', 'layer', 'ts']) if (canonical(entry[key]) !== canonical(indexed[key])) fail('Legacy index mismatch:' + indexed.id + ':' + key);
      entries.push(entry); rawEntries.push(raw); previous = entry.merkle;
      byLayer[entry.layer] = (byLayer[entry.layer] || 0) + 1;
    }
    if ((entries.length ? previous : '') !== rawHead) fail('Legacy head mismatch');
    let cursor;
    do {
      const page = await kv.list({ prefix: 'mem:', ...(cursor ? { cursor } : {}) });
      for (const key of page.keys) if (!['mem:head', 'mem:idx'].includes(key.name) && !ids.has(key.name.slice(4))) fail('Orphan legacy entry:' + key.name);
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    if ((await kv.get('mem:idx') || '[]') !== rawIndex || (await kv.get('mem:head') || '') !== rawHead) fail('Legacy snapshot changed during migration');
    const receipt = { origin_signature: 'MrLiouWord', total: entries.length, head: rawHead, migrated_at: new Date().toISOString(), snapshot_sha256: await sha256(canonical({ index: rawIndex, head: rawHead, entries: rawEntries })), legacy_retained: true, writers_paused_attested: true };
    await this.storage.transaction(async tx => {
      if (await tx.get('checkpoint')) fail('Already initialized');
      for (let n = 0; n < entries.length; n++) {
        await tx.put(sequenceKey(n + 1), entries[n]);
        await tx.put('legacy:' + entries[n].id, rawEntries[n]);
      }
      await tx.put('legacy:index', rawIndex);
      await tx.put('checkpoint', { total: entries.length, head: rawHead, byLayer, migration: receipt });
    });
    return { migrated: true, already_migrated: false, receipt };
  }
}
