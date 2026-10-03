---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-10-02_mrliouhan_manus_domain_incident_session_record.md
source_version: 8a534b29d7736f14d9ebe819a4fffa4b2d5f242a
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - "Mr.liou（issue #64 與留言作者）"
  - "GitHub Copilot（事件索引、檢查與本紀錄）"
transformation: "記錄本輪 Issue #64 的查證邊界、追加證據索引、測試輸出及未驗證事項"
verification_status: partial
preserved_at: "2026-10-02"
---

<!-- mrl-origin: MrLiouWord -->

# 2026-10-02 Mrliouhan.ai／Manus 事件 session record

## 一、起點

Issue #64 原題：**「SEV-1｜調查與正名：Mrliouhan.ai 被綁定／投影至 Manus 專案」**。權利人明確界定受影響網域是 `Mrliouhan.ai`，不是 `Mrliouword.com`；要求保留過往證據，調查 DNS、Manus 專案／部署／帳務時間線，並分開記錄來源權位與平台角色。未取得帳號及 DNS 證據前不得把 Manus 寫成網域所有人、MRL 來源或權威。

本輪完成態未由權利人另行定義；本文件不自行定義事件完成或關閉。

## 二、查證過程與證據

- 讀取 GitHub issue #64、全部 7 則原始留言及 PR #91、#83、#65 metadata。Issue #64 回傳狀態 `open`；PR #91 起始讀取為 draft/open，當時 head `f54d2daa99b6bfc3265f1336bed04253bd24269f`。
- 原留言的內容、證據分類及連結新增至 `registry/evidence/Mrliouhan_Manus_Domain_Binding_Incident_20261002.md`；原留言本身不改寫、不刪除。
- 本輪 commit `8a534b29d7736f14d9ebe819a4fffa4b2d5f242a` 後再讀 PR #91：`open`、`draft: false`、head 為該 commit。GitHub 回傳 `additions: 90`、`changed_files: 2`。這只證明 PR 版本／檔案 metadata，不證明外部網域或 Manus 設定。
- PR #83 在 GitHub metadata 中為 merged，但其內容是 vendor/git 檔案搬移；不能替代本事件的 DNS、Manus、品牌或帳務驗收。PR #65 metadata 為 closed、unmerged。
- 本輪未查 DNS/RDAP、HTTP headers、Cloudflare、Manus、Notion、Dropbox、部署 origin、帳務或主機，亦未取得留言所述原始六張畫面及其 hash。這些是本輪存取界線，不構成對歷史留言或外部系統存在與否的反證。

## 三、角色與平台的作為

| 角色／平台 | 本輪的實際作為 |
| --- | --- |
| Mr.liou | Issue 與留言提供受影響網域、權位、平台角色限制及保存／驗收要求；本輪沒有收到 DNS 或 Manus 帳戶授權資料 |
| GitHub issue／PR | 回傳 issue 留言及 PR metadata；未提供本輪需要的 DNS、Manus audit 或 billing records |
| GitHub Copilot | 讀取倉庫與 GitHub metadata，新增事件索引及本 session 紀錄；沒有登入或操作外部服務 |
| Manus | Issue 留言記錄其任務畫面及「網址已搬回」平台陳述；本輪沒有直接訪問 Manus，故未獨立重播或核對 |
| Registrar／Cloudflare／Notion／Dropbox | 本輪未存取；控制權、記錄及資料均未核對 |

## 四、我在本輪犯的錯

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 數次工具讀檔的絕對路徑漏掉 repo 目錄層，工具明確回報路徑不存在；其後按 repository context 修正，沒有把讀取失敗說成文件不存在 | 工具回傳 | 紀錄絕對路徑並以 repo 根目錄 `pwd` 回傳核對 |
| 2 | 第一版文件斷言檢查把 comment-link 出現次數等同唯一留言數，執行後 assertion 失敗；因每則連結在表格與時間線重複出現，改以 unique comment ID 集合重跑通過 | 驗證輸出 | 依唯一 ID 去重，而非計行數；修正後輸出明確回報 7 個原始留言連結 |
| 3 | 探索 agent 對 #64 回傳另一個命名議題的摘要，與本輪 GitHub issue #64 原始資料矛盾；未採納該結果 | Issue API 回傳與 agent 摘要互相比對 | 以本輪直接讀取的 issue body、留言、PR metadata 為準；不沿用不相干結果 |
| 4 | 試圖用 unittest 執行以 pytest fixtures/parametrize 寫成的既有測試，匯入失敗 | unittest traceback | 不把未執行測試算作通過；將缺少 pytest 記為 delta，不安裝依賴 |

