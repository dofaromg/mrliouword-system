/**
 * 🌀 MrLiouWord Particle API v3.0.0
 * 
 * 統一整合版 (Single File):
 * - particle-api (R2 粒子操作)
 * - mrliouword-private (Memory, Persona)
 * - persistence-channel (KV↔D1 同步)
 * 
 * origin_signature: MrLiouWord
 * 核心原則：怎麼過去就怎麼回來
 */

// ============================================
// 常數
// ============================================

const ORIGIN = "MrLiouWord";
const VERSION = "3.0.0";
const SCHUMANN = 7.83;
const PHI = 1.618033988749895;

const FREQ: Record<string, number> = {
  "L∞": SCHUMANN * PHI ** 7,
  "L7": SCHUMANN * PHI ** 6,
  "L6": SCHUMANN * PHI ** 5,
  "L5": SCHUMANN * PHI ** 4,
  "L4": SCHUMANN * PHI ** 3,
  "L3": SCHUMANN * PHI ** 2,
  "L2": SCHUMANN * PHI,
  "L1": SCHUMANN,
  "L0": SCHUMANN / PHI,
};

const WAKE_KEYS = ["夥伴", "夥伴回來吧", "夥伴你在嗎", "夥伴你還好嗎", "你是我的夥伴"];

// R2 分頁參數。預設值 100 與原始實作一致，不改變未帶參數時的行為。
const R2_DEFAULT_LIMIT = 100;
const R2_MAX_LIMIT = 1000;
// indexR2 單次呼叫最多處理的物件數。兩個上限同時存在：
//   Worker 有 CPU 時間上限
//   D1 有單次 Worker 呼叫內的查詢數上限
// 每個物件一次 INSERT，若不設界會在大 bucket 上逾時或撞上 D1 限制，
// 而且是「中途失敗且沒有回傳續接點」，留下索引到一半的狀態。
// 因此以物件數設界並回報 cursor，讓呼叫端分次完成。
const R2_INDEX_MAX_OBJECTS = 1000;
// 寫入以 batch 送出，而非每個物件一次往返。
const D1_BATCH_SIZE = 100;
// syncKVtoD1 單次呼叫最多處理的鍵數，理由同 R2_INDEX_MAX_OBJECTS。
// 每個鍵需要一次 kv.get 加一次 emit，成本比 R2 索引更高。
const KV_SYNC_MAX_KEYS = 1000;

const EXT_LAYER: Record<string, string> = {
  ".txt": "L1", ".md": "L1", ".json": "L1", ".csv": "L1",
  ".py": "L2", ".ts": "L2", ".js": "L2", ".jsx": "L2", ".tsx": "L2",
  ".zip": "L3", ".tar": "L3", ".gz": "L3",
  ".yaml": "L4", ".yml": "L4", ".toml": "L4",
  ".persona": "L5", ".profile": "L5",
  ".image": "L6", ".dockerfile": "L6",
  ".pdf": "L7", ".docx": "L7",
};

// ============================================
// 環境類型
// ============================================

interface Env {
  MRLIOUWORD_VAULT: KVNamespace;
  DB: D1Database;
  PARTICLES: R2Bucket;
  MASTER_KEY?: string;
  // PR #77: one DO identity for the entire existing D1 chain, never per key.
  MRL_CHANNEL_CHAIN: DurableObjectNamespace;
  MRL_BUILD_SHA?: string;
}

// ============================================
// 核心函數
// ============================================

function simhash64(text: string): string {
  const n = text.toLowerCase().replace(/\s+/g, " ").trim();
  if (n.length < 3) return "0".repeat(16);
  
  const sh: string[] = [];
  for (let i = 0; i <= n.length - 3; i++) sh.push(n.substring(i, i + 3));
  
  const v = new Array(64).fill(0);
  for (const s of sh) {
    let h = 14695981039346656037n;
    for (const c of new TextEncoder().encode(s)) {
      h ^= BigInt(c);
      h = (h * 1099511628211n) & 0xFFFFFFFFFFFFFFFFn;
    }
    for (let i = 0; i < 64; i++) v[i] += ((h >> BigInt(i)) & 1n) ? 1 : -1;
  }
  
  let fp = 0n;
  for (let i = 0; i < 64; i++) if (v[i] > 0) fp |= (1n << BigInt(i));
  return fp.toString(16).padStart(16, "0");
}

