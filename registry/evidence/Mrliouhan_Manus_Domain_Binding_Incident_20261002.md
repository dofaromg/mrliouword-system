---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: GitHub issue dofaromg/mrliouword-system#64 and its comments
source_version: f54d2daa99b6bfc3265f1336bed04253bd24269f
derivative_role: projection
artifact_owner: Mr.liou
contributors:
  - "Mr.liou（issue 與留言中的事件紀錄及指示）"
  - "GitHub Copilot（依本倉庫可讀取的 issue/PR 資料整理；未存取外部帳號）"
transformation: "追加建立事件證據索引；保留留言中的主張與更正，區分平台陳述、直接回報與獨立查證"
verification_status: partial
preserved_at: "2026-10-02"
---

<!-- mrl-origin: MrLiouWord -->

# Mrliouhan.ai／Manus 網域綁定事件紀錄

## 範圍與狀態

- 事件：[#64](https://github.com/dofaromg/mrliouword-system/issues/64)
- 狀態：`INVESTIGATION_OPEN` / `DOMAIN_BINDING_UNVERIFIED`
- 嚴重度：`SEV-1`（Issue 所定義；本紀錄不降級）
- 受影響網域：`Mrliouhan.ai`
- 明確排除：本事件不是 `Mrliouword.com` 網域查核或更動授權。
- 對外署名要求：`Mrlious`

本文件只追加索引，不覆寫 issue、留言、截圖或其他歷史。它不表示網域已綁定 Manus、已解除綁定、已轉移，亦不表示任何驗收項目已完成。沒有帳號或 DNS 權限的觀測缺口不等於系統或歷史不存在。

## 權位與角色分離

| 欄位 | 本事件可記錄的值 | 證據狀態 |
| --- | --- | --- |
| `canonical_authority` | `Mr.liou` | Issue 明定的不可變權位；本紀錄依此保留 |
| `github_identity` | `dofaromg` | Issue 明定 |
| `origin_signature` | `MrLiouWord` | Issue 明定 |
| `source_of_truth` | `dofaromg/mrliouword-system` | Issue 明定 |
| `root_repository`／`root_definition_layer` | `dofaromg/mrliouword-root@main` | 2026-10-03 讀取 Root Repository 的 `docs/SOVEREIGNTY.md`、`docs/SYSTEM_POSITIONING.md` 及 `registry/MRL_REPOSITORY_MAP.json`；屬外部根源倉庫文件，不與 issue 所列的工程來源倉庫合併 |
| `artifact_owner` | 依政策及本紀錄 provenance 記為 `Mr.liou`；Manus 匯出物逐件權屬仍須對照來源與帳號資料 | 匯出及來源鏈未查驗 |
| `implementation_tool` | 未知；不得把 Manus 的執行、讀取或規劃能力推定為原始實作來源 | 未取得專案匯出與工具鏈 |
| `execution_platform` | Manus 是 issue 指定的候選平台角色 | 留言記錄平台任務畫面；本輪未登入 Manus 驗查 |
| `hosting_or_projection` | Manus 是候選，不是已證實的網域主機 | DNS、deployment、origin 未取得 |
| `domain_owner` | 未知 | 未取得 registrar/RDAP 與帳戶控制證據 |
| `billing_party` | 未知；Manus 只可列 billing provider candidate | 未取得帳單或付款方記錄 |

Manus 不得被記為系統來源、canonical authority 或網域所有人，除非新的一級證據支持且 Mr.liou 裁定；本紀錄目前沒有此類證據。

## 證據分類與目前查核

| 命題 | 留存來源／可確認內容 | 本輪狀態 |
| --- | --- | --- |
| 自訂網域能力與 DNS 作法 | [留言 5163085898](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163085898) 是權利人對 Manus 公開文件及先前公開查核的摘要 | 歷史摘要已讀；未在本輪獨立重查 Manus 政策、DNS 或公開頁面 |
| 使用者提供的 Manus 畫面及檔案處理 | [留言 5163374133](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163374133) 記述 6 張 1.6 Lite 畫面、12 份上傳檔、讀取 5 份文件及 MRL 任務 | 保留為權利人提交的事件證據紀錄；本工作環境未取得原始圖片、檔案雜湊或 Manus 帳號，因此不把圖片內容重新宣稱為本輪獨立驗證 |
| `https://mrliouhan.ai/` 已搬回 Cloudflare／自建 Express 的說法 | 同一留言記錄 Manus 回覆「目前的網址已經搬回到」該網址；[公正性更正 5163384409](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163384409) 指定此類回覆只能列為 `PLATFORM_STATEMENT` | 平台陳述，不是 DNS 或 runtime 證明 |
| MRL 特定任務、檔案與資料使用／消失爭議 | 留言 5163374133 列出任務名稱、`mrl-globe-v3.1.js` 及相關任務標題 | 保留為權利人對畫面內容的紀錄；原始畫面與平台 audit log 尚待封存／核對 |
| Manus 所有權、意圖或網域註冊移轉 | [留言 5163342008](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163342008) 明確記錄這些事項尚不能證明 | 未證實；不得從平台處理或品牌顯示推定法律權屬或主觀意圖 |
| 根源層指定的 backend route | `dofaromg/mrliouword-root@main/docs/MRL_PLATFORM_ROUTING.md` 定義 `https://mrliouhan.ai` 為 official backend，`docs/SYSTEM_POSITIONING.md` 指定其 API／服務角色 | 正式路由定義已讀；不是 registrar、DNS、Manus Custom Domain 或 live HTTP 證據 |
| Issue 當前狀態與活動 PR | 2026-10-02 讀取 GitHub issue #64 為 open；PR #91 為 draft/open，head `f54d2daa99b6bfc3265f1336bed04253bd24269f`。PR #83 雖在 issue 的 linked-PR 資料中列為已合併，其內容是 vendor/git 檔案搬移，不能替代網域驗收 | GitHub issue/PR metadata 已查；不能代替 DNS、Manus 或帳務證據 |

2026-08-03 的公開 DNS／解析受阻報告只描述當時執行環境的觀測結果；它不能證明網域未註冊、NXDOMAIN 或目前解析狀態。本輪未執行 DNS/RDAP、HTTP、Cloudflare、Manus、Notion、Dropbox、帳務或主機查驗。

## 保留的事件時間線

以下連結為 Issue #64 的原始留言；本文件概括其內容供索引，留言原文仍是歷史原件：

1. [2026-08-03 初步網域查核（5163085898）](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163085898)：列出 Manus 自訂網域機制、當時的公開查核限制與仍需的權威證據。
2. [獨立 SEV-1 分支及 PR #65（5163124761）](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163124761)：記錄治理分支與不得關閉條件。GitHub PR metadata 顯示 #65 後續 closed、unmerged；留言不等於合併或驗收。
3. [資料回收與外部消除要求（5163271682）](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163271682)：要求先匯出、Manifest/SHA-256 驗證、回存與離線備份，再撤銷憑證、解除網域／分享，最後提出刪除要求並取得書面確認。未驗證回收前不得先刪，未取得確認前為 `PENDING_VERIFICATION`。
4. [初步所有權與網域查核（5163342008）](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163342008)：分開公開政策、外觀混淆與實際所有權；列出未能證明的事項。
5. [使用者提供的 Manus 畫面摘要（5163374133）](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163374133)：保留平台讀取／任務畫面及網域回覆的報告，並要求與 DNS、deployment、帳務時間線核對。
6. [證據公正性追加更正（5163384409）](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5163384409)：要求平台回覆僅作平台陳述、舊歷史不覆寫，並以 RDAP、完整 DNS、Cloudflare/Manus audit、HTTP headers、origin 與時間戳共同驗證。
7. [權利人對忽視證據的提醒（5273068884）](https://github.com/dofaromg/mrliouword-system/issues/64#issuecomment-5273068884)：「一直在找理由無視證據跟歷史紀錄，你們太誇張了」。本紀錄依此把歷史留言與未驗證差異一併保留，不以存取受限否定其存在。

## 尚待取得的一級證據與驗收

下列項目均未由本輪完成；須封存來源、時間戳、原始匯出及 SHA-256，並把正反資料放在同一時間線：

1. Registrar/RDAP、registrant（依法可取得部分）、registrar 帳號控制、nameserver、DNSSEC 與完整 A/AAAA/CNAME/TXT/MX/CAA zone 匯出及歷史。
2. Manus Custom Domain、Deployment/Hosting、Published URL、Workspace/Deployment Owner、驗證方式、加入／發布／移除時間與操作 audit log。
3. Cloudflare DNS 與 audit log、redirect/proxy/origin 設定；可重現的 HTTP headers、canonical、Open Graph、site name、favicon、頁尾及實際畫面。
4. Manus 專案匯出原始碼、build artifact、部署記錄、帳務／Website usage 記錄，以及專案、匯出檔與既有 GitHub／Notion／Dropbox 資產的時間戳與雜湊比對。
5. 對每個受影響產物分欄確認 `canonical_authority`、`artifact_owner`、`implementation_tool`、`execution_platform`、`domain_owner`、`billing_party`；不以平台、repo owner 或付款介面代推其他欄位。
6. 若權利人選擇取消／轉移或刪除：先完成並驗證完整匯出、Manifest/SHA-256、母體及離線備份，再按指示撤銷 token/OAuth/webhook、解除 Custom Domain、停止 Published URL／分享，最後保存 Manus 案件編號、書面刪除確認及備份保留期限。未回收驗證前不得刪除。
7. 可控頁面完成後逐項比對修正前後截圖與 metadata：`canonical_authority: Mr.liou`、`origin_signature: MrLiouWord`、對外名稱 `Mrlious`；Manus 只列平台／工具／執行環境。平台無法修改之項目另留正式 attribution request 與回覆。
8. 取得 Mr.liou 的最終驗收；未完成前不得關閉事件。

## 本輪界線

本輪首次記錄時讀取 issue #64、其七則留言、PR #91／#83／#65 metadata 與本倉庫文件。未登入或操作 registrar、Cloudflare、Manus、Notion、Dropbox 或任何付款帳戶；未更動 DNS、部署、分享、token、專案、檔案或網域；未索取或保存憑證。故本文件不能代表外部狀態已修正，事件不得因本文件關閉。

## 2026-10-02 追加：Issue 識別路徑差異

保留前文的 source-repository API 讀取結果作為當時觀測。其後最後一次查核出現路徑差異：

- `issue_read(owner=dofaromg, repo=mrliouword-system, issue_number=64)` 回傳 `number: 146`，URL 為 `https://github.com/dofaromg/MRL_AI_SYSTEM/issues/146`，狀態 `open`；回傳標題、正文、建立時間及七則留言與前文記錄的事件相同。
- 對 `dofaromg/mrliouword-system` 的 issue 搜尋沒有找到此標題；對 `dofaromg/MRL_AI_SYSTEM` 的搜尋找到 open #146。直接讀取目標 #146 也回傳相同內容。
- 這表示目前 GitHub API 的 issue 身分／路徑有變化或轉址；本輪沒有取得 transfer audit，也不據此斷言何時、由誰或以何種機制移轉。標記 `CONFLICT_REQUIRES_AUDIT`。
- PR #91 仍是 `dofaromg/mrliouword-system` 的 open PR；target issue metadata 將它列在 linked/closing references 內，不等於驗收完成或 issue 已關閉。

因此，前文「Issue #64 必須保持 OPEN」是引用原倉庫 issue 的歷史狀態；最新可觀測目標為 `dofaromg/MRL_AI_SYSTEM#146`, `open`。不得把兩個編號／倉庫靜默合併，也不得因來源 issue 搜尋不到而推論事件不存在或已完成。須由權利人確認 issue 移轉與 canonical tracking location。

## 2026-10-03 追加：本環境公開查詢結果

本輪僅對公開 DNS／HTTP/RDAP 資料執行讀取；未登入 registrar、Cloudflare 或 Manus，未修改任何記錄。結果是**本環境的查詢狀態**，不代表網域不存在：

| 查詢 | 工具回傳 | 可支持的結論 |
| --- | --- | --- |
| Python `socket.getaddrinfo` A／AAAA | `A gaierror [Errno -3] Temporary failure in name resolution`；`AAAA gaierror [Errno -5] No address associated with hostname` | 本環境 resolver 未給出可用解析結果；不是註冊狀態或權屬證據 |
| `dig` 經環境 resolver `127.0.0.53`：A、NS、SOA、DNSKEY、CNAME、TXT、MX、CAA | 每項回 `status: REFUSED`，`ANSWER: 0`；例如 A：`SERVER: 127.0.0.53#53`、`WHEN: Sat Oct 03 16:34:33 UTC 2026` | 查詢被拒絕；沒有取得這些 RRset，不能推斷其不存在 |
| `dig` 經環境 resolver `127.0.0.53`：AAAA | `status: NOERROR`、`ANSWER: 0`、`AUTHORITY: 0` | 這次回應沒有 AAAA answer；resolver 不提供 authority 欄位，不能用來斷言網域無註冊或不存在 |
| `dig @1.1.1.1 mrliouhan.ai A` 及 `dig @8.8.8.8 mrliouhan.ai A` | 兩次都回 `status: REFUSED`、`ANSWER: 0`，分別列出指定 resolver IP | 從本環境對兩個指定位址的查詢都被拒絕；不是由此確認 authoritative DNS |
| Web fetch `https://mrliouhan.ai`、`https://rdap.org/domain/mrliouhan.ai`、`https://data.iana.org/rdap/dns.json` | 三次均 `WebFetchBlockedUrlError: failed to lookup address information: No address associated with hostname` | 沒有取得網站、RDAP 或 IANA bootstrap 資料；RDAP/HTTP 狀態仍未知 |
| Playwright browser `https://mrliouhan.ai` | MCP tool returned `Transport closed` before navigation result | Browser tool did not return a page-level response; not evidence of domain response/status |

**結論仍為 `DOMAIN_BINDING_UNVERIFIED`。** 此環境無法取得可用 RDAP、權威 nameserver、完整 DNS zone 或 HTTP 回應。上述受阻及 REFUSED 結果須保留為 delta，不覆蓋留言所載直接畫面／歷史，也不證明不存在 Manus 綁定、網站或帳號事件。仍需權利人提供/授權取得 registrar 與 DNS 匯出、Manus/Cloudflare 記錄及同一時間線證據。

## 2026-10-03 追加：根源路由規格及本倉 Worker 部署回執

### 根源倉庫的既有正式定義

本輪以 GitHub repository search 確認 `dofaromg/mrliouword-root` 是公開 repo、default branch 為 `main`、非 archived（repo ID `1040653851`，metadata updated `2026-09-07T11:45:56Z`），並直接讀取下列文件（GitHub API 回傳的 Git blob object ID 列於括號，非本文件內容的 SHA-256）：

- [`docs/MRL_PLATFORM_ROUTING.md`](https://github.com/dofaromg/mrliouword-root/blob/main/docs/MRL_PLATFORM_ROUTING.md) (`d62ff7ea32b75c3cd8c2a32ee16bb9c16457c8cf`)：列 `https://mrliouhan.ai` 為 official backend，定義 API base URL，並把 `dns_ready`、adapter、validation、rollback 等列為平台回收 gate。
- [`docs/SYSTEM_POSITIONING.md`](https://github.com/dofaromg/mrliouword-root/blob/main/docs/SYSTEM_POSITIONING.md) (`c9ed68d0bffa48a40eb59b1ce4a5b63cd06c69c4`)：列出 frontend → backend → MRL services → DL580 的正式角色與請求路徑。
- [`docs/SOVEREIGNTY.md`](https://github.com/dofaromg/mrliouword-root/blob/main/docs/SOVEREIGNTY.md) (`5053788d17fa25b15141aa84c891bf83f196619a`) 與 [`registry/MRL_REPOSITORY_MAP.json`](https://github.com/dofaromg/mrliouword-root/blob/main/registry/MRL_REPOSITORY_MAP.json) (`8ceeef7933f977bab3f84d03a6d65f195a09db44`) 把 `dofaromg/mrliouword-root` 定位為 Root Repository，並將 `dofaromg/MRL_AI_SYSTEM` 列為母體運轉工程入口。

此為重要**正向來源證據**：`Mrliouhan.ai` 在根源定義中不是憑空推測的 domain，而是指定的 MRL official backend。此前本事件記錄只突出待驗證項，未補入這個既有正式路由規格；本節補正該遺漏。不過 route specification 是「應指向何處」的治理／架構證據，不證明現時註冊人、DNS 控制權、A/AAAA/CNAME、Manus 綁定、服務在線或路由已完成。根源文件第 4、6 節本身仍把 `dns_ready`、路由、驗證與 rollback proof 列為需逐項通過的 gate。

Issue 所寫 `source_of_truth: dofaromg/mrliouword-system` 保留為事件的工程來源指定；不得拿它覆蓋根源倉庫文件所列的 `dofaromg/mrliouword-root`，也不得以根源 route 反推 issue 指稱的 Manus 綁定已成立。兩者角色不同，任何更廣的權威關係以 Root Owner 有效決策為準。

### 本倉 Worker 的部署證據

PR #91 的 Cloudflare bot 回執記錄：2026-10-03 16:35 UTC，Cloudflare dashboard service 名 `mrliouword-system`、build `978b7362-3b4c-48b2-9e76-ab5ef20cb5da`、commit `9fd9c1d6` 部署成功（[原始回執](https://github.com/dofaromg/mrliouword-system/pull/91#issuecomment-5960870179)；[build details](https://dash.cloudflare.com/0b36a4577da7fced6df2e062fa5f6fa2/workers/services/view/mrliouword-system/production/builds/978b7362-3b4c-48b2-9e76-ab5ef20cb5da)）。PR check runs 同時顯示 `Workers Builds: mrliouword-system` success。

但本倉 `cloudflare/mrliouword-private/wrangler.jsonc` 的 `name` 是 `mrliouword-private`，而同目錄 `README-public-gate.md` §Deployment and cutover conditions 明確記錄 observed live preview 名為 `mrliouword-system`，要求先以帳戶證據釐清 mismatch。故回執支持「Cloudflare 名為 `mrliouword-system` 的 service 對 commit `9fd9c1d6` 回報 build 成功」；source/config/account/deployment ID 與本倉 `mrliouword-private` 的 mapping **尚未閉合**。

這些回執**沒有證明** `mrliouhan.ai` 綁到此 Worker、該 Worker 是 official backend、DNS 已切換、Manus Custom Domain 已解除，或 `.ai` 回應來自這個部署。不得把 Workers build 的成功當成 domain cutover/acceptance；domain 狀態仍為 `DOMAIN_BINDING_UNVERIFIED`。

### 目前追蹤位置

2026-10-03 續查直接讀取 [dofaromg/MRL_AI_SYSTEM#146](https://github.com/dofaromg/MRL_AI_SYSTEM/issues/146)：狀態 `open`，正文包含本事件七項檢查與驗收條件。七則留言亦存在於此 issue URL；現行 comment URL 與先前 `mrliouword-system#64` API 回傳的舊 comment IDs 不同，對照如下：

| 先前 `mrliouword-system#64` comment ID | 目前 `MRL_AI_SYSTEM#146` comment ID | 留言內容 |
| ---: | ---: | --- |
| 5163085898 | 5960841050 | SEV-1 初步網域查核 |
| 5163124761 | 5960841107 | 獨立 SEV-1 治理分支 |
| 5163271682 | 5960841190 | 資料回收與外部消除要求 |
| 5163342008 | 5960841250 | 初步所有權與網域查核 |
| 5163374133 | 5960841297 | 六張 Manus 畫面摘要 |
| 5163384409 | 5960841360 | 公正性修正 |
| 5273068884 | 5960841440 | 權利人要求勿忽略證據與歷史 |

兩組 comment ID 的正文與時間戳相符；這比單靠 issue body 的 linked PR 資料更直接支持留言內容在新 issue 上保留。仍未取得 transfer audit，因此**issue 轉移機制／時間仍未確證**；最新追蹤 URL 記作 `dofaromg/MRL_AI_SYSTEM#146`，source #64 舊鏈結和資料保留。

PR #91 狀態為 open、`draft: false`，head `9fd9c1d6eae4a2da76bc750ac3ede75cc3b3001d`。PR body 仍包含自動 closing keyword `Fixes #64`；而 #146 metadata 將 PR #91 列為 linked closing PR。當 domain/Manus/DNS/帳務/正名/權利人驗收條件仍未完成時，**不得僅因文件工作或 Worker build 成功而合併此 PR 使 issue 自動關閉**。merge 前需移除／更正 closing keyword，或先由權利人完成全部 issue acceptance；本輪沒有 PR body 編輯權限，未代為修改。
