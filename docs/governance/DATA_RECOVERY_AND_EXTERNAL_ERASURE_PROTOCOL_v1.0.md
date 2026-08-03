---
title: "Data Recovery and External Erasure Protocol"
version: "1.0.0"
status: "stable_locked_candidate"
canonical_authority: "Mr.liou"
public_attribution: "Mrlious"
origin_signature: "MrLiouWord"
source_of_truth: "dofaromg/mrliouword-system"
final_approver: "Mr.liou"
---

# 我方資料完整回收與他方副本消除協議 v1.0

## 核心要求

我方資料必須先完整取回、驗證、回到母體或受控儲存，再處理外部平台上的專案、部署、分享、Custom Domain 與資料副本。

不能先刪除再猜資料是否找得回；也不能只在畫面上刪除，卻沒有確認發布網址、API、分享連結、索引、備份保留與平台支援紀錄。

## 最終狀態

外部平台僅保留法律、安全或備份政策明確要求且以書面揭露的資料；其餘我方可控資料、公開投影、部署與連結應停止可存取、可搜尋及可重用。

這裡所稱「如沙盒般消失」是指：

- 專案與工作區不再可見或可執行；
- 公開網址、分享連結與部署停止；
- Custom Domain 解綁；
- API Token、OAuth、Webhook 與整合撤銷；
- 搜尋索引與快取提出移除；
- 平台完成刪除確認，或明確說明備份保留期限；
- 我方已保存可驗證的完整匯出與歷史證據。

不能把「按下刪除」直接等同不可逆、即時且全球消失。

## 回收順序

1. 盤點所有外部位置、帳號、Workspace、專案、網域與整合。
2. 匯出對話、輸入、原始碼、檔案、生成產物、部署設定、帳務與 Audit Logs。
3. 保留原始時間戳、作者欄位、來源 URL、專案 ID 與平台 ID。
4. 建立 Manifest、檔案數量、SHA-256 與匯出時間。
5. 在離線或受控環境打開、解壓、還原並抽樣驗證。
6. 回存至 MRL 母體、Evidence Vault 與至少一份離線備份。
7. 撤銷 API Key、OAuth、Webhook、Repo App、DNS 驗證與 Custom Domain。
8. 停止 Published URL、分享連結、部署與對外索引。
9. 向平台提交資料刪除與帳號／專案刪除要求。
10. 取得刪除確認、保留例外、備份期限與案件編號。
11. 驗證已登入與未登入狀態、舊 URL、DNS、API 與搜尋結果。
12. 將修正前後證據追加至重大事件歷史，由 Mr.liou 驗收。

## 必須回收的資料

- 專案、頁面、對話與提示；
- 使用者輸入、上傳資料與附件；
- 原始碼、設定、Build Artifact 與部署包；
- 網域綁定、DNS 驗證與 Published URL；
- 生成圖片、文件、資料庫、向量與記憶；
- Workspace 成員、權限與分享紀錄；
- 發票、交易、訂閱、退款與支援往來；
- API Key 名稱、Integration ID、Webhook 與 OAuth 授權；
- Audit Log、建立時間、更新時間與刪除時間。

## 驗收條件

- 匯出檔可讀且數量可核對；
- Manifest 與 Hash 已封存；
- 母體可還原至少一個完整專案；
- 外部網域與公開網址停止指向平台；
- Token 與整合已撤銷；
- 刪除要求有案件編號或書面確認；
- 平台保留例外與期限已記錄；
- 未登入測試無法取得已刪內容；
- 歷史證據沒有被刪除；
- Mr.liou 最終確認。

## 權位

```yaml
canonical_authority: Mr.liou
public_attribution: Mrlious
origin_signature: MrLiouWord
artifact_owner: Mr.liou
source_of_truth: dofaromg/mrliouword-system
recovery_status: pending|exported|verified|restored
external_erasure_status: pending|requested|confirmed|retention_exception
return_path: <location>
manifest_sha256: <hash>
final_approver: Mr.liou
```

## 邊界

本協議不能直接刪除我方無權操作的第三方系統資料。外部刪除必須透過帳號控制、平台功能或正式資料權利請求完成；在取得確認前一律保持 `PENDING_VERIFICATION`。
