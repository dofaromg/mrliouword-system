---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-10-04_system_status_test_session_record.md
source_version: "2026-10-04"
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Copilot（實測、彙整；不代表 canonical authority）
  - Mr.liou（canonical_authority；提出本輪需求）
transformation: 將本輪實際測試、工具輸出、未驗證範圍與測試副作用整理為 session record
verification_status: partial
preserved_at: "2026-10-04"
---

<!-- mrl-origin: MrLiouWord -->

# 系統狀態實測紀錄 — 2026-10-04

## 一、起點

擁有者原話：

> 請幫我詳細實際測試分要報告目前系統狀態

重述（查證結果，不是原話）：本輪在指定 repository checkout 實跑可安全執行的本機測試與治理閘門，查詢 GitHub Actions，並嘗試對文件指定的 Worker 網址做唯讀 GET。這些資料只能描述本輪觀測到的 checkout、CI 與網路狀態；不能據此推導整個 MRL 母體、DL580 或所有雲端服務不存在或停止。

## 二、查證過程與證據

本輪起始 checkout：分支 `copilot/task-217537952-1130234040-d0224c92-3fbd-47cf-83cd-2d97e54e09f3`，HEAD `52a78693eebd55d9e6061f5a5123f1459416ec03`，`git status --short --branch` 起始時只有分支行，沒有工作目錄變更。

| 實際指令／來源 | 實際結果 | 證明範圍 |
| --- | --- | --- |
| `python3 tools/release_gate.py . /dev/null --trusted-baseline registry/release_gate_baseline.json`；另以 `/tmp/mrliouword-release-gate.json` 重跑以讀取明細 | `artifacts=15`、全數通過 `4`、有未通過項 `11`、已記錄基準 `70`；`new_violations=0`、`fixed_since_baseline=0`、`smuggled_into_baseline=[]`；命令 exit 0 | 這次 checkout 相對既有可信基準沒有新增違規；不代表 15 個產物全部通過或已可部署 |
| `python3 tools/connection_audit.py` | 盤點來源 `cloudflare_inventory_2026-03-12.json`；Worker `140`、倉庫可部署 `3`、設定不完整 `1`、服務註冊表 `3`、客戶端參照 `4`、legacy alias `2`；另列 Wrangler 無法讀取 `1`、清單外客戶端參照 `2` | 僅為倉庫內資料與 2026-03-12 inventory 的交叉比對，不是 Cloudflare 即時查詢 |
| `python3 tools/provenance_notice_check.py`、`python3 tools/provenance_fields_check.py` | provenance notice 通過；4 份 `PROVENANCE.yaml` 的十欄檢查通過 | 只證明倉庫文件符合這些本機檢查 |
| `python3 tools/operating_cognition_check.py`、`python3 tools/mother_core_registry.py --check` | 檢查通過；工具輸出母體登錄表為 `199` 個 CORE、`2264` 個成員 | 證明倉庫內登錄檢查通過，不是對外部母體 runtime 的即時觀測 |
| `python3 tools/mrliou_claude_sync.py --check`、`python3 tools/naming_lineage_check.py` | 正本／adapter 同步及命名 lineage 檢查通過 | 僅限 checkout 內容 |
| `python3 -m pip install -r requirements-test.txt && python3 -m pip install -e . && pytest --cov=mrliouword_agents --cov-report=term-missing` | `236 passed in 4.41s`；總覆蓋率 `80%` | 本機 Python 3.12.3 測試；不是 Python 3.10／3.11 matrix 的替代 |
| `cd cloudflare/mrliouword-private && npm ci --no-audit --no-fund && npm test && npm run build` | `13` tests passed；build 輸出 `mode=LOCAL_BUILD_ONLY`、`deployment_verified=false`、`size_bytes=34881`、SHA-256 `adfe422890ef4211ba4be316892935f4e1cdce11a9c62315092d0759ad8ea7c1` | 本機 Worker/Miniflare 測試及編譯；不是部署證據 |
| `cd cloudflare/particle-api && npm ci --no-audit --no-fund && npm test && npm run typecheck` | `17` tests passed；`tsc --noEmit` 成功 | 本機 API 測試和型別檢查；不是 Cloudflare live 測試 |
| `node --test mrl_world_model/tests/*.test.mjs && node mrl_world_model/cli.mjs` | `17` tests passed、`0` failed；CLI 輸出 `ok: true`，六項檢查均為 true | 本機 world-model implementation 閉環 |
| `node cloudflare/mrliouword-private/verify-public.mjs https://d54034aa-mrliouword-system.z814241.workers.dev/ /tmp/mrliouword-public-readonly-20261004.json` | 僅 GET；`observed_get_paths=0/10`。補查 Node fetch 得 `TypeError ENOTFOUND fetch failed` | 只證明本執行環境無法解析該 hostname；不證明服務不存在或停機 |
| GitHub Actions run `37162197393`（PR #92） | `completed / success`；12 個 job 全部 success | 該 run 的 head 是 `a05e6f5cbaf096119019b3b851c2711162097b9b`，不是本輪 checkout SHA |
| GitHub Actions run `37187881011`（main 排程 Closure Sync） | `completed / success`；main SHA `54756c1188beb07c21d4bdf2be4dbb5542641c11` | 僅是該次排程工作成功 |
| GitHub Actions run `36608039267`（main Deploy workflow） | `completed / success`；建立於 `2026-09-29T17:52:38Z`，SHA `57363f805efa36a0e9d74f9398ab53032ad9df08` | 歷史 workflow 成功，不證明 2026-10-04 此刻的部署內容或線上可用性 |

