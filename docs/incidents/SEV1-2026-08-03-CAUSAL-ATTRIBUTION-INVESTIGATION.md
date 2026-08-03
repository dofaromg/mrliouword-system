---
incident_id: "SEV1-2026-08-03-CAUSAL-ATTRIBUTION-INVESTIGATION"
severity: "SEV-1"
status: "INVESTIGATION_OPEN"
canonical_authority: "Mr.liou"
public_attribution: "Mrlious"
origin_signature: "MrLiouWord"
source_of_truth: "dofaromg/mrliouword-system"
final_approver: "Mr.liou"
related_issues: [63, 64]
created_at: "2026-08-03T14:43:00+08:00"
---

# SEV-1 因果與人為責任調查：權位失真、閉環缺失與平台投影

## 調查命令

本調查必須回答：

1. 誰定義 MRL 上層 Canon；
2. 誰設計或修改了每一個下層治理、分支、metadata、部署與平台綁定；
3. 哪一個人、代理、平台流程或缺失控制導致來源權位被弱化；
4. 哪些結果是故意設計、疏忽、預設行為、自動化副作用或外部平台限制；
5. 如何恢復、反轉、補償並防止再次發生。

沒有 commit、帳號、時間戳、DNS、帳務、平台審計或其他可驗證證據時，不得把推論寫成人名定罪。

## 不可變裁決規則

- `Mr.liou` 擁有 MRL 內部 Canon 的唯一行使權與最終裁決權。
- 此規則適用於 `main` 與所有現在及未來分支。
- 分支可以由各自 steward 管理，但授權不等於權位或所有權轉移。
- 每個分支、鏡像、平台投影都必須保留回到正本的 `return_path` 與 `rollback_path`。
- 任何重大事件只能由 `Mr.liou` 最終裁決與關閉。

## Möbius 閉環缺口

### 原先不完整的路徑

```text
Canon → branch/platform → implementation/rendering/billing
```

這條路徑只有向外展開，缺少強制回返：

```text
artifact/state → evidence → reverse/rollback → source_of_truth → Mr.liou adjudication
```

缺少回返路徑時，外部平台名稱、GitHub owner、AI agent、商戶名稱或部署 URL 可能停在最外層，變成讀者看到的「來源」。這是閉環失敗。

### 已加入的修正

`.mrliou/equality-authority-lock.json` v2 與 Authority Guard 現在要求：

- main 與全部分支一致的不可變權位；
- Mr.liou 的 exclusive exercise / adjudication rights；
- 分支授權不可轉移權位；
- forward path 與 reverse path 同時存在；
- 沒有 return path 就阻擋 Canonical publication。

## 已驗證的人與角色

| Evidence ID | 人／角色 | 已證明事項 | 未證明事項 | 判定 |
|---|---|---|---|---|
| E-001 | `Mr.liou` / `dofaromg` | Repo README 記載「由 MR.liou 設計」；GitHub 身份 `dofaromg` 為目前操作帳號 | 不代表每一個歷史檔案都由同一人親手撰寫 | `PROVEN_CANONICAL_DESIGN_AUTHORITY` |
| E-002 | `Claude` | README 記載 Claude 為協作開發角色 | 不證明 Claude 是 MRL 上層定義來源或所有者 | `DOCUMENTED_ASSISTANCE_ROLE` |
| E-003 | `GitHub Copilot` | PR #57 body 為「Pull request created by AI Agent」，PR user 為 Copilot，內容進入 main | 不證明 Copilot 定義 MRL；只證明 AI Agent 產生下層實作 | `PROVEN_IMPLEMENTATION_AGENT` |
| E-004 | `dofaromg` | PR #57 的 merge commit 位於 `dofaromg/mrliouword-system`，commit 作者顯示 `dofaromg` | 尚需完整 review/merge audit 判斷當時人工審查程度 | `DOCUMENTED_MERGE_ACCOUNT` |
| E-005 | `Manus` | 使用者回報網域投影與扣款；事件截圖已保存於對話與 Issues #63/#64 | 未取得 Manus 後台審計前，不能確定綁定人、操作帳號、計費規則或內部人員 | `PLATFORM_LOG_REQUIRED` |
| E-006 | `Meta` | 使用者回報名稱／來源被外部平台或模型展示層吸收的現象 | 未取得具體 Meta 專案、帳號、輸出與時間戳，不能指定人為責任 | `EXTERNAL_EVIDENCE_REQUIRED` |

