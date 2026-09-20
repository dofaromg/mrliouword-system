# 連接對照 — 存在的東西，接上了沒有

> origin_signature: MrLiouWord
> 產生工具：`tools/connection_audit.py`（可重跑，不需網路）
> 機器可讀報告：`registry/connection_audit.json`
> 盤點來源：`registry/cloudflare_inventory_2026-03-12.json`

## 這份文件回答什麼

兩個方向的同一個問題：

1. **帳號裡既有的東西，有多少在這個倉庫裡真的接上了？**（第 1–3 項）
2. **倉庫裡既有的東西，有沒有任何東西接著它？**（第 4–6 項）

第一部分由 `tools/connection_audit.py` 自動產生並在 CI 持續執行。
第二部分是 2026-09-20 的人工擴大稽核，結論都經過實跑驗證，來源記在各項之內。

## 現況

| 項目 | 數量 |
|---|---|
| 盤點中的雲端 Worker | **140** |
| 倉庫內可部署（有 wrangler 能讀到的設定） | **3** |
| 登記在 `cloudflare/config.json` 的服務 | 3 |
| 被倉庫內客戶端／文件參照 | 4 |
| 命名註冊表標記為 legacy alias | 2 |

**137 個雲端 Worker 在這個倉庫裡沒有任何原始碼或部署設定。** 它們存在、可能正在運行，但倉庫對它們一無所知——改不了、驗不了、也還原不了。

### 可從倉庫部署的三個

| Worker | 設定檔 | 命名狀態 |
|---|---|---|
| `mrliouword-private` | `cloudflare/mrliouword-private/wrangler.jsonc` | legacy alias → `MRL_System_Core`（`migrate_service_name`） |
| `particle-auth-gateway` | `cloudflare/particle-auth-gateway/wrangler.jsonc` | 未登記於註冊表 |
| `particle-api` | `cloudflare/particle-api/wrangler.toml` | legacy alias → `MRL_API_Gateway`（`quarantine_as_source_name`） |

## 需要決定的事項

以下是稽核查出、但**需要倉庫擁有者判斷**的項目。我沒有自行處置，因為每一項都牽涉到無法從倉庫驗證的雲端實況。

### 1. `wrangler 2.jsonc` — 綁定錯誤的休眠設定檔

根目錄有一個檔名含空格的 `wrangler 2.jsonc`，宣告 `name: mrliouword-private`。

**wrangler 不會讀取這個檔名**，所以它目前是休眠的——這是運氣好。它與正本 `cloudflare/mrliouword-private/wrangler.jsonc` 的差異不是版本新舊，而是**綁定指向不同的資源**：

| 項目 | `wrangler 2.jsonc` | 正本 |
|---|---|---|
| KV id | `8cd99b4a…`（**particle-auth-vault**） | `01275832…`（mrliouword-vault） |
| D1 | 無 | `mrliouword-db` |
| R2 | 無 | `mrlioubook` |
| vars | `"MASTER_KEY": ""` | `ORIGIN`、`VERSION` |

若有人把它改名為 `wrangler.jsonc`，或以 `--config "wrangler 2.jsonc"` 部署，`mrliouword-private` 會被指向**認證用的 KV**，且 `MASTER_KEY` 會被一個空字串的明文 var 覆蓋掉 secret。

依「檔案不要亂刪、留存紀錄」的原則，**我沒有刪除它**，而是記錄在此。處置方式由擁有者決定。

> 附帶一提：2026-01-26 那次 `particle-api` 建置失敗的錯誤是
> `Missing entry-point to Worker script`——當時根目錄唯一的 wrangler 設定就是這個
> wrangler 讀不到的檔案。

### 2. `particle-chat-v42` — 會建立新 Worker 而非更新既有的

倉庫有 `particle-chat-v42/wrangler.jsonc`，其 `name` 為 `particle-chat-v42`。

盤點中有 `particle-chat`（編號 57），**沒有** `particle-chat-v42`。以目前設定部署會**新建一個 Worker**，而不是更新既有的 `particle-chat`。是刻意分版，還是名稱漂移，需要確認。

### 3. `mrl-system-core` — 不在盤點中，但可能只是時間差

根目錄 `wrangler.jsonc` 宣告 `name: mrl-system-core`，不在 2026-03-12 的盤點中。

但改名的 commit `df2e264`（naming: rename root Worker to MRL System Core）**晚於**盤點日期，所以這很可能只是時間差而非真的斷連。**需要一份新的盤點才能確認**，不應據此下結論。

## 倉庫內部：存在但沒有接上的東西

同一個問題的另一面。上面問的是「雲端有的，倉庫接上了嗎」；這一節問的是
「倉庫裡有的，有任何東西接著它嗎」。以下三項在 2026-09-20 的擴大稽核中查出。

### 4. `integrations/` 裡有 92 個 git 專案的 C/H 原始碼

commit `9133778`（2026-01-27，訊息只有 "Add files via upload"）把 git 專案本身的
原始碼樹倒進了 `integrations/`：

