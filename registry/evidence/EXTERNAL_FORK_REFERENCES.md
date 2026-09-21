---
canonical_authority: Mr.liou   # 指本索引檔本身；被索引的外部上游著作權歸屬見內文表格
origin_signature: MrLiouWord   # 僅指本索引檔本身由 MRL 側建立
source_repo: 外部（權利人上傳，非本倉庫產出）
source_artifact: 見下方逐項
source_version: 見下方逐項
derivative_role: projection   # 新撰的核對索引，非逐字轉錄
artifact_owner: 各上游作者
contributors:
  - Claude（本倉庫：核對授權與作者歸屬，未修改任何上游檔案）
transformation: 僅解壓讀取、計算雜湊、統計 MRL 字樣出現次數。未修改、未匯入原始碼。
verification_status: verified
preserved_at: "2026-09-20"
---

<!-- mrl-origin: MrLiouWord -->

# External Fork Reference 索引

依權利人文件 `Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3`：

**Upstream Boundary**
> 同時保留 Next.js／Vercel／MIT 或其他既有作者與授權，不把上游權利誤歸 MRL。

**MRL-branded forks 處置理由**
> GitHub 已保留 parent／source；應標為 External Fork Reference，避免反向混淆。

本檔記錄經逐項核對、確認**不屬於 MRL 原創層**的外部內容。

---

## 1. `features-feature_terraform_1.4.2`

| 欄位 | 值 |
| --- | --- |
| 上游專案 | `devcontainers/features`（Development Container Features） |
| 授權 | MIT License, **Copyright (c) 2022 Microsoft Corporation** |
| CODEOWNERS | `* @devcontainers/maintainers` |
| 分支 | `feature_terraform_1.4.2` |
| 內含 | 647 個檔案，1,432,075 bytes |
| Feature 版本 | `terraform` 1.4.2 — “Terraform, tflint, and TFGrunt” |
| 壓縮檔 SHA-256 | `de11bf9bbb2c05a0906cba745442ab66765f1fbac1018dfa04a46a413d939d1f` |
| 上游 commit（zip 註記） | `7e64292eaec364f971bc8950b665eedbe4a31d47` |
| 建立日期 | 2026-02-02 |

### 核對結果

全樹遞迴搜尋 `mrl` / `mrliou` / `MrLiouWord`（不分大小寫）：

```
命中檔案數：0
```

**判定：純外部上游，MRL 內容佔比 0。**

- 著作權歸屬 Microsoft Corporation，MIT 授權。
- **不得**列為 MRL 原創、不得列入 MRL canonical、不得反向主張。
- 依 Upstream Boundary，若日後在 MRL 系統中使用，須同時保留 MIT 授權全文與
  Microsoft 的著作權聲明。
- 本輪**未將任何檔案匯入本倉庫**——只做核對與記錄。

### 這一項為什麼重要

權利人文件記錄帳號下有 **128 個帶 MRL／MrLiou 名稱的 fork**，
處置理由是「GitHub 已保留 parent／source；應標為 External Fork Reference，
避免反向混淆」。

本檔是該分類的第一筆實例，示範核對方法：
**解壓 → 讀 LICENSE 與 CODEOWNERS → 全樹搜尋 MRL 字樣 → 記錄雜湊**。
命中 0 就是 0，不因為檔案是從 MRL 側交來的就推定它屬於 MRL。