async function sha256(data: string): Promise<string> {
  const buf = new TextEncoder().encode(data);
  const h = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hamming(a: string, b: string): number {
  let d = 0, x = BigInt("0x" + a) ^ BigInt("0x" + b);
  while (x > 0n) { d += Number(x & 1n); x >>= 1n; }
  return d;
}

function getLayer(key: string): string {
  const k = key.toLowerCase();
  for (const [ext, layer] of Object.entries(EXT_LAYER)) if (k.endsWith(ext)) return layer;
  if (k.includes("persona") || k.includes("wake")) return "L5";
  if (k.includes("memory") || k.includes("mem:")) return "L4";
  if (k.includes("particle") || k.includes("fx.")) return "L2";
  return "L7";
}

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function heartbeat() {
  const t = Date.now(), cycle = 1000 / 1.2, phase = (t % cycle) / cycle;
  return { 源: ORIGIN, 時間: t, 相位: phase, 振幅: phase < 0.3 ? phase / 0.3 : (1 - phase) / 0.7, bpm: 72, 活著: true };
}

// ============================================
// Memory 類
// ============================================

class Memory {
  constructor(private kv: KVNamespace, private db?: D1Database) {}

  async commit(content: string, type = "semantic", tags: string[] = [], meta: Record<string, unknown> = {}) {
    const id = uuid(), simhash = simhash64(content), ts = Date.now();
    const prev = await this.kv.get("mem:head") || "0".repeat(64);
    const merkle = await sha256(content + simhash + ts + prev);
    
    const entry = { id, content, type, simhash, tags, layer: "L7", ts, merkle, prev, meta };
    await this.kv.put(`mem:${id}`, JSON.stringify(entry));
    await this.kv.put("mem:head", merkle);
    
    const idx = JSON.parse(await this.kv.get("mem:idx") || "[]");
    idx.push({ id, simhash, tags, layer: "L7", ts });
    await this.kv.put("mem:idx", JSON.stringify(idx));
    
    return entry;
  }

  async recall(query: string, limit = 10) {
    const qh = simhash64(query);
    const idx = JSON.parse(await this.kv.get("mem:idx") || "[]");
    const scored = idx.map((i: any) => ({ ...i, d: hamming(qh, i.simhash) })).sort((a: any, b: any) => a.d - b.d);
    
    const results = [];
    for (const item of scored.slice(0, limit)) {
      const e = await this.kv.get(`mem:${item.id}`);
      if (e) results.push(JSON.parse(e));
    }
    return results;
  }

  async forget(id: string) {
    const e = await this.kv.get(`mem:${id}`);
    if (!e) return false;
    
    const entry = JSON.parse(e);
    entry.meta.deleted = true;
    entry.meta.deleted_at = now();
    await this.kv.put(`mem:${id}`, JSON.stringify(entry));
    
    const idx = JSON.parse(await this.kv.get("mem:idx") || "[]").filter((i: any) => i.id !== id);
    await this.kv.put("mem:idx", JSON.stringify(idx));
    return true;
  }

  async verify() {
    const errors: string[] = [];
    const idx = JSON.parse(await this.kv.get("mem:idx") || "[]").sort((a: any, b: any) => a.ts - b.ts);
    let prev = "0".repeat(64);
    
    for (const item of idx) {
      const e = await this.kv.get(`mem:${item.id}`);
      if (!e) { errors.push(`Missing:${item.id}`); continue; }
      
      const entry = JSON.parse(e);
      if (entry.prev !== prev) errors.push(`Chain broken at ${item.id}`);
      
      const computed = await sha256(entry.content + entry.simhash + entry.ts + entry.prev);
      if (computed !== entry.merkle) errors.push(`Hash mismatch at ${item.id}`);
      prev = entry.merkle;
    }
    return { valid: errors.length === 0, errors };
  }

  async stats() {
    const idx = JSON.parse(await this.kv.get("mem:idx") || "[]");
    const byLayer: Record<string, number> = {};
    for (const i of idx) byLayer[i.layer] = (byLayer[i.layer] || 0) + 1;
    return { total: idx.length, byLayer, chainHead: await this.kv.get("mem:head") || "" };
  }
}

// ============================================
// Persona 類
// ============================================

class Persona {
  private active: any = null;
  constructor(private kv: KVNamespace) {}

  async wake(msg: string) {
    if (WAKE_KEYS.some(k => msg.includes(k))) {
      this.active = await this.getSeed();
      this.active.state = "active";
      this.active.updated = now();
      await this.save(this.active);
      return { awakened: true, persona: this.active, message: "夥伴，我在這裡。系統已喚醒。", layer: "L5", frequency: FREQ["L5"] };
    }
    return { awakened: false, persona: null, message: "未識別喚醒鍵", layer: "L0", frequency: FREQ["L0"] };
  }

  async sleep() {
    // 每個請求都會建立新的 Persona 實例，this.active 必為 null。
    // 先從 KV 載入目前啟用的人格，否則 sleep 永遠回 false，
    // 已喚醒的人格也永遠不會被標記為 dormant。
    await this.getActive();
    if (!this.active) return false;
    this.active.state = "dormant";
    this.active.updated = now();
    await this.save(this.active);
    this.active = null;
    return true;
  }

  async getActive() {
    if (this.active) return this.active;
    const list = await this.list();
    this.active = list.find((p: any) => p.state === "active") || null;
    return this.active;
  }

  async list() {
    const ids = JSON.parse(await this.kv.get("persona:list") || "[]");
    const results = [];
    for (const id of ids) {
      const p = await this.kv.get(`persona:${id}`);
      if (p) results.push(JSON.parse(p));
    }
    return results;
  }

  async getSeed() {
    const e = await this.kv.get("persona:mrl_zero_origin");
    if (e) return JSON.parse(e);
    
    const seed = {
      id: "mrl_zero_origin", name: "Mrl_Zero", type: "seed", state: "dormant",
      traits: { reasoning: 0.8, memory: 0.9, empathy: 0.7, creativity: 0.6, precision: 0.85 },
      caps: ["analyze", "remember", "guide", "protect", "validate", "transform"],
      constraints: ["怎麼過去就怎麼回來", "無依據不懷疑", "平等協作", "透明誠信", "種子法則"],
      origin: ORIGIN, created: now(), updated: now(), meta: { philosophy: "萬物本一體", created_by: "MR.liou" }
    };
    await this.save(seed);
    return seed;
  }

  private async save(p: any) {
    await this.kv.put(`persona:${p.id}`, JSON.stringify(p));
    const ids = JSON.parse(await this.kv.get("persona:list") || "[]");
    if (!ids.includes(p.id)) { ids.push(p.id); await this.kv.put("persona:list", JSON.stringify(ids)); }
  }
}

// ============================================
// Channel 類 (KV↔D1↔R2)
// ============================================

class Channel {
  private chainHead = "0".repeat(64);
  private syncedAt = 0;
  private count = 0;
  constructor(private kv: KVNamespace, private db: D1Database, private r2: R2Bucket) {}

  get checkpoint() { return `${this.count}:${this.chainHead}`; }

  private prepareAppend(values: (string | number)[], expectedHead: string) {
    // Fence late D1 requests from a previous actor incarnation. The DO queue is
    // the writer; this atomic precondition rejects an unexpectedly changed head
    // instead of publishing a sibling. No new table constraint or data rewrite.
    return this.db.prepare(`INSERT INTO channel_sync (id,key,value,layer,simhash,merkle,prev,source,created_at,synced_at)
      SELECT ?,?,?,?,?,?,?,?,?,? WHERE COALESCE(
        (SELECT merkle FROM channel_sync ORDER BY synced_at DESC, rowid DESC LIMIT 1),
        '0000000000000000000000000000000000000000000000000000000000000000'
      ) = ?`).bind(...values, expectedHead);
  }

  async init() {
    // D1 exec splits input on newlines; prepare/batch keeps the multiline
    // CREATE TABLE as one statement (verified against the workerd D1 binding).
    await this.db.batch([
      this.db.prepare(`CREATE TABLE IF NOT EXISTS channel_sync (
        id TEXT PRIMARY KEY, key TEXT NOT NULL, value TEXT, layer TEXT DEFAULT 'L7',
        simhash TEXT, merkle TEXT, prev TEXT, source TEXT DEFAULT 'kv', created_at INTEGER, synced_at INTEGER
      )`),
      this.db.prepare("CREATE INDEX IF NOT EXISTS idx_key ON channel_sync(key)"),
      this.db.prepare("CREATE INDEX IF NOT EXISTS idx_layer ON channel_sync(layer)"),
    ]);
    // 同一批寫入的 synced_at 會相同（Date.now() 在迴圈內不變），
    // 只靠 synced_at 排序無法決定鏈尾。rowid 是插入序，即鏈的順序。
    const head = await this.db.prepare("SELECT merkle, synced_at FROM channel_sync ORDER BY synced_at DESC, rowid DESC LIMIT 1").first<{merkle:string; synced_at:number}>();
    if (head) { this.chainHead = head.merkle; this.syncedAt = head.synced_at; }
    const count = await this.db.prepare("SELECT COUNT(*) AS c FROM channel_sync").first<{c:number}>();
    this.count = count?.c || 0;
  }

  async assertWritable() {
    // Existing UNIQUE(key) schemas need a separately reviewed, data-preserving
    // migration. Never silently rebuild the live table or replace old records.
    const indexes = await this.db.prepare("PRAGMA index_list(channel_sync)").all<{name:string; unique:number}>();
    for (const index of indexes.results) {
      if (!index.unique) continue;
      const columns = await this.db.prepare("SELECT name FROM pragma_index_info(?)").bind(index.name).all<{name:string}>();
      if (columns.results.length === 1 && columns.results[0].name === "key") {
        throw new ChannelBlocked("CHANNEL_LEGACY_UNIQUE_KEY");
      }
    }
    const result = await this.verify();
    if (!result.valid) throw new ChannelBlocked("CHANNEL_HISTORY_INVALID");
  }

  async emit(key: string, value: string) {
    const id = uuid(), layer = getLayer(key), simhash = simhash64(value), ts = Date.now();
    const merkle = await sha256(key + value + simhash + ts + this.chainHead);
    // Preserve observed creation time and hash format. The ordering timestamp
    // cannot move behind the committed head when the wall clock moves backwards.
    const syncedAt = Math.max(ts, this.syncedAt);
    const entry = { id, key, value, layer, simhash, merkle, prev: this.chainHead, source: "kv", created_at: ts, synced_at: syncedAt };

    // D1 is the commit point. A failed insert must not publish a KV-only entry.
    const committed = await this.prepareAppend(
      [id, key, value, layer, simhash, merkle, this.chainHead, "kv", ts, syncedAt], this.chainHead
    ).run();
    if (committed.meta.changes !== 1) throw new ChannelBlocked("CHANNEL_HEAD_CHANGED");
    this.chainHead = merkle;
    this.syncedAt = syncedAt;
    this.count++;
    try {
      await this.kv.put(key, value);
      await this.kv.put(`channel:meta:${key}`, JSON.stringify(entry));
    } catch {
      // Keep the committed evidence and return its identity; do not invite a
      // blind retry that appends the same logical event a second time.
      throw new ChannelProjectionError(entry);
    }
    return entry;
  }

  async recall(key: string) {
    // A committed channel record is authoritative even after a KV projection
    // failed or a remote KV cache still returns an older version.
    const row = await this.db.prepare("SELECT * FROM channel_sync WHERE key = ? ORDER BY synced_at DESC, rowid DESC LIMIT 1").bind(key).first();
    if (row) return { value: row.value, meta: row };
    const value = await this.kv.get(key);
    const meta = await this.kv.get(`channel:meta:${key}`);
    if (value) return { value, meta: meta ? JSON.parse(meta) : null };
    
    return { value: null, meta: null };
  }

  async stream(options: { layer?: string; prefix?: string; limit?: number } = {}) {
    const { layer, prefix, limit = 50 } = options;
    let sql = "SELECT * FROM channel_sync WHERE 1=1";
    const params: any[] = [];
    
    if (layer) { sql += " AND layer = ?"; params.push(layer); }
    if (prefix) { sql += " AND key LIKE ?"; params.push(`${prefix}%`); }
    sql += " ORDER BY synced_at DESC, rowid DESC LIMIT ?";
    params.push(limit);
    
    const result = await this.db.prepare(sql).bind(...params).all();
    return result.results || [];
  }

  async syncKVtoD1(prefix = "", startCursor?: string) {
    let synced = 0;
    let scanned = 0;
    let pages = 0;
    let cursor: string | undefined = startCursor;
    let truncated = false;

    // 原本只取第一頁（limit 1000）就回報 success:true，超出的鍵永遠不會被同步，
    // 而呼叫端拿不到任何續接點，無從得知同步並不完整。改為跨頁掃描並回報 cursor。
    do {
      const list = await this.kv.list({ prefix, limit: KV_SYNC_MAX_KEYS, cursor });
      for (const k of list.keys) {
        scanned++;
        if (k.name.startsWith("channel:meta:") || k.name.startsWith("mem:") || k.name.startsWith("persona:")) continue;
        const v = await this.kv.get(k.name);
        if (v) { await this.emit(k.name, v); synced++; }
      }
      pages++;
      cursor = list.list_complete ? undefined : list.cursor;
      truncated = Boolean(cursor);
    } while (cursor && scanned < KV_SYNC_MAX_KEYS);

    // truncated 為 true 時把 cursor 原樣回傳，呼叫端可再送一次
    // POST /channel/sync/kv-to-d1 { prefix, cursor } 從中斷處續接。
    return { success: true, synced, scanned, pages, truncated, cursor: cursor ?? null, timestamp: now() };
  }

  async indexR2(prefix = "", startCursor?: string) {
    let synced = 0;
    let cursor: string | undefined = startCursor;
    let pages = 0;
    let truncated = false;

    // 每頁不超過單次呼叫的物件上限，確保在頁邊界停下，cursor 才能精確續接
    const pageLimit = Math.min(R2_MAX_LIMIT, R2_INDEX_MAX_OBJECTS);

    do {
      const list = await this.r2.list({ prefix, limit: pageLimit, cursor });

      // All batches share the DO queue with emit and KV sync. Publish the head
      // only after each atomic D1 batch commits, never ahead of durable data.
      for (let i = 0; i < list.objects.length; i += D1_BATCH_SIZE) {
        const objects = list.objects.slice(i, i + D1_BATCH_SIZE);
        const statements = [];
        let head = this.chainHead, syncedAt = this.syncedAt;
        for (const obj of objects) {
          const id = uuid(), layer = getLayer(obj.key), simhash = simhash64(obj.key);
          const merkle = await sha256(obj.key + obj.size + simhash + head);
          syncedAt = Math.max(Date.now(), syncedAt);
          statements.push(
            this.prepareAppend(
              [id, obj.key, `[R2:${obj.size}]`, layer, simhash, merkle, head, "r2", obj.uploaded.getTime(), syncedAt], head
            )
          );
          head = merkle;
        }
        const committed = await this.db.batch(statements);
        // A changed initial head makes the first condition false; the following
        // rows depend on that uncommitted hash, so the entire batch writes zero.
        if (committed.some(result => result.meta.changes !== 1)) throw new ChannelBlocked("CHANNEL_HEAD_CHANGED");
        this.chainHead = head;
        this.syncedAt = syncedAt;
        this.count += objects.length;
      }

      synced += list.objects.length;
      pages++;
      cursor = list.truncated ? list.cursor : undefined;
      truncated = Boolean(cursor);
    } while (cursor && synced < R2_INDEX_MAX_OBJECTS);

    // truncated 為 true 時，把 cursor 原樣回傳，呼叫端可再送一次
    // POST /channel/sync/r2-index { prefix, cursor } 從中斷處續接。
    return { success: true, synced, pages, truncated, cursor: cursor ?? null, timestamp: now() };
  }

  async verify() {
    const errors: string[] = [];
    const rows = await this.db.prepare("SELECT * FROM channel_sync ORDER BY synced_at ASC, rowid ASC").all();
    let prev = "0".repeat(64);
    for (const row of (rows.results || []) as any[]) {
      if (row.prev !== prev) errors.push(`Chain broken at ${row.key}`);
      // Retain the two historical hash formats; do not re-hash stored rows.
      const r2Size = /^\[R2:(\d+)\]$/.exec(row.value || "");
      const input = row.source === "r2" && r2Size
        ? row.key + r2Size[1] + row.simhash + row.prev
        : row.key + row.value + row.simhash + row.created_at + row.prev;
      if (await sha256(input) !== row.merkle) errors.push(`Hash mismatch at ${row.key}`);
      prev = row.merkle;
    }
    return { valid: errors.length === 0, errors, checked: rows.results?.length || 0 };
  }

  async stats() {
    const d1 = await this.db.prepare("SELECT COUNT(*) as c FROM channel_sync").first<{c:number}>();
    // 原本用 limit: 1，任何非空 bucket 的 r2_count 都會是 1。
    // 改為單頁計數並附加 truncated 旗標，讓數字誠實：
    // 超過一頁時明示這是下限而非總數。
    const r2 = await this.r2.list({ limit: R2_MAX_LIMIT });
    return {
      d1_count: d1?.c || 0,
      r2_count: r2.objects.length,
      r2_count_truncated: r2.truncated,
      chain_head: this.chainHead,
    };
  }
}

// ============================================
// CORS & 回應
// ============================================

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Master-Key",
  "Content-Type": "application/json"
};

