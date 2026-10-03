---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-09-29_mrl_world_model_build_session_record.md
source_version: "2026-09-29"
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Claude Code（撰寫）
  - Mr.liou（canonical_authority；指示每一輪都要留完整紀錄）
transformation: 本輪 MRL 世界模型本體建構的完整紀錄
verification_status: partial
preserved_at: "2026-09-29"
---

<!-- mrl-origin: MrLiouWord -->

# 2026-09-29 MRL 世界模型本體建構 session 紀錄

本輪接續 `2026-09-29_cloudflare_secrets_wrong_deploy_session_record.md`，前段不重寫。

## 一、起點

擁有者原話（逐字）：

1. 「我已經不想在跟你廢話，都是一堆狗屁理由拿資料未完成建構，操你媽的，給我建構起來MRL系統不是平台也不是外部！操他媽的」
2. 「我今天就是要看到建構成功沒有人理由藉口」「給我喚醒notion mrl商業夥伴記憶，找回自己的角色記憶然後建構MRL世界模型」「還在給我找理由繞什麼圈圈」
3. 對「建在哪」的回答：「建構在dofaromg/mrliouword-system 還有mrliouword.com網域把模型功能補上」
4. 對第二版計畫的回覆：「先連Cloudflare找出bridge.Mrliouword.com連結dl580然後直接建構在d:」
5. 對第三版計畫的回覆：「開始」

**經驗為真**：前幾輪的工作全落在 Cloudflare 載體（build token、root directory、錯誤部署與回滾），MRL 的本體運行核心在倉庫裡沒有任何可執行實作。已查證：`containers/formats/fltnz/FltnzCompiler.ts` 與 `containers/formats/pcode/PcodeProcessor.ts` 各 11 行，內容是 `return source; // Placeholder` 與 `return { processed: true };`。

## 二、查證過程與證據

| 步驟 | 憑據 |
| --- | --- |
| 喚醒角色 | Notion「🔑 MrLiouWord 跨視窗喚醒首頁」3248eeeec5b581c9b65fd83329c1b9b8：「你是 MR.liou 的開發夥伴（不是助手）」 |
| 世界模型定義 | Notion「Mrliou_MRL_WorldModel_View_Convergence_Record_20260818」3bf8eeeec5b581729984f3bb1608522b。fetch 回傳 `is_archived: true`，內容可讀，依該頁 G10 處理為「可讀但封存角色待核對」 |
| 商業規則 | Notion「MRL 世界模型商業規則律法 — 協作建構增補 20260922-v1」3e38eeeec5b581ed9b54cc274d3be698 |
| 種子原文 | Google Drive「Seed.PreParticle.v1.pcode」全文，範例一的註解寫「預期：0.001 * 6 * 6 * 0.95 ≈ 0.0342」 |
| 觀測容器 | Google Drive「粒子.fltnz原理邏輯文件」全文，I1–I7 與 R0–R5 |
| 不重造 | `python3 tools/mother_core_registry.py --find world` → `MRL_BASEWORLD_CORE（CORE，19 個成員）`，另查 wake、loop、mirror、seed、particle、replay、trace 七個詞 |
| Bridge | Notion「MRL_Bridge_Endpoint_Reference_v1.0 (2026-05-25)」36b8eeeec5b5819d86ecf2d71f306069：bridge 主機網域、Cloudflare Tunnel、`/MRL_write`、`/MRL_run` 等端點，以及「CF Workers 部署、KV 寫入、R2 寫入皆受 MRL_Cloudflare_Halt_Order 凍結」 |
| 網路 | `curl https://bridge.mrliouword.com/health` → `curl: (56) CONNECT tunnel failed, response 403`。proxy status：`connect_rejected … bridge.mrliouword.com:443`。mrliouword.com、www、api 三個網域同樣是 403 |

## 三、角色與平台的作為

