---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-10-05_provenance_ci_failure_session_record.md
source_version: "2026-10-05"
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Claude Code（查證與實作）
  - Mr.liou（canonical_authority）
transformation: 記錄 provenance 欄位 CI 失敗的查證、修正與實測
verification_status: partial
preserved_at: "2026-10-05"
---

<!-- mrl-origin: MrLiouWord -->

# 2026-10-05 provenance CI failure session record

## 一、起點

擁有者提供的原話：

> Fix the failing GitHub Actions job. Analyze the Actions logs, identify the root cause of the failure, and implement a fix.
> Job URL: https://github.com/dofaromg/mrliouword-system/actions/runs/37252579946/job/111583128427

實測確認這個 job 是 `MRL 來源鏈欄位檢查`。它在 `mrl_world_model/PROVENANCE.yaml` 的 `source_version` 欄失敗；不是依「Actions 紅燈」推論整個 MRL 系統不存在或其他交付狀態。

## 二、查證過程與證據

1. `get_workflow_run(37252579946)` 回傳：workflow `Mrliouword SDK CI/CD Pipeline`、run attempt `2`、head SHA `aef18eecd44b80909a1b642dccc93381b5036a72`、PR `#93`。
2. Job `111583128427` 的原始輸出：

   ```text
   Complete job name: MRL 來源鏈欄位檢查
   ...
   MRL 來源鏈欄位檢查未通過（4 份檔案，1 項）：
     - mrl_world_model/PROVENANCE.yaml: source_version 必須是非空字串（§4 來源引用）
   ...
   ##[error]Process completed with exit code 1.
   ```

3. 該 job checkout 的 PR merge SHA 是 `cc1517fda5c7ae92fc07dfef8d4059c7a54b15b3`。以 GitHub `get_file_contents` 讀取此 SHA 的 `tools/provenance_fields_check.py`，確認它對 `source_repo`、`source_artifact`、`source_version` 呼叫 `_text`，要求非空字串。
4. 原檔 `mrl_world_model/PROVENANCE.yaml:14` 寫作 `source_version: 2026-09-29`。本機用 PyYAML 解析的實際輸出為：

   ```text
   date datetime.date(2026, 9, 29)
   ```

   YAML 1.1 loader 將未加引號的 ISO 日期轉成日期物件，與檢查器要求的字串型別不符。
5. 在 `1e3b36ba43b7cf39be46e23859e867b9a9287a49` 將值改為 `"2026-09-29"`；修改後解析結果為：

   ```text
   str '2026-09-29'
   ```

   並新增 `tests/test_provenance_fields_check.py`，直接驗證該欄位載入後仍是字串。

## 三、角色與平台的作為

| 角色／平台 | 本輪的實際作為 |
| --- | --- |
| Mr.liou | 提供失敗 job URL 與修復任務。 |
| GitHub Actions | 提供原始失敗日誌，指出欄位、檔案、要求的型別及退出碼。 |
| GitHub API | 提供該次 merge SHA 上實際執行的檢查器內容。 |
| 本工作階段 | 對照 CI 與檔案內容，修正 YAML 標量並新增回歸測試。 |
| 本機 pytest 環境 | 起初沒有 `pytest` 命令；依既有測試依賴安裝 pytest 9.1.1 後完成測試。 |
| connection audit | `python3 tools/connection_audit.py --help` 實際執行盤點並回報找不到 `registry/cloudflare_inventory_*.json`；此資料缺口未在本任務中處理。 |

## 四、我在本輪犯的錯

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 本機 checkout 的舊版 `provenance_fields_check.py` 沒有 source-version 型別檢查，因此本機原始資料的整體檢查竟回報通過；不能用它否定 CI 的錯誤。 | 我在對照 Actions merge SHA 的檢查器與本機版本時發現。 | 新增直接解析實際 provenance 檔的回歸測試，斷言 `source_version` 為字串；CI merge 版檢查器本身也會拒絕非字串。 |
| 2 | 第一次呼叫 `pytest` 失敗，因為執行環境沒有安裝 pytest。 | 命令輸出 `pytest: command not found`。 | 使用既有需求所列的測試工具版本安裝到使用者環境後再執行，未更動專案相依檔。 |

