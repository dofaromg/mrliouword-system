---
# 十欄來源鏈，依 docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md §4
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: 外部（權利人上傳，非本倉庫產出；包內自述程式協作方為 ChatGPT / Codex）
source_artifact: Mrliou_MRL_Backfill_20260921_v1.zip（上傳時檔名 88c6c1fc-Mrliou_MRL_Backfill_20260921_v1.zip）
source_version: "2026-09-21"
derivative_role: mirror
artifact_owner: Mr.liou
contributors:
  - Mr.liou（canonical_authority；工程方向；2026-09-22 上傳本包）
  - ChatGPT / Codex（OpenAI）（包內 README 自述的整理與程式協作者）
  - Claude Code（本倉庫：逐字解壓保存、雜湊核對、實跑包內測試、撰寫本索引）
transformation: >-
  逐字解壓至 registry/evidence/packages/Mrliou_MRL_Backfill_20260921_v1/，
  未改任何位元組（diff -r 對照 zip 原樣為空）。本索引另記核對結果與驗不了的 delta。
verification_status: partial   # 包內自檢全部實跑通過；固定版本來源與雜湊鏈頭本 session 驗不了，見第四節
source_sha256: 3bf1c4804c3d7df855f394e485499596dfff442427188f2182b96099c134c357
preserved_at: "2026-09-22"
---

<!-- mrl-origin: MrLiouWord -->

# Mrliou_MRL_Backfill_20260921_v1 —— 索引與核對

> **這是逐字保存，不是本倉庫的主張。**
> 原 zip 由權利人於 2026-09-22 上傳，SHA-256 見上方 front matter。
> 檔案在 `packages/Mrliou_MRL_Backfill_20260921_v1/`，一個位元組都沒動。
> 依 `.mrliou/meta.json` `history_policy: append_only`，本檔只新增、不覆寫。

## 一、這包是什麼（依包內自述）

包內 `README.md` 與 `Mrliou_MRL_Backfill_Report_20260921_v1.md` 自述：

- Record ID：`MRL-CONTENT-COMPARISON-BACKFILL-20260921-v1`
- 內容：11 個粒子映射、4 個校正、5 個缺口狀態，共 20 個觀測事件
- `runtime_records/` 是用 `dofaromg/flow-tasks @ d43e53dee1012571915754afdfeff66c96c19615`
  既有固定版本的 MemoryVault / EvidenceLedger / PassportRegistry 實際生成的資料
- 自述完成狀態：
  `CONTENT_BACKFILL_COMPLETE / LOCAL_EVIDENCE_IMPORT_PASS / COMPATIBILITY_RECEIPT_ADAPTER_LOCAL_PASS`
  `MRL_TO_EXTERNAL_LINEAGE_UNRESOLVED / HOST_CONSUMPTION_NOT_VERIFIED`
- Notion 主記錄：`3e28eeeec5b581118727c0b7ccf42335`

## 二、本倉庫做過的核對（實測輸出）

以下每一項都是 2026-09-22 在本 session 實跑的指令與原始輸出，不是轉述包內的自檢結果。

### 2.1 包內雜湊清單

```
$ sha256sum -c SHA256SUMS
（20 行，全部 OK）
exit=0
```

進倉庫後在 `packages/Mrliou_MRL_Backfill_20260921_v1/` 再跑一次，非 OK 行數 `0`，exit `0`。

### 2.2 包內單元測試（Python 3.11.15，僅標準函式庫）

```
$ python3 -m unittest -v test_Mrliou_MRL_Compatibility_Evidence_v1.py
...
Ran 12 tests in 0.011s

OK
exit=0
```

與包內 `MRL_Test_Result.json` 自述的 `tests_run: 12, failures: 0` 一致。

### 2.3 fixture 收據驗證

