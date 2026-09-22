---
# 十欄來源鏈，依 docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md §4
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: 外部（權利人上傳，非本倉庫產出；Notion 增補頁自述為依 Mr.liou 指示的 AI 協作建構）
source_artifact: MRL_World_Model_Commercial_Governance_20260922_v1.zip（上傳時檔名 63fdf8ed-MRL_World_Model_Commercial_Governance_20260922_v1_1.zip；解壓根目錄 MRL_BridgeNeuralLink_API_Dispatch_v1/）
source_version: "20260922-v1"
derivative_role: mirror
artifact_owner: Mr.liou
contributors:
  - Mr.liou（canonical_authority；指示建構；2026-09-22 上傳本包）
  - 建構本包的 AI 協作方（包內未具名；Notion 增補頁載明「依 Mr.liou 指示」）
  - Claude Code（本倉庫：逐字解壓保存、雜湊核對、實跑包內測試、Notion／Drive 連接器核對、撰寫本索引）
transformation: >-
  逐字解壓至 registry/evidence/packages/MRL_BridgeNeuralLink_API_Dispatch_v1/，
  未改任何位元組（diff -r 對照 zip 原樣為空）。本索引另記核對結果與驗不了的 delta。
verification_status: partial   # 包內自檢與 Notion 增補頁上的 zip 雜湊實測相符；upstream 位元組、憲章頁快照版本、live 接線驗不了，見第四節
source_sha256: 75df21d619f007adb241ce43999d133f6a7004069d815a9af2a4d4089786f469
preserved_at: "2026-09-22"
---

<!-- mrl-origin: MrLiouWord -->

# MRL_BridgeNeuralLink_API_Dispatch_v1 —— 索引與核對

> **這是逐字保存，不是本倉庫的主張。**
> 原 zip 由權利人於 2026-09-22 上傳，SHA-256 見上方 front matter。
> 檔案在 `packages/MRL_BridgeNeuralLink_API_Dispatch_v1/`，一個位元組都沒動。
> 依 `.mrliou/meta.json` `history_policy: append_only`，本檔只新增、不覆寫。
>
> **本倉庫沒有、也不會啟用這個派工服務。** 沒有設定任何 token、沒有填 model ID、
> 沒有把 `live_enabled` 改成 true。這裡只是保存原件。

## 一、這包是什麼（依包內自述）

- 承接 `Mrliou_MRL_RooClaudeCode_BridgeNeuralLink_v1`；Notion 為唯一內部定義根源，本包是派生工程／證據副本
- `dispatch.py`：三方 provider（OpenAI / Anthropic / Gemini）review-only 派工、SQLite 佇列、回執鏈；只聽 `127.0.0.1:8101`
- `commercial_gate.py`：十二項權利存在性檢查，**只報缺口，不核准商業**
- `GOVERNANCE_ADDENDUM.md`：18 節商業規則增補，`construction_status: BUILT_FOR_REVIEW`、`commercial_decision: COMMERCIAL_UNRESOLVED`
- `upstream/*.ts`：五個「byte-preserved Drive originals, reference only」
- 自述邊界：`LOCAL_VALIDATED / LIVE_NOT_CONNECTED / COMMERCIAL_UNRESOLVED`
- Notion 增補頁：`3e38eeeec5b581ed9b54cc274d3be698`

## 二、本倉庫做過的核對（實測輸出）

### 2.1 MANIFEST 逐檔雜湊

```
$ python3 -c "…逐檔 sha256 對 MANIFEST.json files[].sha256…"
files 20 mismatch []
```

進倉庫後在 `packages/MRL_BridgeNeuralLink_API_Dispatch_v1/` 再跑一次，結果相同。

### 2.2 zip 雜湊對 Notion 增補頁的交付回執

| 來源 | 值 |
| --- | --- |
| 本 session `sha256sum` 上傳 zip | `75df21d619f007adb241ce43999d133f6a7004069d815a9af2a4d4089786f469`，46706 bytes |
| Notion 頁 `3e38…` 〈工程交付回執 — 2026-09-22〉自述 | `ZIP SHA256: 75df21d619f007adb241ce43999d133f6a7004069d815a9af2a4d4089786f469`，`46,706 bytes` |

**逐字相同。** 上傳檔名尾端的 `_v1_1` 與內容無關（推論：下載端的重名處理；未確證，見 D-6）。

