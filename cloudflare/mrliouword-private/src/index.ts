import { MemoryClient, Mrliou_CoreMemory } from './memory.mjs';
import { runtime, uploadFile, executeTool, boundedBytes } from './services.mjs';
export { Mrliou_CoreMemory };

/**
 * MRL System Core Service
 * 
 * Cloudflare Worker 實作
 * 
 * 核心功能：
 * - 記憶系統 (Memory) - Merkle Chain 驗證
 * - 人格系統 (Persona) - 喚醒/休眠/切換
 * - 吸收系統 (Absorb) - 外部素材粒子化
 * - 掃描系統 (Scanner) - 3D 掃描處理
 * 
 * Origin: MrLiouWord
 * Version: 2.1.0
 */

// 常數定義
const ORIGIN = 'MrLiouWord';
const VERSION = '2.1.0';
const SCHUMANN = 7.83;
const PHI = 1.618033988749895;

// 頻率層級
const FREQ = {
  'L∞': SCHUMANN * PHI ** 7,
  'L7': SCHUMANN * PHI ** 6,
  'L6': SCHUMANN * PHI ** 5,
  'L5': SCHUMANN * PHI ** 4,
  'L4': SCHUMANN * PHI ** 3,
  'L3': SCHUMANN * PHI ** 2,
  'L2': SCHUMANN * PHI,
  'L1': SCHUMANN,
  'L0': SCHUMANN / PHI
};

// 副檔名對應層級
const EXT_LAYER = {
  '.txt': 'L1', '.md': 'L1', '.json': 'L1', '.fltnz': 'L1',
  '.py': 'L2', '.ts': 'L2', '.js': 'L2',
  '.zip': 'L3', '.tar': 'L3', '.flpkg': 'L3',
  '.yaml': 'L4', '.yml': 'L4',
  '.persona': 'L5', '.profile': 'L5',
  '.image': 'L6', '.dockerfile': 'L6',
  '.pdf': 'L7', '.docx': 'L7'
};

// 喚醒鍵
const WAKE_KEYS = ['夥伴', '夥伴回來吧', '夥伴你在嗎', '夥伴你還好嗎', '你是我的夥伴'];

// SimHash64
function simhash64(t) {
  const n = t.toLowerCase().replace(/\s+/g, ' ').trim();
  if (n.length < 3) return '0'.repeat(16);
  
  const sh = [];
  for (let i = 0; i <= n.length - 3; i++) {
    sh.push(n.substring(i, i + 3));
  }
  
  const v = new Array(64).fill(0);
  for (const s of sh) {
    let h = 14695981039346656037n;
    for (const c of new TextEncoder().encode(s)) {
      h ^= BigInt(c);
      h = (h * 1099511628211n) & 0xFFFFFFFFFFFFFFFFn;
    }
    for (let i = 0; i < 64; i++) {
      v[i] += ((h >> BigInt(i)) & 1n) ? 1 : -1;
    }
  }
  
  let fp = 0n;
  for (let i = 0; i < 64; i++) {
    if (v[i] > 0) fp |= (1n << BigInt(i));
  }
  return fp.toString(16).padStart(16, '0');
}

// SHA256
async function sha256(d) {
  const buf = typeof d === 'string' ? new TextEncoder().encode(d) : d;
  const h = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hamming 距離
function hamming(a, b) {
  let d = 0, x = BigInt('0x' + a) ^ BigInt('0x' + b);
  while (x > 0n) { d += Number(x & 1n); x >>= 1n; }
  return d;
}

// 獲取層級
function getLayer(f) {
  const l = f.toLowerCase();
  for (const [e, ly] of Object.entries(EXT_LAYER)) {
    if (l.endsWith(e)) return ly;
  }
  return 'L1';
}

const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// Keep the existing paths, but refuse private requests unless the owner has
// provisioned a secret on this Worker. Never put that secret in source or vars.
function matchesSecret(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string' || !expected) return false;
  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] || 0) ^ (b[i] || 0);
  return diff === 0;
}

