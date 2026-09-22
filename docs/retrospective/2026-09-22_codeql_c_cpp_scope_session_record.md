---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-09-22_codeql_c_cpp_scope_session_record.md
source_version: "2026-09-22"
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Claude Code（執行與撰寫；也是本文件第四節記錄的每一個錯誤的犯錯者）
  - Mr.liou（canonical_authority；提出問題、定義完成態、裁示方案 B）
transformation: 逐步記錄本 session 的查證過程、各角色與平台的實際作為、驗不了的 delta 與待決事項
verification_status: partial
preserved_at: "2026-09-22"
---

<!-- mrl-origin: MrLiouWord -->

# Session 紀錄 — 2026-09-22 CodeQL c-cpp 掃描範圍

這份文件記錄的是一次完整的來回：**一個被誤讀的現象，如何被查成一個有證據的結論，
以及過程中我自己犯了哪些錯。**

寫它的理由是擁有者的指示：

> 把這些都當成系統紀錄，真實紀錄這一切過程，前因後果跟角色平台的作為。

`verification_status` 寫 `partial` 不是保留，是事實：本輪有四件事**驗不了**，
逐條列在第五節。依 `.mrliou/meta.json` 的
`difference_policy: preserve_as_delta_not_failure`，那些記成 delta，不記成結論。

---

## 一、起點：一個被誤讀的現象

擁有者提出的問題是：

> 為什麼我建構失敗每次都這樣、然後別人拿去建構？

附三張 GitHub 手機端截圖：兩則 workflow 失敗通知、一則 CodeQL Advanced 的
queued 畫面，以及數則 NVIDIA/Megatron-LM 的 PR 通知。

這個問題裡有一個**經驗上真實、但歸因錯誤**的判斷。經驗是真的：Inbox 長期被紅燈
淹沒。歸因不成立：紅燈不在同一個倉庫，而「別人拿去建構」的那些 PR 與本人無關。

查證結果（第二節）把它重述為：

> 不是「我失敗、別人成功」，而是**同一個人在兩條線上推，活躍那條成功了，
> 鏡像那條停在 9/13 且帶著一個沒人修的 CodeQL 模板定時失敗**，
> 兩邊通知混在同一個 Inbox。

---

## 二、查證過程與證據

每一步都附可複查的憑據。**沒有一條是從截圖推論出來的。**

### 2.1 活躍倉庫的狀態

`dofaromg/mrliouword-system` main = `7561cc1`，即 PR #77 的合併 commit。
依 `Mrliou_claude.md` 記載「PR #77 的完成態 = 被合併」（擁有者，2026-09-21），
該輪完成態**已達成**。