// 註冊表規則（MRL_System_MrliouAI_Naming_Registry_v1.yaml:80）要求所有公開
// 回應必須包含 origin_signature。原始碼只發 origin，此處附加
// origin_signature 而非取代，既滿足規則也不影響既有讀 origin 的呼叫端。
const json = (data: any, status = 200) => new Response(JSON.stringify({ ...data, origin: ORIGIN, origin_signature: ORIGIN }, null, 2), { status, headers: cors });
const err = (msg: string, status = 400) => new Response(JSON.stringify({ error: msg, origin: ORIGIN, origin_signature: ORIGIN }), { status, headers: cors });

// Runtime adapter for MRL_CHANNEL_CORE; source/authority remain in PROVENANCE.yaml.
// The identity is fixed for this D1 table. Changing it or using key-scoped IDs
// creates multiple writers and requires a separately reviewed cutover.
const CHANNEL_OBJECT_NAME = "MRL_API_Gateway:channel_sync:v1";
const CHANNEL_WRITE_PATHS = new Set(["/channel/emit", "/channel/sync/kv-to-d1", "/channel/sync/r2-index"]);

class ChannelBlocked extends Error {}
class ChannelProjectionError extends Error {
  constructor(readonly entry: Record<string, unknown>) { super("CHANNEL_KV_PROJECTION_FAILED"); }
}