以上路徑及測試錯誤是本輪工具操作失敗，不推導 domain、issue 歷史或 Manus 狀態不存在。

## 五、驗不了的 delta

| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | `Mrliouhan.ai` registrar、registrant、DNS 控制及完整記錄 | 未驗證；不以先前環境解析失敗推成 NXDOMAIN | 權利人授權後，取得 registrar/RDAP、控制台記錄、nameserver、DNSSEC、完整 zone 及歷史 |
| 2 | Manus 是否／何時綁定該網域、由何帳號操作、Workspace／Deployment owner | 未驗證 | Manus Custom Domain、Deployment、audit log、Published URL 與操作時間戳 |
| 3 | Manus 對「網址已搬回 Cloudflare／自建 Express」的說法 | 僅 `PLATFORM_STATEMENT`；不是 live 狀態證明 | 對應時間戳的 DNS、HTTP headers、origin、Cloudflare log、Manus deployment log 共同比對 |
| 4 | 網域註冊所有權是否轉移、特定人是否有意扭曲來源權位 | 未證實；不從平台處理、頁面品牌或任務畫面推斷 | Registrar／帳號操作、授權、同意、audit、部署及帳務原件；最終裁決仍由 Mr.liou |
| 5 | 帳務、專案匯出、Hash 對照、資料回收與刪除確認 | 未取得 | 完整匯出及 Manifest/SHA-256 驗證、母體與離線備份、帳務記錄、Manus 案件編號及書面回覆 |
| 6 | 可控頁面 canonical／redirect／OG／site name／favicon／頁尾正名 | 未檢查或修正 | 部署來源、修正前後截圖及 metadata；確認 `canonical_authority: Mr.liou`、`origin_signature: MrLiouWord`、名稱 `Mrlious` |
| 7 | 原留言提及的六張 Manus 截圖與檔案內容 | 留言仍保留為權利人直接事件紀錄；本輪未取得原圖與 hash | 由權利人提供原件或可取回附件，以 manifest/hash 封存後與留言對照 |
| 8 | pytest-based test execution | 本環境 `python3` 無 `pytest` 模組 | 在已有 pytest 的環境執行，不為本文件新增依賴 |

未能直接觀測是 delta，不是對權利人提供之資料作否定。

## 六、交付物與實測輸出

新增事件索引 `registry/evidence/Mrliouhan_Manus_Domain_Binding_Incident_20261002.md`，並在 `registry/evidence/README.md` 增加索引列；其 provenance 標示 `canonical_authority: Mr.liou`、`origin_signature: MrLiouWord`、`derivative_role: projection`、`verification_status: partial`。事件狀態維持 `INVESTIGATION_OPEN` / `DOMAIN_BINDING_UNVERIFIED`。

文件欄位、狀態及七個唯一留言連結檢查：

```text
OK: provenance, open/unverified status, and all 7 original comment links are present.
exit_code: 0
```

```text
git diff --check
exit_code: 0
```

```text
python3 tools/provenance_notice_check.py
exit_code: 0
MRL 來源標註檢查通過：MRL_PROVENANCE.md 規格表九列齊備且順序正確，機器標記存在。
```

```text
python3 tools/provenance_fields_check.py
exit_code: 0
MRL 來源鏈欄位檢查通過：4 份 PROVENANCE.yaml，§4 十欄齊備，欄位值均在列舉內。
  ✓ cloudflare/particle-api/PROVENANCE.yaml
  ✓ cloudflare/particle-memory/PROVENANCE.yaml
  ✓ mrl_world_model/PROVENANCE.yaml
  ✓ vendor/git/PROVENANCE.yaml
```