第一項與「把『我沒看到』說成『它缺』」同形：本機 checkout 不含 CI merge 基底上的檢查邏輯，不能把本機結果當成該次 CI 行為。

## 五、驗不了的 delta

| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | 修正後 GitHub Actions 的 `MRL 來源鏈欄位檢查` 會成功。 | 尚未由修正後的 Actions run 驗證；本機測試與 YAML 載入結果通過。 | 在包含 commit `1e3b36ba43b7cf39be46e23859e867b9a9287a49` 的 PR merge commit 上重跑該 workflow 並讀取 job 結果。 |
| 2 | connection audit 缺少的 inventory 應如何恢復或是否為本輪造成。 | 未確證；工具輸出只證明盤點時找不到符合 `registry/cloudflare_inventory_*.json` 的檔案。 | 查明工具預期的 inventory 路徑與倉庫歷史後再判定；本輪不新增或替代盤點資料。 |
| 3 | release gate 輸出的 11 個未通過產物是否與本次 provenance 修正相關。 | 未檢視個別報告；該命令以 exit code 0 完成，輸出目的地是 `/dev/null`。 | 另行保留報告並依可信基準逐項核對；不在本任務擴大範圍。 |

## 六、交付物與實測輸出

- 原始失敗：job `111583128427`，exit code `1`，CI 訊息明確指出 `source_version` 必須是非空字串。
- 回歸測試：

  ```text
  .                                                                        [100%]
  ...
  1 passed, 2 warnings in 0.03s
  ```

  兩個 warning 是本機 pytest 環境未安裝 pytest-asyncio 所以不認得既有 `asyncio_default_fixture_loop_scope` 與 `asyncio_mode` 設定；回歸測試本身成功。安裝 pytest 9.1.1 前，advisory database 回覆 `No vulnerabilities found in the provided dependencies.`
- 修正後 PyYAML 實測：`str '2026-09-29'`。
- `python tools/provenance_fields_check.py`：`MRL 來源鏈欄位檢查通過：4 份 PROVENANCE.yaml，§4 十欄齊備，欄位值均在列舉內。` 注意：本機 checkout 的這支檢查器未包含 Actions merge SHA 上的字串型別檢查，故這個輸出不能取代回歸測試或修正後 CI。
- `python3 tools/provenance_notice_check.py`：通過。
- `python3 tools/operating_cognition_check.py`：通過。
- `python3 tools/mother_core_registry.py --check`：通過，輸出 `199 個 CORE / 2264 個成員`。
- `python3 tools/naming_lineage_check.py`：通過。
- `python3 tools/release_gate.py . /dev/null --trusted-baseline registry/release_gate_baseline.json`：exit code `0`；報告摘要是 15 個產物、4 全數通過、11 有未通過項、基準線 70。個別未通過項沒有在本輪檢視。
- `python3 tools/connection_audit.py --help`：exit code `1`，實際輸出 `找不到 registry/cloudflare_inventory_*.json，無法稽核`；沒有修改盤點檔。
- `git diff --check`：exit code `0`，無輸出。
- Secret scan（`mrl_world_model/PROVENANCE.yaml`、`tests/test_provenance_fields_check.py`）：`No secrets detected in the scanned files. Safe to proceed with commit.`
- commit：`1e3b36ba43b7cf39be46e23859e867b9a9287a49`。

這些結果證明 YAML 型別修正與本機回歸測試成立；不證明修正後 GitHub Actions 已重新執行或全部 workflow 已通過。

## 七、當前狀態

