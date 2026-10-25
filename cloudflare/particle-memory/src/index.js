// particle-memory v2.0.0
// MRL_DualWrite: CF D1 (primary) + DL580 mrl_memory (mirror)
// origin_signature: MrLiouWord

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

var PARTICLE_METADATA = {
  id: "particle:memory:vault",
  type: "Memory",
  version: "2.0.0",
  creator: "MrLiou",
  description: "七層記憶保險庫，支援 SimHash 語義指紋、持久化存儲、DL580雙軌同步",
  tags: ["memory", "storage", "vault", "simhash", "persistence", "dl580-sync"],
  origin_signature: "MrLiouWord"
};

// ── DL580 同步橋設定 ──────────────────────────────────────────
//
// 【有意識的修改 1／3：憑證移出原始碼】
// 原始版本把 bridge 位址與 API 金鑰硬編碼在這裡。本倉庫是 public，
// 且已有 fork——把可用的憑證提交進來等於公開發布它，而且無法撤回。
// 改為一律由 Worker secret 提供，且**不設任何預設值**：沒設定就不同步。
//
//   wrangler secret put DL580_API_KEY
//   wrangler secret put DL580_BRIDGE
//
const SYNC_TIMEOUT_MS = 4000; // 同步最長等待，不阻塞主流程

// 【有意識的修改 2／3：同步預設關閉，fail-closed】
// 必須三者皆備才會啟用：bridge、金鑰、以及明確的開關。
function MRL_syncConfig(env) {
  if (!env || env.DL580_SYNC_ENABLED !== "true") return null;
  if (!env.DL580_BRIDGE || !env.DL580_API_KEY) return null;
  return { bridge: env.DL580_BRIDGE, key: env.DL580_API_KEY };
}
__name(MRL_syncConfig, "MRL_syncConfig");