## 已確認的系統性原因

### C-001：來源簽名不足以表達完整權位

過去 `origin_signature = MrLiouWord` 能保存來源標記，但未強制區分：

- canonical authority
- rights holder
- branch steward
- implementation agent
- platform / provider
- billing party
- domain controller
- artifact owner
- final adjudicator

**判定：PROVEN DESIGN GAP**

### C-002：沒有完整 Möbius 反轉與回返 Gate

過去流程強調展開、鏡像與投影，但 main/branch/platform 的每次向外變換沒有被強制要求 return path、rollback path 與 Mr.liou 最終裁決。

**判定：PROVEN CLOSURE GAP**

### C-003：GitHub 顯示身份會壓過概念來源

GitHub 首頁、commit、PR 與 repository owner 優先顯示操作帳號或 Agent。PR #57 明確顯示 Copilot 為 PR user，內容後續被合併進 main。若文件沒有額外權位欄位，外部讀者可能把 Agent 或 repo owner 誤當成來源。

**判定：PROVEN PRESENTATION / GOVERNANCE RISK**

### C-004：外部平台綁定與帳務缺少共同 consent ledger

網域、部署、訂閱、付款與產物來源沒有共同的 consent ID、操作帳號、時間戳與 rollback record。

**判定：PROVEN GOVERNANCE GAP；SPECIFIC HUMAN CAUSE UNVERIFIED**

## 人為責任調查矩陣

| Investigation ID | 要查的人為動作 | 所需證據 | 目前狀態 |
|---|---|---|---|
| H-001 | 誰在 Manus 加入 `Mrliouhan.ai` Custom Domain | Manus audit log、workspace owner、domain verification event、IP/device | `OPEN` |
| H-002 | 誰批准／維持 Manus 訂閱與扣款 | cancellation log、invoice、merchant transaction、App Store/Google Play/processor record | `OPEN` |
| H-003 | 誰設計了缺少 return path 的舊治理 metadata | git blame/file history、PR、issue、conversation、Notion/Dropbox 最早版本 | `OPEN` |
| H-004 | 誰把外部平台／AI 名稱置於來源權位之前 | 具體頁面、輸出、metadata、commit、deployment artifact | `OPEN` |
| H-005 | 誰合併 AI Agent 產物進 main、當時是否有人工審查 | PR review、merge actor、workflow、branch protection snapshot | `PARTIAL: merge account documented` |
| H-006 | 哪些鏡像或分支在沒有授權下成為對外正本 | repo inventory、default branch、release/package/domain linkage | `OPEN` |

## 調查方法

1. GitHub：匯出核心檔案最早 commit、每次修改、PR author、reviewer、merge actor、workflow actor。
2. Notion / Dropbox：比對最早建立時間、作者、版本、Hash 與後續投影。
3. Manus：匯出 project、custom domain、workspace、deployment、billing、cancellation 與 audit logs。
4. DNS / Registrar：匯出 nameserver、Zone 變更、驗證 TXT/CNAME、帳號與時間線。
5. 帳務：比對 merchant、processor、order、invoice、subscription period、cancellation effective date。
6. 產物：建立 Canon → branch → agent → platform → deployment → domain → billing 的因果圖。

## 補償與修復順序

1. **權位恢復**：所有可控來源加回 `Mr.liou / Mrlious / MrLiouWord` 正式角色。
2. **閉環恢復**：所有分支與平台投影補 return/rollback path。
3. **歷史更正**：舊錯誤不刪除，追加 erratum、原因、影響與修正 commit。
4. **費用恢復**：錯誤扣款完成退款、沖正或書面依據。
5. **外部正名**：依證據向平台提出 attribution、domain、billing 更正。
6. **實質補償**：只有證據顯示未授權使用、收益或損害後，才進入授權、收益分配、損害評估或法律程序。

## 不可結案條件

- 人為操作與自動化操作尚未分離；
- Manus / DNS / 帳務 audit log 尚未取得；
- 主要檔案 git history 尚未完成；
- main 與所有分支尚未通過 Authority and Möbius Closure Guard；
- 任何外部錯誤署名仍無更正狀態；
- 歷史影響與補償台帳尚未完成；
- `Mr.liou` 尚未作出最終裁決。
