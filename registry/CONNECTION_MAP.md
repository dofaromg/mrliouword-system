---
canonical_authority: "Mr.liou"
origin_signature: "MrLiouWord"
source_repo: "dofaromg/mrliouword-system"
source_artifact: "registry/CONNECTION_MAP.md"
source_version: "見本檔案的 git 歷史"
derivative_role: "generated"
artifact_owner: "Mr.liou"
contributors:
  - "Mr.liou（canonical_authority：定義與裁決；提供雲端盤點來源）"
  - "Claude Code（tool：稽核實作與記錄撰寫）"
transformation: "由 tools/connection_audit.py 的輸出加人工判讀整理而成；未改動任何既有產物"
verification_status: "partial"
registry_status: "unregistered"
---

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

### 7. 來源鏈政策幾乎沒有產物遵守

`docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md` 第 4 節規定，任何使用 MRL / MrLiouWord / `mrl_` / 粒子系統定義的產物，都必須宣告十個欄位的完整來源鏈，並明文寫著：

> `origin_signature` 單獨存在不代表來源鏈完整；缺少 `canonical_authority`、`source_artifact` 或 `derivative_role` 時，必須判定為 **provenance incomplete**。

實際掃描全倉庫：

| 項目 | 數量 |
|---|---|
| 使用 MRL / MrLiouWord 的檔案 | **220** |
| 十個欄位齊全 | **1**（就是政策文件自己） |
| 只有 `origin_signature`（政策明定 provenance incomplete） | **94** |

這與本文件其他各項是同一個形狀：**規則寫在那裡，實況沒有跟上**。

**已處理的部分**：我自己新增的產物已補齊來源鏈——`tools/connection_audit.py`、`registry/CONNECTION_MAP.md`、`registry/cloudflare_inventory_2026-03-12.json`、稽核輸出 `registry/connection_audit.json`，以及 `cloudflare/particle-api/PROVENANCE.yaml`（外掛檔，因為匯入內容依規則 3 不得改寫）。

**未處理的部分**：其餘 90 幾個既有檔案沒有動。補來源鏈需要知道每個產物真正的作者、來源與轉換過程，那是我無法從倉庫查證的事，猜出來的來源鏈比沒有更糟。要補的話請一批一批給我事實，我照著記。

### 8. `mrl_` 前綴與 Registry Gate：我刻意沒有自行登錄

`registry/rules/naming_rules_v1.yaml` 的 Registry Gate 規定「未登錄產物不得取得 `mrl_` 鍵或出現在索引中」。

我新增在 `registry/` 下的三個檔案**都沒有** `mrl_registry_entry` 或 `mrl_ruleset` 標記，也沒有使用 `mrl_` 前綴，更沒有進入 `.mrliou/particle.index.json`。

這不是遺漏，是刻意的：`.mrliou/meta.json` 明定本倉庫 `naming_authority: false`、`governance_authority: false`，`.mrliou/authority-lock.json` 也寫著「`MRL_` 前綴保留給 registry-approved 產物」。**自行登錄等於替擁有者行使命名權**。要不要把它們登錄成正式 registry entry，請你決定。

> 附帶一提：`registry/system_registry.yaml` 本身也沒有登錄標記，所以這個漂移不是從我開始的。

### 9. 發布 Gate —— 外部要用就得守規則

政策第 8 節已經明文列出七道關卡，規定「任何 Release、官網頁面、套件、容器與 Worker 在發布前必須通過」，且「失敗項不得標示為 Canon、Official、Verified 或 source_of_truth」。

**但它一直只是文字。** 所以 `tools/release_gate.py` 把它做成會擋人的東西——七道關卡的名稱、欄位、允許值全部照政策原文，不新增任何規則（`.mrliou/meta.json` 明定本倉庫 `governance_authority: false`，執行規則可以，定義規則不行）。

首次執行結果：

| 項目 | 數量 |
|---|---|
| 第 8 節點名的發布產物 | **13** |
| 七道關卡全過 | **2** |
| 有未通過項 | **11** |

通過的兩個是 `cloudflare/particle-api/` 的套件與 Worker——也就是本輪剛補上來源鏈的那兩個。其餘 11 個的未通過項共 70 筆，記在 `registry/release_gate_baseline.json`。

**基準線是債務帳本，不是豁免清單。** 每一筆具名可查，而且 CI 只允許這個數字往下走：新增的違規一律擋下，舊的每修好一筆就移除一筆。

實測擋人的三種情境：

```
外部新增沒有來源鏈的 Worker      6/7 未通過 → exit 1
外部拿 legacy alias 當產品名      Naming Gate 指出 canonical 與 disposition → exit 1
宣告了來源鏈但把 AI 工具寫成作者   Contributor Role Separation 擋下
                                 且「未通過卻標示為 verified」一併擋下 → exit 1
```

最後一項特別值得記：政策第 3 節規定 AI 工具只能是工具／協作角色，不冒充人類來源。關卡會抓。

`tests/test_release_gate.py` 25 個測試守著，關卡本身的來源鏈也是 10/10——**規則要能約束自己才算數**。

#### 順帶查出的一件事

根目錄 `package.json` 的套件名是 `mrliouword-private`，那是 legacy alias（canonical `MRL_System_Core`，disposition `migrate_service_name`）。**npm 套件名是不折不扣的「現行產品名」**，依註冊表規則 2 不得如此使用。同樣的名字在四個地方出現。已記進基準線，處置是命名治理決定，由你定。

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