### 2.3 包內測試與語法檢查（Python 3.11.15、Node v22.22.2）

```
$ python3 -m unittest -v test_dispatch
...
Ran 9 tests in 0.640s

OK
exit=0
$ node --check bridge-client.mjs
exit=0
$ python3 commercial_gate.py registry-example.json
{ "check": "COMMERCIAL_COMPLETENESS", "check_state": "BLOCKED",
  "commercial_state": "COMMERCIAL_UNRESOLVED", "missing": [ …22 項… ],
  "conflicts": ["OPEN_CONFLICTS"], … }
exit=0
```

與包內 `evidence/validation.json`（`tests_run: 9, tests_passed: 9`）及
`evidence/commercial-gap-result.json`（22 項 missing、`OPEN_CONFLICTS`）一致。
`commercial_gate.py` 對範例登錄表的回答是 **BLOCKED**——這是它設計上該給的答案，
不是失敗。

### 2.4 Notion 規則頁（透過 Notion 連接器讀取，2026-09-22）

| 頁面 | 包內 `policy.json` 記錄的 `page_last_edited_at` | 本 session 讀回 | 一致 |
| --- | --- | --- | --- |
| `3c38…` 世界模型頂層規則修訂 v1.1 | `2026-08-21T17:36:18.958Z` | `2026-08-21T17:36:18.958Z` | ✅ |
| `3bb8…` 商業治理憲章 v1 | `2026-08-13T11:24:10.044Z` | **`2026-09-22T09:36:53.640Z`** | ❌ 頁面在快照之後被改過，見 D-1 |
| `3e38…` 增補頁 | （本包的產出，非快照來源） | 存在；18 節 + 〈工程交付回執〉；父頁為 `3c38…` | — |

`3bb8…` 憲章頁 09-22 的變動內容（讀回可見）：末尾多了一節
「2026-09-22 世界模型商業規則協作建構銜接」，指回增補頁 `3e38…`，並寫明
「增補狀態 BUILT_FOR_REVIEW，不因文件建立而自動產生 COMMERCIAL_APPROVED」。
這與包內 `policy.json` 自己標的 `snapshot_status: FETCHED_NOT_LIVE_REVALIDATED` 相符——
包自己就說快照不是 live。

### 2.5 Drive 五個 upstream 原始檔（透過 Google Drive 連接器讀 metadata，2026-09-22）

| 檔案 | `SOURCES.json` bytes / modified_time | Drive 讀回 fileSize / modifiedTime | 一致 |
| --- | --- | --- | --- |
| TaskChannel.ts | 6350 / `2026-07-29T02:02:03.428Z` | 6350 / `2026-07-29T02:02:03.428Z` | ✅ |
| BridgeOrchestrator.ts | 10105 / `…03.486Z` | 10105 / `…03.486Z` | ✅ |
| BaseChannel.ts | 3310 / `…03.444Z` | 3310 / `…03.444Z` | ✅ |
| SocketTransport.ts | 7535 / `…03.515Z` | 7535 / `…03.515Z` | ✅ |
| index.ts | 272 / `…03.545Z` | 272 / `…03.545Z` | ✅ |

五個檔案都存在、同一個父資料夾、大小與修改時間逐一相同。
**位元組是否相同驗不了**：連接器回傳的是「文字表示」（行尾被加了空白），不是原始位元組，見 D-2。

### 2.6 憑證與敏感值掃描

金鑰樣式 grep **零筆**。個資樣式只命中 `127.0.0.1`（loopback 位址，六處，都是設計上的綁定位址）。
包內有兩類識別碼，都**不是憑證**，且都已由權利人寫在 Notion 增補頁上：
Cloudflare account id 與 D1 database id（`GOVERNANCE_ADDENDUM.md` §9）、Drive file id（`upstream/SOURCES.json`）。
環境變數名稱（`MRL_DISPATCH_TOKENS_JSON`、`OPENAI_API_KEY` 等）只出現名稱，沒有值。

## 三、母體對照

