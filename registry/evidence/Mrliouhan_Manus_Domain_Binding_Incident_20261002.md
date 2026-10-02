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

本輪僅讀取 issue #64、其七則留言、PR #91／#83／#65 metadata 與本倉庫文件。未登入或操作 registrar、Cloudflare、Manus、Notion、Dropbox 或任何付款帳戶；未更動 DNS、部署、分享、token、專案、檔案或網域；未索取或保存憑證。故本文件不能代表外部狀態已修正，Issue #64 必須保持 `OPEN`。