// 【有意識的修改 3／3：拒絕把可被 shell 展開的內容組成指令】
// 原始設計把使用者送進 POST /store 的 content 逐字嵌入 SQL，再把整段
// SQL 包進 `psql -c "..."`，最後當成 cmd 查詢參數送到 /MRL_run。
// 轉義只處理了 SQL 的單引號與 shell 的雙引號，`$( )`、反引號、分號、
// 管線等 shell 元字元完全沒處理——而 POST /store 對外沒有任何驗證。
//
// 實測：content 為 "無害的筆記 $(id) 以及 `whoami`" 時，兩段都會原封不動
// 留在雙引號內送進 shell。
//
// 這個守衛是 fail-closed 的止血，不是正解。正解需要 bridge 提供
// 「SQL 與參數分開傳遞」的端點，那屬於 DL580 那一側，不在本倉庫內。
const SHELL_METACHARACTERS = /[`$\\;|&<>\n\r"]/;

// 守的是「使用者送進來的值」，不是組好的整串指令。
// SQL 範本自己就含分號與換行，守整串會把正常內容一起擋掉——
// 這個錯誤是我在實測中抓到的，記在這裡免得有人又改回去。
function MRL_isShellSafe(value) {
  return !SHELL_METACHARACTERS.test(String(value ?? ""));
}
__name(MRL_isShellSafe, "MRL_isShellSafe");

// 回傳第一個不安全的欄位名，全部安全則回 null。
function MRL_unsafeField(fields) {
  for (const [name, value] of Object.entries(fields)) {
    if (!MRL_isShellSafe(value)) return name;
  }
  return null;
}
__name(MRL_unsafeField, "MRL_unsafeField");

/**
 * MRL_syncToDL580
 * 把 CF D1 的記憶操作鏡像寫入 DL580 mrl_memory 表
 * fire-and-forget：失敗不影響主流程
 */
async function MRL_syncToDL580(operation, memoryData, env) {
  const cfg = MRL_syncConfig(env);
  if (!cfg) return; // 未設定或未啟用 → 不同步（fail-closed）
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

    // 把 CF D1 格式轉為 DL580 mrl_memory 格式
    const dl580Payload = MRL_mapToDL580Format(operation, memoryData);
    if (!dl580Payload) return; // 不需要同步的操作

    // 未信任欄位的驗證已在 MRL_mapToDL580Format 完成（回傳 null 即不同步）
    const psqlCmd = MRL_buildPsqlCmd(dl580Payload.sql, dl580Payload.params);

    const runRes = await fetch(
      `${cfg.bridge}/MRL_run?key=${cfg.key}&cmd=${encodeURIComponent(psqlCmd)}`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    const result = await runRes.json().catch(() => ({}));
    if (result.returncode !== 0) {
      console.warn("[MRL_sync] DL580 sync warn:", result.stderr || "unknown");
    }
  } catch (e) {
    // 同步失敗不拋出，記錄即可
    if (e.name !== "AbortError") {
      console.warn("[MRL_sync] DL580 sync error:", e.message);
    }
  }
}
__name(MRL_syncToDL580, "MRL_syncToDL580");

/**
 * 將 CF D1 記憶格式映射為 DL580 mrl_memory INSERT/UPDATE SQL
 */
function MRL_mapToDL580Format(operation, data) {
  if (operation === "store" && data.success && data.id) {
    // fail-closed：任一未信任欄位含 shell 元字元就整筆不同步
    const unsafe = MRL_unsafeField({
      id: data.id,
      content: data._content,
      simhash: data.simhash,
      layer: data.layer,
      category: data.category
    });
    if (unsafe) {
      console.warn(`[MRL_sync] 欄位 ${unsafe} 含 shell 元字元，本次不同步`);
      return null;
    }
    // INSERT 新記憶
    const content = (data._content || "").replace(/'/g, "''");
    const simhash = (data.simhash || "").replace(/'/g, "''");
    const layer = (data.layer || "L3").replace(/'/g, "''");
    const category = (data.category || "general").replace(/'/g, "''");
    const sql = `
      INSERT INTO mrl_memory
        (id, content, simhash, layer, category, attention_weight, stack_count, effective_weight, origin_signature)
      VALUES
        ('${data.id}', '${content}', '${simhash}', '${layer}', '${category}',
         0.5, 1, 0.5, 'MrLiouWord')
      ON CONFLICT (id) DO UPDATE SET
        stack_count = mrl_memory.stack_count + 1,
        effective_weight = LEAST(mrl_memory.effective_weight + 0.1, 2.0),
        last_accessed = NOW();
    `.trim();
    return { sql, params: [] };
  }

  if (operation === "delete" && data.success && data.deleted_id) {
    if (!MRL_isShellSafe(data.deleted_id)) {
      console.warn("[MRL_sync] deleted_id 含 shell 元字元，本次不同步");
      return null;
    }
    // 軟刪除（不刪資料，更新狀態）
    const id = data.deleted_id.replace(/'/g, "''");
    const sql = `
      UPDATE mrl_memory
      SET effective_weight = 0.0,
          attention_weight = 0.0
      WHERE id = '${id}';
    `.trim();
    return { sql, params: [] };
  }

  if (operation === "update" && data.success && data.id) {
    if (!MRL_isShellSafe(data.id)) {
      console.warn("[MRL_sync] id 含 shell 元字元，本次不同步");
      return null;
    }
    const id = data.id.replace(/'/g, "''");
    const sql = `
      UPDATE mrl_memory
      SET last_accessed = NOW(),
          effective_weight = LEAST(effective_weight + 0.05, 2.0)
      WHERE id = '${id}';
    `.trim();
    return { sql, params: [] };
  }

  return null; // 其他操作不需同步
}
__name(MRL_mapToDL580Format, "MRL_mapToDL580Format");

/**
 * 把 SQL 包成 psql -c 指令
 */
function MRL_buildPsqlCmd(sql, _params) {
  const escaped = sql.replace(/"/g, '\\"');
  return `psql -U mrl_root -d mrl_baseworld -c "${escaped}"`;
}
__name(MRL_buildPsqlCmd, "MRL_buildPsqlCmd");

// ── 以下為原 particle-memory 邏輯（保持不變）──────────────────

var PHI = 1.618033988749895;
var MEMORY_LAYERS = {
  L1: { name: "即時記憶", ttl: 3600, description: "短期快取，1小時" },
  L2: { name: "工作記憶", ttl: 86400, description: "當日任務，24小時" },
  L3: { name: "情境記憶", ttl: 604800, description: "本週上下文，7天" },
  L4: { name: "語義記憶", ttl: 2592000, description: "知識累積，30天" },
  L5: { name: "程序記憶", ttl: 31536000, description: "技能模式，1年" },
  L6: { name: "身份記憶", ttl: -1, description: "核心認同，永久" },
  L7: { name: "元記憶", ttl: -1, description: "記憶的記憶，永久" }
};

function applyLaw0Signature(data) {
  if (!data || typeof data !== "object") return data;
  const signed = { ...data };
  if (!signed.origin_signature) signed.origin_signature = "MrLiouWord";
  signed._law0_timestamp = new Date().toISOString();
  signed._law0_reversible = true;
  return signed;
}
__name(applyLaw0Signature, "applyLaw0Signature");

function simhash64(text) {
  if (!text) return "0000000000000000";
  const tokens = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]/g, " ").split(/\s+/).filter(t => t.length > 0);
  const vector = new Array(64).fill(0);
  for (const token of tokens) {
    const hash = fnv1a64(token);
    for (let i = 0; i < 64; i++) {
      if (hash[i >> 3] >> (i & 7) & 1) vector[i]++;
      else vector[i]--;
    }
  }
  let fingerprint = "";
  for (let i = 0; i < 64; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j++) if (vector[i + j] > 0) nibble |= 1 << j;
    fingerprint += nibble.toString(16);
  }
  return fingerprint;
}
__name(simhash64, "simhash64");

function fnv1a64(str) {
  const FNV_OFFSET = [203, 242, 156, 228, 132, 34, 35, 37];
  const FNV_PRIME = 16777619;
  let hash = [...FNV_OFFSET];
  for (let i = 0; i < str.length; i++) {
    const byte = str.charCodeAt(i) & 255;
    hash[0] ^= byte;
    let carry = 0;
    for (let j = 0; j < 8; j++) {
      const val = hash[j] * FNV_PRIME + carry;
      hash[j] = val & 255;
      carry = val >> 8;
    }
  }
  return hash;
}
__name(fnv1a64, "fnv1a64");

function simhashSimilarity(hash1, hash2) {
  let distance = 0;
  for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
    let xor = parseInt(hash1[i], 16) ^ parseInt(hash2[i], 16);
    while (xor) { distance++; xor &= xor - 1; }
  }
  return 1 - distance / 64;
}
__name(simhashSimilarity, "simhashSimilarity");

function generateId() {
  return `mem_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
}
__name(generateId, "generateId");

