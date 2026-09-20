/**
 * particle-api — R2 粒子操作 Worker
 *
 * Canonical 模組身分：MRL_API_Gateway
 * 雲端資源名 particle-api 依命名註冊表保留為實作識別碼
 * （legacy alias，disposition: quarantine_as_source_name）。
 *
 * 端點規格來源：WORKERS_COMPARISON.md 的 particle-api v2.0.0 章節
 *   GET /list            列出所有粒子
 *   GET /list/:prefix    按前綴列出
 *   GET /get/:key        取得粒子內容
 *   GET /particles/ai    AI 粒子
 *   GET /particles/ui    UI 粒子
 *   GET /globe           Globe 視覺化
 *   GET /runtime         Runtime 核心
 *   GET /search?q=       搜尋粒子
 *
 * 綁定：R2 PARTICLES → mrlioubook
 *
 * Author: MR.liou × Claude
 * Philosophy: 怎麼過去，就怎麼回來
 */

const ORIGIN = "MrLiouWord";

// R2 綁定所需的最小結構型別，避免相依 @cloudflare/workers-types
interface R2Listed {
  key: string;
  size?: number;
  uploaded?: Date | string;
  etag?: string;
}

interface R2ListResult {
  objects: R2Listed[];
  truncated: boolean;
  cursor?: string;
}

interface R2Object {
  body: ReadableStream | null;
  size?: number;
  etag?: string;
  uploaded?: Date | string;
  httpMetadata?: { contentType?: string };
}

interface R2Bucket {
  list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<R2ListResult>;
  get(key: string): Promise<R2Object | null>;
}

interface Env {
  PARTICLES: R2Bucket;
  ORIGIN_SIGNATURE?: string;
  CANONICAL_MODULE?: string;
  SOURCE_NAME?: string;
  VERSION?: string;
}

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  // 註冊表規則：所有公開回應必須帶 origin_signature。
  // 非 JSON 的原始內容回應無法內嵌欄位，因此一律以標頭攜帶。
  "X-Origin-Signature": ORIGIN,
};

const JSON_HEADERS: Record<string, string> = {
  ...CORS,
  "Content-Type": "application/json; charset=utf-8",
};

const LIST_LIMIT = 1000;

function ok(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify({ ...data, origin: ORIGIN }, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

function fail(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message, origin: ORIGIN }, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

function toEntry(object: R2Listed): Record<string, unknown> {
  return {
    key: object.key,
    size: object.size ?? null,
    uploaded:
      object.uploaded instanceof Date
        ? object.uploaded.toISOString()
        : (object.uploaded ?? null),
    etag: object.etag ?? null,
  };
}

/** 列出指定前綴下的粒子。R2 單次 list 有上限，truncated 時回報 cursor。 */
async function listParticles(env: Env, prefix: string): Promise<Response> {
  const listed = await env.PARTICLES.list({
    prefix: prefix || undefined,
    limit: LIST_LIMIT,
  });

  return ok({
    prefix: prefix || null,
    count: listed.objects.length,
    truncated: listed.truncated,
    cursor: listed.truncated ? (listed.cursor ?? null) : null,
    particles: listed.objects.map(toEntry),
  });
}

/** 取得單一粒子的原始內容，沿用其儲存時的 content type。 */
async function getParticle(env: Env, key: string): Promise<Response> {
  if (!key) return fail("缺少粒子 key", 400);

  const object = await env.PARTICLES.get(key);
  if (!object || !object.body) return fail(`找不到粒子：${key}`, 404);

  return new Response(object.body, {
    headers: {
      ...CORS,
      "Content-Type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "X-Particle-Key": encodeURIComponent(key),
    },
  });
}

/**
 * /globe 與 /runtime 在 WORKERS_COMPARISON.md 中只留下端點名稱，
 * 原 Worker 的確切語意無法從倉庫中還原。這裡採取先精確後前綴的解析：
 * 先當成單一物件 key，不存在時退回同名前綴的列表。
 */
async function resolveNamed(env: Env, name: string): Promise<Response> {
  const object = await env.PARTICLES.get(name);
  if (object && object.body) return getParticle(env, name);
  return listParticles(env, `${name}/`);
}

/**
 * 依 key 名稱做子字串搜尋。
 * R2 不提供內容檢索，因此這是 key 搜尋而非全文搜尋。
 */
async function searchParticles(env: Env, query: string): Promise<Response> {
  if (!query) return fail("缺少查詢字串，請使用 /search?q=", 400);

  const needle = query.toLowerCase();
  const listed = await env.PARTICLES.list({ limit: LIST_LIMIT });
  const matched = listed.objects.filter((object) =>
    object.key.toLowerCase().includes(needle),
  );

  return ok({
    query,
    scope: "key_name",
    scanned: listed.objects.length,
    truncated: listed.truncated,
    count: matched.length,
    particles: matched.map(toEntry),
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== "GET") {
      return fail("僅支援 GET", 405);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === "/") {
        return ok({
          module: env.CANONICAL_MODULE ?? "MRL_API_Gateway",
          source_name: env.SOURCE_NAME ?? "particle-api",
          version: env.VERSION ?? "2.0.0",
          binding: "R2 PARTICLES → mrlioubook",
          endpoints: [
            "GET /list",
            "GET /list/:prefix",
            "GET /get/:key",
            "GET /particles/ai",
            "GET /particles/ui",
            "GET /globe",
            "GET /runtime",
            "GET /search?q=",
            "GET /health",
          ],
        });
      }

      if (path === "/health") {
        // 實際觸碰一次 R2，避免回報「活著」但綁定其實壞掉
        const probe = await env.PARTICLES.list({ limit: 1 });
        return ok({
          status: "healthy",
          bucket_reachable: true,
          sample_count: probe.objects.length,
        });
      }

      if (path === "/list") return listParticles(env, "");

      if (path.startsWith("/list/")) {
        return listParticles(env, decodeURIComponent(path.slice("/list/".length)));
      }

      if (path.startsWith("/get/")) {
        return getParticle(env, decodeURIComponent(path.slice("/get/".length)));
      }

      if (path === "/particles/ai") return listParticles(env, "ai/");
      if (path === "/particles/ui") return listParticles(env, "ui/");

      if (path === "/globe") return resolveNamed(env, "globe");
      if (path === "/runtime") return resolveNamed(env, "runtime");

      if (path === "/search") {
        return searchParticles(env, url.searchParams.get("q") ?? "");
      }

      return fail(`未定義的路徑：${path}`, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return fail(message, 500);
    }
  },
};
