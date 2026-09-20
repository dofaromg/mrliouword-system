# particle-api v3.0.0

> **統一整合版**：particle-api（R2 粒子操作）+ mrliouword-private（Memory / Persona）+ persistence-channel（KV↔D1 同步）
>
> Canonical 模組身分：**MRL_API_Gateway**
> 雲端資源名 `particle-api` 依 [命名註冊表](../../registry/MRL_System_MrliouAI_Naming_Registry_v1.yaml) 保留為實作識別碼（legacy alias，`disposition: quarantine_as_source_name`），不得作為現行產品或模組名稱使用。

## 這個模組解決什麼

Cloudflare 上有一個名為 `particle-api` 的 Workers 專案，透過 Git 整合連到本倉庫。每一次 push 都觸發建置，而每一次都失敗。

2026-01-26 的建置日誌給出了確切原因：

```
Executing user deploy command: npx wrangler versions upload
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

該專案的 deploy 指令是不帶任何參數的 `npx wrangler versions upload`，wrangler 會在建置根目錄尋找 `wrangler.toml` / `wrangler.jsonc`。當時倉庫根目錄只有一個 `wrangler 2.jsonc`（檔名含空格，wrangler 不會讀取），沒有任何它找得到的設定——**原始碼從來沒有被提交進倉庫**。

管線接上了，另一端卻沒有出口。本目錄就是那個出口。

## 本目錄的來源

`wrangler.toml`、`package.json`、`tsconfig.json`、`src/index.ts` 四個檔案**逐位元組原樣取自 `particle-api-v3.0.0.zip`**，未經改寫。這是實際運行的建構，不是依文件重建的推測版本。

## 綁定

| 類型 | binding | 目標 |
|---|---|---|
| KV | `MRLIOUWORD_VAULT` | `01275832766148bfbcaa00ee4aeb9946` |
| D1 | `DB` | `mrliouword-db` (`7980baaf-48d3-43cc-8be7-dd8c9590f3d1`) |
| R2 | `PARTICLES` | `mrlioubook` |
| Secret | `MASTER_KEY` | `wrangler secret put MASTER_KEY` |

## 端點

**系統**（公開，不需 `X-Master-Key`）

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/` | 系統資訊與端點清單 |
| GET | `/status` | 記憶統計、人格狀態、通道統計、心跳 |
| GET | `/heartbeat` | 心跳（相位／振幅／bpm） |

**R2 粒子**

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/r2/list` | 列出粒子。`?limit=`（預設 100，上限 1000）、`?cursor=` 續接 |
| GET | `/r2/get/:key` | 讀取粒子 |
| POST | `/r2/put/:key` | 寫入粒子 |

**分頁**：`/r2/list` 不帶參數時行為與原本完全相同（limit 100），既有的 `count` 與 `objects` 欄位形狀不變，只額外回 `limit`、`truncated` 與 `cursor`。`truncated` 為 `true` 時把 `cursor` 原樣帶回即可取得下一頁。

`POST /channel/sync/r2-index` 同樣支援續接：它會跨頁掃描，單次最多 50 頁（Worker 有 CPU 時間上限，無界迴圈在大 bucket 上會逾時）。未掃完時回應帶 `truncated: true` 與 `cursor`，把該 `cursor` 放進請求主體再送一次即可從中斷處接續。

**Memory**（SimHash64 + Merkle 鏈）

| 方法 | 路徑 | 說明 |
|---|---|---|
| POST | `/memory/commit` | 提交記憶，接上 Merkle 鏈 |
| POST | `/memory/recall` | 以 SimHash 漢明距離召回 |
| POST | `/memory/forget` | 標記刪除（保留條目，僅移出索引） |
| POST | `/memory/verify` | 驗證整條 Merkle 鏈 |
| GET | `/memory/stats` | 總數、分層統計、鏈頭 |

**Persona**

| 方法 | 路徑 | 說明 |
|---|---|---|
| POST | `/persona/wake` | 以喚醒鍵喚醒 |
| POST | `/persona/sleep` | 休眠 |
| GET | `/persona/list` | 人格列表 |

**Channel**（KV↔D1↔R2 同步）

| 方法 | 路徑 | 說明 |
|---|---|---|
| POST | `/channel/emit` | 發射粒子 |
| POST | `/channel/recall` | 召回 |
| POST | `/channel/stream` | 串流 |
| POST | `/channel/sync/kv-to-d1` | KV → D1 同步 |
| POST | `/channel/sync/r2-index` | 建立 R2 索引 |
| GET | `/channel/verify` | 驗證通道鏈 |
| GET | `/channel/stats` | 通道統計 |

### 認證

設定了 `MASTER_KEY` 之後，除 `/`、`/status`、`/heartbeat` 外的所有路徑都需要 `X-Master-Key` 標頭，否則回 401。未設定 `MASTER_KEY` 時全部開放——正式環境務必設定。

所有回應在主體中帶 `origin: MrLiouWord`。

## 部署：唯一需要在 dashboard 做的一步

倉庫這一側已經完備。但 **Cloudflare 要在哪個目錄尋找設定，是由該專案在 dashboard 的建置設定決定的**——那個設定不在倉庫裡，也無法從倉庫改。

在 Cloudflare dashboard → Workers & Pages → `particle-api` → Settings → Build：

```
Root directory:  cloudflare/particle-api
```

這一項設好之後，**既有的 deploy 指令 `npx wrangler versions upload` 不需要任何改動**——它會在該目錄找到 `wrangler.toml`，也會依該目錄的 `package.json` 安裝正確的三個依賴。

若不想改 Root directory，另一個等效做法是把 deploy 指令改成：

```
npx wrangler versions upload --config cloudflare/particle-api/wrangler.toml
```

倉庫根目錄也提供了對應的 npm script：

```bash
npm run deploy:particle-api
```

### 首次部署成功之後

1. `wrangler secret put MASTER_KEY` 設定主金鑰。
2. 確認 D1 `mrliouword-db` 中存在 `channel_sync` 資料表（`/channel/*` 會用到，`channel.init()` 負責建立）。
3. `GET /status` 應回傳版本、記憶統計與通道統計。
4. 把實際的 `*.workers.dev` URL 補進 [`cloudflare/config.json`](../config.json)。這裡刻意留空，因為在部署成功前寫入 URL 等於宣告一個沒有驗證過的事實。

## 本地驗證

`src/index.ts` 需要 `@cloudflare/workers-types`（`tsconfig.json` 已宣告）：

```bash
cd cloudflare/particle-api && npm install && npx tsc --noEmit
```

本次匯入時在無法連外的環境中，以等價於 `@cloudflare/workers-types` 的最小 ambient 宣告（`KVNamespace` / `D1Database` / `R2Bucket` / `R2Object`）在 `--strict` 下完成型別檢查，**零錯誤**。