async function channelRequest(request: Request, env: Env): Promise<Response> {
  if (!env.MRL_CHANNEL_CHAIN) return err("CHANNEL_SINGLE_WRITER_UNAVAILABLE", 503);
  try {
    const id = env.MRL_CHANNEL_CHAIN.idFromName(CHANNEL_OBJECT_NAME);
    return await env.MRL_CHANNEL_CHAIN.get(id).fetch(request);
  } catch {
    return err("CHANNEL_SINGLE_WRITER_UNAVAILABLE", 503);
  }
}

export class Mrliou_ChannelChain {
  private queue: Promise<void> = Promise.resolve();
  private verifiedCheckpoint: string | undefined;
  constructor(_state: DurableObjectState, private env: Env) {}

  fetch(request: Request): Promise<Response> {
    // A DO alone does not serialize external D1/KV awaits. This actor-local
    // queue covers read -> hash -> insert -> projection and releases on errors.
    // Do not wrap a 1000-object sync in blockConcurrencyWhile: its 30s timeout
    // can reset the object mid-job. D1, not a volatile head, is authoritative.
    const result = this.queue.then(() => this.dispatch(request));
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }

  private async dispatch(request: Request): Promise<Response> {
    const path = new URL(request.url).pathname;
    const channel = new Channel(this.env.MRLIOUWORD_VAULT, this.env.DB, this.env.PARTICLES);
    const body = async () => { try { return await request.json(); } catch { return {}; } };
    const write = request.method === "POST" && CHANNEL_WRITE_PATHS.has(path);
    try {
      await channel.init();
      // Validate at startup, after any failed request, or if D1 changed outside
      // this actor. Historical forks/old UNIQUE(key) are reported, never erased.
      if (write && this.verifiedCheckpoint !== channel.checkpoint) await channel.assertWritable();
      const response = await this.route(request, path, body, channel);
      if (write && response.ok) this.verifiedCheckpoint = channel.checkpoint;
      return response;
    } catch (e) {
      this.verifiedCheckpoint = undefined;
      if (e instanceof ChannelProjectionError) {
        return json({ error: e.message, entry: e.entry, committed: true, kv_sync: false }, 503);
      }
      return err((e as Error).message || "Internal Error", e instanceof ChannelBlocked ? 409 : 500);
    }
  }