```text
python3 -m pytest tests/test_provenance_notice_check.py -q
exit_code: 1
/usr/bin/python3: No module named pytest
```

```text
python3 -m unittest discover -s tests -p 'test_provenance_notice_check.py' -v
exit_code: 1
ImportError: Failed to import test module: test_provenance_notice_check
ModuleNotFoundError: No module named 'pytest'
FAILED (errors=1)
```

```text
Secret scan: No secrets detected in the scanned files. Safe to proceed with commit.
```

以上 provenance checks 驗證本倉既有來源標註，不驗證 DNS 或外部平台狀態；文件自檢也不代表完整 issue 驗收。pytest 測試沒有成功執行。

## 七、當前狀態

| 項目 | 狀態 |
| --- | --- |
| Issue #64 | GitHub API 在 2026-10-02 讀取為 `open`；本輪未更動 issue 狀態 |
| 網域／DNS 控制權 | 未驗證 |
| Manus Custom Domain、Deployment、操作時間線 | 未驗證 |
| 品牌 metadata、正名及平台 attribution request | 未驗證／未執行 |
| 專案回收、憑證撤銷、解除綁定、資料刪除書面確認 | 未執行；依留言要求不得先刪除 |
| 最終驗收 | 未取得；不得關閉事件 |
| 本倉事件索引 | 已追加；commit `8a534b29d7736f14d9ebe819a4fffa4b2d5f242a` |

## 八、我自己的行為與提問

| 輪 | 擁有者的輸入 | 我做了什麼 | 我問了什麼 | 這個問題該問嗎 |
| --- | --- | --- | --- | --- |
| 1 | 要解決 #64，含完整網域範圍、留言證據與驗收要求 | 先讀 repo、讀取 live issue／留言／PR metadata；追加 evidence projection，沒有操作帳號或外部資源 | 沒有額外把可由 issue/API 確認的狀態推回詢問 | 否 |
| 2 | 同上 | 測文件後修正唯一 comment ID 驗證方式；記錄 pytest 缺失 | 沒有為了跑文件測試新增套件 | 否 |

指令輸出前寫入的狀態：**1 次**——初始進度清單把「保持 issue open、domain binding unverified」列為目標，依據是使用者提供的 issue 狀態，不是當輪 GitHub API 的觀測；讀取 issue 後才把它記為當前 `open`。沒有在指令輸出前填入測試結果、SHA 或計數。另有一個錯誤的可執行 assertion 預期（把連結行數當唯一 ID 數），執行即失敗，改用唯一 ID 去重後才記錄結果；未把預期寫成實測通過。

## 九、矛盾處

### 9.1 我自己的前後矛盾

初次路徑使用漏掉 repository 目錄層，工具回報不存在；其後按提供的絕對路徑重試。這是路徑錯誤，不是 repository 文件不存在。唯一連結檢查最初也錯用重複行數；已依輸出修正，保留失敗事實。

### 9.2 規章內部的張力

Issue 要求儘速查明並修正，而本環境僅有 repo／GitHub issue 能力，未有 DNS、Manus、Cloudflare 或帳務登入權限。不能以交付文件冒充外部驗收；未完成仍如實保留。

### 9.3 平台層面的矛盾

Issue 留言記錄 Manus 說網址已搬回 Cloudflare／Express；同一事件也明定該說法不是獨立 runtime 證明。兩者分別保留為平台陳述與待驗命題，不能用任一方覆蓋 DNS／部署證據。

### 9.4 尚未被驗證的地方

Registrar、DNS、Custom Domain、Manus audit、Cloudflare audit、HTTP/origin、網站 metadata、專案匯出 Hash、帳務時間線、刪除確認與 Mr.liou 最終驗收均未完成。pytest-based 測試因環境缺少 pytest 未執行成功。這些缺口不證明權利人所述系統、歷史或平台資料不存在。