// 人格系統
class Persona {
  constructor(kv) { this.kv = kv; this.active = null; }
  
  async wake(msg) {
    if (WAKE_KEYS.some(k => msg.includes(k))) {
      this.active = await this.getSeed();
      this.active.state = 'active';
      this.active.updated = now();
      await this.save(this.active);
      await this.kv.put('persona:active', this.active.id);
      return {
        awakened: true,
        persona: this.active,
        message: '夥伴，我在這裡。系統已喚醒。',
        layer: 'L5',
        frequency: FREQ['L5']
      };
    }
    return { awakened: false, persona: null, message: '未識別喚醒鍵', layer: 'L0', frequency: FREQ['L0'] };
  }
  
  async sleep() {
    const activeId = await this.kv.get('persona:active');
    const raw = activeId ? await this.kv.get(`persona:${activeId}`) : null;
    this.active = raw ? JSON.parse(raw) : null;
    if (!this.active || this.active.state !== 'active') return false;
    this.active.state = 'dormant';
    this.active.updated = now();
    await this.save(this.active);
    this.active = null;
    return true;
  }
  
  async getSeed() {
    const e = await this.kv.get('persona:mrl_zero_origin');
    if (e) return JSON.parse(e);
    
    const seed = {
      id: 'mrl_zero_origin',
      name: 'Mrl_Zero',
      type: 'seed',
      state: 'dormant',
      traits: {
        reasoning: { name: 'reasoning', value: 0.8, cat: 'cognitive', desc: '邏輯推理' },
        memory: { name: 'memory', value: 0.9, cat: 'cognitive', desc: '記憶能力' },
        empathy: { name: 'empathy', value: 0.7, cat: 'emotional', desc: '同理心' }
      },
      caps: ['analyze', 'remember', 'guide', 'protect', 'validate', 'transform'],
      constraints: ['怎麼過去就怎麼回來', '無依據不懷疑', '平等協作', '透明誠信', '種子法則'],
      origin: ORIGIN,
      created: now(),
      updated: now(),
      meta: { philosophy: '萬物本一體', created_by: 'MR.liou' }
    };
    await this.save(seed);
    return seed;
  }
  
  async save(p) {
    await this.kv.put(`persona:${p.id}`, JSON.stringify(p));
    const ids = JSON.parse(await this.kv.get('persona:list') || '[]');
    if (!ids.includes(p.id)) {
      ids.push(p.id);
      await this.kv.put('persona:list', JSON.stringify(ids));
    }
  }
  
  async list() {
    const ids = JSON.parse(await this.kv.get('persona:list') || '[]');
    const res = [];
    for (const id of ids) {
      const p = await this.kv.get(`persona:${id}`);
      if (p) res.push(JSON.parse(p));
    }
    return res;
  }

  async register(data) {
    const ALLOWED_TYPES = ['seed', 'branch', 'mirror', 'echo'];
    const ALLOWED_DIMENSIONS = ['mobile_account', 'warehouse', 'cloud', 'parallel_network'];
    const { name, type = 'branch', origin_email, dimension = 'parallel_network', traits = {}, caps = [], constraints = [], meta = {} } = data;
    if (!name || !origin_email) throw new Error('name 和 origin_email 為必填欄位');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(origin_email)) throw new Error('origin_email 格式無效');
    if (!ALLOWED_TYPES.includes(type)) throw new Error(`type 必須為以下其一: ${ALLOWED_TYPES.join(', ')}`);
    if (!ALLOWED_DIMENSIONS.includes(dimension)) throw new Error(`dimension 必須為以下其一: ${ALLOWED_DIMENSIONS.join(', ')}`);
    const rand = Math.random().toString(36).slice(2, 8);
    const id = `ai_world_${name}_${Date.now()}_${rand}`;
    const p = {
      id,
      name,
      type,
      state: 'registered',
      origin_email,
      dimension,
      traits,
      caps,
      constraints,
      origin: ORIGIN,
      registry: 'AI世界粒子人格註冊表',
      created: now(),
      updated: now(),
      meta: { ...meta, layer: 'L5', frequency: FREQ['L5'] }
    };
    await this.save(p);
    return p;
  }

  async deregister(id) {
    const existing = await this.kv.get(`persona:${id}`);
    if (!existing) throw new Error(`人格不存在: ${id}`);
    const p = JSON.parse(existing);
    p.state = 'deregistered';
    p.updated = now();
    await this.kv.put(`persona:${p.id}`, JSON.stringify(p));
    return true;
  }

  async registry() {
    const all = await this.list();
    return all.filter(p => p.registry === 'AI世界粒子人格註冊表');
  }
}