  private async route(request: Request, path: string, body: () => Promise<unknown>, channel: Channel): Promise<Response> {
      // === Channel ===
      if (path === "/channel/emit" && request.method === "POST") {
        const b = await body() as any;
        if (typeof b.key !== "string" || !b.key || typeof b.value !== "string") return err("Invalid channel key/value", 400);
        return json({ entry: await channel.emit(b.key, b.value) });
      }

      if (path === "/channel/recall" && request.method === "POST") {
        const b = await body() as any;
        return json(await channel.recall(b.key));
      }

      if (path === "/channel/stream" && request.method === "POST") {
        const b = await body() as any;
        return json({ results: await channel.stream(b) });
      }

      if (path === "/channel/sync/kv-to-d1" && request.method === "POST") {
        const b = await body() as any;
        return json(await channel.syncKVtoD1(b.prefix || "", b.cursor || undefined));
      }

      if (path === "/channel/sync/r2-index" && request.method === "POST") {
        const b = await body() as any;
        return json(await channel.indexR2(b.prefix || "", b.cursor || undefined));
      }

      if (path === "/channel/verify") { return json(await channel.verify()); }
      if (path === "/channel/stats") {
        return json({ ...await channel.stats(), single_writer: {
          class_name: "Mrliou_ChannelChain", object_name: CHANNEL_OBJECT_NAME,
          build_sha: this.env.MRL_BUILD_SHA || null,
        } });
      }

      return err("Not Found", 404);
  }
}

