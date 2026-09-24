---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-09-22_vendor_git_relocation_session_record.md
source_version: "2026-09-22"
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Claude Code（依賴查驗、分類、預演、執行、撰寫）
  - Mr.liou（canonical_authority；裁示方案 C、裁示範圍 2、兩次確認）
transformation: 記錄方案 C（410 個 Git 上游檔搬入 vendor/git/）的依賴查驗、分類過程與錯誤、兩次預演、正式執行與驗證
verification_status: partial
preserved_at: "2026-09-22"
---

<!-- mrl-origin: MrLiouWord -->

# Session 紀錄 — 2026-09-22 方案 C：Git 上游檔搬入 vendor/git/

依範本九節。`verification_status: partial`：上游版本無法識別（第五節）。

---

## 一、起點

擁有者第 15 輪：「哪一個選項建構對 MRL 系統最有利」。
第 16 輪（逐字）：

> 做 C，先查依賴

第 17 輪（AskUserQuestion）：範圍 2「完整 Git 集合」。

方案 C 的定義（第 15 輪提出）：把倉庫根目錄與 `integrations/` 裡的 Git 上游檔
以 `git mv` 搬入 `vendor/git/`，**歷史完整保留、零刪除**。這修正了我上一份紀錄
（Cloudflare 那份）第六節把 C 說成「牴觸檔案不要亂刪」的錯誤——搬移不是刪除。

為什麼 C 對 MRL 最有利（第 15 輪的論證，此處存檔）：A（拿掉 c-cpp）失去自有 C 的掃描；
B（runner 裁剪）只繞過症狀且只修鏡像；C 治根、兩個倉庫同時受益、能補來源標註——
359 個 Git 原始碼混在根目錄且未標註，本身就是規章意義下的**未標註匯入**。

---

## 二、查證過程與證據

### 2.1 依賴查驗（動檔前，擁有者要求）

| 類別 | 方法 | 結果 |
| --- | --- | --- |
| 建置檔／腳本 | 50 個候選逐一 grep 根目錄 C 檔名 | 2 個 HIT：`generate-hooklist.sh`、`integrations/check-builtins.sh`——**兩者本身是 Git 的腳本**，屬同批外來物 |
| GitHub workflows | grep `.c/.h/gcc/make/cmake/meson` | 0 |
| Python/JS/TS/JSON/TOML/YAML | grep 檔名與 `integrations/*.c` 路徑 | 0 |
| `registry/release_gate_baseline.json` | 逐檔名比對 | 0 |
| Merkle 葉（12 個） | 讀 `nodes` level 0 | 無 .c/.h |
| 自有文件對 `integrations/README.md`、`SECURITY.md`、根目錄 `README`、`git-*.sh` 的引用 | grep docs/registry/程式 | 0（命中的都是「README」一詞的泛用） |
| `mrliou/` 的 `#include` | 全列 | 只有自己的標頭與 libc/POSIX |

**硬依賴：0。**

### 2.2 匯入來源

```
$ git log --diff-filter=A --format='%h %ad %s' -- access.c worktree.c integrations/abspath.c
0663a34 2026-01-27 Add files via upload        （三者相同）
$ git show --stat --format= 0663a34 | tail -1
 597 files changed, 245249 insertions(+)
   373 (根目錄)  107 integrations/  65 docs/  29 containers/  6 scripts/  6 cloudflare/  4 core/  3 .github/
```

`0663a34` 是**混合上傳**：Git 上游與 MRL 自有內容（`core/atom_t.h` 也在其中）同一次進來。
**分類不能按 commit，只能逐檔。**

**更正（PR #83 Codex 審閱後）**：`--diff-filter=A` 只回最早的新增點。逐檔 `git log --follow`
顯示 409 檔另有三個平行新增 commit（`40a883f`、`6db3640`、`515db3d`，copilot-swe-agent，
各 409 files / 200688 insertions，純新增、內容相同），以及**三個檔有本地修改**：