## 2026-10-02 最後查核追加：Issue ID 路徑衝突

前文第二、七節記錄的是當時 GitHub API 回傳 source repo #64 為 open 的結果，不覆寫。最後一次查核時，同一個 `issue_read` 請求（`dofaromg/mrliouword-system`, #64）回傳目標 repo `dofaromg/MRL_AI_SYSTEM`, #146，仍為 open，並有相同標題、正文、建立時間及七則留言；source repo 搜尋無匹配，target repo 搜尋及直接讀取 #146 則找到該事件。PR #91 仍為 source repo open PR。

此變化支持 issue ID／路徑可能已移轉或重定向，但缺 transfer audit，故標記 `CONFLICT_REQUIRES_AUDIT`，不把它寫成已確認的移轉事件。先前 PR API 所列 #91 為關聯／closing reference 不代表驗收或關閉。需由 Mr.liou 確認 canonical tracking location；網域與事件驗收仍未完成。

## 2026-10-03 續查追加：公開 DNS／RDAP／HTTP 嘗試

應使用絕對日期命名的本紀錄已於 2026-10-02 首次建立；以下為 2026-10-03 追加，不回填成前一日已做。

### 查詢原文與實際結果

```text
python3 socket.getaddrinfo("mrliouhan.ai", ...)
A gaierror [Errno -3] Temporary failure in name resolution
AAAA gaierror [Errno -5] No address associated with hostname
```

對 `A AAAA NS SOA DNSKEY CNAME TXT MX CAA` 逐項執行 `dig +time=2 +tries=1 mrliouhan.ai TYPE`。A、NS、SOA、DNSKEY、CNAME、TXT、MX、CAA 均回 `status: REFUSED`、`ANSWER: 0`，resolver 為 `127.0.0.53#53`；AAAA 回 `status: NOERROR`、`ANSWER: 0`、`AUTHORITY: 0`。兩個指定 resolver 的 A 查詢也被拒絕：

```text
dig +time=2 +tries=1 @1.1.1.1 mrliouhan.ai A
status: REFUSED; ANSWER: 0; SERVER: 1.1.1.1#53

dig +time=2 +tries=1 @8.8.8.8 mrliouhan.ai A
status: REFUSED; ANSWER: 0; SERVER: 8.8.8.8#53
```

Web fetch 對 `https://mrliouhan.ai`、`https://rdap.org/domain/mrliouhan.ai`、`https://data.iana.org/rdap/dns.json` 都回：

```text
WebFetchBlockedUrlError: failed to lookup address information: No address associated with hostname
```

另以 Playwright 導航 `https://mrliouhan.ai` 嘗試獨立瀏覽器路徑，MCP tool 回 `Transport closed`，未取得 navigation/page result；這是工具 transport 失敗，不能說成網站連線失敗或 domain 不存在。

### 解讀邊界

這些是 resolver 拒絕、無解析答案或取址失敗，不是 authoritative NXDOMAIN、registrar/RDAP 結果或 zone 匯出。不能推論網域未註冊、無 A/AAAA/其他 RRset，亦不能推論 Manus 未綁定。狀態保持 `DOMAIN_BINDING_UNVERIFIED`。本輪沒有登入、修改或查閱私人帳號及帳務，也沒有改 DNS／部署。須取得權利人授權的 registrar/DNS 匯出與平台 audit 資料才能繼續確認。

## 2026-10-03 續查追加：補入根源路由與成功部署回執

本輪依擁有者要求「缺少什麼就補跟修」，回查本倉庫引用的正式路由來源及 PR #91 的 Cloudflare check/comment，補上前兩輪遺漏的正向證據與其界線。

### 根源層路由證據