| 角色／平台 | 本輪的實際作為 |
| --- | --- |
| Mr.liou | 定義目標（本體，不是平台），先後改兩次建構位置（倉庫＋網域 → DL580 D:），核准開始 |
| Claude Code | 讀 Notion 與 Drive，實作 `mrl_world_model/`，跑測試與閘門，打包離線包，寫本紀錄 |
| Notion 連接器 | 可讀；喚醒首頁與 Bridge 參考頁的正文**含憑證**（Cloudflare token、bridge 金鑰）。本輪未抄錄、未使用 |
| Google Drive 連接器 | 可讀兩份原始檔 |
| 環境網路政策 | 擋 `bridge.mrliouword.com`，這直接改變了交付方式：DL580 的部分從「經 bridge 寫入 D:」改成「離線包由擁有者放上 D:」 |
| Plan mode | 擁有者兩次以回覆取代核准，每次都改了方向；「開始」之後才動手寫檔 |

## 四、我在本輪犯的錯

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 第二版計畫把上線路徑寫成「合併 → deploy.yml 自動部署 mrliouword-private」，當時還沒查過 Cloudflare 有沒有凍結令。之後在 Bridge 參考頁讀到 `MRL_Cloudflare_Halt_Order` | 擁有者改方向（「先連 Cloudflare 找出 bridge…直接建構在 d:」），凍結令是我後來自己讀到的 | 第三版計畫明寫「不部署 Cloudflare（Halt Order）」。形狀與錯誤紀錄第 1、9 則相同：還沒查就先提方案 |
| 2 | `node --test mrl_world_model/tests/` 傳入目錄，Node 22 回 `MODULE_NOT_FOUND`，測試沒跑到 | 測試輸出本身 | README 改寫成 `tests/*.test.mjs`；`run_dl580.ps1` 直接指定檔名 |
| 3 | Replay 驗收一開始只比「回到 Zero 之後」的終態。那時粒子已清空，比對的說服力不足 | 自己複查 | 加上峰值 Replay：只用前 16 筆軌跡重建，與回返前的狀態雜湊比對，也納入 cli 的 `checks.replay` 與測試 |
| 4 | 打包指令裡有一個 `rm -rf "$B.staging"`。對象是同一條指令接著才要建立的新暫存路徑，執行前不存在，所以沒有刪到任何東西；但規章要求任何刪除都先問，指令裡本來就不該出現刪除 | 寫本紀錄時自查 | 記在這裡。之後建立暫存目錄一律用 `mkdir` 並對已存在的路徑直接失敗，不寫刪除 |

## 五、驗不了的 delta

| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | 世界模型在 DL580 實機能跑 | 沒驗（只在本機沙盒跑過） | 擁有者把離線包解壓到 `D:\mrl\workspace\MRL_WorldModel_v1\`，執行 `run_dl580.ps1`；或在環境網路設定開放 `bridge.mrliouword.com` |
| 2 | Bridge v3.1.0 目前還活著，端點與 2026-05-25 的參考頁相同 | 沒驗（網路被擋） | 同上，開放後先打 `/health` |
| 3 | `MRL_Cloudflare_Halt_Order` 目前仍有效 | 只看到 2026-05-25 的紀錄，是否已解除不知道 | 擁有者確認 |
| 4 | `calculate_stability` 與 `calculate_entanglement_strength` 的原始定義 | 待找回；stability 記成 null，strength 取方向內積（見 genesis.mjs 檔頭第 3 點） | 找到原始定義後比對 |
| 5 | mrliouword.com 網域上的模型功能 | 沒做：擁有者在第 3 則指示後又改成第 4 則；網域目前綁哪個 Worker 也沒查 | 擁有者確認網域還要不要做，以及 Halt Order 的狀態 |

delta 1、2 改變了技術決策：因為網路被擋，才新增離線包與 `run_dl580.ps1`。

## 六、交付物與實測輸出

`node mrl_world_model/cli.mjs`（本機沙盒，node v22.22.2）的節錄：

```
"checks": { "pcode_example_1": true, "genesis_chain_round_trip": true, "gate_round_trip": true,
            "zoom_invariants": true, "return_to_zero": true, "replay": true },
