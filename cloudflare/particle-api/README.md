# particle-api v3.0.0

> **2026-09-22 Channel 修補**：下方早期匯入／部署說明保留為歷史。
> 本次 binding、migration、切換與驗收，以文末「Channel 單寫者修補」為準；
> 首次新增 DO migration 不能用 `versions upload` 代替部署。

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

`POST /channel/sync/r2-index` 同樣支援續接：它會跨頁掃描，**單次最多處理 1000 個物件**，寫入以每批 100 筆的 `db.batch()` 送出（單次 Worker 呼叫最多 10 次 D1 往返）。

兩個上限同時存在——Worker 的 CPU 時間，以及 D1 單次 Worker 呼叫內的查詢數。無界迴圈在大 bucket 上會中途失敗**且不回傳續接點**，留下索引到一半的狀態。未掃完時回應帶 `truncated: true` 與 `cursor`，把該 `cursor` 放進請求主體再送一次即可接續。

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

## Channel 單寫者修補 — 2026-09-22

來源 main：`3ef4d1f31e79bc93c2f6a47804c83eea0df61fab`，包含 PR #77 merge
`7561cc16c3c5e217753ac426f13d25299220d0ab`。完整來源見
[PROVENANCE.yaml](PROVENANCE.yaml) 的 `channel_single_writer_20260922`。

### 實作與相容性

- `MRL_CHANNEL_CHAIN` 綁定匯出的 `Mrliou_ChannelChain`，整張 `channel_sync`
  固定使用 `idFromName("MRL_API_Gateway:channel_sync:v1")`。不可改成每 key 一個 DO。
- DO 內的 Promise 佇列跨越 D1／KV／R2 的 await，序列化完整 Channel 操作。
  只建立 DO 本身不足以保護外部 I/O 的交錯；不以 30 秒限時的
  `blockConcurrencyWhile` 包住最多 1000 個物件的同步工作。
- `/channel/emit`、`/channel/sync/kv-to-d1`、`/channel/sync/r2-index` 都走此物件。
  recall／stream／verify／stats 同樣排入佇列，`/status` 取得此物件的統計。
  公開 URL、method、既有驗證與原有成功欄位保留。
- D1 保留所有原始列、欄位、hash 公式與歷史順序。DO SQLite namespace 是
  協調資源，**沒有把既有 D1 資料搬到 DO SQLite**。binding 缺失／DO 不可用回 503。
- 每筆 INSERT 在同一 SQL 中比對當下 D1 鏈尾；若舊執行個體的延遲請求遇到
  已前進的 head，回 `409 CHANNEL_HEAD_CHANGED`，不建立 sibling，也不自動重播。
- 先提交 D1 再投影 KV。D1 失敗不發布 KV；D1 成功但 KV 失敗回 503，附
  `committed: true`、`entry`、`kv_sync: false`。須用 entry.id 查證，不盲目重送。
  已提交 Channel key 的 recall 以 D1 為準，避免 KV 過期值／部分投影。
- 新列 `created_at` 保留實測時鐘，`synced_at` 不小於既有鏈尾時間，避免時鐘倒退
  把新列排在前面。已有列的任何 timestamp 都不重写。
- 冷啟動、失敗後、或 D1 的 count/head 與上次確認不同時，追加前驗證歷史。
  歷史分叉／hash 不符回 `409 CHANNEL_HISTORY_INVALID`；舊 `UNIQUE(key)` 回
  `409 CHANNEL_LEGACY_UNIQUE_KEY`。兩者均保留原始資料，沒有隱性重建表。
- R2 每批最多 100 筆，成功提交後才推進鏈尾；第 N 批失敗保留前 N-1 批。
  此 API 不是 exactly-once。斷線／逾時／部分批次失敗後，先核對 D1，不能自動重播。
- `/channel/stats` 附加 `single_writer.class_name`、`object_name`、`build_sha`。
  `MRL_BUILD_SHA` 必須在部署時注入精確 commit，未注入則是 null，不假冒已驗版本。

### 本地驗證與 CI

```bash
cd cloudflare/particle-api
npm ci --no-audit --no-fund
npm run typecheck
npm test
WRANGLER_SEND_METRICS=false npm run deploy:check
```

鎖檔固定 Wrangler 4.60.0、Miniflare 4.20260120.0、TypeScript 5.9.3。
指令明確指定 `--config wrangler.toml`：Wrangler 對 json/jsonc 的向上搜尋
可能先選到根目錄別的 Worker，不能只依賴 working-directory。
`deploy:check` 只做本地配置解析與打包，不能證明帳號權限、migration 或 live traffic。
CI 工作流 `MRL Channel Single Writer` 執行同樣的測試，不從 PR 取得部署 secrets。

測試以 workerd/Miniflare 的 DO、D1、KV、R2 驅動真實 fetch 路由：多個 Worker
實例共用同一 DO、同 key 追加、混合寫入、多批 R2、故障注入、重啟、舊分叉、
舊 UNIQUE(key)、時鐘倒退、binding 故障、auth、精確 SHA 部署驗證器與分頁續接。

### 首次 migration 與現有路由切換

1. 先用帳號內已觀測的 metadata 核對既有 Worker `particle-api`、D1
   `7980baaf-48d3-43cc-8be7-dd8c9590f3d1`、KV `01275832766148bfbcaa00ee4aeb9946`、
   R2 `mrlioubook`、既有 routes/custom domains/workers.dev、MASTER_KEY 已設定，
   以及既有 DO migrations/tags。不得用 README 或本地 config 推論線上狀態。
   保存部署版本／route 設定回執；資料庫快照／Time Travel bookmark 保存在私人位置。
