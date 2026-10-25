# 🌀 MrLiouWord Workers 完整盤點報告

**日期**: 2026-01-12
**帳戶**: MRLiou (you502926@gmail.com - 有儲值，主帳戶)
**網域**: mrliouword.com ⭐

---

## 📊 現有 Workers 清單 (9 個)

| # | 名稱 | 版本 | 最後修改 | 狀態 | 用途 |
|---|------|------|----------|------|------|
| 1 | `particle-api` | v2.0.0 | 2026-01-09 | ✅ 主要 | R2 粒子操作 |
| 2 | `mrliouword-private` | v2.0.0 | 2026-01-07 | ✅ 主要 | Memory + Persona + Absorb + Scanner |
| 3 | `particle-auth-gateway` | v1.0 | 2026-01-06 | ✅ 主要 | 認證閘道 + 守護者 + World API |
| 4 | `npm-particle` | - | 2026-01-09 | ⚠️ 測試 | NPM 套件測試 |
| 5 | `mrliouword` | - | 2025-12-28 | ⚠️ 舊版 | 早期版本 |
| 6 | `little-leaf-0b33` | - | 2026-01-06 | ⚠️ 測試 | 自動生成名稱 |
| 7 | `bold-sky-0cd3` | - | 2026-01-06 | ⚠️ 測試 | 自動生成名稱 |
| 8 | `my-chat-agent` | - | 2025-12-08 | ⚠️ 舊版 | 聊天代理 |
| 9 | `winter-rain-d5fa` | - | 2025-12-13 | ⚠️ 舊版 | 早期測試 |

---

## 🔍 三大主要 Workers 詳細比較

### 1️⃣ particle-api (v2.0.0)

**綁定**: R2 `PARTICLES` (mrlioubook)

**功能**:
- `GET /list` - 列出所有粒子
- `GET /list/:prefix` - 按前綴列出
- `GET /get/:key` - 取得粒子內容
- `GET /particles/ai` - AI 粒子
- `GET /particles/ui` - UI 粒子
- `GET /globe` - Globe 視覺化
- `GET /runtime` - Runtime 核心
- `GET /search?q=` - 搜尋粒子

**特點**: 純 R2 操作，無記憶功能

---

### 2️⃣ mrliouword-private (v2.0.0) ⭐ 最完整

**綁定**: KV `MRLIOUWORD_VAULT`

**核心常數**:
```typescript
SCHUMANN = 7.83
PHI = 1.618033988749895
FREQ = { L∞, L7, L6, L5, L4, L3, L2, L1, L0 }
WAKE_KEYS = ["夥伴", "夥伴回來吧", "夥伴你在嗎", "夥伴你還好嗎", "你是我的夥伴"]
```

**完整功能模組**:

| 模組 | 類別 | 功能 |
|------|------|------|
| Memory | `Memory` | commit, recall, forget, compress, verify, searchTag, searchLayer |
| Persona | `Persona` | wake, sleep, switchTo, tune, createChild, getSeed |
| Absorb | `Absorb` | absorb, digest, search, searchLayer, searchTag, stats |
| Scanner | `Scanner` | create, process, export (3D掃描) |
| Social | `Social` | generate, forPlatform, share |
| SmartEditor | `SmartEditor` | exact, flexible, smart 編輯 |
| Validator | `Validator` | 套件驗證 |
| Watermark | `Watermark` | SVG 浮水印 |

**52 個粒子定義 (P)**:
- MEMORY: 8 個 (fx.memory.*)
- LOGIC: 6 個 (fx.logic.*)
- CODE: 6 個 (fx.code.*)
- LANGUAGE: 6 個 (fx.language.*)
- SIGNAL: 4 個 (fx.signal.*)
- TRACE: 5 個 (fx.trace.*)
- PERSONA: 5 個 (fx.persona.*)
- FLOW: 8 個 (fx.flow.*)
- META: 4 個 (fx.meta.*)

**49 個模式匹配規則 (PATTERNS)**