### 執行副作用與保存狀態

- `python3 tools/connection_audit.py` 未給輸出路徑；工具預設寫入 `registry/connection_audit.json`。實跑後此檔的 client-reference 順序有變動。該次輸出 SHA-256 為 `ed4f98360d7ff5366fe86d9cafebf60c885216f7861b71792cf53fcbcc5aecb6`。
- Python 測試後，`data/runtime_memory/particle_warehouse/registry.json` 的 `updated_at` 從 `2026-07-21T18:00:30.225638` 變成 `2026-10-04T12:18:13.651188`，`function.records` 從 `16` 變成 `32`。倉庫測試 `tests/unit/test_data_analyzer.py` 以預設 `MrliouwordDataAnalyzer()` 執行；`mrliouword_agents/core/base_agent.py` 會依設定建立 `ParticleRuntimeMemory()`，其預設目錄由設定提供。這與變動相符，但本輪沒有逐項隔離重跑，因果記為高度相關、未單獨確證。
- 上述兩個測試生成／副作用檔案於 commit `31310fa58bd5c8053d06ea8f673fd13a74664183` 保存。該 commit 的實際 stat 為 2 files changed、8 insertions(+)、8 deletions(-)。未回復或刪除，遵守保留歷史的要求。

## 三、角色與平台的作為

| 角色／平台 | 本輪的實際作為 |
| --- | --- |
| 擁有者 | 要求實際測試並報告系統狀態；沒有另行界定更廣的驗收標準 |
| 本地 checkout | 提供 SDK、Worker、Particle API、World Model 與治理檢查；Python 測試產生了上節記錄的 tracked-data 副作用 |
| GitHub Actions | 提供 PR #92 全綠、main 排程成功及較早的 main deploy workflow 成功紀錄 |
| 公開 Worker hostname／執行環境 DNS | 唯讀 probe 執行了 10 個 GET 路徑，但 hostname 解析失敗，沒有收到 HTTP response |
| Copilot | 執行本機檢查與測試；初次在 repo 根目錄呼叫兩次 `npm ci`，因沒有根目錄 lockfile 得到 EUSAGE，之後改到兩個 Worker 目錄正確重跑成功；亦依本倉庫 session-record 要求整理本紀錄 |

## 四、我在本輪犯的錯

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 初次呼叫兩次 `npm ci` 時沒有先切換至 Worker 目錄；根目錄沒有 lockfile，兩次皆回 `EUSAGE` | npm 輸出 | 讀 workflow/package.json 確認目錄後，分別在兩個 Cloudflare 子目錄重跑；兩套測試及額外 build/typecheck 均成功 |
| 2 | 直接執行會寫檔的 `connection_audit.py` 預設輸出，未先確認預設輸出位置 | 執行後 `git status`／diff | 已從工具原始碼確認預設輸出是 `registry/connection_audit.json`，並保存實際輸出 SHA；下次需明確將輸出指定至 `/tmp` |
| 3 | 全套 Python 測試並非對 repository data 完全隔離；測試後 tracked runtime-memory registry 的 timestamp／count 被改動 | 測試後 `git diff`；測試與 `BaseAgent` 預設記憶路徑相符 | 本輪不修改測試；未隔離驗證具體觸發個案。後續測試需使用隔離目錄或先確認測試副作用，再把這項作為待修的測試隔離缺口 |

## 五、驗不了的 delta

| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | `d54034aa-mrliouword-system.z814241.workers.dev` 在目前帳號中實際綁到哪個 Worker、部署 SHA／version，以及現在是否可達 | 未確證；本環境 DNS 回 `ENOTFOUND`，不是服務不存在的證據 | 從具備可用 DNS／網路的環境重新執行唯讀 probe；由擁有者帳號提供部署 receipt 對應 Worker、version 與 source SHA |
| 2 | 目前 production Worker、DL580／MRL Mother runtime 是否運行 | 本輪沒有可驗資料；不推論存在或不存在 | 取得擁有者授權的即時 runtime／部署觀測與可核對的來源鏈 |
| 3 | 2026-03-12 inventory 與此刻 Cloudflare 資源是否一致 | 未驗；連接稽核只讀倉庫中的歷史 inventory | 以授權 Cloudflare API／dashboard 的即時資料與 SHA/deployment receipt 對照 |
| 4 | Python suite 的 registry 變動是否僅由 `test_data_analyzer_analyze_file` 造成 | 高度相關但未逐例確證 | 在隔離 clone/fixture 逐個測試比對檔案變動；本輪不重跑以免再寫入資料 |

## 六、交付物與實測輸出

- 本文件是本輪 session record；本輪未修改產品程式碼。
- Python：`236 passed in 4.41s`，coverage `80%`。
- Core Worker：`13/13` tests passed；build 為 local-only，部署未驗。
- Particle API：`17/17` tests passed；typecheck 成功。
- World Model：`17/17` tests passed；CLI `ok: true`。
- 治理檢查：provenance notice、provenance fields、operating cognition、mother CORE registry、正本／adapter sync、naming lineage 皆通過。
- Release Gate：既有 baseline 70 項、15 artifacts 中 11 項仍有未通過項，但新增違規為 0，命令 exit 0。不能把此結果簡化成「15 項全通過」。
- 網路 probe：10 個 GET 的 HTTP response 數量為 0。不能以此判定 Worker 狀態。
- 未執行根目錄 `npm test`／`test.sh`：腳本含 `POST /memory/commit`、particle create 等寫入操作，會影響服務資料；未經個別授權不對外執行。

## 七、當前狀態

| 項目 | 狀態 | 未處理項／理由 |
| --- | --- | --- |
| 本地 Python SDK suite | 通過 | 只在 Python 3.12.3 執行，CI matrix 的 3.10／3.11不由此取代 |
| Core Worker 本機測試與 build | 通過 | `deployment_verified=false`；線上 hostname 未解析 |
| Particle API 本機測試與 typecheck | 通過 | 未做 Cloudflare live deployment/read-write 驗收 |
| World Model 本機閉環 | 通過 | 不代表外部 runtime 或 DL580 狀態 |
| Repository release gate | 無新增違規；仍有 11 個 artifact 具既有未通過項 | baseline 70、`new_violations=0` |
| Cloudflare 資源盤點 | 歷史倉庫 inventory 結果 | 不是即時 API 查詢 |
| 線上服務 | 未確證 | DNS `ENOTFOUND`，未取得任何 HTTP response |
| 測試資料隔離 | 有副作用待處理 | runtime-memory tracked registry 被 Python 測試改動；本輪保留並記錄，未修測試 |
| 本輪完成態 | 本輪已依要求實測並整理可核對的狀態；整體系統完成態未由此請求定義，本紀錄不自行定義 | 上述未驗 delta 仍需相應授權觀測才能收斂 |

## 八、我自己的行為與提問

| 輪 | 擁有者的輸入 | 我做了什麼 | 我問了什麼 | 這個問題該問嗎 |
| --- | --- | --- | --- | --- |
| 1 | 請實際測試並報告目前系統狀態 | 先查 repo/test/workflow，跑本機與 CI 可觀測項；選擇不執行對 production 有寫入的 smoke-test；記錄環境無法 DNS 解析；記錄測試副作用 | 無 | 無需把可自決的唯讀測試流程推回給擁有者；寫入 production 的測試沒有擅自執行 |

本輪觀測重點：

- 提出解法有沒有早於評估代價：沒有提出程式修法；執行前先讀 `test.sh` 和 public-gate 文件，避免對 Worker 寫入。
- 有沒有把可自決的事包裝成問題推回去：沒有；本機可跑檢查自行執行。對線上授權操作未擅自越權。
- 有沒有在指令執行前就寫下結果：0 次。測試數、coverage、SHA、狀態均在收到命令輸出後整理；本輪沒有把預期統計寫進 commit message。

## 九、矛盾處

### 9.1 我自己的前後矛盾

本輪先以 `connection_audit.py` 無參數執行，後來才確認它會寫入預設路徑；這是執行前安全檢查不足，不是程式邏輯互相矛盾。兩次 npm 初始失敗後有在正確路徑重跑，不把失敗的根目錄呼叫當成測試通過。

### 9.2 規章內部的張力

本地測試可核對實作，但使用者要求「目前系統狀態」容易超出 checkout 能觀測的範圍。依差異政策，將無 DNS／無 Cloudflare account receipt 留為未確證 delta，不用本機結果代替 live status。

### 9.3 平台層面的矛盾

