# Mrliouword Mother Gateway

Labels: `Mrliouword`, `MrliouAI`, `MrliouhanAI`, `FlowAgent`

Owner: `Mrliouword`

Origin signature: `MrLiouWord`

## Deployment principle

This gateway is self-hosted and must remain operational without Cloudflare or any other external edge provider.

External platforms are optional adapters only.

## Runtime path

```text
Phone (Android / iOS)
        |
        v
FlowAgent Runtime
        |
        v
Mrliouword Mother Gateway
        |
  +-----+-----------+
  |     |           |
  v     v           v
Memory  Tool Router Service Registry
Runtime
        |
        v
DL580 / self-hosted infrastructure
```

## Responsibilities

### Phone client

- Sends user requests and device capability events.
- Receives streaming responses.
- Does not contain the system root of trust.

### FlowAgent Runtime

- Loads persona, context and task state.
- Executes the Flow loop: Input -> Transform -> Decide -> Act -> Commit.
- Delegates infrastructure access through the Mother Gateway.

### Mrliouword Mother Gateway

- Authentication and request verification.
- Runtime routing.
- Memory routing.
- Tool routing.
- Service discovery.
- Streaming transport.

### Memory Runtime

- Append-only event log.
- Snapshot loading and writing.
- Index rebuild and retrieval.

### Tool Router

- Local filesystem and process tools.
- Internal APIs.
- Optional external adapters.
- No mandatory dependency on Cloudflare, Pipedream or other SaaS platforms.

### Service Registry

- Registers local services.
- Tracks health and endpoint metadata.
- Resolves service capabilities for FlowAgent Runtime.

### DL580 / self-hosted infrastructure

- Root data sovereignty.
- Persistent memory storage.
- Model serving.
- Runtime execution.

## Adapter boundary

Optional integrations must live behind adapters:

```text
adapters/
  cloudflare/
  pipedream/
  github/
  notion/
```

Removing any adapter must not break the core runtime.
