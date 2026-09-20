# particle-api

> Canonical 模組身分：**MRL_API_Gateway**
> 雲端資源名 `particle-api` 依 [命名註冊表](../../registry/MRL_System_MrliouAI_Naming_Registry_v1.yaml) 保留為實作識別碼（legacy alias，`disposition: quarantine_as_source_name`），不得作為現行產品或模組名稱使用。

## 這個模組解決什麼

Cloudflare 上有一個名為 `particle-api` 的 Workers 專案，透過 Git 整合連到本倉庫。每一次 push 都會觸發它的建置，而**它每一次都失敗**——因為在此之前，倉庫裡從來沒有任何 `particle-api` 的 wrangler 設定或進入點。它是一條接上了、但另一端沒有出口的管線。

這個模組就是那個出口。

端點規格不是憑空設計的，來自倉庫既有文件 [`WORKERS_COMPARISON.md`](../../WORKERS_COMPARISON.md) 中記載的 particle-api v2.0.0：R2 粒子操作、綁定 `PARTICLES` → `mrlioubook`、八個端點。

## 端點

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/` | 模組身分與端點清單 |
| GET | `/health` | 健康檢查（會實際觸碰一次 R2） |
| GET | `/list` | 列出所有粒子 |
| GET | `/list/:prefix` | 按前綴列出 |
| GET | `/get/:key` | 取得粒子原始內容 |
| GET | `/particles/ai` | AI 粒子（前綴 `ai/`） |
| GET | `/particles/ui` | UI 粒子（前綴 `ui/`） |
| GET | `/globe` | Globe 視覺化 |
| GET | `/runtime` | Runtime 核心 |
| GET | `/search?q=` | 搜尋粒子 |

所有回應都帶 `X-Origin-Signature: MrLiouWord` 標頭；JSON 回應另外在主體中帶 `origin` 欄位。這是為了滿足註冊表「所有公開回應必須包含 origin_signature」的規則——原始內容回應無法內嵌欄位，因此一律以標頭攜帶。

### 兩個需要說明的語意

**`/globe` 與 `/runtime`**：`WORKERS_COMPARISON.md` 只留下端點名稱，原 Worker 的確切語意無法從倉庫還原。這裡採**先精確後前綴**：先當成單一物件 key 取，取不到才退回同名前綴的列表。

**`/search?q=`**：R2 不提供內容檢索，因此這是**對 key 名稱**的子字串搜尋，不是全文搜尋。回應中的 `scope: "key_name"` 明示了這一點。

## 部署：唯一需要在 dashboard 做的一步

倉庫這一側已經完備。但 Cloudflare 要往**哪裡**找設定，是由該專案在 dashboard 的建置設定決定的——那個設定不在倉庫裡，也無法從倉庫改。

在 Cloudflare dashboard → Workers & Pages → `particle-api` → Settings → Build，擇一設定：

**方式 A（建議）— 指定 Root directory**

```
Root directory:  cloudflare/particle-api
```

wrangler 會自動採用該目錄下的 `wrangler.jsonc`。

**方式 B — 指定 Deploy command**

```
Deploy command:  npx wrangler deploy --config cloudflare/particle-api/wrangler.jsonc
```

倉庫根目錄也提供了對應的 npm script：

```bash
npm run deploy:particle-api
```

## 首次部署成功之後

1. 把實際的 `*.workers.dev` URL 補進 [`cloudflare/config.json`](../config.json) 的 `workers` 區段。這裡刻意留空，因為在部署成功前寫入 URL 等於宣告一個沒有驗證過的事實。
2. 確認 R2 bucket `mrlioubook` 已存在且該 Worker 有存取權。
3. `GET /health` 應回傳 `bucket_reachable: true`。

## 本地驗證

型別檢查（strict，無外部型別相依）：

```bash
npx tsc cloudflare/particle-api/src/index.ts --noEmit --strict --types --target ES2022 --module esnext --moduleResolution bundler
```

`src/index.ts` 刻意不相依 `@cloudflare/workers-types`，R2 綁定所需的型別以最小結構型別就地宣告，因此在任何環境都能單檔編譯。
