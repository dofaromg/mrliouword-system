---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-09-20_claude_session_error_log.md
source_version: "2026-09-21"
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Claude Code（撰寫；也是本文件記錄的每一個錯誤的犯錯者）
  - Codex（chatgpt-codex-connector）——七則發現中的多數由它指出
  - Mr.liou（canonical_authority；第 1 則由他當面更正）
transformation: 逐項記錄本 session 的錯誤、證據、發現者與防止復發的機制
verification_status: verified
preserved_at: "2026-09-21"
---

<!-- mrl-origin: MrLiouWord -->

# 錯誤紀錄 — 2026-09-20／21 Claude session

這份文件記錄的是**我自己犯的錯**，不是別人的。

寫它的理由來自擁有者的一句指示：

> 往後發生任何錯誤都沒關係、檔案不要亂刪留存紀錄，真實建構保存。

錯誤本身不值得紀念。值得紀錄的是**它怎麼被抓到的**，以及**現在有什麼東西擋著它復發**。
沒有後者的話，這份文件就只是一份認錯清單，下一輪照犯。

---

## 一、七則錯誤

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 把「我看不到」說成「不存在」 | **MR.liou 當面更正** | 寫進 commit 與 `registry/CONNECTION_MAP.md`；本文件第二節 |
| 2 | shell 安全守衛把正常內容全擋掉 | 我自己的回歸測試 | 原始碼註解記下錯誤原因，防止改回去 |
| 3 | JSONC 尾隨逗號處理會弄壞字串內容 | 我自己新寫的測試 | `tests/test_connection_audit.py` |
| 4 | 來源標註檢查：規格表少一列會放行 | **Codex** | 界標 + 逐列比對；14 個測試函式，`parametrize` 展開後 22 個案例 |
| 5 | 發布 Gate 可以被繞過 | **Codex** | `--trusted-baseline`；債務帳本只能變小 |
| 6 | particle-memory 部分更新從來沒能用過 | **Codex** | 拿掉多餘的 `JSON.parse`，註解寫明理由 |
| 7 | 連接稽核把我自己的待辦算成成果 | **Codex** | `deployable` 要求兩個條件；佔位字串具名另列 |

外加一則我在**修 #7 的過程中**犯的：第一版 `find_placeholders` 用逐行解析，
抓不到寫在同一行的內嵌 JSON 物件。我自己的測試抓到了，**修的是解析不是刪測試**。

---

## 二、第 1 則：唯一一則由人當面更正的

我寫過這句話：

> 其餘 136 個 Worker 的原始碼不在任何地方。

MR.liou 的回覆：

> 一定是存在的，只是放在那個平台跟運行順序而已，Dropbox、iCloud、
> googledrive、onedrive、notion、GitHub、cloudflare 這些都是有 MRL 系統
> 檔案分布，全部串連起來才是真正的系統全貌完整態。

我用本 session 的連接器實地查過，他完全正確：Dropbox 命中 40 筆且未列完，
Google Drive 有 `MRL_全域檔案索引.json`、`00_MRL_BaseWorld_DB_v1.sql`、
`MRL_ParticleArchive_manifest.json` 等。

**我能查證的只是「不在這個倉庫裡」，卻把「我看不到」說成了「不存在」。**

這一則之所以單獨寫一節，是因為它和其他六則性質不同：其他六則是程式缺陷，
這一則是**認識論上的錯誤**——把觀測範圍的邊界當成了世界的邊界。

而且它是我當時正在批評別人的那種錯誤。我一邊寫「沙箱 ≠ 部署」「不可繼承
前視窗的數字」，一邊自己犯了同一類。

現在的做法：查不到的一律寫「我沒查」或「待補」，並寫明為什麼查不到。
例如 `MRL_PROVENANCE.md` 第 3.3 節的來源 commit SHA 就是這樣處理的——
猜一個填進去等於偽造來源鏈，比留白更糟。

---

## 三、第 4、5、7 則是同一種病

這三則全是 Codex 抓到的，而且根因一模一樣：

> **檢查者自己把標準放寬。**

| 則 | 具體形狀 |
| --- | --- |
| 4 | 來源標註檢查對**整份文件**做子字串搜尋。欄位名在第三、四、五節也會出現，所以從規格表刪掉一整列仍然通過。九個欄位裡有五個是這種情況。 |
| 5 | 發布 Gate 的債務帳本從**同一個 checkout** 讀。一個變更只要同時「新增違規」＋「重寫帳本」，兩件事互相抵銷。 |
| 6→7 | 連接稽核的 `deployable_from_repo` 只檢查「wrangler 讀得到」。我自己刻意留的 `FILL_ME_BEFORE_DEPLOY` 待辦，被算成了可部署成果，主結論 3 被灌水成 4。 |

第 7 則最難看，因為那份復盤文件就在同一個 PR 裡，由我親手存進
`registry/evidence/`，裡面白紙黑字寫著：

> 用行數／單元數／備份節點數製造進度感 = 渲染，不是執行

**我把那句話收進倉庫，然後在隔壁的工具裡犯了一模一樣的錯。**

### 為什麼我自己抓不到

第 4 則我寫了九個「拿掉該欄位就該被擋下」的負面案例，全部通過，所以我向
擁有者報告「18/18」。但那些案例用的是我自己捏的最小文件，**每個欄位只出現
一次**——測試重現的不是真實文件的結構。