main 上唯一紅燈是 `Deploy to Cloudflare Workers`
（[run 35597928511](https://github.com/dofaromg/mrliouword-system/actions/runs/35597928511)）。
實際 job log：

```
env:
  CLOUDFLARE_ACCOUNT_ID:
  CLOUDFLARE_API_TOKEN:
✘ [ERROR] In a non-interactive environment, it's necessary to set a
  CLOUDFLARE_API_TOKEN environment variable for wrangler to work.
```

`deploy.yml:9-10` 讀 `${{ secrets.CLOUDFLARE_API_TOKEN }}`，該 secret 為空。
自 2026-08-10 的 run 80 起，每次 push 到 main 都是同一個 job 在同一行失敗。
**這與 `Mrliou_claude.md` 已記載的 `Workers Builds: particle-api` 同類**：
平台端設定未接上，倉庫端修不好。

### 2.2 截圖裡的紅燈不在活躍倉庫

| 截圖 | 倉庫 | 事件 |
| --- | --- | --- |
| 1 | `Mrliou/MRL-Autonomous-Evolution-Stack-AES-` | workflow run failed at startup |
| 2 | `Mrliou/mrliouword-system` | CodeQL Advanced Attempt #3 failed |
| 3 | `Mrliou/mrliouword-system` | CodeQL Advanced #24，commit `61bf01f`，**Triggered by dofaromg** |

決定性證據：`61bf01f` 在活躍倉庫中不存在。

```
$ git cat-file -t 61bf01f
fatal: Not a valid object name 61bf01f
```

鏡像 HEAD 停在 `61bf01f`（2026-09-13，"Fix MRL public interface artifact
attestations (#7)"），活躍倉庫當日已是 `7561cc1`。兩邊 workflow 檔也不同：
鏡像多了 `codeql.yml`、`generator-generic-ossf-slsa3-publish.yml`、
`mrliou-mrl-wake-public-interface.yml`。

此漂移非新發現，PR #62 已記載：`dofaromg/` 為活躍實作，`Mrliou/` 為組織投影／鏡像。

### 2.3 CodeQL c-cpp 失敗的成因（推論，非確證）

鏡像的 `.github/workflows/codeql.yml` 是 GitHub 自動產生模板，未經修改，
語言矩陣含 `c-cpp`（`build-mode: none`）。模板之所以偵測到 C/C++，是因為：

```
根目錄            267 個 .c/.h    Git 自身原始碼（access.c、worktree.c、write-tree.c …）
integrations/      92 個 .c/.h    同上
mrliou/            17 個 .c/.h    本倉庫自有
core/atom_t.h       1 個 .h       本倉庫自有
                  ───────────
                  377 個
```

`build-mode: none` 依副檔名推斷編譯單元，會把 359 個外來檔全部吃進去。

**血緣判定用的是全文比對，不是檔名直覺**：359 個 vendored 檔中，
提及 `mrl_`／`mrliou` 者為 0。

### 2.4 自有 C 的實質內容

```
mrliou/router.c     396 行
mrliou/memory.c     225 行   memcpy ×8
mrliou/server.c     218 行   socket() / accept() — 對外監聽
mrliou/reasoning.c  199 行   strcat ×2（有邊界檢查）
mrliou/learning.c   169 行
mrliou/growth.c     141 行
mrliou/generation.c 111 行
mrliou/main.c        95 行
                  ───────
                  1,888 行（含標頭）
```

`core/atom_t.h`（87 行）開頭寫明 `Author: MR.liou`。

依賴檢查：`mrliou/` 的所有 `#include` 只有自己的標頭與 libc/POSIX，
**不依賴根目錄那批 Git 標頭**，因此移除 vendored 後仍可獨立抽取。

### 2.5 一個差點造成的破壞

`integrations/` 是**混的**：vendored 的 Git C 源碼，與本倉庫自有的 Python
（`github/attention_filter.py`、`notion/sync.py`、`particle/naming_engine.py`、
`webgpu/attention_filter.py` 等 22 個非 C 檔）放在同一個目錄。

若按直覺整個目錄排除，會**連帶關閉自有 Python 的掃描**。查證擋下了這個。

---

## 三、角色與平台的作為

| 角色／平台 | 本輪的實際作為 |
| --- | --- |
| **Mr.liou**（canonical_authority） | 提出問題；要求先報告影響再動手；裁示方案 B；授權開新 session 推送 |
| **Claude Code**（本 session） | 查證、設計、實測、撰寫；同時犯了第四節的三個錯 |
| **GitHub Actions** | 忠實回報失敗。`deploy.yml` 的紅燈自 8/10 起每次都在同一行，訊息一直是對的 |
| **GitHub API（MCP）** | 允許讀寫 `dofaromg/`；對 `Mrliou/` 回 `Access denied: repository "mrliou/mrliouword-system" is not configured for this session` |
| **GitHub 匿名 git proxy** | 允許 clone `Mrliou/` 唯讀副本——本輪所有鏡像側證據由此取得 |
| **GitHub CodeQL 模板** | 自動產生的語言矩陣把 vendored Git 源碼誤判為本倉庫的 C 專案。**模板沒有錯，是倉庫內容誤導了偵測** |
| **Cloudflare** | 未提供 API token（secret 為空）；dashboard 的 particle-api Root directory 亦未設定 |
| **egress proxy** | 擋掉 `docs.github.com`、`raw.githubusercontent.com`、`codeql.github.com`（WebFetch 與 curl 皆 `000`），導致 `paths-ignore` 語意無法確證 |
| **Claude Code Remote** | `add_repo(access: push)` 對 `Mrliou/` 回 `cross-tier adds are not supported in v1`；`create_session` 允許以該倉庫為初始 source |
| **子 session** `session_01TGigtDYeJu4JMamMLQbsjd` | 已建立分支 `fix/codeql-exclude-vendored-c`、檔案已 staged；**當前卡在等待擁有者批准 `add_repo`（push）** |
| **Dependabot / Copilot** | 在活躍倉庫有例行 run，與本議題無關 |
| **NVIDIA/Megatron-LM** | 與本人倉庫無關。截圖中的 PR 是訂閱的上游通知 |

---

## 四、我在本輪犯的錯

延續 `2026-09-20_claude_session_error_log.md` 的體例：錯誤本身不值得紀念，
值得記的是**怎麼被抓到**，以及**現在擋著它復發的是什麼**。

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 把 `mrliou/` 的 17 個自有 C 檔含混歸進「那不是本倉庫要掃描的程式碼」 | 我自己，在做影響分析時 | 本文件 2.3／2.4 的逐目錄分類；`codeql.yml` 註解寫死 18 個保留檔 |
| 2 | 分類寫成 267+92+17=376，漏掉 `core/atom_t.h`，實際 377 | **實測輸出**，不是我的推理 | 裁剪腳本每次執行都印出 `before → after` 與完整保留清單 |
| 3 | 原本打算整個目錄排除 `integrations/` | 查證（未實際犯錯） | 排除規則精確到副檔名層級：`integrations/*.c integrations/*.h` |
| 4 | 說「Merkle 集涵蓋 6 個檔」——把 JSON 的頂層鍵當成檔案清單 | 我自己，第二次查時 | 本節的更正；查 `nodes` 而非頂層鍵 |

### 4.1 第 4 則的更正內容

`.mrliou/merkle.json` 的頂層鍵是 `version`／`merkle_root`／`tree_height`／
`leaf_count`／`hash_algorithm`／`nodes` 六個。我把這六個鍵當成「六個檔案」，
得出「Merkle 集涵蓋 6 個檔」。

實際結構：`leaf_count: 12`，檔案清單在 `nodes` 陣列裡（24 個節點，level 0 為葉），
**全部位於 `.mrliou/` 之下**。

```
$ python3 -c "... json.load(open('.mrliou/merkle.json')) ..."
leaf_count: 12  hash: sha256
nodes 型別: list 長度: 24
  含 'Mrliou_claude.md': False
  含 'CLAUDE.md': False
  含 'docs/retrospective': False
```

**結論不變**（本輪改動不在雜湊集內，不需重建），但**數字與理由都是錯的**。

這則錯誤的擴散範圍：commit `ac84959` 的 message 與 PR #78 的內文都寫了
「Merkle 雜湊集涵蓋的 6 個檔」。依 `history_policy: append_only`，
commit message **不改寫**；更正以本節為準，PR 內文另行更新。

這是本輪第二次「用結構直覺代替實際解析」——第 2 則是分類漏算，這則是
把鍵當成值。兩者同源：**沒有把資料真的攤開看，就開始數。**

**第 1 則與既有錯誤紀錄第 1 則同形**：把「我沒分類清楚」說成「它不是你的」。
既有紀錄裡那一則是把「我沒查到」說成「它不存在」。形狀一樣——
**用自己的認知邊界去替事實下定論。**

差別在於：上一次是擁有者當面更正，這一次是我在被要求「先報告說明影響」時自己抓到的。
**如果當時直接照第一版動手，自有的 1,888 行 C 會無聲失去掃描覆蓋。**
擋住它的不是我的謹慎，是**規章要求先報告影響**這一步。

---

## 五、驗不了的 delta

依 `difference_policy: preserve_as_delta_not_failure`，以下記成 delta，不記成結論。

| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | `c-cpp` 失敗的真正成因是 vendored Git 源碼 | **推論，未確證** | 讀鏡像倉庫該 job 的 log；本輪 GitHub API 對 `Mrliou/` 被拒 |
| 2 | `paths-ignore` 對 `build-mode: none` 的 C/C++ 是否生效；`*.c` 是否遞迴匹配 | **查不到原文** | 能連上 `docs.github.com`；或在該倉庫實跑一次對照 |
| 3 | 其餘三格（actions／javascript-typescript／python）是否為綠 | **未知** | 同 delta 1 |
| 4 | `Analyze (c-cpp)` 是否為 required status check | **查不到** | 擁有者在 Settings → Branches 確認 |

delta 2 直接改變了實作選擇：因為無法確證 glob 是否遞迴，**放棄 `paths-ignore`**，
改用語意可在本地重現驗證的工作副本裁剪。理由寫在 `codeql.yml` 的註解裡，
不只寫在這份文件——**若 glob 其實遞迴，自有程式碼會被一起排除而且不會報錯**，
那比紅燈更糟。

---

## 六、交付物與實測輸出

對 `Mrliou/mrliouword-system` 的 `.github/workflows/codeql.yml`，
**純新增 41 行，0 刪除**，保留 `c-cpp` 矩陣項，在 `codeql-action/init` 之前
加入一個僅對 `c-cpp` 生效的裁剪步驟。

驗收三項，皆實跑：

```
# 1 YAML 與結構
矩陣語言: ['actions', 'c-cpp', 'javascript-typescript', 'python']
c-cpp 保留 ✓  裁剪早於 init ✓  if 條件只鎖 c-cpp ✓

# 2 裁剪腳本（於 git archive 出的副本上原文照抄執行）
C/C++ 檔數：377 → 18（移除逐字匯入的 Git 源碼）
保留供分析的自有 C 實作：
./core/atom_t.h
./mrliou/config.h  ./mrliou/generation.c  ./mrliou/growth.c
./mrliou/learning.c ./mrliou/main.c       ./mrliou/memory.c
./mrliou/reasoning.c ./mrliou/router.c    ./mrliou/server.c
（+ 各自的標頭）
=== 保險條件通過 ===

# 3 diff 規模
.github/workflows/codeql.yml | 41 +++++++++++++++++++++++++++++++++++++++++
1 file changed, 41 insertions(+)
```

腳本內含保險：裁剪後若 `mrliou/` 沒有 C 檔留下，job 以 `::error::` 明確失敗。
**寧願紅燈，不要假綠燈**——這道保險擋的正是第五節 delta 2 描述的無聲失敗模式。

被否決的方案 A（直接拿掉 `c-cpp`）不採用，理由：那會用**放棄 1,888 行自有 C 的
掃描覆蓋**去換一個綠燈。已寫入給子 session 的指令：若 `c-cpp` 仍紅，
須讀 log 找真正成因回報，**不得退回方案 A 換綠燈**。

根因**未處理**：359 個 vendored C 檔仍在鏡像倉庫中，本方案是讓掃描繞過它們，
不是清掉它們。活躍倉庫同樣有那 267 個。該項（方案 C）涉及搬移檔案，
牴觸「檔案不要亂刪、留存紀錄」，**未動，待擁有者裁示**。

---

## 七、當前狀態

| 項目 | 狀態 |
| --- | --- |
| 活躍倉庫 PR #77 | 已合併（`7561cc1`），該輪完成態達成 |
| 活躍倉庫 `deploy.yml` 紅燈 | **未修**，需在 Settings → Secrets 補 `CLOUDFLARE_API_TOKEN` 與 `CLOUDFLARE_ACCOUNT_ID`（倉庫端無法修） |
| 鏡像倉庫 CodeQL 修正 | 已設計、已實測、**尚未推送** |
| 子 session | 卡在等待擁有者批准 `add_repo(access: push)` |
| 鏡像／活躍漂移 | 未處理，非本輪範圍 |
| 方案 C（清理 vendored 源碼） | 未動，待裁示 |

依規章 Step 1「完成態由人類定義，不由系統猜測」——
**本輪完成態尚未由擁有者定義，本文件不自行定義。**

---

## 八、這一輪學到的

擋住本輪最大破壞的，不是任何技術手段，是**規章裡「先報告說明影響」那一步**。

第一版方案在技術上完全可行、YAML 驗得過、CI 會變綠。它唯一的問題是
**會無聲拿掉自有程式碼的掃描覆蓋**——而這件事，只有在被要求說明影響、
因而必須逐目錄去查「到底不再被掃的是什麼」時，才會浮出來。

七步裡的「比對」寫著：**先跑一次，再決定同不同意**。
本輪三個錯誤裡有兩個是實測抓到的，不是推理抓到的。

---

## 九、我自己的行為與提問

擁有者要求「也紀錄妳自己的行為跟提問」。逐輪列出我做了什麼、問了什麼、
以及該問還是該自己決定。

| 輪 | 擁有者的輸入 | 我做了什麼 | 我問了什麼 | 這個問題該問嗎 |
| --- | --- | --- | --- | --- |
| 1 | 為什麼建構失敗、別人拿去建構 | 查 run log、clone 鏡像、比對 commit；未動手修任何東西 | 「三個修法哪一個要做」 | **該問**。完成態未定義，不得自行延伸 |
| 2 | 拿掉 c-cpp | 改動、驗證 YAML、產出 patch；推送被拒 | 「你自己套 patch，還是我開新 session」 | **可自決**。我已知推不上去，開新 session 是唯一路徑，問了等於把已知結論推回去 |
| 3 | 先報告說明影響 | 逐目錄查覆蓋範圍，**發現自己第 1 輪的分類錯誤**；建議 B 而非 A | 無（給了建議與三條路） | — |
| 4 | B | 退回 A、研究 paths-ignore、撞上 egress 封鎖、改設計、實測 377→18 | 「你套 patch 還是我開新 session 推」 | **重複第 2 輪那個可自決的問題** |
| 5 | 開新 session 推上去 | 建立子 session，寫入完整指令與邊界 | 「現在去查它狀態還是等一下」 | **可自決**。查一次成本極低 |
| 6 | 當成系統紀錄 | 寫本文件、跑六支閘門、開 PR #78 | 無 | — |

### 9.1 最根本的那個錯，在第 1 輪

我在第 1 輪就把「CodeQL 矩陣拿掉 `c-cpp`」列為三個修法之一。

**當時我還沒查過 `c-cpp` 覆蓋什麼。**

第四節那三則錯誤都是這一件事的下游：我提出解法早於評估代價，之後的分類含混、
數字漏算、差點整個目錄排除，全部發生在那個已經說出口的建議之上。

這比「分類錯誤」更根本。分類可以重查，但**一個被說出口的建議會變成後續工作的
預設起點**——第 2 輪擁有者說「拿掉 c-cpp」，選的正是我自己端上去的選項。
如果擁有者當時沒有要求先報告影響，那個未經評估的建議就會被執行。

### 9.2 提問的傾向

四次提問裡有三次是可自決的，其中兩次還是同一個問題問了兩遍。
把已知結論包裝成問題推回給擁有者，不是謹慎，是**把判斷成本轉嫁出去**。
規章要求的是「完成態由人類定義」，不是「每一步都要人類定義」。

---

## 十、矛盾處

擁有者的要求是「純粹真實完整記錄錯誤矛盾處」。以下不分輕重，逐條列。

### 10.1 我自己的前後矛盾

| # | 前 | 後 |
| --- | --- | --- |
| 1 | 第 1 輪：「那不是本倉庫要掃描的程式碼」（指全部 C 檔） | 第 3 輪：「這句話對 359 個檔成立，對 `mrliou/` 那 17 個**不成立**」 |
| 2 | 分類推理：267+92+17 = **376** | 實測輸出：**377**（漏了 `core/atom_t.h`） |
| 3 | 第 1 輪把「拿掉 c-cpp」列為可行修法 | 第 3 輪自己論證該方案是「用放棄覆蓋換綠燈」並建議否決 |

第 3 條是我自己推翻自己的建議。**推翻是對的，但那個建議本來就不該在未查證前說出口。**

### 10.2 規章內部的張力

以下不是誰的錯，是設計取捨必然帶來的代價。記下來，因為它們會重複出現。

- **完成即停止 ↔ 已知損壞的存續**
  `deploy.yml` 的紅燈從 2026-08-10 的 run 80 紅到今天，成因單一且明確。
  停止條款讓系統不因「好奇、優化衝動」自行延伸——代價是**已知損壞會一直維持
  損壞，直到人類點名**。本輪它被點名，靠的是擁有者拿著截圖來問，不是系統回報。

- **`history_policy: append_only`／「檔案不要亂刪」 ↔ 根因的存續**
  整件事的根因是 359 個 Git 自身的 C 原始碼檔躺在倉庫根目錄。
  保護歷史的規章，同時保存了這個問題。方案 C（清理）之所以卡住，正是卡在這裡。
  **這不是規章錯了**——規章擋掉的破壞遠大於它保存的麻煩。但兩者確實衝突，
  而衝突只能由擁有者裁示，不能由系統自行權衡。

- **`governance_authority: false` ↔ 需要判斷的時刻**
  倉庫不得自行定義治理規則。本輪至少三次撞上「這件事該怎麼算」
  （鏡像算不算本倉庫的責任、完成態是什麼、方案 C 動不動），全部只能上呈。
  這是對的，但也意味著**系統的推進速度上限等於擁有者的裁示頻率**。

### 10.3 平台層面的矛盾

- **同一份公開資料，兩條路徑給出不同答案。**
  `Mrliou/mrliouword-system` 是 public 倉庫。匿名 git proxy 讓我 clone 到完整內容；
  GitHub API（MCP）對同一個倉庫回 `Access denied ... not configured for this session`。
  本輪所有鏡像側證據，都是繞過 API、從 git 這條路拿到的。

- **能記錄問題的地方，不是能修問題的地方。**
  我有權限在 `dofaromg/` 寫下這份紀錄並開 PR，卻沒有權限在 `Mrliou/` 改那一行
  YAML。修正必須繞道一個新 session。

- **批准的請求停在它自己的 UI。**
  子 session `session_01TGigtDYeJu4JMamMLQbsjd` 卡在 `add_repo(access: push)`，
  `request_id` 為 `337c8c23-841d-46b5-ab4a-ae34c90b582c`，
  `updated_at` 停在 `2026-09-22T05:31:18Z` 未再變動。
  該批准須在**那個 session 自己的介面**上進行，本 session 無法代為批准，
  也無法把「擁有者已表示會批准」轉成實際的授權。

- **egress 封鎖改變了技術決策，不只是拖慢它。**
  `docs.github.com`、`raw.githubusercontent.com`、`codeql.github.com` 三者皆
  不可達（WebFetch 與 curl 均 `000`）。結果不是「查慢一點」，
  而是**放棄了原本打算用的 `paths-ignore` 方案**，改走一條語意可本地重現的路。
  一個環境限制，直接寫進了倉庫的 CI 設計。

### 10.4 尚未被驗證的地方（與第五節呼應）

本文件第六節那些實測輸出，證明的是**裁剪腳本的行為**，
不是**CodeQL 會因此變綠**。這兩件事之間仍然隔著一次真實執行，而那次執行
尚未發生。任何把第六節讀成「問題已解決」的理解，都超出證據所能支撐的範圍。