| 內容 | 數量 / 檔案 |
|---|---|
| git 的 `.c` / `.h` | 92 個 |
| git 的授權與說明文件 | `COPYING`(GPLv2)、`INSTALL`、`README.md`、`SECURITY.md`、`CODE_OF_CONDUCT.md` |
| 本專案真正的整合程式 | 17 個 `.py` + `notion/config.json` |
| 目錄總大小 | 2.0 MB |

具體影響，已實測而非推測：

- **`integrations/README.md` 是 git 的 README**（含 git 的 CI badge）。打開它的人拿到的是別的專案的說明文件。`SECURITY.md`、`CODE_OF_CONDUCT.md` 同理。
- **`COPYING` 是 GPLv2**，而 `pyproject.toml` 宣告 `license = {text = "MIT"}`。倉庫根目錄**沒有 LICENSE 檔**。
- **但發佈產物是乾淨的**：實跑 `setup.py sdist`，產出的 66 個檔案中 git 的 C/H 為 **0**，`COPYING` 也不在其中。`integrations/` 只帶進 17 個 `.py`。所以這不是已經外流的授權污染，是倉庫內的殘留。

依「檔案不要亂刪、留存紀錄」原則**未刪除**。處置由擁有者決定：移到
`vendor/` 或 `third_party/` 並附來源說明、或整批移除、或維持現狀。
無論哪一種，根目錄補一份 LICENSE 是獨立於此的一件事。

### 5. `integrations/google/` 與 `integrations/notion/` 缺 `__init__.py`

`find_packages()` 實跑結果：找到 `integrations`、`integrations.github`、
`integrations.particle`、`integrations.webgpu`——**沒有** `google` 與 `notion`。

也就是說 `integrations/google/integration.py`（Google Drive / Earth KML /
Sheets）與 `integrations/notion/sync.py` 安裝之後不可匯入。
`integrations/notion/config.json` 更是完全不會被打包。

沒有據此補 `__init__.py`，因為全倉庫**沒有任何地方匯入它們**（已 grep 確認），
兩個檔案都帶 `#!/usr/bin/env python3` 與 `argparse`，看起來是獨立腳本而非
函式庫模組。補 `__init__.py` 等於替擁有者決定它們是哪一種。要哪一種請指定。

### 6. 超過一半的 Python 從來沒有被任何檢查掃過

| 範圍 | `.py` 數 | CI 是否掃 |
|---|---|---|
| `mrliouword_agents/` | 22 | flake8 / black / mypy / bandit |
| `integrations/` | 13 | **無** |
| `scripts/` | 8 | **無** |
| `tools/` | 6 | **無** |

未受檢的 27 個比受檢的 22 個還多，而且正是 #71 修過五個靜默失敗缺陷、
#72 重寫過 Merkle 工具的地方。

**已處理**：flake8 致命集（E9,F63,F7,F82）已擴到這三個目錄（見 #71）。
第一次執行就抓到 `scripts/mrliouword_scanner.py:98` 的 `undefined name 'logger'`
——一個會把讀檔失敗轉成崩潰的真缺陷，已一併修正。

**未處理**：`black` 在這三個目錄有 23 個檔案需要重排版；`mypy` 會立刻被
`scripts/global_github_search.py` 的模組名衝突擋住。兩者都是另一件事，
沒有塞進同一次改動，以免大規模重排版把上面那個真缺陷蓋掉。

## 稽核工具的已知限制

誠實標記，避免把工具的輸出當成全知：

- **盤點是帶日期的快照**，不是即時狀態。`registry/cloudflare_inventory_2026-03-12.json` 由使用者提供，其來源標註為 Cloudflare API 即時拉取。在取得新盤點之前，任何「不在盤點中」的結論都受限於該日期。
- **URL 參照無法分辨範例與真實端點**。例如 `tools/deploy-enhanced.sh` 中的 `particle-edge` 只是互動提示裡的範例字串，不是實際呼叫。稽核會把它列出來，判讀時需人工確認。
- **只看 `name` 欄位**，不驗證該 Worker 在雲端是否真的存在、是否可達、綁定是否一致。
- **設定檔解析失敗會列在 `config_parse_failed`，不會被靜默略過。** 早期版本的 JSONC 處理只支援整行 `//` 註解，行末註解、區塊註解與尾隨逗號都會讓設定被丟掉、讓「倉庫可部署」少算——那正是本報告的主結論。現在改為逐字元掃描（字串內的 `//` 與 `,}` 不受影響），並把任何解析失敗明列在報告與 CI summary 中。`tests/test_connection_audit.py` 有 13 個回歸測試守著。

## 怎麼重跑

```bash
python3 tools/connection_audit.py            # 在倉庫根目錄
python3 tools/connection_audit.py <repo> <out.json>
```

CI 每次都會執行並把摘要寫進 job summary，完整 JSON 以 artifact 保存。這樣 137 這個數字不會在無人注意時悄悄變大。

## 取得新盤點之後

把新的盤點存成 `registry/cloudflare_inventory_<日期>.json`（**不要覆蓋舊檔**——舊檔是該時點的證據），稽核工具會自動採用日期最新的一份。