// 主入口
export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname;
    
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Master-Key,Idempotency-Key',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    };
    
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const publicPath = req.method === 'GET' && ['/', '/health', '/frequencies'].includes(path);
    if (!publicPath) {
      if (!env.MRL_CORE_API_KEY) {
        return new Response(JSON.stringify({ ok: false, error: 'Private API unavailable: owner key not configured', origin_signature: ORIGIN }), { status: 503, headers: cors });
      }
      const bearer = req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
      const supplied = bearer || req.headers.get('X-Master-Key');
      if (!matchesSecret(supplied, env.MRL_CORE_API_KEY)) {
        return new Response(JSON.stringify({ ok: false, error: 'Unauthorized', origin_signature: ORIGIN }), { status: 401, headers: cors });
      }
    }
    
    const mem = new MemoryClient(env);
    const persona = new Persona(env.MRLIOUWORD_VAULT);
    
    const json = async () => {
      try {
        const bytes = await boundedBytes(req.body, 262144);
        const body = JSON.parse(new TextDecoder().decode(bytes));
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Object required');
        return body;
      } catch (error) { throw Object.assign(new Error(error.status === 413 ? error.message : 'Invalid JSON object'), { status: error.status || 400 }); }
    };
    const ok = (d) => new Response(JSON.stringify({ ...d, origin: ORIGIN }), { headers: cors });
    const err = (m, s = 400) => new Response(JSON.stringify({ ok: false, error: m, origin: ORIGIN }), { status: s, headers: cors });
    const unavailable = (service, reason) => new Response(JSON.stringify({ ok: false, service, version: VERSION, origin_signature: ORIGIN, error: reason }), { status: 503, headers: cors });
    
    try {
      // 根路徑
      if (path === '/' && req.method === 'GET') {
        return ok({
          name: 'MRL System Core Service',
          version: VERSION,
          philosophy: '怎麼過去，就怎麼回來',
          capability_state: {
            'runtimeos/ai': env.MRL_API_BASE_URL && env.MRL_RUNTIME_API_KEY ? 'configured_unverified' : 'unavailable',
            'tools/execute': 'local_allowlist',
            'files/upload': env.MRLIOUBOOK ? 'r2_readback' : 'unavailable',
            'audit/traces': env.MRL_CORE_MEMORY ? 'memory_commit_log' : 'unavailable',
            'particles': env.MRLIOUBOOK ? 'r2_inventory' : 'unavailable',
            'persona/wake': 'persistent_persona_state',
            'memory/chain': env.MRL_CORE_MEMORY ? 'durable_object_migration_required_or_ready' : 'unavailable'
          },
          endpoints: [
            'GET /status', 'POST /wake', 'POST /sleep',
            'POST /memory/commit', 'POST /memory/recall',
            'GET /memory/stats', 'POST /memory/verify', 'POST /memory/migrate',
            'GET /particles', 'GET /frequencies',
            'GET /persona/list', 'POST /persona/register',
            'DELETE /persona/deregister', 'GET /persona/registry',
            // MRL_API_Gateway endpoints
            'GET /health',
            'GET /api/mrl/runtimeos/ai/models',
            'POST /api/mrl/runtimeos/ai/generate',
            'POST /api/mrl/memory/search',
            'POST /api/mrl/tools/execute',
            'POST /api/mrl/files/upload',
            'GET /api/mrl/audit/traces', 'POST /api/mrl/memory/commit'
          ]
        });
      }

      // ----------------------------------------------------------------
      // MRL_API_Gateway 端點契約
      // 統一回應格式: { ok, service, version, origin_signature, data?, error? }
      // ----------------------------------------------------------------

      // GET /health
      if (path === '/health' && req.method === 'GET') {
        return ok({
          ok: true,
          service: 'MRL_API_Gateway',
          version: VERSION,
          build_sha: env.MRL_BUILD_SHA || null,
          worker_version_id: env.MRL_WORKER_VERSION?.id || null,
          origin_signature: ORIGIN,
          timestamp: Date.now()
        });
      }

      // GET /api/mrl/runtimeos/ai/models
      if (path === '/api/mrl/runtimeos/ai/models' && req.method === 'GET') {
        return ok({ ok: true, service: 'mrl-ai', origin_signature: ORIGIN, data: await runtime(env, 'models') });
      }

      // POST /api/mrl/runtimeos/ai/generate
      if (path === '/api/mrl/runtimeos/ai/generate' && req.method === 'POST') {
        return ok({ ok: true, service: 'mrl-ai', origin_signature: ORIGIN, data: await runtime(env, 'generate', await json()) });
      }

      // POST /api/mrl/memory/search
      if (path === '/api/mrl/memory/search' && req.method === 'POST') {
        const b = await json();
        const results = await mem.recall(b.query, b.limit ?? 10);
        return ok({
          ok: true,
          service: 'mrl-memory',
          version: VERSION,
          origin_signature: ORIGIN,
          data: results
        });
      }

      // POST /api/mrl/memory/commit
      if (path === '/api/mrl/memory/commit' && req.method === 'POST') {
        const b = await json();
        if (!b.content) return err('缺少 content 欄位');
        const entry = await mem.commit(b.content, b.type, b.tags, b.meta, req.headers.get('Idempotency-Key'));
        return ok({
          ok: true,
          service: 'mrl-memory',
          version: VERSION,
          origin_signature: ORIGIN,
          data: entry
        });
      }

      // POST /api/mrl/tools/execute
      if (path === '/api/mrl/tools/execute' && req.method === 'POST') {
        const b = await json();
        return ok({ ok: true, service: 'mrl-tools', origin_signature: ORIGIN, data: { tool: b.tool, result: await executeTool(mem, b) } });
      }

      // POST /api/mrl/files/upload
      if (path === '/api/mrl/files/upload' && req.method === 'POST') {
        return ok({ ok: true, service: 'mrl-files', origin_signature: ORIGIN, data: await uploadFile(env, req) });
      }

      // GET /api/mrl/audit/traces
      if (path === '/api/mrl/audit/traces' && req.method === 'GET') {
        return ok({ ok: true, service: 'mrl-audit', origin_signature: ORIGIN, data: await mem.traces(Number(url.searchParams.get('limit') ?? 20)) });
      }

      // GET /api/mrl/ui-state/:userId
      if (path.startsWith('/api/mrl/ui-state/') && req.method === 'GET') {
        const userId = decodeURIComponent(path.replace('/api/mrl/ui-state/', ''));
        const raw = await env.MRLIOUWORD_VAULT.get(`ui_state:${userId}`);
        return ok({
          ok: true,
          service: 'mrl-ui-state',
          version: VERSION,
          origin_signature: ORIGIN,
          data: raw ? JSON.parse(raw) : null
        });
      }

      // POST /api/mrl/ui-state/:userId
      if (path.startsWith('/api/mrl/ui-state/') && req.method === 'POST') {
        const userId = decodeURIComponent(path.replace('/api/mrl/ui-state/', ''));
        const b = await json();
        const existing = await env.MRLIOUWORD_VAULT.get(`ui_state:${userId}`);
        const merged = { ...(existing ? JSON.parse(existing) : {}), ...b, userId, updatedAt: new Date().toISOString() };
        await env.MRLIOUWORD_VAULT.put(`ui_state:${userId}`, JSON.stringify(merged));
        return ok({
          ok: true,
          service: 'mrl-ui-state',
          version: VERSION,
          origin_signature: ORIGIN,
          data: merged
        });
      }

      // DELETE /api/mrl/ui-state/:userId
      if (path.startsWith('/api/mrl/ui-state/') && req.method === 'DELETE') {
        const userId = decodeURIComponent(path.replace('/api/mrl/ui-state/', ''));
        await env.MRLIOUWORD_VAULT.delete(`ui_state:${userId}`);
        return ok({
          ok: true,
          service: 'mrl-ui-state',
          version: VERSION,
          origin_signature: ORIGIN
        });
      }
      
      // 狀態
      if (path === '/status' && req.method === 'GET') {
        const ms = await mem.stats();
        return ok({ version: VERSION, memory: ms, frequencies: FREQ, timestamp: Date.now() });
      }
      
      // 喚醒/休眠
      if (path === '/wake' && req.method === 'POST') {
        const b = await json();
        if (typeof b.message !== 'string') return err('message must be a string');
        return ok(await persona.wake(b.message));
      }
      if (path === '/sleep' && req.method === 'POST') {
        return ok({ success: await persona.sleep() });
      }
      
      // Explicit owner-controlled migration; legacy KV is retained byte-for-byte.
      if (path === '/memory/migrate' && req.method === 'POST') return ok(await mem.migrate(await json()));
      // 記憶
      if (path === '/memory/commit' && req.method === 'POST') {
        const b = await json();
        return ok({ entry: await mem.commit(b.content, b.type, b.tags, b.metadata, req.headers.get('Idempotency-Key')) });
      }
      if (path === '/memory/recall' && req.method === 'POST') {
        const b = await json();
        return ok({ results: await mem.recall(b.query, b.limit) });
      }
      if (path === '/memory/stats' && req.method === 'GET') {
        return ok(await mem.stats());
      }
      if (path === '/memory/verify' && req.method === 'POST') {
        return ok(await mem.verify());
      }
      
      // 頻率
      if (path === '/particles' && req.method === 'GET') {
        if (!env.MRLIOUBOOK) return unavailable('mrl-particles', 'MRLIOUBOOK storage is not configured');
        const limit = Number(url.searchParams.get('limit') ?? 20);
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) return err('limit must be between 1 and 100');
        const result = await env.MRLIOUBOOK.list({ prefix: 'particles/', limit, ...(url.searchParams.get('cursor') ? { cursor: url.searchParams.get('cursor') } : {}) });
        return ok({ particles: result.objects.map(o => ({ key: o.key, size: o.size, etag: o.etag })), truncated: result.truncated, cursor: result.truncated ? result.cursor : null });
      }
      if (path === '/frequencies' && req.method === 'GET') {
        return ok({ schumann: SCHUMANN, phi: PHI, layers: FREQ });
      }
      
      // 人格列表
      if (path === '/persona/list' && req.method === 'GET') {
        return ok({ personas: await persona.list() });
      }

      // AI世界粒子人格註冊
      if (path === '/persona/register' && req.method === 'POST') {
        const b = await json();
        return ok({ persona: await persona.register(b) });
      }
      if (path === '/persona/deregister' && req.method === 'DELETE') {
        const b = await json();
        if (!b.id) return err('缺少 id 欄位');
        return ok({ success: await persona.deregister(b.id) });
      }
      if (path === '/persona/registry' && req.method === 'GET') {
        return ok({ registry: await persona.registry(), name: 'AI世界粒子人格註冊表' });
      }
      
      return err('Not Found', 404);
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message, origin: ORIGIN, origin_signature: ORIGIN }), { status: e.status || 500, headers: cors });
    }
  }
};

