# MRL System Core public gate

`origin_signature: MrLiouWord` · 2026-09-24 · owner review branch

The root lists 20 paths. A listed path is an inventory entry, not proof of a working service. The read-only verifier records status, response size and SHA-256, an origin match and a narrow verdict. It never prints response bodies or secrets, and never invokes write routes.

```sh
node cloudflare/mrliouword-private/verify-public.mjs \
  https://d54034aa-mrliouword-system.z814241.workers.dev/ \
  core-evidence-$(date -u +%Y%m%dT%H%M%SZ).json
node --test cloudflare/mrliouword-private/core-gate.test.mjs
```

For an owner-authorized read, provide `MRL_CORE_API_KEY` as an environment secret to the verifier. Do not put the value in a file, command argument, PR, or response receipt. The Worker patch expects the same Cloudflare Worker **secret**; with no secret configured, private routes return 503. Invalid credentials return 401. The original paths are preserved. This branch does not deploy, set secrets, or modify DNS.

AI generation, model inventory, tool execution, file upload and audit trace lookup currently have no connected backends in this source. The advertised particle route also has no implementation, and wake/sleep only changed a KV state flag in a request-local persona object. These paths now return 503 with `ok: false` rather than implying that a connected runtime exists. The root exposes their `capability_state` for honest discovery. KV memory writes still use multiple non-atomic `get`/`put` operations. Concurrent commits may fork or lose index updates, and the route must not receive a chain integrity PASS before a single-writer implementation, migration plan and live receipt are verified. Do not use a real user memory payload for probing.

Provenance boundary: the live Workers hostname returned a matching root JSON on 2026-09-24, but this alone does not bind it to this repository, this source file, a commit, or a deployment ID. Production deployment and full request → response → persistence → provenance closure stay open until an owner account deployment receipt establishes that mapping.
