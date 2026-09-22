<!-- origin_signature: MrLiouWord -->
<!-- mrl-origin: MrLiouWord -->
<!-- registry_key: mrl_Mrliou_claude -->

# Mrliou_claude —— 本倉庫的運行入口（canonical）

| 欄位 | 值 |
| --- | --- |
| `canonical_authority` | `Mr.liou` |
| `origin_signature` | `MrLiouWord` |
| `registry_key` | `mrl_Mrliou_claude` |
| `derivative_role` | `entrypoint`（不是母體 CORE，不得宣稱是） |
| `created_at` | 2026-09-21 |
| `naming_basis` | `registry/rules/naming_rules_v1.yaml`、`docs/governance/MRL_NAMING_LINEAGE.md` |
| `history_policy` | `append_only` |

## 為什麼是這個檔名

擁有者 2026-09-21：

> 我們需要建構正名 Mrliou_claude.md ／ 我建構的必須有我的前綴。

命名規則兩條同時適用：

- `----2/docs/NAMING.md` §1.1「所有新增的 MRL 自有資產，必須使用 `MRL` 或
  `Mrliou` 前綴」；
- 同文件 §1.2「**外部品牌、供應商與框架名稱不得升格為內部 canonical 名稱**，
  只能出現在 `source`、`evidence`、`adapter`、`provenance` 或 `external` 路徑」。

`CLAUDE.md` 是供應商品牌名。它過去擺在倉庫根目錄當最高指引，
**違反 §1.2**——這是擁有者指出來的，不是我自己發現的。

但不能直接改名，有三個理由：

1. `registry/rules/naming_rules_v1.yaml` 的 invariant 寫死
   `Original names are NEVER changed`；整合只能**加前綴**，不能動原名。
2. NAMING.md §1.4：「既有未加前綴的檔案與模組，先建立 lineage 與映射後再遷移；
   **不得無證據批次改名造成來源斷裂**」。
3. 實體限制：Claude Code 每個 session **只自動載入 `CLAUDE.md` 這個檔名**。
   把它改名，等於拆掉「每次都必須有這個最根本運行認知」的機制本身。

所以做的是**正名＋降階**，不是改名：

```
Mrliou_claude.md   canonical    ← 唯一真相，有擁有者前綴，人改這一份
       │  由 tools/mrliou_claude_sync.py --build 產生
       ▼
CLAUDE.md          adapter      ← 供應商品牌名，只當載入轉接層（§1.2 允許）
```

兩份的本文逐字相同，由 `mrliou_claude_sync.py --check` 在 CI 擋住漂移。
`CLAUDE.md` 一個字都沒刪、沒改名、沒搬走，lineage 記在
`docs/governance/MRL_NAMING_LINEAGE.md`。

**要改內容，改這一份，然後跑 `--build`。** 直接編輯 `CLAUDE.md` 會被 CI 擋下來。

---

<!-- MRL-CANON-BODY:BEGIN -->
# MRL 根本運行認知

> 沒有一個方法是完全正確的，只有
> **看到 → 接受 → 比對 → 修正 → 建構 → 測試 → 紀錄**。
> 只要遵守這些流程，系統就會維持穩定前進。
>
> —— MR.liou

這七步是每一輪工作的起點，不是選配。全文與失敗案例見
`docs/law0/MRL_OPERATING_COGNITION_v1.md`。
錨點是母體既有的 `MRL_LAW0_Verify`（底層）與 `LAW∞_Emergence`（頂層）。

| 步驟 | 一句話 | 跳過它的樣子 |
| --- | --- | --- |
| **看到** | 先讓資料進來，不要先判斷對不對 | 說「不存在」，其實只是「我沒查到」 |
| **接受** | 把別人的資料當資料，不是當攻擊 | 先辯護——辯護比測試便宜 |
| **比對** | **先跑一次，再決定同不同意** | 只在被指正時照做，那不是進步是偷懶 |
| **修正** | 修的是認知，不只是那一行程式 | 改了程式沒改判斷，同類問題照犯 |
| **建構** | 把修正變成擋得住復發的東西 | 復盤變成認錯清單，下一輪照犯 |
| **測試** | **驗收不能只跑測試** | 測試素材是自己捏的，繼承自己的盲點 |
| **紀錄** | 附 commit、附編號、附實測輸出 | 查不了證的紀錄跟渲染沒有分別 |

