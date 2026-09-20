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

### 公平合作二選一原則（逐字轉錄）

> 願意使用即共同標註完整來源；無法或拒絕標註即不得使用 MRL 原創內容。
> 外部人員、AI 或 bot 得保留其修改者／committer 身份，
> 但不得把 MRL 原始內容改標成自己或第三方的原創。
> 補正應以新增 commit 保留真實歷史。

---

## 三、本倉庫的 Trace

| 欄位 | 值 |
| --- | --- |
| Source Root | MRL / MrLiouWord / `dofaromg/MRL-lecrev` |
| Repository URL | https://github.com/dofaromg/mrliouword-system |
| Repo ID | 1130234040 |
| 本倉庫角色 | `external_version_reference_and_evidence_ledger`（見 `.mrliou/meta.json`） |
| Canonical 判定 | **本倉庫不是 MRL canonical。** `canonical_authority: false` |
| 歷史政策 | `append_only`——不刪除、不 force-push、不重寫 commit 歷史 |
| 上游規格來源 | Incident Record `..._20260914_v3`，SHA-256 `0a6f9a05b1eaec7545544ecafb8788b5cf90f4829ee4eebe2211c52e5fcf2820` |
| 相關前例 commit | `MRL-lecrev` canary `43949c3449b61cc77626e773dd78c75516af2cb9`（權利人已完成的首個 MRL_PROVENANCE.md） |

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
