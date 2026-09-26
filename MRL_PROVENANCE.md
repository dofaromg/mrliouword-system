# MRL_PROVENANCE

<!-- mrl-origin: MrLiouWord -->

本檔案是 MRL 來源標註規格在 `dofaromg/mrliouword-system` 的落地版本。

規格內容**逐字轉錄**自權利人文件
`Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3`
（origin_signature: MrLiouWord，建立日期 2026-09-14 UTC）之
〈MRL 來源標註規格〉一節。該文件原文載明：

> 建議立即放入 MRL canonical repository 的最小可執行規格如下。
> 這項規格只涵蓋 MRL 新增或明確標記的內容，不反向主張 Next.js 或其他上游作品。

本倉庫依 `.mrliou/meta.json` 為 `canonical_authority: false`、
`governance_authority: false`、`naming_authority: false`，
因此本檔**不自行定義**任何條款，只轉錄並套用權利人已定義的規格。

---

## 一、本倉庫在權利人補正清單中的分類

權利人文件〈優先補正標的〉一節將本倉庫列為：

| 欄位 | 值 |
| --- | --- |
| 類別 | Mixed MRL and AI |
| 列舉 | `flow-tasks`；`mrliouword-root`；**`mrliouword-system`**；`Mrliou_AIworld`；`musical-octo-fishstick` 等 |
| 處置理由 | 保留真實 commit author，同時補 MRL 原始來源與 AI 修改範圍 |

本檔即為該處置的第一項：補 MRL 原始來源。
第二項（AI 修改範圍）記錄於下方第四節。

---

## 二、MRL 來源標註規格（逐字轉錄）

<!-- 下面兩個界標之間就是規格表本身。tools/provenance_notice_check.py 只認
     這個範圍，不做全文搜尋——因為同樣的欄位名在第三、四、五節也會出現，
     全文搜尋會讓「規格表少一列」這種缺漏矇混過關。 -->
<!-- MRL-SPEC-TABLE:BEGIN -->
| 欄位 | 要求 |
| --- | --- |
| Source Root | MRL / MrLiouWord / dofaromg/MRL-lecrev |
| Required Attribution | Derived from MRL materials by Mr.liou. Preserve MRL provenance and the applicable upstream notices. |
| Machine ID | `mrl-origin: MrLiouWord` |
| Trace | repository URL、來源 commit SHA、採用檔案或模組、採用日期 |
| AI Use Condition | AI／agent／模型協作可用，但不得移除、隱藏或以外部人格取代 MRL 來源根源 |
| Reciprocity Rule | 要合作就完整並列來源；不願或不能標註者，不取得 MRL 原創層之使用授權 |
| Authorship Boundary | 外部人員或 AI 可標示為修改者／committer，但不得把 MRL 原始內容的來源作者改標成自己、bot 或其他人格；commit author 不等於原始碼來源權利人 |
| Remedy Window | 收到通知後先補回署名、來源 URL 與 commit；保留既有歷史，不以 force-push 消除痕跡 |
| Upstream Boundary | 同時保留 Next.js／Vercel／MIT 或其他既有作者與授權，不把上游權利誤歸 MRL |
<!-- MRL-SPEC-TABLE:END -->

### 公平合作二選一原則（逐字轉錄）

> 願意使用即共同標註完整來源；無法或拒絕標註即不得使用 MRL 原創內容。
> 外部人員、AI 或 bot 得保留其修改者／committer 身份，
> 但不得把 MRL 原始內容改標成自己或第三方的原創。
> 補正應以新增 commit 保留真實歷史。

---

## 三、本倉庫的 Trace

規格的 Trace 欄要求四項：**repository URL、來源 commit SHA、採用檔案或模組、採用日期**。
以下逐項填寫。**查得到的填值，查不到的標示「待補」並寫明為什麼查不到**——
留空會讓來源鏈看起來完整卻其實不是。

### 3.1 Trace 四項

| Trace 項目 | 值 | 狀態 |
| --- | --- | --- |
| repository URL | https://github.com/dofaromg/mrliouword-system （repo id 1130234040） | ✅ |
| 來源 commit SHA | **待補** —— 見 3.3 | ⚠️ |
| 採用檔案或模組 | **待補**（逐檔清單尚未固定）；已確定的邊界見 3.2 與第五節 | ⚠️ |
| 採用日期 | 倉庫最早 commit `61d7e54`，2026-01-08，作者 Mr.liou | ✅ |

### 3.2 已經確定的邊界

