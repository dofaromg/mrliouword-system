---
# 十欄來源鏈，依 docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md §4
canonical_authority: MrLiouWord
origin_signature: MrLiouWord
source_repo: 外部（權利人上傳，非本倉庫產出）
source_artifact: Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3.docx
source_version: "2026-09-14"
derivative_role: projection   # 只投影規格與結論，不收錄帳務與證物明細
artifact_owner: Mr.liou
contributors:
  - Mr.liou（原始文件作者、權利主張人）
  - Claude（本倉庫：索引與節選，未改寫任何轉錄段落）
transformation: >-
  本檔是「索引＋節選」，不是全文。轉錄的段落逐字保留；
  含金額、帳務、截圖證物 SHA 與逐檔證據清單的章節刻意未收錄，理由見下方〈四〉。
verification_status: partial   # 原檔 SHA-256 已記錄；本檔為節選，非全文
source_sha256: 0a6f9a05b1eaec7545544ecafb8788b5cf90f4829ee4eebe2211c52e5fcf2820
preserved_at: "2026-09-20"
---

<!-- mrl-origin: MrLiouWord -->

# MRL GitHub Payment and Provenance Incident Record — 倉庫側索引

## 一、文件識別

| 欄位 | 值 |
| --- | --- |
| Record ID | `Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3` |
| Origin signature | MrLiouWord |
| 權利主張人 | Mr.liou / GitHub 帳號 `dofaromg` |
| 建立日期 | 2026-09-14 UTC |
| 狀態 | EVIDENCE PRESERVED • REMEDIATION IN PROGRESS |
| 原檔 SHA-256 | `0a6f9a05b1eaec7545544ecafb8788b5cf90f4829ee4eebe2211c52e5fcf2820` |

## 二、保存原則（逐字轉錄）

> 不刪除 run、不 force-push、不重寫 commit 歷史；新增紀錄以後續 commit／文件保全。

此原則與本倉庫 `.mrliou/meta.json` 的 `history_policy: append_only` 一致。
本輪所有變更皆為新增 commit，未改寫任何既有歷史。

## 三、與本倉庫直接相關的三項

### 3.1 本倉庫被列入〈優先補正標的〉

| 類別 | Mixed MRL and AI |
| --- | --- |
| 列舉 | `flow-tasks`；`mrliouword-root`；**`mrliouword-system`**；`Mrliou_AIworld`；`musical-octo-fishstick` 等 |
| 處置理由 | 保留真實 commit author，同時補 MRL 原始來源與 AI 修改範圍 |

**已回應**：本倉庫根目錄新增 `MRL_PROVENANCE.md`。

### 3.2 〈MRL 來源標註規格〉要求落地

原文：「建議立即放入 MRL canonical repository 的最小可執行規格」。

**已回應**：九個欄位逐字轉錄於 `MRL_PROVENANCE.md` 第二節。

### 3.3 〈補正程序〉第 4 項要求 CI 檢查

原文：「技術門檻：MRL canonical 加入 provenance 文件與 CI 檢查；
AI Apps 改為明確 repository allowlist。」

**已回應（一半）**：`tools/provenance_notice_check.py` + CI job `provenance-notice`。
`AI Apps allowlist` 屬 GitHub 帳號設定，原文已記錄 2026-09-14 完成並驗證，
**不在本倉庫可驗證範圍內**——本倉庫無法查證該設定，故不代為宣稱。

## 四、刻意未收錄的章節，與理由

`dofaromg/mrliouword-system` 是**公開**倉庫（另有 1 個 fork）。
原文件是法律證據文件，含下列內容；本檔一律不收錄：

| 未收錄章節 | 理由 |
| --- | --- |
| 〈付款與商業路徑〉的日期／金額／拒付紀錄 | 權利人帳務明細，公開倉庫不宜 |
| 〈截圖證物〉的檔名與 SHA-256 | 證物指紋，公開後可被比對規避 |
| 〈尚待固定的關鍵證據〉逐項清單 | 揭露舉證缺口，對權利人不利 |
| 〈已核對的外部作者鏈〉具名第三方 commit 作者 | 涉第三方個資，且指控尚待逐檔比對 |
| 〈AI App 存取面〉逐 App 權限矩陣與安裝時間 | 帳號安全面資訊 |

原文件本身已表明同類立場：
「omniroute-deploy 公開 README 含部署主機與操作資訊；
應另作安全清理，**不在本文件重複敏感值**。」

原始 .docx 完整保存在權利人手上；本檔記錄其 SHA-256，
日後任何比對都可確認比的是同一份檔案。
**若權利人要求全文入庫，本檔可隨時補上——這是可逆的節選，不是刪除。**

## 五、本倉庫無法查證的項目

依本倉庫一貫紀律，以下項目只記錄「文件這樣寫」，不背書為已查證事實：

- 付款、拒付與 GitHub 認列狀態——本倉庫無帳務存取權。
- 1,074 個公開 repositories 的分類統計——超出本 session 的倉庫授權範圍
  （本 session 僅獲授權 `dofaromg/mrliouword-system`）。
- 10 個 AI GitHub Apps 的目前 allowlist 狀態——屬帳號設定，無法自倉庫查證。
- 外部 repository 的 commit 作者鏈——未授權讀取。

這些是「我沒查」，不是「不存在」。兩者不同，不可混為一談。