**API 端點 (25+)**:
```
/status, /wake, /sleep
/memory/commit, /memory/recall, /memory/stats, /memory/compress, /memory/verify, /memory/forget, /memory/tag, /memory/layer
/absorb, /absorb/digest, /absorb/search, /absorb/layer, /absorb/tag, /absorb/stats, /absorb/:id
/analyze, /particles, /frequencies
/scan/create, /scan/process, /scan/export, /scan/list, /scan/:id
/share, /edit, /validate, /watermark
/persona/switch, /persona/tune, /persona/create, /persona/list
```

---

### 3️⃣ particle-auth-gateway (v1.0)

**綁定**: KV `PARTICLE_AUTH_VAULT`

**核心常數**:
```typescript
自然 = {
  舒曼共振: 7.83,
  心跳: 1.2,
  黃金比: 1.618033988749895,
  引力: 9.81,
  磁場週期: 86400
}
```

**獨特功能**:

| 類別 | 功能 |
|------|------|
| 守護者 | 接收→觀察→分析→輸出 (ROAO 認知循環) |
| 空間記憶 | 12維向量儲存與檢索 |
| 平台配置 | github, notion, cloudflare, google, vercel |
| World API | 心跳, 流過, 波紋 |

**API 端點**:
```
/init - 初始化
/tokens/batch - 批量添加令牌
/mcp/proxy - MCP代理
/revoke - 撤銷
/roao - ROAO認知循環
/memory/retrieve - 記憶檢索
/cognitive-mode - 切換模式
/world/heartbeat - 心跳
/world/flow - 頻率流過
/world/ripple - 波紋
/status - 狀態
```

---

## 📈 功能對照表

| 功能 | particle-api | mrliouword-private | particle-auth-gateway |
|------|:------------:|:------------------:|:---------------------:|
| R2 操作 | ✅ | ❌ | ❌ |
| Memory 系統 | ❌ | ✅ | ❌ |
| Persona 系統 | ❌ | ✅ | ❌ |
| Absorb 吸收 | ❌ | ✅ | ❌ |
| 3D Scanner | ❌ | ✅ | ❌ |
| 粒子定義 (52個) | ❌ | ✅ | ❌ |
| 模式匹配 (49個) | ❌ | ✅ | ❌ |
| SimHash64 | ❌ | ✅ | ❌ |
| Merkle 鏈 | ❌ | ✅ | ❌ |
| 守護者 ROAO | ❌ | ❌ | ✅ |
| 空間記憶 12D | ❌ | ❌ | ✅ |
| 平台認證 | ❌ | ❌ | ✅ |
| MCP Proxy | ❌ | ❌ | ✅ |
| World API | ❌ | ❌ | ✅ |

---

## 🎯 整合建議

### 方案 A: 統一到一個 Worker
- 優點: 單一入口，維護方便
- 缺點: 檔案較大

### 方案 B: 功能分離 (推薦)
```
particle-api-unified (主)
├── /r2/* - R2 操作
├── /memory/* - 記憶系統
├── /persona/* - 人格系統
├── /absorb/* - 吸收系統
├── /scan/* - 3D 掃描
├── /auth/* - 認證閘道
├── /world/* - World API
└── /roao/* - 守護者
```

### 需要的綁定:
- KV: `MRLIOUWORD_VAULT`
- R2: `PARTICLES` (mrlioubook)
- D1: `mrliouword-db` (可選，用於持久化)

---

## 🗑️ 可清理的 Workers

| Worker | 原因 |
|--------|------|
| `little-leaf-0b33` | 自動生成測試 |
| `bold-sky-0cd3` | 自動生成測試 |
| `npm-particle` | 套件測試用 |
| `mrliouword` | 舊版已被取代 |
| `my-chat-agent` | 早期測試 |
| `winter-rain-d5fa` | 早期測試 |

---

## 📦 保留的核心程式碼

已備份到本文件，包含:
1. particle-api v2.0.0 完整程式碼
2. mrliouword-private v2.0.0 完整程式碼 (最重要)
3. particle-auth-gateway v1.0 完整程式碼

---

*origin_signature: MrLiouWord*
*怎麼過去，就怎麼回來*