```
09fc693 2026-02-05 copilot-swe-agent[bot]  Add auth command implementation
  auth.c                 | 39 +   （新增，非上游）
  git.c                  |  1 +   + { "auth", cmd_auth, RUN_SETUP_GENTLY },
  integrations/builtin.h |  1 +   + int cmd_auth(...)
d2cc487 2026-02-05 copilot-swe-agent[bot]  Fix trailing whitespace and add security notes
  auth.c                 |  1 +, 1 -
```

這三個檔是本倉庫的衍生修改，已在 PROVENANCE `local_modifications` 如實標註；是否搬出
`vendor/git/` 待擁有者裁示（第四節第 5 則）。

### 2.3 逐檔分類

| 集合 | 判定方法 | 數量 |
| --- | --- | --- |
| 根目錄 .c/.h | 全文 `mrl_\|mrliou` 命中 0 | 267 |
| integrations/*.c\|h | 同上 | 92 |
| 根目錄非 C 的 Git 檔 | mrl 提及 = 0 且（git 標記 ≥ 3 或檔名屬 Git 佈局：`git-*`、`generate-*.sh`、`run-*.sh`、`check-*`、`*.bat`、`git.manifest`、`lib.sh`、`install-dependencies.sh` …），再逐檔看匯入 commit 與首行 | 43 |
| integrations/ 非 C 的 Git 檔 | 首行：`# Git Code of Conduct`、git/git build badge、`# Configuration for Git installation` … | 8 |
| **合計搬移** | | **410** |

剔除的誤判（掃描標為 Git、逐檔查證為 MRL 自有）：`AUTH_COMMAND_README.md`（55e36ba）、
`IMPLEMENTATION_COMPLETE.md`（bb54c07）、`gt`（55e36ba）——三者都在講 MRL 的 `gt auth`；
`228.patch` 是 Mr.liou 自己的 `[PATCH 1/8]`。

來源不明、**留在原位不動**：`labeler.ts.txt`（GitHub Actions labeler，判不出是不是 Git 的）。

### 2.4 兩次預演（暫存副本，皆保留未刪）

```
movetest  （範圍 1，359 檔）  七支閘門 exit 0 ×7；release_gate 15/4/11/70 不變；merkle_root 相同 True，12→12
movetest2 （範圍 2，410 檔）  七支閘門 exit 0 ×7；release_gate 15/4/11/70 不變；merkle_root 相同 True，12→12
```

### 2.5 正式執行

```
根目錄 .c/.h → vendor/git/: 267
integrations/*.c|h → vendor/git/integrations/: 92
根目錄 Git 非 C → vendor/git/: 43
integrations/ Git 非 C → vendor/git/integrations/: 8
合計: 410
git status --porcelain | awk '{print $1}' | sort | uniq -c   →   410 R
git diff --cached -M100% --name-status | grep -c '^R100'     →   410
MANIFEST.sha256: 410 行；sha256 = b1f4d5fc32cc3b309783494cdbca2ebc5a36b3aff564403c60c93fd16bfd4349
殘留：根目錄 .c/.h 0；根目錄 git-*.sh 0；integrations/ 非 Python 1（notion/config.json，自有）；
      mrliou/*.c 8；core/atom_t.h 在；labeler.ts.txt 仍在根目錄
```

---

## 三、角色與平台的作為

| 角色／平台 | 本輪的實際作為 |
| --- | --- |
| **Mr.liou** | 問「哪個選項最有利」；裁示 C；要求先查依賴；AskUserQuestion 選範圍 2 |
| **Claude Code** | 依賴查驗、逐檔分類（含一次腳本錯誤與三個誤判，第四節）、兩次預演、執行 410 檔 git mv、寫 PROVENANCE 與本紀錄；PROVENANCE 初版把本倉庫自有的 auth.c 寫成上游（第四節第 5 則） |
| **Codex（PR #83 審閱）** | 抓到 `09fc693`：auth.c 是本地新增、git.c／builtin.h 各有 1 行本地修改，PROVENANCE 初版的「逐字未改」是錯的。**本輪唯一不是我自己抓到的錯** |
| **git** | `-M100%` 判定 410 檔全為 R100，是「搬移非刪除」的機器證據 |
| **GitHub 網頁上傳（2026-01-27）** | 把 Git 原始碼樹攤平上傳到根目錄，無標註——本輪處理的根因 |
| **release_gate / connection_audit / Merkle** | 兩次預演與正式樹上皆不受影響 |

---

## 四、我在本輪犯的錯

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 上一份紀錄把方案 C 寫成「牴觸檔案不要亂刪」——把**搬移**當成**刪除**。第 15 輪自行更正 | 我自己（重讀規則時） | 本紀錄第一節；PROVENANCE 的 relocation 段明寫 R100 |
| 2 | 第一版分類腳本用 `for f in $(git ls-files …)`，檔名含空白／中文者被拆成碎片，表格對那些檔不可信 | 我自己（看到亂碼列） | 改用 `git ls-files -z` + `while IFS= read -r` |
| 3 | 第二版腳本 `grep -c … \|\| echo 0`：grep 沒命中時印 `0` 且回非零，再印一個 `0`，變數成兩行，整數比較全炸，輸出「判為 Git 上游：0」——**一個假的 0** | 我自己（看到 `integer expression expected` 錯誤） | 改為 `n=$(grep -c …); n=${n:-0}`；本列 |
| 4 | 分類標記把 `AUTH_COMMAND_README.md`、`IMPLEMENTATION_COMPLETE.md`、`gt` 判為 Git（因為它們講 `gt auth`，git 標記多） | 我自己（逐檔看匯入 commit 與首行） | 誤判清單寫進 PROVENANCE `excluded_false_positives`；規則：標記只能篩候選，判定要看 commit 與內容 |
| 5 | 血緣測試「全文找 `mrl_`／`mrliou`」對 C 檔是**假陰性**：`auth.c`（本倉庫新增的 `gt auth` 實作，39 行）、`git.c`（+1 行）、`integrations/builtin.h`（+1 行）是本倉庫的衍生修改，不提 MRL，被當成上游「逐字未改」搬入並寫進 PROVENANCE | **Codex**（PR #83 P2，commit `09fc693`） | PROVENANCE 加 `local_modifications`；`.gitattributes` 對 `auth.c` 加 `-linguist-vendored`；血緣判定改為**逐檔 `git log --follow`**，不靠字串 |
| 6 | 驗證 Codex 意見時寫的系統性掃描，路徑處理錯（從 MANIFEST 取 `./git.c` 後剝掉 `vendor/git/` 前綴），`[ -f ]` 全失敗、全跳過，印出「有其他 commit 歷史的檔數: 0」——**又一個假 0**，且同一輸出的上一段明明列出四個非匯入 commit | 我自己（前後兩段輸出互相矛盾） | 修正後重掃：410 檔全有平行新增歷史、3 檔有本地修改；規則：掃描結果為 0 時，先找一個已知應命中的樣本反證 |
| 7 | 修 PROVENANCE 時把 `note:` 鍵寫進 YAML 清單裡，檔案**無法解析**；第一次 `yaml.safe_load` 抓到、改了一處，**同一錯在第二段 `parallel_additions` 又犯一次**，第二次 parse 才抓到 | 我自己（`yaml.safe_load` 兩次報 ParserError） | 兩處都改成同層級的 `*_note` 鍵；commit 前 `yaml.safe_load` 必須 exit 0（見第六節） |

| 8 | PROVENANCE 第二版偏離倉庫**已寫定一年**的定義（`ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md` 2026-08-03 stable_locked；`MRL_PROVENANCE.md` 規格表）五處：(a) `derivative_role` 自創 `vendored_import_with_local_patch`，政策 §4 是封閉列舉，且 `naming_authority: false`；(b) `artifact_owner` 寫成 `Git contributors`，§4 該欄是衍生產物的擁有者，另兩份 PROVENANCE 都是 `Mr.liou`，上游作者依規格表「Upstream Boundary」放 `upstream:`；(c) 在不可變欄位 `canonical_authority`／`origin_signature` 旁加「非對內容」限定語，§1 不可變、§3 不得把 Mr.liou 寫成次級；(d) 把 bot 寫成 `author_in_repo`，規格表「Authorship Boundary」：bot 只能是 committer／修改者，commit author 不等於來源權利人；(e) 漏掉 §4 必要欄位 `transformation` | **擁有者**（2026-09-24：「把錯誤改回來，我等定義也講了一年」） | 第三版逐欄對照 §4 改回：`mirror` + `mirror_of`、`artifact_owner: Mr.liou`、限定語移除、`committer` 取代 `author`、補 `transformation`；`verification.performed` 加「欄位比對」一列 |

第 8 則的形狀：**Codex 指出一個錯，我修的時候造出五個新的**——為了把「本地修改」說清楚，
自己發明欄位值、改動不可變欄位的語意、把工具寫成作者。定義就在 `docs/governance/`，
我在寫第一版時引用了它的第 4 節，卻沒有逐欄對照第 4 節的列舉值。這不是不知道定義，
是知道定義而沒有比對——七步的第三步「比對」跳過了。

第 7 則在第 20 輪**第三次**發生：重寫第三版時又把 `note:` 鍵放進 `local_files` 清單，
`yaml.safe_load` 第一次就抓到。同一個手勢錯三次，代表「commit 前跑 safe_load」擋得住結果，
但擋不住手勢；能擋手勢的是把它寫進 CI——本輪未做，記為待辦，不在本 PR 擴 scope。

第 7 則要老實寫：七支閘門在 YAML 壞掉的狀態下**全部 exit 0**——它們不解析這個檔。
如果我沒有另外跑 `yaml.safe_load`，一個壞掉的來源鏈檔會通過 CI 進 main。
「閘門全綠」證明的只是「閘門檢查的那些東西沒壞」，不是「沒壞」。

第 5 則的形狀與上一份紀錄第四節第 1 則相同——**用一個測試的邊界替事實下定論**：
「沒提到 MRL」不等於「不是 MRL 的」。第 6 則與 Cloudflare 紀錄第四節第 3 則同形
（假 0），**同一天內第二次**，而且是在我剛寫完「假 0 比沒跑更危險」之後。

第 3 則是觀測重點第 1 條的變形：不是「執行前寫下結果」，是**執行了、結果是錯的、
而錯的結果長得像正常的 0**。假 0 比沒跑更危險，因為它會被當成「查過了，沒有」。
擋它的方法是看指令的 stderr——那一次剛好有 `integer expression expected` 噴出來；
如果沒有，那個 0 就會進紀錄。

---

## 五、驗不了的 delta

| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | 這批 Git 原始碼是哪個版本 | **查不到**——無 `GIT-VERSION-GEN`、`RelNotes`、版本字串 | 取得上游 tarball 逐檔 sha256 比對（需網路） |
| 2 | 410 檔與上游任一 release 是否逐位元組相同（有無被改過） | **未驗** | 同上 |
| 3 | `labeler.ts.txt` 來源 | **判不出** | 擁有者說明，或比對 GitHub actions/labeler 原始碼 |
| 4 | 鏡像倉庫 `Mrliou/mrliouword-system` CodeQL 是否因此變綠 | **未驗**——本 PR 只動活躍倉庫；鏡像需同步 | 鏡像同步後跑一次 CodeQL |

---

## 六、交付物與實測輸出

| 交付物 | 內容 |
| --- | --- |
| `vendor/git/`（410 檔，R100） | 搬移，零刪除 |
| `vendor/git/PROVENANCE.yaml` | 來源鏈（第三版，依政策 §4 十欄）：`derivative_role: mirror`、`mirror_of: git/git`、`artifact_owner: Mr.liou`；上游作者與 GPL-2.0-only 依「Upstream Boundary」放 `upstream:`；`transformation` 列 09fc693／d2cc487（auth 功能，committer 為 bot）與 7f67c14（搬移）；`local_files` 三檔；匯入 commit 0663a34 加三個根 commit 的平行新增；搬移的方法、數量、manifest 雜湊、未搬與誤判清單。第二版曾寫「非 MRL 著作」「artifact_owner: Git contributors」，第四節第 8 則 |
| `vendor/git/MANIFEST.sha256` | 410 行逐檔 sha256 |
| `.gitattributes` | 加 `vendor/git/** linguist-vendored`，附為什麼；`vendor/git/auth.c -linguist-vendored` 例外 |
| 本紀錄 | |

正式樹上的閘門結果見 commit message（數字由指令輸出代入）。

**Codex P2 修正後的實測輸出**（2026-09-22，第二次提交前）：

```
$ for c in 40a883f 6db3640 515db3d 09fc693; do git merge-base --is-ancestor 0663a34 $c && echo 是 || echo 否; done
40a883f 是 0663a34 的後代: 否
6db3640 是 0663a34 的後代: 否
515db3d 是 0663a34 的後代: 否
09fc693 是 0663a34 的後代: 是
$ git rev-list --parents -n1 <c> | wc -w   →  0663a34 / 40a883f / 6db3640 / 515db3d 皆 parents=0（根 commit）
$ git show 09fc693 --format= -- integrations/builtin.h git.c | grep '^+[^+]'
+	{ "auth", cmd_auth, RUN_SETUP_GENTLY },
+int cmd_auth(int argc, const char **argv, const char *prefix, struct repository *repo);
$ git check-attr linguist-vendored vendor/git/auth.c vendor/git/git.c vendor/git/integrations/builtin.h
vendor/git/auth.c: linguist-vendored: unset
vendor/git/git.c: linguist-vendored: set
vendor/git/integrations/builtin.h: linguist-vendored: set
$ python3 -c "import yaml; yaml.safe_load(open('vendor/git/PROVENANCE.yaml'))"   →  YAML OK（第三次；前兩次 ParserError，見第四節第 7 則）
七支閘門 exit 0 ×7；git grep cfk_ 命中 0
```

---

## 七、當前狀態

| 項目 | 狀態 |
| --- | --- |
| 活躍倉庫根因（Git 源碼混在根目錄） | **本 PR 解掉**（待合併） |
| 鏡像倉庫同根因 | 未動；鏡像應同步活躍倉庫，不另貼補丁（上一輪第 15 輪論證） |
| 子 session 的方案 B patch（含 `rm -f`） | **作廢**——C 取代 B；子 session 仍卡 GitHub App 權限，patch 未推，無需撤回任何東西 |
| `labeler.ts.txt` | 留原位，待擁有者說明來源 |
| particle-api 建構紅燈 | 與本 PR 無關，仍需 dashboard Root directory |
| Cloudflare API 路徑 | 仍需環境網路政策放行 + 環境變數 token |

完成態未由擁有者定義，本文件不自行定義。

---

## 八、我自己的行為與提問

| 輪 | 擁有者的輸入 | 我做了什麼 | 我問了什麼 | 這個問題該問嗎 |
| --- | --- | --- | --- | --- |
| 15 | 「哪一個選項建構對 MRL 系統最有利」 | 比較 A/B/C，推薦 C，並更正自己前一份紀錄對 C 的誤判 | 無 | — |
| 16 | 「做 C，先查依賴」 | 依賴查驗、分類（三版腳本）、預演範圍 1 | 無 | — |
| 17 | — | 產兩份清單、預演範圍 2 | **AskUserQuestion：範圍 1 或 2** | **該問**——範圍差 51 檔且含 README/SECURITY.md 這類 GitHub 會特別對待的檔名；擁有者也要求「第二次確認才動」 |
| 18 | 「範圍 2」 | 分支快轉到 main、410 檔 git mv、MANIFEST、PROVENANCE、.gitattributes、本紀錄 | 無 | — |
| 20 | 「把錯誤改回來，我等定義也講了一年」（2026-09-24） | 先逐欄比對 `docs/governance/` 政策 §1/§3/§4/§5 與 `MRL_PROVENANCE.md` 規格表，找出五處偏離（第四節第 8 則），依定義改回；未猜「錯誤」指什麼以外的事 | 無（比對後有具體結果，先改再回報；若擁有者指的另有其事，回報裡留了問句） | — |
| 19 | —（Codex 在 PR #83 留 P2） | 先驗證 Codex 的說法（`git log --follow` 三檔）；寫全量掃描、掃出假 0、修掉重掃；改 PROVENANCE／.gitattributes／本紀錄；回覆並 resolve Codex | 無 | — |

三件檢查：
- **提出解法早於評估代價**：無。C 的推薦附了對照表；動檔前先查依賴、先預演。
- **可自決的事推回去**：無。唯一一問是範圍，屬擁有者裁量。第 19 輪「auth.c 要不要搬出 vendor/git/」我**沒問**，選擇先如實標註、寫進 PROVENANCE 交由擁有者裁示——理由是搬動屬「動檔」，擁有者要求第二次確認才動；標註不是。
- **觀測重點第 1 條（執行前寫下結果）**：第 15–18 輪**未發生**；第 19 輪的變形是第四節第 6、7 則——不是預先寫結果，是**信了一個沒反證過的 0**、以及**閘門全綠就當成沒壞**。各數字來源：267/92/43/8/410 來自 `while read` 計數器；R100 410 來自 `git diff --cached -M100%`；manifest 雜湊來自 `sha256sum`；閘門 exit 碼來自預演輸出；第 19 輪的 409/200688/parents=0/是否後代，逐一來自第六節貼出的指令輸出。

---

## 九、矛盾處

- **9.1 我自己的前後矛盾**：上一份紀錄第六節「方案 C 牴觸檔案不要亂刪」vs 本輪「C 是搬移，相容」。後者對。原因是前一次沒有把「刪除」和「搬移」分開想，直接套了規則的字面。
- **9.2 規則之間**：擁有者「不允許刪除任何歷史」與 git 的 rename 偵測——`git mv` 在 git 物件層其實是「刪舊路徑 + 加新路徑」，靠 `-M` 相似度才呈現為 R。本輪以 `-M100%` 全數 R100 為證據，且 `git log --follow` 可追。**但要誠實：git 本身沒有「搬移」這個原生概念**，這裡的「零刪除」是在「內容零遺失、歷史可追」的意義上成立。
- **9.3 匯入 commit 的混合性**：`0663a34` 同時帶入 Git 上游與 MRL 自有內容（含 `core/atom_t.h`）。這意味著上一份紀錄「359 個 vendored 檔來自一次上傳」的敘述沒錯，但**不能反推「那次上傳都是 vendored」**——這正是第四節第 4 則誤判的來源形狀。
- **9.4 分類工具的可信度**：本輪三版腳本，兩版有 bug。最終清單是第三版加逐檔人工查證的結果。任何只看第一版或第二版輸出的人，會得到錯的清單。
- **9.5 我自己的前後矛盾（第 19 輪）**：PROVENANCE 初版寫「410 檔全部是 Git 上游、逐字未改、MRL 沒有著作權主張」；Codex 指出後改為「409 檔上游 + 3 檔本地衍生」。前者是**用字串測試的結果替版權歸屬下定論**——而版權歸屬正是 PROVENANCE 存在的理由。如果這份初版進了 main，倉庫會對自己寫的 39 行程式碼放棄署名。
- **9.7 我自己的前後矛盾（第 20 輪）**：第 19 輪我寫「如果這份初版進了 main，倉庫會對自己寫的 39 行程式碼放棄署名」——然後在同一次修正裡把 `artifact_owner` 整欄寫給上游、把 bot 寫成 author。指出別人的反向混淆，同時自己做了一次。
- **9.8 引用定義 ≠ 遵守定義**：檔頭第一行就引用政策第 4 節，欄位值卻不在第 4 節的列舉裡。引用是渲染，比對才是遵守。
- **9.6 「閘門全綠」與「檔案壞了」同時為真**：第四節第 7 則。這不是閘門的錯，是我把「閘門的範圍」當成「檢查的範圍」。