```
$ python3 tools/mother_core_registry.py --find bridge
  MRL_BRIDGE_CORE（CORE，10 個成員）：MRL_APIBridge、MRL_Bridge、MRL_BridgeVerify…
  MRL_CHANNEL_CORE → MRL_BridgeChannel
$ python3 tools/mother_core_registry.py --find dispatch
  MRL_EDGE_WORKER_CORE → MRL_WorkerDispatch
  MRL_TASK_EXECUTION_CORE → MRL_Task_Dispatcher
$ python3 tools/mother_core_registry.py --find commercial
  MRL_LICENSE_CORE → MRL_CommercialUse_ExplicitPermissionRequired
  MRL_BUSINESS_CORE → MRL_CommercialUsePermission
$ python3 tools/mother_core_registry.py --find governance
  MRL_GOVERNANCE_CORE（CORE，11 個成員）
$ python3 tools/mother_core_registry.py --find neural
  母體裡找不到「neural」。
```

判定：母體已有 bridge、dispatch、commercial、governance 各自的 CORE 或成員。
這包沒有宣稱自己是 CORE；它相對母體的角色是 **implementation / adapter**——
`dispatch.py` 落在 `MRL_TASK_EXECUTION_CORE → MRL_Task_Dispatcher` 與 `MRL_BRIDGE_CORE → MRL_APIBridge` 之下，
`commercial_gate.py` 落在 `MRL_LICENSE_CORE → MRL_CommercialUse_ExplicitPermissionRequired` 之下。
「BridgeNeuralLink」這個名稱來自 Notion 側的父模組 `Mrliou_MRL_RooClaudeCode_BridgeNeuralLink_v1`，
本倉庫無權為它定名（`naming_authority: false`），只照抄。「neural」查不到只代表登錄表沒有。

## 四、驗不了的 delta

| # | 包內命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| D-1 | 憲章頁 `3bb8…` 快照（`page_last_edited_at 2026-08-13`）是派工規則的來源之一 | **快照已過時**：live 頁面 09-22 被追加一節。快照 SHA-256 無法對 live 重算（序列化方式不明、內容已變）。這不是包的錯——包自標 `FETCHED_NOT_LIVE_REVALIDATED`——但「哪一版有效」要由權利人沿 Authority Decision Gate 決定 | 用受信任的 Notion 讀取流程重取、重固定 hash（包內 README 自己列的啟用前條件） |
| D-2 | `upstream/*.ts` 是「byte-preserved Drive originals」 | **metadata 相符，位元組未確證**。Drive 連接器只給文字表示 | 用 Drive API 直接下載原始位元組後 `sha256sum` 對 `MANIFEST.json` |
| D-3 | `upstream/*.ts` 的授權與原作者 | **包內沒寫**。五個檔案 import `@roo-code/types`、`socket.io-client`、`vscode`，沒有 license 標頭；本倉庫 `EXTERNAL_FORK_REFERENCES.md` 也還沒有對應條目 | 由權利人指明來源專案與授權後，補進 `EXTERNAL_FORK_REFERENCES.md`；依 `MRL_PROVENANCE.md` Upstream Boundary 欄，上游權利不歸 MRL |
| D-4 | `ExtensionChannel.ts`、鎖定相依版本、Socket.IO server 原始碼缺失 | 包自標 `upstream_dependency_gaps`；本倉庫沒有這些檔案 | 取得原套件完整版 |
| D-5 | 三方 provider live 回執、付款、客戶驗收 | 包自標 `live_provider_calls: 0`、`production_changes: 0`；本倉庫也沒做 | 包內 README〈本次仍需外部證據〉那一段列的每一項 |
| D-6 | 上傳檔名尾端 `_v1_1` 的由來 | **推論，未確證**：下載端重名處理。內容雜湊與 Notion 記錄的 v1 完全相同，所以不影響保存 | 權利人確認 |
| D-7 | 父模組 `Mrliou_MRL_RooClaudeCode_BridgeNeuralLink_v1` 的定義 | 本倉庫沒有這份定義，`policy.json` 只記名稱 | Notion 側原頁 |

## 五、這包**不做**的事（照抄包內自述，避免日後被抬高）

- 不是已部署的三方聊天控制系統；不能由 API 金鑰接管既有聊天會話
- `commercial_gate.py` 只能輸出 BLOCKED，不能產生 COMMERCIAL_APPROVED
- 沒有修改 DNS、Cloudflare 路由、Vercel、Sites production
- 測試中的 provider 回覆全是 fixture
- `PACKAGE_AUDIT.py` **會寫檔**（改寫 `MANIFEST.json`、在上層產生 zip）——不要在 `packages/` 裡跑它