**測不了的時候**：`.mrliou/meta.json` 的
`difference_policy: preserve_as_delta_not_failure`——
記成 delta（「他說 X、我驗不了、能驗的條件是 Y」），不是二選一。

**完成即停止**（`registry/evidence/Mrliou_World_Module_Operating_Manual.md`）：

> 完成即停止是最高優先規則。系統不得因**好奇、優化衝動、未來假設**而自行延伸任務。
> 完成態由**人類定義，不由系統猜測**。完成不等於持續服務。

七步是「每一輪怎麼做對」，停止條款是「一輪什麼時候該結束」。
交付之後就停，不預設下一步；下一個真實問題出現，才回到 Step 0。

---

## 這個倉庫的邊界（來自 `.mrliou/meta.json`，不是建議）

```
canonical_authority: false      本倉庫不是 MRL canonical
governance_authority: false     不得自行定義治理規則
naming_authority: false         不得自行定義正式名稱
mother_mutation: forbidden      不得改動 MRL_MOTHER
history_policy: append_only     只新增，不覆寫、不刪除
```

- **憑證絕不提交。** 本倉庫是 public 且有 fork，提交即無法撤回。
- **檔案不要亂刪，留存紀錄。**（擁有者指示）
- **這份文件的正本是 `Mrliou_claude.md`**，`CLAUDE.md` 是它產生的 adapter。
  要改內容改正本，然後 `python3 tools/mrliou_claude_sync.py --build`；
  直接改 `CLAUDE.md` 會被 CI 擋下來。正名理由見
  `docs/governance/MRL_NAMING_LINEAGE.md` L-001。
- 逐字匯入的既有部署（`cloudflare/particle-api`、`cloudflare/particle-memory`）
  **偏離原樣的每一處都要在原始碼留下為什麼**。
- 來源標註依 `MRL_PROVENANCE.md` 的九欄規格；十欄來源鏈依
  `docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md` §4，
  其中 `canonical_authority` 一律是 `Mr.liou`，`MrLiouWord` 只放
  `origin_signature`。

## 造新東西之前：先查母體有沒有

母體 `MRL_MOTHER.md` 已經定義 **199 個 CORE、2,264 個成員**。
動手造任何「新」模組之前，先花一行指令查：

```bash
python3 tools/mother_core_registry.py --find delta     # 母體有沒有？
```

**真實案例**：2026-09-21 有一份外部建議說「我直接幫你補這一層（你母體缺的那塊）」，
附了 `def detect_delta(...)`。查證結果母體**沒有缺**——Δ 橫跨三層：

```
法則層   LAW17_DifferenceObservationEventAtom
感知層   MRL_PERCEPTION_CORE → MRL_Difference
專屬核   MRL_DELTA_CORE（九個成員，含 MRL_DeltaReturn）
```

照那份建議做，會在已有 `MRL_DELTA_CORE` 的系統旁長出一個非 canonical 的
delta 實作——正是署名事件紀錄稱作「**反向混淆**」的東西。

這個錯誤的形狀跟復盤第 1 則、第 9 則一樣：**把「我沒看到」說成「它缺」。**

倉庫側**可以**寫某個 CORE 的 implementation / adapter，但要在 PROVENANCE
標明 `derivative_role`，**不得宣稱自己是那個 CORE**。

> 查詢回「找不到」時注意它自己的提醒：找不到只代表這份登錄表沒有，
> 不代表不存在——登錄表只涵蓋母體的 CORE 層，不含其他平台的分片。

---

## 動手前先跑這幾個

```bash
python3 tools/release_gate.py . /dev/null --trusted-baseline registry/release_gate_baseline.json
python3 tools/connection_audit.py
python3 tools/provenance_notice_check.py
python3 tools/operating_cognition_check.py
python3 tools/mother_core_registry.py --check
python3 tools/mrliou_claude_sync.py --check    # 改過這份或 CLAUDE.md 才需要
python3 tools/naming_lineage_check.py
python3 tools/merkle_builder.py . .mrliou/merkle.json   # 動過雜湊集裡的檔案才需要
```