```
$ python3 Mrliou_MRL_Compatibility_Evidence_v1.py examples/fixture/receipt.json --evidence-root examples/fixture
{
  "schema": "Mrliou_MRL_Compatibility_Consistency_Result_v1",
  "origin_signature": "MrLiouWord",
  "context_sha256": "205c640fe7e1082ca1b74aa5976c54323cb67c2685e65794685d23f1d74a055a",
  "consistency": "PASS",
  "completed_operations": 1,
  "observation_kind": "fixture",
  "authenticity": "NOT_VERIFIED_BY_THIS_ADAPTER",
  "hardware_acceptance": "OPEN",
  "source_claim": "OBSERVATION_ONLY",
  "note": "Digests bind declared context and evidence. Trusted host provenance and real execution require separate evidence."
}
exit=0
```

與包內 `examples/fixture/expected_consistency_result.json` 逐欄比對：`equal: True`。

注意輸出裡的 `hardware_acceptance: OPEN` 與 `authenticity: NOT_VERIFIED_BY_THIS_ADAPTER`——
這個工具**自己就說**它只驗收據內部一致，不驗硬體來源。本倉庫不把它抬高成實機驗收。

### 2.4 計數（從指令輸出複製，不從自述複製）

| 項目 | 指令輸出 | 包內自述 | 一致 |
| --- | --- | --- | --- |
| `MRL_memory_events.jsonl` 行數 | 20 | 20 筆 Memory | ✅ |
| `MRL_evidence_events.jsonl` 行數 | 20 | 20 筆 Evidence | ✅ |
| `passports/*.jsonl` 行數 | 1 | 1 版 candidate Passport | ✅ |
| `Content_Comparison` 的 `observations` | 11 | 11 個粒子映射 | ✅ |
| `Content_Comparison` 的 `corrections` | 4 | 4 個校正 | ✅ |
| `Content_Comparison` 的 `gaps` | 5 | 5 個缺口 | ✅ |
| `Source_Fingerprints` 陣列長度 | 23 | 23 個固定版本檔案指紋 | ✅ |

### 2.5 Notion 主記錄頁（透過 Notion 連接器讀取，2026-09-22）

| 欄位 | 讀回值 |
| --- | --- |
| 頁面 | `3e28eeeec5b581118727c0b7ccf42335`，標題 `Mrliou_MRL_Content_Comparison_Backfill_20260921_v1` |
| `page_last_edited_at` | `2026-09-21T14:21:21.509Z` |
| `is_archived` | **`true`** |
| 父鏈 | `Mrliou_MRL_Workspace_Complete_Index_v1 / MRL_Mother_Top_Source_Layer_v1` |
| 內容 | 十節結構與包內 `Mrliou_MRL_Backfill_Report_20260921_v1.md` 的十節相同；Memory / Evidence / Passport 三個雜湊頭字串與報告相同（目視逐字比對，非程式比對） |

包內 `MRL_Notion_Readback_Receipt.json` 的 `observed_at` 是 `2026-09-21T14:25:45.800Z`，
比頁面最後編輯時間晚 4 分鐘，時序合理。

### 2.6 憑證與敏感值掃描

對整包跑了金鑰樣式（`sk-`、`AKIA`、`ghp_`、`ntn_`、PEM 私鑰、`api_key=` 等）
與個資樣式（email、IP、家目錄路徑）的 grep：**金鑰零筆**；個資零筆。
包內出現的識別碼（Notion page id、GitHub commit SHA）是公開座標，不是憑證。

## 三、母體對照（造新東西之前先查母體）

```
$ python3 tools/mother_core_registry.py --find backfill
  MRL_DELIVERY_CORE → MRL_BackfillPackage
  MRL_WORKFLOW_CORE → MRL_Backfill
  MRL_EVIDENCE_CHAIN_CORE → MRL_WeakSource_Backfill
  （另 4 筆）
$ python3 tools/mother_core_registry.py --find passport
  MRL_PASSPORT_CORE（CORE，9 個成員）
  MRL_REGISTRY_CORE → MRL_PassportRegistry
$ python3 tools/mother_core_registry.py --find compat
  母體裡找不到「compat」。
```