| 項目 | 狀態 |
| --- | --- |
| `mrl_world_model/PROVENANCE.yaml` 日期字串加引號 | 已提交於 `1e3b36ba43b7cf39be46e23859e867b9a9287a49`。 |
| source-version 字串型別回歸測試 | 已提交，本機 `1 passed`。 |
| 原失敗 GitHub Actions job | 修正後尚未重跑；需新 run 驗收。 |
| connection audit inventory 缺檔 | 未處理，與本次變更無直接關聯的資料缺口。 |
| release gate 11 個未通過產物 | 未逐項調查，本輪不擴大範圍。 |

本輪完成態未由擁有者定義；本文件不自行定義。

## 八、我自己的行為與提問

| 輪 | 擁有者的輸入 | 我做了什麼 | 我問了什麼 | 這個問題該問嗎 |
| --- | --- | --- | --- | --- |
| 1 | 失敗 job URL 與「分析日誌並修復」要求 | 先取得 Actions run/job 日誌，再對照 merge SHA 的檢查器，最後改 YAML 並加測試。 | 無。 | 無須詢問；失敗根因與修正方式均可依日誌及 YAML 型別自行確認。 |

- 提出解法有沒有早於評估代價：沒有；先查日誌與檢查器，再確定只需引用日期字串。
- 有沒有把可自決的事包裝成問題推回去：沒有。
- 有沒有在指令執行前就寫下結果：0 次。測試通過數、命令退出狀態、commit SHA 與盤點結果均在各命令或工具輸出後記錄；CI 尚未重跑明確標為未驗證。

## 九、矛盾處

### 9.1 我自己的前後矛盾

本機舊檢查器原始執行回報通過，但該次 CI merge SHA 的檢查器要求 `source_version` 是字串。兩者看似衝突，實際是 checkout 版本不同；不能用前者推翻 CI 證據。透過新回歸測試直接鎖定 YAML 載入型別。

### 9.2 規章內部的張力

程式修正保持最小；倉庫 session-record 規則要求另存完整工作紀錄，因而增加一份文件。兩者分別滿足變更範圍與可追溯性，文件未改動其他程式或盤點資料。

### 9.3 平台層面的矛盾

GitHub Actions 執行 PR merge SHA 上的新檢查器；本機工作目錄是較舊的 PR head checkout。兩路徑不是同一版本，本機 checker 的「通過」不可視為 CI 等價驗收。

### 9.4 尚未被驗證的地方

修正後 workflow 尚未執行。只有新 Actions job 結果能確認 CI 驗收；本機結果不替代它。


## 十、2026-10-06 Stack #95 基底與衝突修復追加紀錄

- 擁有者授權保留 Stack #95，連同 #93 更新基底與驗證；不合併 main。
- 網頁明確指出 tests/test_provenance_fields_check.py 衝突。main 與 #94 分別新增同名檔；本次保留 main 全部測試，再追加日期字串回歸測試。
- main 基準：c2cb657c122d3d54e8767fbfa3448b5326d12279。
- 原 #93：ff7328148078ad83ed445a9ab29f9c095509c2b5；封存分支 archive/stack95-pr93-before-rebase-20261006。
- 原 #94：c5bd5a8cc686dce00cee1776a7fdc2c09bafd79a；封存分支 archive/stack95-pr94-before-rebase-20261006。
- #93 既有 SDK workflow 增加既有 stack base 分支的 pull_request 觸發，保留 main；#94 維持三檔範圍。connection audit / release gate 未新增修補。
- 本輪先前只讀 API 回傳 dirty 與舊 base，未能定位原因；網頁顯示 stack 衝突後才確認。不能把舊 base 資訊當成整個 stack 的合併基準。
- 原始網頁授權後，再向擁有者確認 stack 範圍一次；取得明確授權後更新。
- 本紀錄建立時新 exact-head GitHub Actions 尚未完成，不宣告 CI PASS 或 owner-review-ready；最終驗收須核對新 SHA 的 run/jobs。
- 指令執行前未預填測試成功數或 CI 成功狀態；本次未執行本機完整 SDK 測試，GitHub CI 結果不可用歷史結果替代。