所以「18/18」測的是測試自己。

這是一個一般性的教訓，不只關於那一次：**我寫的測試會繼承我寫程式時的同一個
盲點**。我以為 X 成立，所以我寫的程式假設 X，我寫的測試也假設 X。三者一致，
全綠，錯的。

要打破這個迴圈需要一個不共享我假設的東西——這一輪那個東西是 Codex 和
MR.liou。這不是謙虛的場面話，是可觀察的事實：七則裡有五則不是我自己發現的。

---

## 四、每一則現在擋著它的機制

紀錄錯誤沒有用，除非有東西擋著它復發。逐則對照：

### 第 2 則 — shell 安全守衛

第一版檢查「組好的整串指令」，結果正常內容也被擋掉——因為 SQL 範本自身就
含分號與換行。改為驗證**使用者輸入本身**。

擋著它的：`cloudflare/particle-memory/src/index.js` 的原始碼註解寫明了
「為什麼不能驗證整串指令」，免得有人覺得那樣比較嚴謹而改回去。

### 第 4 則 — 來源標註檢查

規格表用 `<!-- MRL-SPEC-TABLE:BEGIN/END -->` 界標框住，只解析界標之間的
表格列，逐列比對欄位名**與順序**，要求值非空。

擋著它的：`tests/test_provenance_notice_check.py` 的破壞性案例**一律以倉庫裡
真正的 `MRL_PROVENANCE.md` 為素材**，不用捏造的。14 個測試函式，其中刪除
規格表某一列的那個以 `parametrize` 展開成 9 個，合計 22 個案例；另在本機以
等價 harness 跑過 16 種破壞情境（本機無 pytest，PyPI 回 403），誤放行 0。
模組 docstring 寫明「不要改回全文搜尋」。

### 第 5 則 — 發布 Gate

`--trusted-baseline`：債務帳本從 base revision 取，而且工作樹的帳本只要多出
信任來源沒有的條目，**即使沒有新違規也擋下**。

擋著它的：8 個回歸測試 +「帳本只能變小」這條規則寫進原始碼註解與 CI 註解。

### 第 6 則 — particle-memory

`retrieve()` 已經解析過了，`update()` 不能再 parse 一次。

擋著它的：原始碼註解記下實測結果（只給 content 會炸、給了 tags 還是會炸），
免得下一輪有人「修正」回去。這個檔案是逐字匯入的既有部署，**偏離原樣的每一處
都要留下為什麼**。

### 第 7 則 — 連接稽核

`deployable_from_repo` 要求兩個條件同時成立。佔位字串另列 `config_incomplete`
**具名**呈現——不是把數字改小就算，要說清楚少的那一個少在哪裡。

擋著它的：新增 7 個回歸測試（`tests/test_connection_audit.py` 全檔共 20 個），
含「整行註解不算設定」與「非必要欄位不擴大解釋」
兩個反向案例。`registry/CONNECTION_MAP.md` 的判準說明一併更新。

---

## 五、刻意沒有做的事

紀錄裡也該有「沒做什麼」，否則只記做過的事會讓人以為全都處理完了。

| 項目 | 為什麼沒做 |
| --- | --- |
| channel 鏈頭競態（Codex 第 7 則發現） | 正解是 Durable Object，那是部署拓樸變更。已提案，等擁有者裁定 |
| `MRL_MOTHER.md` 全文入庫 | `.mrliou/meta.json` 明定 `canonical_authority: false`、`mother_mutation: forbidden`。放進來會生出第二份假 canonical |
| 事件紀錄全文入庫 | 公開倉庫。含金額、證物 SHA、第三方姓名。存的是索引＋節選，**節選可逆，刪除不可逆** |
| SEC-3 加驗證 | 會改變 iOS 客戶端的契約，需要擁有者決定 |
| `wrangler 2.jsonc` 刪除 | 依「檔案不要亂刪、留存紀錄」原則，只記錄不刪 |

---

## 六、給下一輪的三句話

1. **測試素材要重現真實結構。** 自己捏的最小案例會繼承自己的盲點。
2. **檢查的依據不能由被檢查的那一方提供。** 第 4、5、7 則都是這一條的變形。
3. **「我沒查」不等於「不存在」。** 這一條是人教的，不是工具教的。

---

## 七、可查證性

本文件的每一項都對得上具體的 commit 與 PR 討論串：

| 則 | 證據 |
| --- | --- |
| 1 | commit `6a16d52`（原 #75 分支）；`registry/CONNECTION_MAP.md` 第 10–12 項 |
| 2 | 原 #75 的 particle-memory 匯入 commit；`src/index.js` 的 `MRL_isShellSafe` 註解 |
| 3 | `tests/test_connection_audit.py::test_comma_inside_string_is_not_trailing` |
| 4 | PR #76 討論串 `4057750013`；修正於 `8164e2d` |
| 5 | PR #77 討論串 `4059254309`；修正於 `ec8a86b` |
| 6 | PR #77 討論串 `4059254314`；修正於 `ec8a86b` |
| 7 | PR #77 討論串 `4059254316`；修正於 `5883dab` |
| 未修 | PR #77 討論串 `4059254312`（channel 競態，提案） |

原七個 PR（#70–#76）已收成 #77，但**分支與討論串一條都沒刪**，上述編號隨時可回查。