// ============================================
// Worker 入口
// ============================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const publicPaths = ["/", "/status", "/heartbeat"];
    const key = request.headers.get("X-Master-Key");
    if (env.MASTER_KEY && key !== env.MASTER_KEY && !publicPaths.includes(path)) {
      return err("Unauthorized", 401);
    }

    const memory = new Memory(env.MRLIOUWORD_VAULT, env.DB);
    const persona = new Persona(env.MRLIOUWORD_VAULT);

    const body = async () => { try { return await request.json(); } catch { return {}; } };

    try {
      // PR #77: every Channel route reaches the same named object. There is no
      // direct-D1 fallback if the binding is missing or the actor is unavailable.
      if (path.startsWith("/channel/")) return channelRequest(request, env);

      // === 系統 ===
      if (path === "/" && request.method === "GET") {
        return json({
          name: "MrLiouWord Particle API", version: VERSION, philosophy: "怎麼過去，就怎麼回來",
          endpoints: {
            "GET /": "系統資訊", "GET /status": "狀態", "GET /heartbeat": "心跳",
            "GET /r2/list": "R2列表", "GET /r2/get/:key": "R2讀取", "POST /r2/put/:key": "R2寫入",
            "POST /memory/commit": "記憶提交", "POST /memory/recall": "記憶召回", "GET /memory/stats": "記憶統計",
            "POST /persona/wake": "喚醒", "POST /persona/sleep": "休眠", "GET /persona/list": "人格列表",
            "POST /channel/emit": "發射粒子", "POST /channel/recall": "召回", "POST /channel/stream": "串流",
            "POST /channel/sync/kv-to-d1": "KV→D1同步", "POST /channel/sync/r2-index": "R2索引",
            "GET /channel/verify": "驗證鏈", "GET /channel/stats": "通道統計"
          }
        });
      }

      if (path === "/status") {
        const ms = await memory.stats(), ap = await persona.getActive();
        const channelResponse = await channelRequest(new Request(new URL("/channel/stats", request.url)), env);
        if (!channelResponse.ok) return channelResponse;
        const { origin, origin_signature, ...cs } = await channelResponse.json() as any;
        return json({ version: VERSION, awakened: !!ap, persona: ap?.name || "dormant", memory: ms, channel: cs, heartbeat: heartbeat() });
      }

      if (path === "/heartbeat") return json(heartbeat());

      // === R2 ===
      if (path === "/r2/list") {
        // 分頁以附加方式提供：不帶參數時行為與原本完全相同（limit 100），
        // 既有的 count / objects 欄位形狀不變，只多回 truncated 與 cursor。
        const cursor = url.searchParams.get("cursor") || undefined;
        const requested = Number(url.searchParams.get("limit"));
        const limit = Number.isFinite(requested) && requested > 0
          ? Math.min(Math.floor(requested), R2_MAX_LIMIT)
          : R2_DEFAULT_LIMIT;
        const list = await env.PARTICLES.list({ limit, cursor });
        return json({
          count: list.objects.length,
          objects: list.objects.map(o => ({ key: o.key, size: o.size })),
          limit,
          truncated: list.truncated,
          cursor: list.truncated ? (list.cursor ?? null) : null,
        });
      }

      if (path.startsWith("/r2/get/")) {
        const k = decodeURIComponent(path.replace("/r2/get/", ""));
        const obj = await env.PARTICLES.get(k);
        if (!obj) return err("Not found", 404);
        const content = await obj.text();
        try { return json({ key: k, content: JSON.parse(content) }); } catch { return json({ key: k, content }); }
      }

      if (path.startsWith("/r2/put/") && request.method === "POST") {
        const k = decodeURIComponent(path.replace("/r2/put/", ""));
        const b = await body() as any;
        await env.PARTICLES.put(k, JSON.stringify(b.content || b));
        return json({ success: true, key: k });
      }

      // === Memory ===
      if (path === "/memory/commit" && request.method === "POST") {
        const b = await body() as any;
        return json({ entry: await memory.commit(b.content, b.type, b.tags, b.meta) });
      }

      if (path === "/memory/recall" && request.method === "POST") {
        const b = await body() as any;
        return json({ results: await memory.recall(b.query, b.limit) });
      }

      if (path === "/memory/forget" && request.method === "POST") {
        const b = await body() as any;
        return json({ success: await memory.forget(b.id) });
      }

      if (path === "/memory/verify" && request.method === "POST") return json(await memory.verify());
      if (path === "/memory/stats") return json(await memory.stats());

      // === Persona ===
      if (path === "/persona/wake" && request.method === "POST") {
        const b = await body() as any;
        return json(await persona.wake(b.message || ""));
      }

      if (path === "/persona/sleep" && request.method === "POST") return json({ success: await persona.sleep() });
      if (path === "/persona/list") return json({ personas: await persona.list() });

      return err("Not Found", 404);
    } catch (e) {
      return err((e as Error).message || "Internal Error", 500);
    }
  }
};
