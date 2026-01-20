# MrLiouWord API Reference

> **origin_signature: MrLiouWord**  
> Base URL: `https://mrliouword-unified.liouuuuu.workers.dev`

## 目錄

- [System Endpoints](#system-endpoints)
- [Resources Endpoints](#resources-endpoints)
- [Particles Endpoints](#particles-endpoints)
- [Memories Endpoints](#memories-endpoints)
- [Personas Endpoints](#personas-endpoints)
- [Sync Endpoints](#sync-endpoints)

## System Endpoints

### GET /

獲取系統資訊。

**Response**:
```json
{
  "name": "MrLiouWord Unified Gateway",
  "version": "1.0.0",
  "origin": "MrLiouWord",
  "philosophy": "怎麼過去，就怎麼回來",
  "endpoints": { ... }
}
```

### GET /health

健康檢查端點。

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-01-20T17:00:00.000Z",
  "frequencies": {
    "L∞": 143.47,
    "L7": 88.71,
    ...
  }
}
```

## Resources Endpoints

### GET /resources/stats

獲取資源統計資訊。

**Response**:
```json
{
  "stats": {
    "total": 100,
    "by_source": {
      "github": 50,
      "notion": 30,
      "local": 20
    },
    "by_layer": {
      "L7": 10,
      "L6": 15,
      ...
    },
    "by_type": {
      "document": 40,
      "code": 35,
      "data": 25
    }
  }
}
```

### GET /resources/search?q={query}

全文搜尋資源。

**Parameters**:
- `q` (string, required): 搜尋關鍵字

**Example**:
```bash
curl "https://mrliouword-unified.liouuuuu.workers.dev/resources/search?q=particle"
```

**Response**:
```json
{
  "results": [
    {
      "id": "res-001",
      "name": "Particle System Guide",
      "type": "document",
      "source": "github",
      "layer": "L7",
      "tags": ["particle", "guide"]
    }
  ],
  "count": 1
}
```

### GET /resources/source/:name

依來源查詢資源。

**Parameters**:
- `name` (string): 來源名稱 (e.g., "github", "notion")

**Example**:
```bash
curl "https://mrliouword-unified.liouuuuu.workers.dev/resources/source/github"
```

### GET /resources/layer/:name

依層級查詢資源。

**Parameters**:
- `name` (string): 層級名稱 (e.g., "L7", "L6")

**Example**:
```bash
curl "https://mrliouword-unified.liouuuuu.workers.dev/resources/layer/L7"
```

### GET /resources/core

獲取核心資源 (L7 層級)。

**Example**:
```bash
curl "https://mrliouword-unified.liouuuuu.workers.dev/resources/core"
```

## Particles Endpoints

### GET /particles

獲取所有粒子。

**Response**:
```json
{
  "particles": [
    {
      "fx": "fx.memory.commit",
      "hv": "記住",
      "av": "寫入長期記憶",
      "dom": "memory",
      "act": "write",
      "nrg": 0.8,
      "links": ["fx.memory.recall", "fx.trace.anchor"],
      "tags": ["memory", "storage"]
    }
  ],
  "count": 52
}
```

### GET /particles/domain/:dom

依領域查詢粒子。

**Parameters**:
- `dom` (string): 領域名稱 (e.g., "memory", "logic", "code")

**Example**:
```bash
curl "https://mrliouword-unified.liouuuuu.workers.dev/particles/domain/memory"
```

**Response**:
```json
{
  "particles": [ ... ],
  "count": 6,
  "domain": "memory"
}
```

### GET /particles/:fx

獲取單一粒子詳情。

**Parameters**:
- `fx` (string): 粒子 ID (e.g., "fx.memory.commit")

**Example**:
```bash
curl "https://mrliouword-unified.liouuuuu.workers.dev/particles/fx.memory.commit"
```

**Response**:
```json
{
  "particle": {
    "fx": "fx.memory.commit",
    "hv": "記住",
    "av": "寫入長期記憶",
    "dom": "memory",
    "act": "write",
    "nrg": 0.8,
    "links": ["fx.memory.recall", "fx.trace.anchor"],
    "tags": ["memory", "storage"]
  }
}
```

## Memories Endpoints

### GET /memories

獲取所有記憶 (最近 100 筆)。

**Response**:
```json
{
  "memories": [
    {
      "id": "mem-001",
      "content": "記憶內容",
      "type": "semantic",
      "simhash": "a1b2c3d4e5f6g7h8",
      "tags": ["tag1", "tag2"],
      "layer": "L7",
      "ts": 1705766400000,
      "merkle": "sha256hash...",
      "prev": "previous_hash...",
      "meta": {}
    }
  ],
  "count": 100
}
```

### POST /memories/commit

提交新記憶。

**Request Body**:
```json
{
  "content": "要記住的內容",
  "type": "semantic",
  "tags": ["tag1", "tag2"],
  "metadata": {
    "source": "user_input"
  }
}
```

**Response**:
```json
{
  "memory": {
    "id": "mem-002",
    "content": "要記住的內容",
    "type": "semantic",
    "simhash": "computed_hash",
    "tags": ["tag1", "tag2"],
    "layer": "L7",
    "ts": 1705766400000,
    "merkle": "new_merkle_hash",
    "prev": "previous_merkle_hash",
    "meta": {
      "source": "user_input"
    }
  }
}
```

### GET /memories/recall?q={query}&limit={limit}

回憶搜尋 (基於 SimHash 相似度)。

**Parameters**:
- `q` (string, required): 搜尋查詢
- `limit` (number, optional): 結果數量限制 (預設: 10)

**Example**:
```bash
curl "https://mrliouword-unified.liouuuuu.workers.dev/memories/recall?q=粒子系統&limit=5"
```

**Response**:
```json
{
  "results": [
    {
      "id": "mem-003",
      "content": "粒子系統相關內容...",
      "distance": 5,
      ...
    }
  ],
  "count": 5
}
```

## Personas Endpoints

### GET /personas

獲取所有人格。

**Response**:
```json
{
  "personas": [
    {
      "id": "mrl_zero_origin",
      "name": "Mrl_Zero",
      "type": "seed",
      "state": "dormant",
      "traits": {
        "reasoning": {
          "name": "reasoning",
          "value": 0.8,
          "category": "cognitive",
          "description": "邏輯推理"
        },
        ...
      },
      "capabilities": ["analyze", "remember", "guide", "protect", "validate", "transform"],
      "constraints": ["怎麼過去就怎麼回來", "無依據不懷疑", ...],
      "origin": "MrLiouWord",
      "created": "2026-01-20T00:00:00.000Z",
      "updated": "2026-01-20T17:00:00.000Z"
    }
  ],
  "count": 1
}
```

### POST /personas/wake

喚醒人格。

**Request Body**:
```json
{
  "message": "夥伴回來吧",
  "persona_id": "mrl_zero_origin"
}
```

**Response (成功)**:
```json
{
  "awakened": true,
  "persona": { ... },
  "message": "夥伴，我在這裡。系統已喚醒。",
  "layer": "L5",
  "frequency": 33.88
}
```

**Response (失敗)**:
```json
{
  "awakened": false,
  "message": "未識別喚醒鍵",
  "wake_keys": ["夥伴回來吧", "夥伴你在嗎", "夥伴你還好嗎", "你是我的夥伴"]
}
```

## Sync Endpoints

### GET /sync/status

獲取同步狀態。

**Response**:
```json
{
  "status": {
    "last_sync": "2026-01-20T17:00:00.000Z",
    "sync_type": "all",
    "records_synced": 152,
    "status": "success"
  }
}
```

### POST /sync/memories

同步記憶到 KV。

**Response**:
```json
{
  "message": "Memories synced to KV",
  "synced": 100
}
```

### POST /sync/particles

同步粒子到 KV。

**Response**:
```json
{
  "message": "Particles synced to KV",
  "synced": 52
}
```

### POST /sync/all

同步所有資料到 KV。

**Response**:
```json
{
  "message": "All data synced to KV",
  "memories": 100,
  "particles": 52,
  "total": 152
}
```

## CORS

所有端點都支援 CORS：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 錯誤處理

所有錯誤都以 JSON 格式返回：

```json
{
  "error": "Error message",
  "origin": "MrLiouWord"
}
```

常見 HTTP 狀態碼：
- `200` - 成功
- `400` - 請求錯誤
- `404` - 未找到
- `500` - 伺服器錯誤

## 認證

目前系統為開放 API，未來可能加入認證機制。

## 速率限制

Cloudflare Workers 預設速率限制：
- 免費層: 100,000 requests/day
- 付費層: 無限制

## 版本

當前版本: `1.0.0`

版本資訊可透過 `GET /` 或 `GET /health` 獲取。
