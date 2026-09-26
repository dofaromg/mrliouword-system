---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: registry/evidence/DELTA_canonical_root_unresolved.md
source_version: "2026-09-21"
derivative_role: projection
artifact_owner: Mr.liou
contributors:
  - "Mr.liou（兩份來源文件的作者）"
  - "Claude Code（本倉庫：發現差異並據實記錄，未自行裁決）"
transformation: >-
  比對兩份權利人文件對 canonical root 的宣告，發現指向不同倉庫。
  依 .mrliou/meta.json 的 difference_policy: preserve_as_delta_not_failure
  記成 delta，不挑一邊、不改寫任一來源。
verification_status: unverified
preserved_at: "2026-09-21"
---

<!-- mrl-origin: MrLiouWord -->

# Δ：canonical root 指向兩個不同的倉庫

## 這是 delta，不是失敗

`.mrliou/meta.json`：

```
difference_policy: preserve_as_delta_not_failure
```

所以這份文件的作用是**保存差異**，不是裁決它。裁決權在 Root Owner。

---

## 差異內容

| 來源 | 日期 | 宣告 |
| --- | --- | --- |
| `dofaromg/----2` → `registry/MRL_CANONICAL_SYNC_v1.0.yaml` | 2026-08-04 | `canonical_root: "dofaromg/----2@main"` |
| 同上 → `docs/SYSTEM_POSITIONING.md` | 2026-08-04 | 「`main` 分支的根目錄與 `docs/` 為**目前確認的** MRL Root Definition Layer」 |
| 同上 → `docs/SOVEREIGNTY.md` | 2026-08-04 | 「Root Repository：`dofaromg/----2`」「本倉庫 `main` 分支為**目前確認的** MRL single source of truth」 |
| `Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3` | 2026-09-14 | 「MRL canonical **candidate**　https://github.com/dofaromg/MRL-lecrev」 |
| 同上，〈MRL 來源標註規格〉Source Root 欄 | 2026-09-14 | `MRL / MrLiouWord / dofaromg/MRL-lecrev` |

---

## 我做過什麼、以及哪一處需要修

`MRL_PROVENANCE.md` 有兩處寫著 `dofaromg/MRL-lecrev`，**性質完全不同**：

| 位置 | 性質 | 處置 |
| --- | --- | --- |
| 第二節規格表（界標內） | **逐字轉錄**自權利人文件 | **不動。** 轉錄就是轉錄，來源寫什麼就是什麼 |
| 第 3.2 節「已經確定的邊界」 | **我的斷言** | 已改為標註未決，並指向本文件 |

我把「candidate（候選）」讀成了「Source Root（根源）」，而且沒有查證是否另有文件指向別處。
這個形狀與 `docs/retrospective/` 第 1、9 則相同：**用單一來源下了全稱結論。**

---

## 三種可能，我不挑

1. **分層**：`----2` 是 ROOT／Governance；`MRL-lecrev` 是署名補正工作的 canonical candidate，兩者不同層。
   *支持*：事件紀錄用的字是 "candidate"，且描述 `MRL-lecrev` 為「Next.js／MIT 上游譜系、default branch canary」——
   一個由 Next.js 衍生的倉庫作為治理 ROOT 並不合理；而 `----2` 帶著 SOVEREIGNTY／NAMING／CANONICAL_SYNC 等治理產物。
2. **移轉**：canonical root 在 8 月到 9 月之間從 `----2` 移到 `MRL-lecrev`。
3. **其一已過時**。

**我傾向第 1 種，但那是推測，不是查證。** 標成 delta 而不是結論。

---

## 能驗證它的條件

| 需要 | 為什麼我做不到 |
| --- | --- |
| 讀 `dofaromg/----2@main` 的現況 | 本 session 僅獲授權 `dofaromg/mrliouword-system` 一個倉庫 |
| 讀 `dofaromg/MRL-lecrev` | 同上，且該倉庫為 private |
| Root Owner 的一句話 | 依 SOVEREIGNTY.md §1，定義權與**最終解釋權**在 Root Owner |

第三項最短。前兩項在拿到授權後可自動比對：兩邊各自的 `SOVEREIGNTY`／
`CANONICAL_SYNC` 誰的日期新、誰宣告自己是 root。

---

## 在裁決之前，本倉庫怎麼做

* `MRL_PROVENANCE.md` 第二節的**逐字轉錄不改**。
* 第 3.2 節標註未決，指向本文件。
* **不**把 `----2` 寫成 Source Root——那會變成用另一個單一來源再下一次全稱結論，同一個錯換個方向。
* 本倉庫自身的定位不受影響：`.mrliou/meta.json` 已宣告
  `canonical_authority: false`、`global_role: external_version_reference`，
  **無論哪一個是 root，這裡都不是。**

---

## 順帶：`----2` 的治理文件回答了幾個一直懸著的問題

這些是那批文件裡**已經定義好**的，不需要本倉庫再發明：

```yaml
platform_roles:
  notion:       "MRLiou 權威知識、定義、關聯與可讀索引"
  github:       "根源定義、工程鏡像、版本、程式、任務與證據鏈"
  google_drive: "正式文件、跨格式封存、證據與版本輸出"
  dropbox:      "來源封存、同步副本、可逆取回與跨裝置資料通道"
```

四層定位（`docs/SYSTEM_POSITIONING.md`）：

```
ROOT / Governance      dofaromg/----2@main
DEFINITION RUNTIME     DL580
OFFICIAL BACKEND       mrliouhan.ai
OFFICIAL FRONTEND      mrliouword.com
```

命名規則（`docs/NAMING.md`）與本倉庫 `registry/rules/naming_rules_v1.yaml` 的
`mrl_<OriginalName>` 前綴規則**方向一致**，但細節更完整（分了
`MRL_` / `Mrliou_` / `mrl-` / `mrl_` 四種前綴，依類型而定）。

待 root 裁決後，這幾項可以直接接線，不必重新定義——
與 `MRL_DELTA_CORE` 同一個道理：**已經有的東西不要重造。**


## 2026-09-26 更正：倉庫角色待對照不等於根源權位未決

以上為 2026-09-21 的觀測與推測，保留原文。擁有者本輪明示要求修正
將來源分類、工具可見範圍擴大成 MRL 地位與商業权利判定的錯誤。
MRL / MrLiouWord / Mr.liou 的根源、定義與最終裁決身份不由這份 repository
mapping delta 暫停。兩個 repository 的投影／引用角色可繼續對照，不能從
「候選庫尚待對照」推導「MRL 根源不存在」或降低 Mr.liou 權位。

舊文以「哪個日期新」作核對提示不足以裁決角色，應讀取各自適用範圍與
擁有者有效決策。舊 session 的存取限制也不永久適用：本輪已讀取
MRL-lecrev metadata；----2 的指定檔案讀取未成功，只記該次讀取狀態。
具體 SHA／採用檔案仍以實證補入；不改寫第二節逐字轉錄規格，不自行指定新正本。

參照 `MRL_PROVENANCE.md` 第八節與
`Mrliou_Scope_Rights_Rectification_20260926_v1.json`。