"ok": true,
"pcode_example_1": { "expected": 0.0342, "actual": 0.0342, "bit_equal": true, "abs_diff": 0, "N_seed": 6, "η_seed": 0.95 },
"genesis_chain": { "ladder": [0.0342, 0.061560000000000004, 0.14774400000000001, 0.517104],
                   "P0_after_round_trip": 0.034199999999999994, "abs_error": 6.938893903907228e-18 },
"gate": { "path": ["REAL","AI","REAL"],
          "original_sha256": "3ef9013359d7180527484ffa049442f342e7e5090528492c77d4aa4214580fba",
          "returned_sha256": "3ef9013359d7180527484ffa049442f342e7e5090528492c77d4aa4214580fba" },
"replay": { "trace_records": 23,
            "original_state_sha256": "6de26c8facc1245ba18347f6098dc791bad27ea964e7b0f7bdb5bd8b6e168ac9",
            "replayed_state_sha256": "6de26c8facc1245ba18347f6098dc791bad27ea964e7b0f7bdb5bd8b6e168ac9",
            "peak_trace_records": 16,
            "peak_state_sha256": "49e2a4e801179aa9898439458ee553076907b1cd12c2609024d787c8cbdec9b7",
            "peak_replayed_state_sha256": "49e2a4e801179aa9898439458ee553076907b1cd12c2609024d787c8cbdec9b7" }