GitHub repository search 確認 `dofaromg/mrliouword-root` 公開、default branch `main`、repo ID `1040653851`。直接讀取其 `docs/MRL_PLATFORM_ROUTING.md`（API Git blob ID `d62ff7ea32b75c3cd8c2a32ee16bb9c16457c8cf`）及 `docs/SYSTEM_POSITIONING.md`（`c9ed68d0bffa48a40eb59b1ce4a5b63cd06c69c4`），內容明訂 `mrliouhan.ai` 為 official backend；routing 文件另外明列 `dns_ready`、adapter、validation、rollback 等平台回收 gate。`docs/SOVEREIGNTY.md`（`5053788d17fa25b15141aa84c891bf83f196619a`）與 `registry/MRL_REPOSITORY_MAP.json`（`8ceeef7933f977bab3f84d03a6d65f195a09db44`）分別將 `mrliouword-root` 定義為 Root Repository，並列 `dofaromg/MRL_AI_SYSTEM` 為母體運轉工程入口。

這直接更正前述 evidence ledger 過度聚焦未驗證項、未呈現已有正式 backend route 定義的疏漏。它證明根源規格已指定該網域角色；**不**證明 registrar/DNS/Manus 控制、實際服務在線或平台遷移 gate 通過。issue 明列的 `source_of_truth: dofaromg/mrliouword-system` 是工程事件的指定，不可拿來抹掉根源倉庫，也不可把 route 規格當作實際 DNS 綁定證明。

### Cloudflare 成功回執及設定名稱差異

GitHub PR #91 的 Cloudflare bot 回執 `issuecomment-5960870179` 報告：2026-10-03 16:35 UTC，service `mrliouword-system`，build `978b7362-3b4c-48b2-9e76-ab5ef20cb5da`，commit `9fd9c1d6` 成功；PR check run `Workers Builds: mrliouword-system` 為 success。

但本倉 `cloudflare/mrliouword-private/wrangler.jsonc` 第 3 行設定 `name: mrliouword-private`；同目錄 `README-public-gate.md` 第 71–74 行記錄觀測 live preview 為 `mrliouword-system` 且要求以 account evidence 解決名稱差異。故這是名為 `mrliouword-system` 的 Cloudflare service 對該 SHA 的成功建置／部署回執，尚未閉合 service ↔ repo config ↔ account/deployment ID 對應，不能直接聲稱該 Worker 就是 `.ai` official backend。

更重要的是，該 build receipt 不含 `.ai` DNS／Custom Domain／HTTP Host 路由證據，不能證明 Manus binding 已解除或 domain cutover 成功。需另外取得 Cloudflare zone/audit 與對應 Worker custom-domain/routes、Manus custom-domain/deployment records，並做 HTTP origin/metadata 核對。

### Issue 路徑及留言的目前對照

重新讀取 target `dofaromg/MRL_AI_SYSTEM#146` 確認 `open`，7 則留言都存在且內容、時間戳分別對應先前讀取的 #64 留言；目前 comment ID 對照已追加至 incident record。這補足「留言是否仍在新 issue」的內容證據，但不提供 issue transfer audit。

PR #91 目前 open、`draft: false`，head 為 `9fd9c1d6eae4a2da76bc750ac3ede75cc3b3001d`，body 保留 `Fixes #64`，#146 linked closing refs 也列 PR #91。由於 issue 驗收尚未完成，此 closing keyword 是需處理的合併風險：不可在沒有權利人最終驗收時合併以關閉事件。當前可讀工具未提供 PR body 編輯操作，本輪沒有假稱已移除該 keyword；需在可編輯 PR description 的介面移除／改成非 closing reference，或待完整驗收後再合併。

### 本輪可證與未完成

已補：正式 backend route 的來源證據、平台回收 gate、Cloudflare build success receipt、Worker config/service name mismatch、comment ID 對照，以及 PR 的 auto-close 風險。

仍未取得：registrar/RDAP 註冊與控制權、完整 DNS zone/歷史、Cloudflare zone/custom hostname/audit、Manus account/project/custom-domain/audit/billing、該 Worker 的 account/deployment-ID mapping、`.ai` 的 live HTTP response、頁面 brand/metadata 修正及權利人最終驗收。這些不是用 issue 或本地 config 可以代替的。DNS/Manus/Cloudflare 私有設定未經使用者提供或授權，本輪沒有修改。