判定：這包**沒有**宣稱自己是任何 CORE。它自述是「用既有 MRL runtime 寫入新資料」
加上一個新的 evidence adapter（`Mrliou_MRL_Compatibility_Evidence_v1.py`）。
依本倉庫規則，adapter 可以存在，但 `derivative_role` 要誠實——所以本索引記它為
`mirror`（本倉庫沒改它），而它自己相對母體的角色是 **adapter / implementation**，
掛在 `MRL_EVIDENCE_CHAIN_CORE` 與 `MRL_PASSPORT_CORE` 之下，**不是新的 CORE**。
「compat」查不到只代表登錄表沒有，不代表母體沒有這個概念。

## 四、驗不了的 delta

依 `.mrliou/meta.json` `difference_policy: preserve_as_delta_not_failure` 記成 delta。

| # | 包內命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| D-1 | `runtime_records/` 由 `dofaromg/flow-tasks @ d43e53d…` 的固定版本模組生成，模組 Git blob SHA-1 已核對 | **未確證**。本 session 的 GitHub 範圍只有 `dofaromg/mrliouword-system`，無法讀 `flow-tasks` | 在能讀 `flow-tasks` 的環境跑包內 `Mrliou_MRL_Source_Backfill_Import_v1.py --runtime-dir …`，或至少比對 `Source_Fingerprints` 裡 13 個 MRL 檔案的 blob SHA-1 |
| D-2 | Memory head `75f174…`、Evidence head `9c082e…`、Passport hash `523ede…` | **未確證**。行數 20/20/1 已驗，但雜湊鏈的計算方式在 `flow-tasks` 的 `MRL_hash_chain_v1.py`，本倉庫沒有 | 同 D-1，用該模組的 `verify` 重算鏈頭 |
| D-3 | 外部 `Speedstu/CUDA-for-AMD-Windows @ 4a6fb1b…` 10 個檔案指紋 | **未確證**，同樣不在本 session 範圍 | 讀該倉庫該 commit 重算 SHA-256 |
| D-4 | Notion 主記錄頁 `is_archived: true` | **驗到了，但不知道為什麼**。包內 readback receipt 只列出該頁有 `is_archived` 這個欄位，沒寫值 | 由權利人說明是否刻意封存；本倉庫不推測 |
| D-5 | 「目標 DL580 / 既有運行服務的接收尚未驗證」 | 包自己就標 `host_consumption_verified: false`；本倉庫沒有任何東西能改變這個狀態 | 可信 host receipt、received hash、use/return trace（包內第 8 節寫的完成條件） |
| D-6 | 「MRL↔Speedstu 來源與接觸狀態 UNRESOLVED」 | 這是包內第 3 節第 2 筆校正**主動**改成的狀態，不是缺陷。本倉庫照抄，不補成結論 | `cublasLtShim.c`／PDB／build parent 或可核對的傳播原件（包內第 8 節） |

## 五、跟本倉庫既有紀錄的關係

- `MRL_PROVENANCE.md` 第一節把 `flow-tasks` 與 `mrliouword-system` 同列在權利人的
  「Mixed MRL and AI」補正清單；這包的固定版本來源正是 `flow-tasks`。
- `.mrliou/meta.json` 列 `dofaromg/flow-tasks`（repo_id 1010512921）為關聯倉庫。
- 這包的作法（先保存原件與原時間、未知欄位維持 UNKNOWN、原作者／Git 協作者／AI 工作者分欄）
  與 `registry/evidence/README.md` 的規則一致。


## 2026-09-27 D-5 觀測範圍訂正

D-5 的 host_consumption_verified=false 是該次回填包的接收證據狀態；不得外推為 DL580 未運行。原句「本倉庫沒有任何東西能改變這個狀態」應限縮為：只有取得對應封包的可信 host receipt、received hash 與 use/return trace 後才能追加新的驗證狀態；倉庫可以保存這些後續證據，不能永遠凍結為未驗。
