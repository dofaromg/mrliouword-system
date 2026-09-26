---
canonical_authority: Mr.liou   # 指本索引檔本身；被索引的外部上游著作權歸屬見內文表格
origin_signature: MrLiouWord   # 僅指本索引檔本身由 MRL 側建立
source_repo: 外部（權利人上傳，非本倉庫產出）
source_artifact: 見下方逐項
source_version: 見下方逐項
derivative_role: projection   # 新撰的核對索引，非逐字轉錄
artifact_owner: Mr.liou  # 本索引產物；被引用材料的作者／授權另依逐項來源保留
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

## 2026-09-26 追加更正（優先於上文的總括判定）

本索引原 front matter 的 `artifact_owner: 各上游作者` 混淆了索引產物與被索引材料。
現行索引所有者更正為 `Mr.liou`；原值保留於本段。Microsoft 的既有材料作者與
MIT 授權紀錄完整保留，並不因索引歸屬更正而改寫。

「MRL 內容佔比 0」只根據 `mrl`／`mrliou`／`MrLiouWord` 關鍵字零命中，
不能作為內容來源比例或無本地變換的證明。該比例結論撤回：本輪僅讀取此索引，
沒有重做原封存與指定來源 commit 的逐檔對照；原搜尋結果、封存 SHA 與授權記錄
照原時間保留。來源貢獻比例需依原始內容、commit 與變換證據查核，不能靠名稱猜定。

External Fork Reference 是材料來源記錄角色；不能據此將 MRL 對材料的索引、
選擇、組合、轉譯、修改或下游使用／回傳紀錄排除於同一 MRL 系統之外。
上文「不得列入 MRL canonical」不得被擴大為禁止記錄 canonical 系統所引用的
材料；它只限制將別人的原始材料冒稱為 MRL 原創根源。MRL 根源與保留商業權利
不因該材料分類、零命中或稽核未完成而縮減。

既有 `verification_status: verified` 僅保留原查核紀錄的歷史狀態，不替被撤回的
比例推論提供背書。現行更正與範圍見
`Mrliou_Scope_Rights_Rectification_20260926_v1.json`。