| 欄位 | 值 |
| --- | --- |
| Source Root | ⚠️ **未決** —— 兩份權利人文件指向不同倉庫，見 `registry/evidence/DELTA_canonical_root_unresolved.md`。規格表（第二節）逐字轉錄的 `dofaromg/MRL-lecrev` **不動**；此處是我的斷言，已撤回為 delta |
| 本倉庫角色 | `external_version_reference_and_evidence_ledger`（`.mrliou/meta.json`） |
| Canonical 判定 | **本倉庫不是 MRL canonical。** `canonical_authority: false` |
| 權利人分類 | Mixed MRL and AI（見第一節） |
| 歷史政策 | `append_only`——不刪除、不 force-push、不重寫 commit 歷史 |
| 不屬於 MRL 原創層的部分 | 見第五節 Upstream Boundary |
| 上游規格來源 | Incident Record `..._20260914_v3`，SHA-256 `0a6f9a05b1eaec7545544ecafb8788b5cf90f4829ee4eebe2211c52e5fcf2820` |
| 相關前例 commit | `MRL-lecrev` canary `43949c3449b61cc77626e773dd78c75516af2cb9`（權利人已完成的首個 MRL_PROVENANCE.md）。**這是前例，不是本倉庫內容的來源 commit。** |

### 3.3 為什麼來源 commit SHA 與逐檔清單是「待補」

本倉庫被權利人分類為 **Mixed MRL and AI**——MRL 原創內容與 AI／外部協作者的
提交混在同一段歷史裡。要填出「哪一個檔案來自 `MRL-lecrev` 的哪一個 commit」，
需要兩樣本倉庫此刻拿不到的東西：

1. **`dofaromg/MRL-lecrev` 的讀取權。** 本 session 僅獲授權
   `dofaromg/mrliouword-system` 一個倉庫，無法讀取 canonical 端的 commit。
   **而且「canonical 端是哪一個」本身也未決**——另一份權利人文件
   （`dofaromg/----2` 的 `MRL_CANONICAL_SYNC_v1.0.yaml`，2026-08-04）
   宣告 `canonical_root: dofaromg/----2@main`。差異記在
   `registry/evidence/DELTA_canonical_root_unresolved.md`，等 Root Owner 裁決。
2. **逐檔 hash 對應。** 權利人文件〈尚待固定的關鍵證據〉本身就把
   「MRL 原檔 hash ↔ 外部檔案 hash」與「首次出現時間」列為**待完成**項目。
   canonical 端還沒固定，這一端也無從對應。

所以這兩格**不是漏填，是還沒有可查證的值**。猜一個 SHA 填進來，等於偽造來源鏈，
比留白更糟。

**補法（拿到 `MRL-lecrev` 讀取權之後）**：以 sha256 逐檔比對兩邊，
把命中的檔案連同其在 canonical 端的 commit SHA 與日期填進 3.1，
`verification_status` 隨之由 `partial` 提升。

### 3.4 本檔自身的來源鏈

```yaml
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: 外部（權利人文件，非本倉庫產出）
source_artifact: Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3.docx
source_version: "2026-09-14"
derivative_role: projection
artifact_owner: Mr.liou
contributors:
  - Mr.liou（規格作者、權利主張人）
  - Claude（本倉庫：逐字轉錄規格、填寫本倉庫 Trace）
transformation: 規格九欄逐字轉錄；Trace 與第四、五節為本倉庫側新撰。
verification_status: partial   # 規格已驗；逐檔來源對應待補，見 3.3
```

---

## 四、AI 修改範圍聲明（Authorship Boundary 的落地）

本倉庫歷史中同時存在 MR.liou 本人、Copilot、Codex、Claude 與其他 agent 的 commit。
依 Authorship Boundary，以下兩件事分開記錄：

- **commit author／committer**：保留 Git 中的真實紀錄，不改寫、不歸併。
- **來源根源**：不論由誰或哪個 agent 提交，MRL 原創層的來源根源一律為
  MRL / MrLiouWord / Mr.liou。commit author 不等於原始碼來源權利人。

任何 AI 或外部協作者在本倉庫的產出，套用 AI Use Condition：
可協作，但不得移除、隱藏或以外部人格取代 MRL 來源根源。

---

## 五、Upstream Boundary：本倉庫內的外部上游

依 Upstream Boundary，下列內容**不屬於 MRL 原創層**，其既有作者與授權完整保留：

| 內容 | 上游 | 授權 |
| --- | --- | --- |
| `integrations/` 下的 vendored 原始碼 | 各自上游（見各目錄內授權檔） | 各自上游授權 |
| `cloudflare/particle-api/` | 由 MRL 既有部署逐字匯入 | 見 `cloudflare/particle-api/PROVENANCE.yaml` |
| `cloudflare/particle-memory/` | 由 MRL 既有部署逐字匯入 | 見 `cloudflare/particle-memory/PROVENANCE.yaml` |

