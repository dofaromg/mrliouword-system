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

## Construction addendum — 2026-09-24 (supersedes capability statements above)

Canonical authority: Mr.liou. Origin signature: MrLiouWord.
The preceding section is retained as historical branch evidence.

Implemented:
- A single `Mrliou_CoreMemory` Durable Object owns the entire existing chain,
  using identity `MrLiouWord:core-memory:v1`. Entry, checkpoint and retry key
  commit in one storage transaction. Both memory commit routes use it.
- `Idempotency-Key` returns the same record after a retry/restart; reusing a key
  for a different payload returns 409. Existing clients may omit this header.
- New version-2 hashes cover the complete canonical entry, including metadata,
  ID, sequence and owner attribution. Legacy entries retain the exact original
  ID, timestamp, format and Merkle hash; their old hash coverage is unchanged.
- Explicit `POST /memory/migrate` validates the legacy index, each chain link,
  final head, missing/duplicate/orphan entries and stable start/end snapshots.
  It retains KV and stores original entry bytes. Nothing is silently regenerated.
  Migration is bounded to 1000 entries / 8 MiB; larger histories return 413 and
  require a staged importer. No truncation or partial-success receipt.
- Local tools: `sha256`, `simhash64`, `memory.stats`, `memory.verify`,
  `memory.recall`. Unknown tool names are rejected.
- R2 raw-body uploads (maximum 8 MiB) use unique keys and return size, SHA-256,
  ETag and an actual read-after-write verification.
- Audit traces expose real memory commit records only. They are not yet a
  general record of every tool, inference, persona or file event.
- Particle inventory lists existing `particles/` R2 objects with pagination.
- Persona wake/sleep persists the active persona across requests. This is
  persona state, not proof of an active model or DL580 session.
- AI endpoints use an explicitly configured OpenAI-compatible owner runtime,
  `MRL_API_BASE_URL` plus separate `MRL_RUNTIME_API_KEY`. They never forward
  the public owner API key, follow redirects or return invented model text.

### Local verification

From this Worker directory:

```sh
npm ci --no-audit --no-fund
npm test
npm run build
```

Tests exercise the real local workerd/Miniflare storage runtime, 32 concurrent
writes, retry deduplication, process restart, legacy byte preservation, orphan
rejection, tamper detection, R2 readback and persona state. Runtime adapter
tests use controlled upstream responses; they do not establish live inference.
The build command compiles locally and validates exports/bindings. It does
not contact Cloudflare or prove that a deployment succeeds.

### Deployment and cutover conditions

1. Bind the intended Cloudflare account/Worker/deployment ID to a source SHA.
   The checked-in name is `mrliouword-private`; the observed live preview is
   named `mrliouword-system`. This mismatch must be resolved from account
   evidence before deployment. Keep existing names and routes until resolved.
2. Provision `MRL_CORE_API_KEY` as an owner-held secret and verify all clients.
   The new DO binding and SQLite class migration are in `wrangler.jsonc`.
3. Stop legacy writers, including accessible old preview versions/aliases.
   KV snapshot comparison cannot itself prove global quiescence or overcome
   eventual consistency. Obtain an owner/account receipt that writers stopped.
4. Reconcile/export KV, including orphan checks and the authoritative total/head.
   Invoke `POST /memory/migrate` with
   `{"writers_paused":true,"expected_total":N,"expected_head":"observed head"}`.
   The boolean is an operator attestation, not automatic proof of quiescence.
   Until migration succeeds, new memory reads/writes return 503.
5. Verify one authorized append/readback/chain using:
   `node verify-write.mjs https://OWNER-VERIFIED-HOST/ receipt.json --write`.
   Supply the secret through the environment; never in command arguments.
   This creates one retained test record. A timed-out write is never retried
   automatically. Reconcile by probe ID before retrying manually.
6. Verify restart, full account deployment mapping and DL580/model receipts.
   A local test or a successful legacy live append does not complete these gates.

No production deployment is claimed by this addendum. The existing unauthenticated
preview still requires the authorization/cutover repair before private content
is suitable for that public endpoint. The live test used non-sensitive synthetic
content only, under explicit owner authorization.



## 2026-09-26 current-status correction

The earlier source and deployment statements are dated historical observations.
PR #84 was merged as dd13aa1c1208b26ab086967ddac41de01d85eb4f.
[PR #86](https://github.com/dofaromg/mrliouword-system/pull/86) records a subsequent
production deployment and 19/19 live assertions for version
157336c5-8be8-40bc-91be-2d0d3e0a070b.
[Cloudflare's receipt](https://github.com/dofaromg/mrliouword-system/pull/86#issuecomment-5845996222)
reports a successful build deployment at head
85655319fced8e89676cc7cf8b333e8d5745e57d. This correction reads those stored records;
it does not claim to have repeated their live tests.

An unconfigured or unverified adapter in this Worker does not establish that the
owner's existing DL580/MRL Mother or its services are absent or stopped.
Record Worker adapter status, Mother runtime status, observations and individual
commercial transaction status separately. Tool access failures and scoped gates
cannot waive or transfer the owner's origin, product authority or retained rights.
The previous dated constraints remain evidence of that investigation only.

No Worker runtime, authentication, route, DNS or storage setting is changed by this
documentation correction. The separate particle-api status is not inferred from Core.