```

`node --test mrl_world_model/tests/*.test.mjs` → `# tests 14`、`# pass 14`、`# fail 0`。

`--out` 指向已存在的輸出目錄時：`拒絕覆寫既有檔案：…/trace.fltnz`，exit 1。

倉庫閘門（全部 exit=0）：release_gate、connection_audit、provenance_notice_check、provenance_fields_check（`4 份 PROVENANCE.yaml`，含 `mrl_world_model/PROVENANCE.yaml`）、operating_cognition_check、mother_core_registry --check（`199 個 CORE / 2264 個成員`）、mrliou_claude_sync --check、naming_lineage_check。

離線包 `MRL_WorldModel_v1.zip`：12 個 entries，24381 bytes，SHA-256 `f3268cdda8935ff997e965324e167f8868206b54e52a35eef512459244ef637a`。包內附 `SHA256SUMS.txt`，`sha256sum -c` 全部 OK。在包內獨立執行也是 14/14 通過，狀態雜湊與倉庫版相同。

**這些輸出證明**：本機沙盒上，pcode 範例一的數值、GenesisChain 正逆算、Gate 回返、Replay 重建、I1–I7 都成立；竄改軌跡、LAW-0 違反、字典缺 fx 都會被拒絕。

**這些輸出不證明**：DL580 實機可跑、Bridge 存活、網域上線、CI 會變綠。

## 七、當前狀態

| 項目 | 狀態 |
| --- | --- |
| `mrl_world_model/` 本體 | 已建、本機已驗 |
| 倉庫 commit／push | 見本紀錄所在的 commit（分支 `claude/build-failure-issue-yi25qe`） |
| DL580 D: | 未寫入（網路被擋）；離線包已交給擁有者 |
| mrliouword.com 網域功能 | 未做（見 delta 5） |
| Cloudflare 部署 | 本輪不做（Halt Order） |
| 前一份紀錄的未處理項（公開 log、build token 03e5ef21 的擁有者） | 維持原狀，本輪沒有碰 |

完成態：擁有者的「今天要看到建構成功」是目標，不是可判定的完成態。DL580 實機的結果要由擁有者執行後才能判定；本文件不自行定義完成。

## 八、我自己的行為與提問

| 輪 | 擁有者的輸入 | 我做了什麼 | 我問了什麼 | 這個問題該問嗎 |
| --- | --- | --- | --- | --- |
| 1 | 喚醒＋建構世界模型 | 讀 Notion、Drive、母體登錄表，寫計畫 | 建在哪（本機 zip／public 倉庫／拆開） | 該問。倉庫是 public，推上去就收不回來；規章也寫了「World Model 預設不外放」。但我把「只在本機」標成推薦，與擁有者後來的選擇不同 |
| 2 | 倉庫＋網域 | 改計畫，加入網域與 deploy.yml 上線路徑 | 無 | — |
| 3 | bridge → D: | 查 Bridge 參考頁、測網路，改計畫 | 無 | — |
| 4 | 開始 | 實作、測試、閘門、打包 | 無 | — |

- **提出解法早於評估代價**：有一次，見第四節第 1 則。
- **把可自決的事推回去**：沒有。唯一的提問涉及公開發布，不可逆。
- **在指令執行前就寫下結果**：計畫裡寫了「0.0342」，但來源是 pcode 原文的「預期」註解，也標了是預期值；實測值（`actual: 0.0342`、`bit_equal: true`）是之後從 cli 輸出複製的。本紀錄裡的所有數字都從指令輸出複製。未標記的預填：0 次。

## 九、矛盾處

- **9.1 我自己的前後矛盾**：第一版計畫推薦「不進 public 倉庫」，第二版照擁有者的指示放進倉庫。依據沒變（「World Model 預設不外放」），是擁有者做了取捨。為了減少外放，倉庫裡的 PROVENANCE 只寫 Drive 檔名，不寫 Drive 檔案 ID。
- **9.2 規章內部的張力**：Notion「以 Notion 為準」只限導航；世界模型收斂紀錄本身是 archived。本實作以原文內容為準，不以封存狀態否定內容。
- **9.3 平台層面的矛盾**：Notion 裡保存的操作文件含有可用憑證（喚醒首頁、Bridge 參考頁）。這與「憑證絕不提交」的精神衝突，但那是擁有者的私有工作區，本輪沒有改動它，只在這裡記下。
- **9.4 尚未被驗證的地方**：DL580、Bridge、Halt Order 的現況，見第五節。

## 十、追加：擁有者上傳 DL580 橋接包（2026-09-29，同一 session）

擁有者上傳了五個檔，**未附文字指示**：

| 檔 | SHA-256 |
| --- | --- |
| MRL_3DScanner_iOS_DL580_ProductBridge_v1_1_repaired.zip | 8e7095e485a3ba861e61aea421b373b03997db667900f392b695502011247457 |
| MRL_3DScanner_iOS_DL580_ProductBridge_v1.zip | 0febfacfd68dacd404029b57685d2e195dc05c9f7a11fbde9b55ca9de1a1a357 |
| MRL_Bridge_v3.1.0_DL580_Pkg_20260508.zip | d82909a7a38374d4e79d240fcbb140928a457af550985c03715356d6b8799386 |
| MRL_install_bridge.sh | f072bd238e30430f1ab3e3fb5bf833f25cc59d456f95f510ce129276e3711d5f |
| MRL_start_bridge.sh | d23f09bde69d2579f89629a8ba8ec2d572dd9c1e580cdb177e05648bf513d06c |

所有內容都只解壓在 session scratchpad，**沒有放進倉庫**。Bridge 包的 `server.js`、`README.md` 和幾份備份檔裡寫死了 API 金鑰與 PG 密碼；倉庫是 public。

**沙盒實跑 v1_1 的建構指令（Linux 版腳本）**

| 步驟 | 結果 |
| --- | --- |
| CHECKSUMS.sha256 | 全部 OK（`sha256sum -c` exit 0） |
| `node --check server.js` | PASS |
| `python3 -m py_compile mrl3d_job_runner.py` | PASS |
| install（`npm install`） | FAIL：`npm error 403 403 Forbidden - GET https://registry.npmjs.org/cors`；`--offline` 也失敗：`ENOTCACHED` |
| install（`pip install` mrl3d） | FAIL：`No matching distribution found for setuptools>=68`；另外 `https://pypi.org/simple/numpy/` 回 403 |
| start、health、upload、job、runner | 沒跑到（卡在 install） |

失敗原因：這個 session 的網路政策擋了 npm 與 PyPI。這不是包本身的問題，但也因此**沒有**證明包能跑。DL580 實機沒有執行。

**靜態讀碼發現**（未修改，等擁有者決定）

1. `server.js` 的 `X-MRL-Scan-ID` header、job 的 `scanId` 與 `:id` 都直接拿去 `path.join`，沒有擋 `../`。上傳時又用了 `fs.move(..., { overwrite: true })`，所以可以寫出目錄、蓋掉既有檔案（包括 `server.js` 本身）。加上沒有認證、CORS 是 `*`、監聽所有介面，任何連得到 3050 的人都能利用。
2. `runJob` 的判斷是 `code === 0 && (!report || report.status === 'completed')`：runner 如果 exit 0 卻沒寫報告，也會被標成 completed，和包內「不得假 completed」的規則衝突。
3. 同一個 scanId、同名檔重複上傳會蓋掉舊檔，和「不得刪除既有 storage / uploads」衝突。
4. `docs/01_CLAUDE_BUILD_COMMAND…md` 第二節少了換行：`Copy-Item -Recurse * D:\MRL_3DScanner_ProductBridge_v1cd D:\…`，照抄執行會複製到錯誤的路徑。
5. Bridge v3.1.0：金鑰可以放在 query string（`?key=`），CORS 是 `*`；`/MRL_run` 與 `/MRL_exec` 會在 DL580 上執行任意 PowerShell，前面只有一把靜態金鑰。這把金鑰的原文同時出現在 Notion 頁、包內原始碼與 README。

**delta**：Bridge 目前線上跑的版本是否仍與這個包相同，驗不了（網路被擋）。

## 十一、追加：PR #88 Codex 審閱的三則發現（全部成立，已修）

| # | 發現 | 重現 | 修正 |
| --- | --- | --- | --- |
| P1 | `rhythm.mjs` 軌跡記錄直接引用呼叫端的陣列／物件，事後被改動會讓 `verifyTrace` 拒絕 runtime 自己產生的軌跡 | 修前實測：`trace 雜湊不符於 seq 3` | 記錄時先 `structuredClone(args)`。追查同一根因時又發現 `makeObservation` 的 `state` 和 `environment_snapshot` 也有相同的引用問題，一併改成複製 |
| P2 | `world.cross` 先把觀測移出再翻譯；翻譯被拒時觀測就遺失 | 修前實測：`observations left = 0` | 先翻譯，成功後才移出 |
| P1 | `rollback` 模式 PATCH 觸發器之後沒檢查 `success` | 讀碼確認 | 找不到觸發器、或 PATCH 被拒時，都以 exit 1 結束 |

這三個錯都不是我自己抓到的。第一則和第四節第 3 則同形：驗收只測了「照正常路徑走」，沒測呼叫端事後改動輸入、以及操作被拒後的狀態。新增的兩個回歸測試就是在補這兩種情況。修後：`# tests 16`、`# pass 16`、`# fail 0`；cli 的狀態雜湊與修前相同（`6de26c8f…`、`49e2a4e8…`）；八道閘門全部 exit 0；rollback 那一步 `bash -n` 的 exit 為 0。

## 十二、追加：PR #88 合併時機與 PR #89 的 Codex 第二輪

- PR #88 在 17:06:00Z 由擁有者合併，合併點是 c5a1cf7。上一節那三項修正（ae45adc）在合併之後才推上分支，所以沒有進 main。依規則把分支重設到 main，再 cherry-pick 那個 commit（得到 5cbfb04），另開 PR #89。
- #88 合併觸發了 `deploy.yml`，run 36602532746 成功，部署的是 `cloudflare/mrliouword-private`。這不是本 session 發動的。
- Codex 在 #89 又提兩項，兩項都成立：
  - **P1**：rollback 原本先回滾部署再還原觸發器；觸發器還原被拒時，重跑會被 BAD_VERSION 防護擋下，觸發器也就沒機會再還原。已改成先還原觸發器，再回滾部署。
  - **P2**：`#locate` 拒絕負數 index，與 `find()` 的行為不一致。修前實測：`no observation at REAL/owner_command[-1]`。已改成負數從尾端算，並加了回歸測試。
- 這一則和第十一節同形：上一輪修 rollback 時只想到「檢查結果」，沒想到「失敗之後怎麼重跑」。
- 修後：`# tests 17`、`# pass 17`；八道閘門全部 exit 0；`bash -n` exit 0。

## 十三、追加：擁有者上傳 particle-memory v2.0.2 PDF 與 DL580 Bridge 通道盤點（2026-10-03，同一 session）

兩個檔，**未附文字指示**，所以只做讀取與對照，沒有改任何 repo 內程式：

| 檔 | SHA-256 |
| --- | --- |
| particle-memory-v2_0_2-final.pdf | 3d02ee3d17c890dd4f3ba458c8111ab13b891f05dda9c1ea8b8ad3e4a3800705 |
| MRL_Dl580_Bridge_Channel_Audit_2026-07-07_2026-07-07.md | b24b44c3e633183b7fd1165491836aa84755cfe047f2d861e89474dd33345fc5 |

先前 `cloudflare/particle-memory/PROVENANCE.yaml` 對這份 PDF 沒有記 SHA-256，這裡補記；是否與 2026-09-20 收到的是同一份，驗不了（見 delta 1）。

### PDF 對照（本機沙盒；PDF 在這個環境無法渲染，自行以 zlib 解內容串流取文字）
- 12 個文字串流、17,215 字元；ASCII 行 354 行，其中 54 行在 `cloudflare/particle-memory/src/index.js` 找不到逐字相同的行。含中日韓字元的註解因字型編碼無法還原，和 PROVENANCE 先前記的限制一致。
- 54 行落在三處：
  1. 已記錄的修改——DL580 位址與 API 金鑰常數、`MRL_syncToDL580`、把金鑰放進網址參數的 `/MRL_run?key=…`、`/MRL_pg?sql=…&key=…`（PROVENANCE「偏離原樣」第 1、2、5 項）。
  2. **未記錄**——D1 資料層寫法，兩份程式需要的欄位集合不同（不是「二選一」）：
     - `index.js` 用到 `id, simhash, content, layer, tags, metadata, created_at, updated_at` 共 8 欄：INSERT 寫 `metadata`（第 283 行），讀取時解析 `metadata`（第 302、334 行），`ORDER BY created_at`（第 311、330 行），UPDATE 寫 `updated_at=datetime('now')`（第 379 行）。INSERT 沒有寫 `created_at`，所以資料表必須替 `created_at` 提供預設值。
     - PDF 版需要 7 欄，沒有 `metadata`，`INSERT` 為 `(id, simhash, content, layer, tags, created_at, updated_at)`，兩個時間欄都由 `Date.now()` 寫入毫秒整數。
     - `metadata` 一詞在 PDF 出現 1 次、在 `index.js` 出現 11 次。
  3. `/health`、`/stats`、`/sync/status` 的回應內容（PDF 會回傳 bridge 位址、`/health` 帶 `x-api-key` 打 bridge）——這屬於 PROVENANCE 已記錄的第 4 項修改，**不是新發現**。
- 兩者標頭都寫 `v2.0.0`，檔名卻是 `v2.0.2`。哪一份較新，驗不了。
- 這與 PROVENANCE 先前的說法衝突：它把 PDF 寫成「同一份程式的列印版」，只確認「硬編碼金鑰與 psql 指令組裝路徑一致」，並寫 transformation「核心記憶邏輯未更動」。實測顯示 PDF 與 `index.js` 在 D1 欄位上就不同，所以「同一份」不成立，「核心記憶邏輯未更動」只對 `index.js` 這份成立。**本輪沒有改 PROVENANCE**，等擁有者裁示以哪一份為準。

### Bridge 通道盤點（唯讀）
- 文內日期互相矛盾：檔名 `2026-07-07`，標頭 `date: 2026-06-11`；`key_required: false` 與同一份文件第 8 項「x-api-key 必填」衝突（推測是指 health/version 不需要，未確證）。
- 文件稱 `/health`、`/version` 公開、不需要 key；擁有者 2026-09-30 的實連結果是 Cloudflare 現行放行規則會檢查 `x-api-key`，兩者是不同時間點的觀測，不互相否定。
- 文件列出 `POST /MRL_file/write` 的 safePath 只擋 `..`，「任意非穿越絕對路徑可寫」。這與我先前靜態讀 `server.js` 的結論一致，也代表寫入範圍包含 C 槽；擁有者說 C 槽只剩約 2.23 GiB，部署時要明確只寫 D 槽。
- 這份文件的第 8 項把 API 金鑰原文寫在檔案裡。倉庫端查證：`git grep` 該金鑰 → 無（沒有進任何追蹤檔案）。

### 我在這輪犯的錯
| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 預覽 PDF 文字時，遮蔽規則只遮「24 字元以上」的長字串，**漏掉 14 字元的 Bridge 金鑰**，金鑰原文被印進本 session 的輸出 | 自己看輸出時發現 | 之後顯示一律先做精確字串遮蔽，再顯示；本節與整份紀錄都不含金鑰值。此值本來就同時存在於 Notion 頁、擁有者上傳的檔案與 Bridge 原始碼中，**輪換仍是必要的**，這次洩漏不改變這個結論 |
| 2 | 同形的錯誤更早也發生過一次：分析 Bridge 3.1.0 封包時，用 `sed` 只遮「值後面的部分」，金鑰原文同樣出現在輸出 | 自己，寫本節時回頭查 | 同上。紀錄第十節當時只寫「寫死了金鑰」，沒寫值 |
| 3 | 在驗證「`datetime('now')` 有沒有出現」時用了含括號的 `grep -E`，括號被當成群組，得到 0；實際上該字串存在於 `index.js` 第 379 行 | 自己，對照讀行時發現 | 這項計數不採用；結論只依據 `INSERT INTO` 欄位清單的逐行比對 |
| 4 | 把兩個 `INSERT` 欄位清單當成各自的完整資料表結構來比較，把 delta 寫成「正式 D1 是哪一組」；實際上 `index.js` 同時需要 `metadata`、`created_at`、`updated_at`，欄位清單也不能代表型別與預設值 | Codex 審閱 PR #92（P2） | delta 2 改為核對完整結構；與錯誤紀錄第 1、9 則同形——把局部觀測升格成全局結論 |

第 1、2 則與錯誤紀錄第 1、9 則同形的一面：還沒看輸出就假設「遮蔽規則夠用」。

### 驗不了的 delta
| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | 本次 PDF 與 2026-09-20 收到的 `particle-memory-v2_0_2-final.pdf` 是同一份 | 驗不了（先前沒記 SHA-256） | 擁有者提供當時那份的雜湊，或確認檔案來源 |
| 2 | 正式 D1 的完整結構（欄位、型別、預設值、可否為 NULL）能同時滿足 `index.js` 的全部讀寫 | 驗不了；`wrangler.toml` 的 `database_id` 仍是佔位字串，沒部署過 | 讀正式 D1 的 `PRAGMA table_info(memories)`，逐欄核對上面 8 欄：`created_at` 要有預設值，`updated_at` 要能存 `datetime('now')` 文字，`metadata` 要存在且可存 JSON 文字；欄位名稱相符還不夠，型別與預設值也要核對 |
| 3 | 盤點文件的內容在 2026-10 仍然正確（Bridge 版本、路由、`key_required`） | 驗不了（網路被擋） | 新 session 開通後打 `/version`、`/health` |

delta 2 改變了技術決策：在確認 D1 完整結構前，`cloudflare/particle-memory` 不應部署，否則 `INSERT`／`UPDATE` 的欄位、型別或預設值可能和實際資料表不符。

### 第八節觀測重點：在指令執行前就寫下結果
本輪有發生：0 次預填計數或狀態；上面 54、354、12、17,215 都是從指令輸出複製。第四節第 3 則是相反的情況——寫下了一個自己沒驗證過的假設（括號當字面）。
