export interface Env {
  MRL_GATEWAY_TOKEN: string;
  MRL_UPSTREAM_URL?: string;
}

type JsonRecord = Record<string, unknown>;

const ORIGIN_SIGNATURE = "MrLiouWord";

function json(data: JsonRecord, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isAuthorized(request: Request, env: Env): boolean {
  const value = request.headers.get("authorization");
  return value === `Bearer ${env.MRL_GATEWAY_TOKEN}`;
}

async function readJson(request: Request): Promise<JsonRecord> {
  try {
    return (await request.json()) as JsonRecord;
  } catch {
    throw new Error("invalid_json");
  }
}

async function forwardToUpstream(
  request: Request,
  env: Env,
  path: string,
): Promise<Response> {
  if (!env.MRL_UPSTREAM_URL) {
    return json(
      {
        ok: false,
        error: "upstream_not_configured",
        origin_signature: ORIGIN_SIGNATURE,
      },
      503,
    );
  }

  const target = new URL(path, env.MRL_UPSTREAM_URL).toString();
  const body = request.method === "GET" ? undefined : await request.text();

  return fetch(target, {
    method: request.method,
    headers: {
      "content-type": request.headers.get("content-type") ?? "application/json",
      "x-mrl-origin-signature": ORIGIN_SIGNATURE,
      "x-mrl-gateway": "cloudflare",
    },
    body,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        ok: true,
        service: "MRL_CF_MotherGateway",
        version: "0.1.0",
        origin_signature: ORIGIN_SIGNATURE,
      });
    }

    if (!isAuthorized(request, env)) {
      return json(
        {
          ok: false,
          error: "unauthorized",
          origin_signature: ORIGIN_SIGNATURE,
        },
        401,
      );
    }

    if (request.method === "GET" && url.pathname === "/v1/capabilities") {
      return json({
        ok: true,
        capabilities: [
          "particle.translate",
          "memory.read",
          "memory.write",
          "workflow.execute",
          "device.command.enqueue",
        ],
        origin_signature: ORIGIN_SIGNATURE,
      });
    }

    if (request.method === "POST" && url.pathname === "/v1/particle/translate") {
      const payload = await readJson(request);
      return json({
        ok: true,
        accepted: true,
        payload,
        origin_signature: ORIGIN_SIGNATURE,
      }, 202);
    }

    if (url.pathname.startsWith("/v1/runtime/")) {
      return forwardToUpstream(request, env, url.pathname.replace("/v1/runtime", ""));
    }

    return json(
      {
        ok: false,
        error: "not_found",
        origin_signature: ORIGIN_SIGNATURE,
      },
      404,
    );
  },
};
