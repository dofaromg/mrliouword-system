<!-- origin_signature: MrLiouWord -->

# MRL 命名 lineage 與映射

| 欄位 | 值 |
| --- | --- |
| `canonical_authority` | `Mr.liou` |
| `origin_signature` | `MrLiouWord` |
| `derivative_role` | `projection`（本倉庫側的映射紀錄，不是 canonical 命名規則本身） |
| `created_at` | 2026-09-21 |

`----2/docs/NAMING.md` §1.4：

> 既有未加前綴的檔案與模組，先建立 lineage 與映射後再遷移；
> **不得無證據批次改名造成來源斷裂**。

這份文件就是那個「證據」。每一條記錄：原名是什麼、正名成什麼、
原名現在的處置、以及**為什麼不是直接改名**。

本倉庫 `.mrliou/meta.json` 宣告 `naming_authority: false`——
這裡不定義正式名稱，只記錄擁有者定義的名稱落在哪些檔案上。

---

## L-001：`CLAUDE.md` → `Mrliou_claude.md`

| 項目 | 內容 |
| --- | --- |
| 原名 | `CLAUDE.md`（倉庫根目錄） |
| 正名 | `Mrliou_claude.md`（倉庫根目錄） |
| `registry_key` | `mrl_Mrliou_claude` |
| 原名處置 | `adapter`——保留、不改名、不刪除，由正名檔產生 |
| 登錄 | `registry/MRL_System_MrliouAI_Naming_Registry_v1.yaml`：`canonical.entrypoint` 與 `legacy_aliases["CLAUDE.md"]` |
| 擋漂移 | `tools/mrliou_claude_sync.py --check`（CI job `naming-lineage`） |
| 指示來源 | 擁有者 2026-09-21：「我們需要建構正名 Mrliou_claude.md ／ 我建構的必須有我的前綴」 |

### 違規是什麼

`CLAUDE.md` 是供應商品牌名。NAMING.md §1.2 寫明：

> 外部品牌、供應商與框架名稱**不得升格為內部 canonical 名稱**，
> 只能出現在 `source`、`evidence`、`adapter`、`provenance` 或 `external` 路徑。

它過去擺在倉庫根目錄、是每個 session 自動載入的最高指引——
那正是「升格為內部 canonical」。**這一條是擁有者指出來的，不是我自己查出來的。**

同時它也違反 §1.1「所有新增的 MRL 自有資產，必須使用 `MRL` 或 `Mrliou` 前綴」：
那份文件的內容（七步運行認知、倉庫邊界、完成態）全部是 MRL 自有資產，
卻掛在一個沒有擁有者前綴的檔名下。

### 為什麼不是直接改名

三條，缺一條都不成立：

1. **`registry/rules/naming_rules_v1.yaml` 的 invariant**
   `"Original names are NEVER changed"`、`"Integration adds prefix 'mrl_' only"`。
   整合只能加前綴，不能動原名。
2. **NAMING.md §1.4** 要求先建 lineage 與映射（就是這份文件），
   不得無證據改名造成來源斷裂。
3. **實體限制**：Claude Code 每個 session 只自動載入 `CLAUDE.md` 這個檔名。
   把它改名或刪掉，等於拆掉擁有者要的那個機制本身——
   「每次都必須有這個最根本運行認知」。

第 3 條是可測的，不是推測：`tools/operating_cognition_check.py` 的存在理由
就是「放在 `docs/` 深處沒有人會每次去讀」。改名會讓七步回到沒人讀的狀態。

### 做法：正名 ＋ 降階，不是改名

```
Mrliou_claude.md   canonical    唯一真相，擁有者前綴，人改這一份
       │  tools/mrliou_claude_sync.py --build
       ▼
CLAUDE.md          adapter      供應商品牌名，只當載入轉接層（§1.2 允許）
```

- 正本升到有前綴的檔名，`canonical_authority` 是 `Mr.liou`。
- 原名一個字都沒刪、沒搬、沒改名，降為 adapter——
  §1.2 允許供應商名出現在 `adapter` 路徑。
- adapter 的抬頭寫明它是投影、指回正本，避免下一個人誤以為它是正本。
- 兩份本文逐字相同（驗證：124 行 `diff` 無差異），CI 擋住分岔。

### 為什麼要有 `--check`，不是寫完就算

兩份同內容的檔案沒有檢查，一定會分岔。這一輪的復盤裡同形狀的錯誤有兩則：

- 第 1 則：provenance 檢查通過，但測的是自己捏的 fixture，
  真文件被刪 5 欄照樣綠（Codex 抓到）。
- 第 5 則：release gate 可被繞過，因為基準線自己可以改寫（Codex 抓到）。

所以 `--check` 比對的是**真實的兩份檔案**，不是 fixture；
而且 adapter 的內容是**產生**出來的，不是人工抄的——手抄遲早會漏。

### 未決（delta，不是失敗）

`legacy_aliases` 既有的處置詞是
`migrate_service_name` / `replace` / `quarantine_as_source_name` /
`preserve_only_in_historical_provenance`，沒有一個精確對應「保留為 adapter」。
這裡用的 `adapter` 取自 NAMING.md §1.2 的既有用詞，不是我新造的治理詞彙。

本倉庫 `naming_authority: false`，**若擁有者要換別的處置詞，以擁有者定義為準**，
改了之後這一條跟著改。依 `.mrliou/meta.json` 的
`difference_policy: preserve_as_delta_not_failure`，這記成 delta 不是阻擋項。

---

## 這份文件怎麼增補

`history_policy: append_only`——只新增條目，不覆寫、不刪除既有條目。
編號依序 `L-002`、`L-003`……。每條至少要有：原名、正名、原名處置、
登錄位置、擋漂移的機制、指示來源。