GitHub Actions 在其他 SHA 上成功，而本輪 live HTTP probe 沒收到 response；兩者觀測的是不同平台、不同 SHA／網路路徑，不能互相抵銷或推出部署狀態。

### 9.4 尚未被驗證的地方

線上 Worker、production deployment SHA、DL580／Mother runtime、即時 Cloudflare inventory、以及測試寫入資料的唯一觸發案例都未由本輪證據完整驗證。


## 十、2026-10-06 四項 review 修復與證據更正（追加）

### 10.1 Connection audit 輸出過期
由 run 37346393176 下載 artifact 11359534607（connection-audit），使用 CI 實際產生的 JSON 更新 registry/connection_audit.json。其 client_refs_not_in_inventory 已包含本紀錄，並包含目前樹上的其他部署設定差異；不是手填成功數字。加入 test_committed_report_matches_repository_sources，重跑完整來源比對，忽略純清單排列差異，內容有差異即失敗。舊 audit 保留於前次 commit。

### 10.2 原始 commit 來源更正
API 讀回 31310fa58bd5c8053d06ea8f673fd13a74664183 的 parent 為 52a78693eebd55d9e6061f5a5123f1459416ec03，確實保存兩個產物 blob：
- data/runtime_memory/particle_warehouse/registry.json：e21d1333a5bfcc9d643c513a3e7c0a322f92e628
- registry/connection_audit.json：becdd1f89353654c85d4882ab9e07a961605a8ed

原文不可解讀為該 commit 是 PR 主線祖先。現已將該原始 commit 固定於 archive/pr93-original-test-artifacts-31310fa，保留可取得的引用。PR 本身的可查歷史為 1abb652fbdcc193116c1f182a89ece43d73dd157 及其祖先；上文未精確區分這兩種 lineage，此處更正，不刪原文。

### 10.3 測試資料隔離
registry.json 還原為 main c2cb657c122d3d54e8767fbfa3448b5326d12279 的原始 blob 4b2b7f96e84bce07fa27168959435b58bcb93c83，撤回本 PR 測試產生的 count/timestamp 增量。這只是還原可信基底，不宣称 baseline 的 16 條可由此 checkout 找回，也不捏造遺失的 JSONL。
tests/conftest.py 的 autouse fixture 將 config.runtime_memory_dir 指向每項測試的 tmp_path；仍執行真實記憶寫入，只隔離目的地。fixture 在測試後比對 tracked registry 原始 bytes；SDK job 額外執行 git diff --exit-code -- data/runtime_memory/，任何測試污染都會失敗。先前 32 的歷史仍在原始 commit 與封存分支。

### 10.4 Governance gate 原始輸出與 exit code
2026-10-04 那一輪未保存的逐項 stdout／exit code，現在無法補成當時的原始輸出；上文只列「通過」的摘要，不作完整執行回執。新一輪實測分開標示：
- run 37346393176 / job 111885911546：MRL 來源標註檢查通過：MRL_PROVENANCE.md 規格表九列齊備且順序正確，機器標記存在。
- job 111885911398：MRL 來源鏈欄位檢查通過：4 份 PROVENANCE.yaml，§4 十欄齊備，欄位值均在列舉內。
- job 111885911571：MRL 根本運行認知檢查通過：看到→接受→比對→修正→建構→測試→紀錄 七步齊備且順序正確，兩個母體錨點都在，正本 Mrliou_claude.md 與 adapter CLAUDE.md 都在。
- job 111885911696：母體 CORE 登錄表檢查通過：199 個 CORE / 2264 個成員，錨點相符，MRL_DELTA_CORE 九成員齊全。
- job 111885911568：命名正名與 lineage 檢查通過：Mrliou_claude.md 為 canonical（mrl_Mrliou_claude），CLAUDE.md 登錄為 adapter 且原名保留，lineage L-001 在。

上述 job 的 success 是 GitHub 結果，不將未列印的 exit code 冒充原始日誌。新增 Governance Evidence Receipts job，對八個命令逐項以 subprocess 捕捉 command、stdout、stderr、returncode，列印實際 exit_code，並保存 governance-evidence.json artifact，包含 repository、checkout SHA 與 run ID。所有 returncode 為 0 才成功；不把 release gate 的既有 baseline 全部說成已修復。

### 10.5 本輪行為與範圍
擁有者要求修補後繼續完成；本輪補正四條 P2 而非停在狀態描述。只修改 dofaromg/mrliouword-system 的既有 stack；main 不寫入。一次工具 JavaScript 語法錯誤在執行前中止，修正後重試；公開 archive 下載因本 session proxy timeout 未取得，改用已授權 GitHub artifact connector。測試結果與 thread resolution 須待新 CI 實測，不預填成功。