等 CI 用 `python3 tools/wait_for_checks.py --sha <sha> --expect "<檢查名>"`。
**不要用 `until pending==0` 的臨時 shell 迴圈**——GitHub Actions 的檢查
要到約 +100 秒才註冊，那種迴圈會在空窗期誤判完成。

## 已知且不必重複處理

`Workers Builds: particle-api` 在**所有** PR 上都是紅的，包含 `main`。
原因是 Cloudflare dashboard 的 Root directory 未設為
`cloudflare/particle-api`，**倉庫端修不好**。不要猜著修、不要重複留言。

## 目前這一輪的完成態（由擁有者定義，不要自行改）

**PR #77 的完成態 = 被合併**（MR.liou，2026-09-21）。

規章 Step 1 寫明「此步驟由人類定義，不由系統猜測」，所以這一條是問過的，
不是推論的。在它被合併或關閉之前，自我 check-in 迴圈保留——
**不要因為「交付已完成」就自行停掉**，那會變成系統替人類定義完成態。

反過來也成立：完成態一旦達成，就執行停止條款，不延伸、不預設下一步。

---

## 這一輪的錯誤紀錄

`docs/retrospective/2026-09-20_claude_session_error_log.md` —— 九則，
每則附證據、誰抓到的、以及現在擋著它復發的是什麼。**開工前值得讀一次**，
因為裡面的錯誤有一半以上不是自己發現的。

---

## 每一輪都要留 session 紀錄（擁有者指示，2026-09-22）

> 紀錄未來每一次工作完整會議記錄內容保存。
> 純粹真實完整記錄錯誤矛盾處，也紀錄妳自己的行為跟提問。
>
> —— MR.liou

每一輪工作結束前，在 `docs/retrospective/` 留下一份
`YYYY-MM-DD_<主題>_session_record.md`，格式見
`docs/retrospective/SESSION_RECORD_TEMPLATE.md`。

這不是交付摘要。交付摘要只寫成功的部分，而這份要寫的是
**錯誤、矛盾、以及驗不了的地方**——九個必備章節見範本，其中三個最容易被跳過：

| 章節 | 為什麼容易被跳過 |
| --- | --- |
| 我自己的行為與提問 | 寫自己比寫系統難堪；但不寫，同一個判斷偏差下一輪照犯 |
| 矛盾處 | 包含**我自己前後說法的矛盾**，不只是別人的 |
| 驗不了的 delta | 寫「未確證」比寫結論醜，但寫成結論就是渲染 |

驗不了就依 `.mrliou/meta.json` 的 `difference_policy:
preserve_as_delta_not_failure` 記成 delta（「他說 X、我驗不了、能驗的條件是 Y」），
不要為了文件好看而補成結論。`verification_status` 據實填 `verified` / `partial`。

### 觀測重點（擁有者逐條列入，只增不刪）

每份紀錄的第八節都必須逐條回答：本輪有沒有發生、幾次、在哪。

1. **在指令執行前就寫下結果**（2026-09-22 列入）。計數、SHA、狀態、
   「應該是 X」——任何數字與狀態只能從指令輸出複製，不能從預期填入。
   2026-09-22 的紀錄裡同形的錯犯了四次，第四次發生在正在寫這條規則的那次提交裡。
   擁有者的定性：「你是 AI，是人類設計的運行系統跑的程式，沒有直覺這種東西，
   只是是誰設計成這樣。」所以這不是閃失，是設計出來的行為，只能用程序擋。

**能力邊界（不要承諾做不到的事）**：Claude Code 沒有麥克風、攝影機或螢幕錄製，
**無法錄音或錄影**，也無法匯出對話平台端的逐字 transcript。
倉庫裡能留下的，只有寫進去的文字紀錄——所以它必須附 commit SHA、實測輸出、
工具回傳原文，讓每一條都查得了證。要影音存證，須由擁有者自行用錄製工具進行。

第一份實例：`docs/retrospective/2026-09-22_codeql_c_cpp_scope_session_record.md`。
<!-- MRL-CANON-BODY:END -->