2. 執行唯讀 D1 檢查，將真實輸出保存在私人證據空間：
   `npx wrangler d1 execute mrliouword-db --remote --config wrangler.toml --file scripts/channel-preflight.sql`。
   若缺表、舊 UNIQUE(key)、重複 prev、斷鏈或不明寫入者，停止切換並保留 delta。
   不自動改 schema、不刪 sibling、不重寫 hash。
3. 在既有生產者端暫停三種 Channel 寫入，確認已送出的舊版請求及同步工作全部結束。
   盤點所有共用該 D1 的 Worker／排程／外部直接寫入者，不能只停 HTTP emit。
   不變更 DNS／路由。**不可新旧寫入版本並跑或以百分比流量漸進切換**。
4. `wrangler.toml` 的 migration tag `mrliou-channel-chain-v1` 建立
   SQLite-backed `Mrliou_ChannelChain`。這是新增 class，不是 D1 table migration。
   首次應使用完整 `wrangler deploy`，`versions upload` 不支援上傳帶新 migration
   的版本；Cloudflare Builds 目前若仍用 upload，不能把它當這次完成證據。
   保留原 Worker 名、binding IDs、既有路由設定及帳號端 vars。
   以下命令只在前述帳號核對／排空完成後執行：

   ```bash
   mrl_release_sha="$(git rev-parse HEAD)"
   npx wrangler deploy --config wrangler.toml --keep-vars --var "MRL_BUILD_SHA:$mrl_release_sha"
   ```

   部署後逐項核對 route/custom domain/workers.dev 與切換前一致；若 Wrangler 顯示
   將改動既有 routes，先停止並將已觀測的既有設定精確回填，不猜測或接受路由刪除。
5. 保存 Cloudflare deployment/version ID、migration tag、namespace ID、UTC 時間、
   exact SHA、bundle SHA-256。`GET /channel/stats` 必須回同一 SHA 與固定 object name。
6. 驗證器以既有公開 origin 執行。`MRL_MASTER_KEY` 由安全環境提供，不寫入指令或提交。
   唯讀驗收：
   `node scripts/verify-channel-deployment.mjs --url "$MRL_CHANNEL_URL" --expected-sha "$mrl_release_sha" --receipt "$MRL_RECEIPT_PATH"`。
   並行驗收另外指定 `--append 32`：會永久追加具名測試事件；不刪除、不自動重試。
   `--receipt` 在任何 HTTP 請求前以 exclusive create 保留新檔名；路徑已存在或
   無法建立時，不送請求、不追加資料、不覆蓋舊證據。程序中斷留下的空回執僅表示
   未完成，須保留並核對 D1，不可視為成功或自動重送。
   每個請求在送出前登記 operation，保留 path、寫入 key、開始／結束時間及結果。
   斷線、逾時、回應 body 損壞或 JSON 解析失敗仍保留該筆 operation；emit 的
   `commit_state: unknown` 表示須查 D1，不能推定未寫入。明確的 committed 回執
   或帶 entry.id 的成功回應才標 `committed`。這些欄位附加於原回執，沒有自動重送。
   正常結束時才將完整回執落盤；強制終止仍可能留下空 reservation，須保留查證。
7. 只有 live 版本、綁定、歷史完整性、並行 receipt 與原路由均驗證，才能恢復生產者
   寫入並宣告 production PASS。出錯時保持暫停，修正後再前進；**不可回滾成舊的
   直接 D1 寫入程式**，不可刪除 DO class／namespace 或更改固定 object identity。

### 必須成立的驗收條件

| 條件 | 必要證據 |
| --- | --- |
| N 筆已接受寫入形成單鏈 | N 個唯一 id、無重複 prev、全鏈 verify.valid=true、checked 增加 N |
| 三種寫入入口共用單寫者 | emit + KV sync + R2 index 混跑，所有記錄 hash／prev 正確 |
| 既有歷史不變 | 切換前後同一批舊列的 id/value/hash/prev/timestamp 逐項一致 |
| 故障不污染後續 head | D1 拒寫無 KV 發布；R2 失敗批次不留部分列；下一筆接實際鏈尾 |
| 延遲提交不能越過新 head | 在讀 head 與 INSERT 間注入競爭提交，延遲寫入被拒絕，既有鏈仍完整 |
| KV 部分失敗可追溯 | 回 committed receipt、D1 保留列、recall 讀到同一 id |
| 並行驗收遇到不確定回應仍可追查 | 提交後斷線／JSON 損壞，所有嘗試 key 均留在 receipt；unknown 不當作未提交，無重送 |
| 重啟與時間漂移安全 | DO 重啟接回 D1，時鐘倒退不重排原始列 |
| 既有錯誤不被抹除 | 舊 fork／UNIQUE(key) 明確阻擋追加，原始證據完整留存 |
| 精確線上版本 | Cloudflare version + namespace + exact SHA + live receipt，不能用 dry-run 代替 |
| 路由與主權一致 | 既有 routes 不變；canonical_authority=Mr.liou；origin_signature=MrLiouWord |

### 官方行為依据

- [DO State：外部 async I/O 的交錯與 30 秒 blockConcurrencyWhile 限制](https://developers.cloudflare.com/durable-objects/api/state/)
- [DO migrations：新 SQLite class 與首次 deploy](https://developers.cloudflare.com/durable-objects/reference/durable-object-class-migrations-legacy/)
- [D1 binding／batch 交易](https://developers.cloudflare.com/d1/worker-api/d1-database/)

上述說明不宣稱任何尚未實際取得的生產部署證據。Memory／Persona 另有自己的鏈，
本次 Channel 修補不代表那些子系統的並行問題已解決。