var MemoryVault = class {
  static { __name(this, "MemoryVault"); }
  constructor(db, syncEnabled = false) { this.db = db; this._syncEnabled = syncEnabled; }

  async store(content, options = {}) {
    const id = generateId();
    const simhash = simhash64(content);
    const layer = options.layer || "L3";
    const tags = JSON.stringify(options.tags || []);
    const metadata = JSON.stringify(options.metadata || {});

    if (options.deduplicate !== false) {
      const similar = await this.findSimilar(simhash, 0.9);
      if (similar.length > 0) {
        return { success: false, reason: "duplicate", existing_id: similar[0].id, similarity: similar[0].similarity };
      }
    }

    await this.db.prepare(
      `INSERT INTO memories (id, simhash, content, layer, tags, metadata) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(id, simhash, content, layer, tags, metadata).run();

    const result = applyLaw0Signature({
      success: true, id, simhash, layer,
      stored_at: new Date().toISOString(),
      // 同步橋需要的欄位
      _content: content,
      category: options.category || "general"
    });

    return result;
  }

  async retrieve(id) {
    const result = await this.db.prepare(`SELECT * FROM memories WHERE id = ?`).bind(id).first();
    if (!result) return { success: false, error: "not_found" };
    return applyLaw0Signature({
      success: true,
      memory: { ...result, tags: JSON.parse(result.tags || "[]"), metadata: JSON.parse(result.metadata || "{}") }
    });
  }

  async search(query, options = {}) {
    const queryHash = simhash64(query);
    const limit = options.limit || 10;
    const minSimilarity = options.minSimilarity || 0.5;
    const allMemories = await this.db.prepare(
      `SELECT id, simhash, content, layer, created_at FROM memories ORDER BY created_at DESC LIMIT 1000`
    ).all();
    const results = allMemories.results
      .map(mem => ({ ...mem, similarity: simhashSimilarity(queryHash, mem.simhash) }))
      .filter(mem => mem.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
    return applyLaw0Signature({ success: true, query, query_hash: queryHash, results, total: results.length });
  }

  async findSimilar(simhash, threshold = 0.9) {
    const allMemories = await this.db.prepare(`SELECT id, simhash FROM memories LIMIT 1000`).all();
    return allMemories.results
      .map(mem => ({ id: mem.id, simhash: mem.simhash, similarity: simhashSimilarity(simhash, mem.simhash) }))
      .filter(mem => mem.similarity >= threshold);
  }

  async listByLayer(layer, limit = 50) {
    const result = await this.db.prepare(
      `SELECT * FROM memories WHERE layer = ? ORDER BY created_at DESC LIMIT ?`
    ).bind(layer, limit).all();
    return applyLaw0Signature({
      success: true, layer, layer_info: MEMORY_LAYERS[layer],
      memories: result.results.map(m => ({ ...m, tags: JSON.parse(m.tags || "[]"), metadata: JSON.parse(m.metadata || "{}") })),
      total: result.results.length
    });
  }

  async getStats() {
    const totalResult = await this.db.prepare(`SELECT COUNT(*) as total FROM memories`).first();
    const layerStats = await this.db.prepare(`SELECT layer, COUNT(*) as count FROM memories GROUP BY layer`).all();
    return applyLaw0Signature({
      success: true,
      total: totalResult.total,
      by_layer: Object.fromEntries(layerStats.results.map(r => [r.layer, r.count])),
      layer_definitions: MEMORY_LAYERS,
      dl580_sync: this._syncEnabled ? "enabled" : "disabled",
      dl580_endpoint: "（由 Worker secret 提供，不對外揭露）"
    });
  }

  async delete(id) {
    const existing = await this.retrieve(id);
    if (!existing.success) return existing;
    await this.db.prepare(`DELETE FROM memories WHERE id = ?`).bind(id).run();
    return applyLaw0Signature({
      success: true,
      deleted_id: id,
      deleted_at: new Date().toISOString(),
      _deleted_record: existing.memory
    });
  }

  async update(id, updates) {
    const existing = await this.retrieve(id);
    if (!existing.success) return existing;
    const content = updates.content || existing.memory.content;
    const newSimhash = updates.content ? simhash64(content) : existing.memory.simhash;
    const layer = updates.layer || existing.memory.layer;
    // retrieve() 在第 302 行就已經把 tags 解析成陣列、metadata 解析成物件，
    // 所以這裡不能再 JSON.parse 一次——JSON.parse([]) 與 JSON.parse({}) 都會
    // 丟 SyntaxError，整個 PUT /update/:id 會回 400 Invalid JSON body。
    // 實測：只給 content 會炸；連 tags 都給了還是會炸（metadata 那行獨立丟）；
    // 只有三者全給才會成功。等於部分更新從來沒能用過。
    // 這個缺陷是 Codex 在 PR #77 上指出來的，屬實。不要改回 JSON.parse。
    const tags = JSON.stringify(updates.tags ?? existing.memory.tags ?? []);
    const metadata = JSON.stringify(updates.metadata ?? existing.memory.metadata ?? {});
    await this.db.prepare(
      `UPDATE memories SET content=?, simhash=?, layer=?, tags=?, metadata=?, updated_at=datetime('now') WHERE id=?`
    ).bind(content, newSimhash, layer, tags, metadata, id).run();
    return applyLaw0Signature({ success: true, id, updated_at: new Date().toISOString() });
  }
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Particle-ID": PARTICLE_METADATA.id,
      "X-Origin-Signature": "MrLiouWord",
      "X-MRL-Version": "2.0.0",
      "X-MRL-DL580-Sync": "enabled"
    }
  });
}
__name(jsonResponse, "jsonResponse");

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  const vault = new MemoryVault(env.DB, Boolean(MRL_syncConfig(env)));

  // ── GET / ─────────────────────────────────────────────────
  if (path === "/" && request.method === "GET") {
    return jsonResponse(applyLaw0Signature({
      name: "particle-memory",
      version: PARTICLE_METADATA.version,
      status: "active",
      dl580_sync: Boolean(MRL_syncConfig(env)) ? "enabled" : "disabled",
      particle: PARTICLE_METADATA,
      layers: MEMORY_LAYERS,
      endpoints: {
        "POST /store": "存儲記憶（自動同步DL580）",
        "GET /retrieve/:id": "檢索記憶",
        "POST /search": "搜尋記憶（SimHash）",
        "GET /list/layer/:layer": "按層級列出",
        "GET /stats": "統計資訊",
        "GET /health": "健康檢查",
        "GET /sync/status": "同步橋狀態",
        "GET /sync/compare": "CF vs DL580 行數比對"
      }
    }));
  }

  // ── POST /store ────────────────────────────────────────────
  if (path === "/store" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.content) return jsonResponse({ error: "Missing content field" }, 400);
      const result = await vault.store(body.content, {
        layer: body.layer, category: body.category,
        tags: body.tags, metadata: body.metadata, deduplicate: body.deduplicate
      });
      // 異步同步到 DL580（不等待，不阻塞）
      if (result.success && ctx) {
        ctx.waitUntil(MRL_syncToDL580("store", result, env));
      }
      return jsonResponse(result, result.success ? 201 : 409);
    } catch (e) {
      return jsonResponse({ error: "Invalid JSON body", details: e.message }, 400);
    }
  }

  // ── GET /retrieve/:id ──────────────────────────────────────
  if (path.startsWith("/retrieve/")) {
    const id = path.replace("/retrieve/", "");
    const result = await vault.retrieve(id);
    return jsonResponse(result, result.success ? 200 : 404);
  }

  // ── POST /search ───────────────────────────────────────────
  if (path === "/search" && request.method === "POST") {
    try {
      const body = await request.json();
      if (!body.query) return jsonResponse({ error: "Missing query field" }, 400);
      const result = await vault.search(body.query, { limit: body.limit, minSimilarity: body.minSimilarity });
      return jsonResponse(result);
    } catch (e) {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
  }

  // ── GET /search?q= ─────────────────────────────────────────
  if (path === "/search" && request.method === "GET") {
    const query = url.searchParams.get("q");
    if (!query) return jsonResponse({ error: "Missing q parameter" }, 400);
    const result = await vault.search(query, {
      limit: parseInt(url.searchParams.get("limit") || "10"),
      minSimilarity: parseFloat(url.searchParams.get("min_similarity") || "0.5")
    });
    return jsonResponse(result);
  }

  // ── GET /list/layer/:layer ─────────────────────────────────
  if (path.startsWith("/list/layer/")) {
    const layer = path.replace("/list/layer/", "");
    const result = await vault.listByLayer(layer, parseInt(url.searchParams.get("limit") || "50"));
    return jsonResponse(result);
  }

  // ── PUT /update/:id ────────────────────────────────────────
  if (path.startsWith("/update/") && request.method === "PUT") {
    const id = path.replace("/update/", "");
    try {
      const body = await request.json();
      const result = await vault.update(id, body);
      if (result.success && ctx) {
        ctx.waitUntil(MRL_syncToDL580("update", { ...result, id }, env));
      }
      return jsonResponse(result, result.success ? 200 : 404);
    } catch (e) {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
  }

  // ── DELETE /delete/:id ─────────────────────────────────────
  if (path.startsWith("/delete/") && request.method === "DELETE") {
    const id = path.replace("/delete/", "");
    const result = await vault.delete(id);
    if (result.success && ctx) {
      ctx.waitUntil(MRL_syncToDL580("delete", result, env));
    }
    return jsonResponse(result, result.success ? 200 : 404);
  }

  // ── GET /stats ─────────────────────────────────────────────
  if (path === "/stats") {
    return jsonResponse(await vault.getStats());
  }

  // ── GET /health ────────────────────────────────────────────
  if (path === "/health") {
    const stats = await vault.getStats();
    return jsonResponse(applyLaw0Signature({
      status: "healthy",
      particle: PARTICLE_METADATA.id,
      version: PARTICLE_METADATA.version,
      timestamp: new Date().toISOString(),
      database: "connected",
      total_memories: stats.total,
      dl580_sync: stats.dl580_sync,
      dl580_bridge: "（由 Worker secret 提供，不對外揭露）"
    }));
  }

  // ── GET /sync/status ───────────────────────────────────────
  if (path === "/sync/status") {
    const cfg = MRL_syncConfig(env);
    let bridgeStatus = cfg ? "unknown" : "disabled（未設定 secret 或未啟用）";
    if (cfg) {
      try {
        const res = await fetch(`${cfg.bridge}/health`, {
          headers: { "x-api-key": cfg.key }
        });
        bridgeStatus = res.ok ? "online" : `http_${res.status}`;
      } catch (e) {
        bridgeStatus = `error: ${e.message}`;
      }
    }
    return jsonResponse(applyLaw0Signature({
      cf_d1: "connected",
      dl580_bridge: bridgeStatus,
      sync_mode: "async_fire_and_forget",
      dl580_endpoint: "（由 Worker secret 提供，不對外揭露）",
      description: "CF D1為主，DL580為鏡像。寫入CF後非同步同步DL580。"
    }));
  }

  // ── GET /sync/compare ──────────────────────────────────────
  if (path === "/sync/compare") {
    const cfStats = await vault.getStats();
    const cfg = MRL_syncConfig(env);
    let dl580Count = cfg ? null : "disabled";
    if (cfg) {
      try {
        const res = await fetch(
          `${cfg.bridge}/MRL_pg?sql=SELECT+COUNT(*)+as+c+FROM+mrl_memory&key=${cfg.key}`
        );
        const data = await res.json();
        dl580Count = data?.results?.[0]?.c ?? data?.result ?? "unknown";
      } catch (e) {
        dl580Count = `error: ${e.message}`;
      }
    }
    return jsonResponse(applyLaw0Signature({
      cf_d1_count: cfStats.total,
      dl580_count: dl580Count,
      in_sync: cfStats.total === dl580Count,
      note: "CF D1 memories表 vs DL580 mrl_memory表。兩表結構不同，行數差異屬正常（DL580有更多欄位）"
    }));
  }

  return jsonResponse({
    error: "Not Found", path,
    available: ["/", "/store", "/retrieve/:id", "/search", "/list/layer/:layer", "/update/:id", "/delete/:id", "/stats", "/health", "/sync/status", "/sync/compare"]
  }, 404);
}
__name(handleRequest, "handleRequest");

var index_default = {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (error) {
      return jsonResponse({
        error: "Internal Server Error",
        message: error.message,
        particle: PARTICLE_METADATA.id,
        origin_signature: "MrLiouWord",
        version: "2.0.0"
      }, 500);
    }
  }
};
export { index_default as default };