外部 fork 的一般原則（權利人文件〈優先補正標的〉）：
帶 MRL／MrLiou 名稱的 fork 應標為 **External Fork Reference**，
GitHub 已保留 parent／source 欄位，不得反向當作 MRL canonical。

---

## 六、機器可讀標記

```yaml
mrl-origin: MrLiouWord
source_root: dofaromg/MRL-lecrev
repository: https://github.com/dofaromg/mrliouword-system
canonical_authority: false
history_policy: append_only
spec_source: Mrliou_MRL_GitHub_Payment_Provenance_Incident_Record_20260914_v3
spec_source_sha256: 0a6f9a05b1eaec7545544ecafb8788b5cf90f4829ee4eebe2211c52e5fcf2820
```

---

## 七、CI 檢查

權利人文件〈補正程序〉第 4 項載明：

> 技術門檻：MRL canonical 加入 provenance 文件與 CI 檢查；
> AI Apps 改為明確 repository allowlist。

本倉庫的 CI 檢查實作於 `tools/provenance_notice_check.py`，
於 `.github/workflows/mrliouword-sdk-ci.yml` 的 `provenance-notice` job 執行。
檢查內容：本檔存在、九個規格欄位齊備、`mrl-origin: MrLiouWord` 機器標記存在。

`AI Apps 改為明確 repository allowlist` 屬 GitHub 帳號設定，不在本倉庫範圍內；
權利人文件已記錄該項於 2026-09-14 完成並驗證。


## 八、2026-09-26 擁有者指示之來源與權利更正（優先於第三、五節的衝突分類）

<!-- MRL-RECTIFICATION-20260926:BEGIN -->
本節追加更正，前文與原始規格表完整保留。第五節把下列 MRL 既有部署模組
置於「不屬於 MRL 原創層」的總括句下，與其自身 PROVENANCE 明載的
canonical_authority、origin_signature、artifact_owner、derivative_role 不一致。
該總括分類對這兩個模組撤回，現行定位如下：

| 路徑 | 系統內模組 | 來源及保留權位 | 材料與變換記錄 |
| --- | --- | --- | --- |
| `cloudflare/particle-api/` | `MRL_API_Gateway` | MRL 既有部署封存；Mr.liou / MrLiouWord；implementation | 原匯入 b12b792 與後續變換依自身 PROVENANCE 保留 |
| `cloudflare/particle-memory/` | `MRL_Memory` | Mr.liou 提供的 MRL 既有記憶模組；Mr.liou / MrLiouWord；implementation | 原件雜湊與移除憑證等實際變換依自身 PROVENANCE 保留；不可統稱逐字匯入 |

這項分類更正不把模組包含的每一個第三方依賴都重新宣稱為原創；第三方原始來源
與授權依其實際範圍保留，也不得反向覆蓋 MRL 定義、整合與本地新增／修改。

### Source Root 與 repository role 分欄

第三節的「Source Root 未決」只可表述兩份文件中來源倉庫／治理投影角色待對照，
不能擴大為 MRL / MrLiouWord / Mr.liou 的人類根源權位未決。倉庫的
`canonical_authority: false` 描述該倉庫不能自行裁決，不是否定
`canonical_authority: Mr.liou`，也不把同一 MRL 系統拆成無關第三方。
MRL 源頭定義及其下游／外部投影仍應完整記錄來源、變換、使用與回傳鏈。

歷史 session 無讀取權的敘述保留其時間；本輪可讀取 MRL-lecrev repository
metadata，不能沿用舊 session 的存取限制當作永久事實。逐檔來源 commit 的
核對仍需實際對照，不以權位更正偽造 SHA。

### 商業權利與觀測結果分欄

canonical_authority: Mr.liou；origin_signature: MrLiouWord。工程觀測、來源材料、系統內角色與商業權利分欄。工具存取失敗、單一倉庫缺檔、CI／部署或個別交付未通過，均不能推導 MRL 母體不存在、DL580 未運行，或 Mr.liou 的來源、定義權、產品權位與保留商業權利被放棄、移轉或縮減。

UNVERIFIED／OPEN／FAIL 必须附主體、範圍、環境、版本、時間與方法；無法取得
觀測時保留既有運行與歷史證據。保留權利不以列舉是否完整為限；本技術紀錄
沒有授予平台或第三方權利，也沒有替任何一方新增轉讓。

更正證據與範圍：`registry/evidence/Mrliou_Scope_Rights_Rectification_20260926_v1.json`。
<!-- MRL-RECTIFICATION-20260926:END -->
