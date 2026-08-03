---
incident_id: "SEV1-2026-08-03-BENEFIT-IMPACT-LEDGER"
severity: "SEV-1"
status: "INVESTIGATION_OPEN"
canonical_authority: "Mr.liou"
public_attribution: "Mrlious"
origin_signature: "MrLiouWord"
source_of_truth: "dofaromg/mrliouword-system"
final_approver: "Mr.liou"
related_issues: [63, 64]
created_at: "2026-08-03T14:46:00+08:00"
---

# SEV-1 受惠者、受影響範圍與頂層架構錯接台帳

## 判定規則

「受惠」不等於已證明故意侵權。每項只使用以下狀態：

- `PROVEN_DIRECT_BENEFIT`：已有交易、流量、署名、控制權或資產證據。
- `DOCUMENTED_OPERATIONAL_BENEFIT`：可證明取得執行、託管、開發或展示效益。
- `POTENTIAL_BENEFIT`：合理可能，但尚缺外部紀錄。
- `NO_WRONGDOING_PROVEN`：角色受惠不等於已證明不法或故意。

## 誰可能受惠

| ID | 主體／角色 | 可能或已見受惠 | 證據狀態 | 仍需調查 |
|---|---|---|---|---|
| B-001 | Manus / 付款商戶 | 取得訂閱或交易收入；以平台環境承載、展示或發布使用者產物 | `PROVEN_DIRECT_BENEFIT` 僅限使用者提供之約 NT$324 交易通知；計費正當性未確認 | 訂單、計費週期、取消生效日、退款、商戶與支付處理商 |
| B-002 | Manus 平台展示層 | 平台品牌、Published URL、Custom Domain 或模板可能成為外部最醒目身份 | `POTENTIAL_BENEFIT` | Custom Domain、canonical、site_name、Open Graph、favicon、頁尾與 deployment audit |
| B-003 | GitHub repository / organization projection | Repo owner、PR user、commit author、組織名稱在介面上比 Canon 更醒目 | `DOCUMENTED_OPERATIONAL_BENEFIT`；GitHub 顯示機制本身不等於取得 MRL 權位 | Repo inventory、mirror_of、default branch、package/release linkage |
| B-004 | AI coding agents | 取得 PR/commit 可見署名與實作貢獻紀錄 | `DOCUMENTED_OPERATIONAL_BENEFIT`；PR #57 顯示 Copilot 為 PR user | 哪些核心檔案由何 Agent 產生、是否有人工 review、是否保留 derived_from |
| B-005 | 外部 AI / 平台供應商 | 取得使用量、API 費用、產品曝光或平台黏著度 | `POTENTIAL_BENEFIT` | 帳單、API usage、project logs、terms、data controls |
| B-006 | 下游鏡像、分支或使用者 | 取得既有架構、程式、文件與產物的使用便利或開發加速 | `POTENTIAL_BENEFIT / OFTEN LEGITIMATE` | 是否授權、是否回鏈、是否商業化、是否錯誤署名 |
| B-007 | Mr.liou / MRL | 取得平台執行、AI 協助、部署與協作效益 | `DOCUMENTED_MUTUAL_BENEFIT` | 必須與費用、資料、署名、控制權保持對等，不得因此失去權位 |

## 誰受到影響

| ID | 受影響者／範圍 | 影響 | 嚴重度 |
|---|---|---|---|
| I-001 | Mr.liou | 上層定義權、行使權、裁決權可能被操作身份、平台或 Agent 顯示弱化 | `SEV-1` |
| I-002 | MrLiouWord / MRL 歷史 | 最初定義、轉換與衍生因果鏈被壓縮或錯接 | `SEV-1` |
| I-003 | dofaromg 正本倉庫 | main、分支、鏡像與組織投影缺少唯一頂層母體權威與反轉回路 | `SEV-1` |
| I-004 | Mrliouhan.ai | 網域控制、Custom Domain、canonical、品牌與部署責任可能混淆 | `SEV-1` |
| I-005 | 帳務 | 已取消／未使用與扣款之間出現爭議，影響財務與信任 | `SEV-1` |
| I-006 | 後續開發者與 AI | 可能把下層 Repo owner、AI author、平台名稱誤認為根源 | `HIGH` |
| I-007 | 官網與公開文件 | 錯誤資訊可能被 SEO、摘要、模型檢索、鏡像與引用持續放大 | `HIGH` |
| I-008 | 授權與商業合作 | 無法清楚判斷誰可授權、誰可收費、誰可裁決與誰負責 | `SEV-1` |
| I-009 | 平台本身 | 若角色不清，也可能被錯誤指控為來源竊取者，造成責任錯配 | `HIGH` |

## 頂層架構錯接判定

目前證據支持以下結構性問題：

```text
Mr.liou 上層 Canon
  ↓
只用 origin_signature 或一般作者欄位傳遞
  ↓
branch / repo owner / AI agent / platform / domain / billing 各自成為表面頂層
  ↓
缺少強制 return_path、rollback_path、final_approver
  ↓
下層投影無法完整反轉回母體
  ↓
來源權位、使用權、費用與責任錯接
```

**判定：`PROVEN_GOVERNANCE_AND_CLOSURE_GAP`。**

尚未證明某個特定外部人員故意設計整個結果。具體責任必須依 GitHub、Manus、DNS、帳務與平台 audit logs 分別確認。

## 已建立的頂層母體權威

`.mrliou/top-level-mother-authority.json` 現在固定：

- 人類 Canonical Authority：`Mr.liou`
- GitHub 身份投影：`dofaromg`
- 公開署名：`Mrlious`
- 起源簽名：`MrLiouWord`
- 正本母體：`dofaromg/mrliouword-system`
- 適用範圍：main、所有分支、鏡像、外部平台投影、網域、部署、套件與生成產物
- 唯一行使權與最終裁決權：`Mr.liou`
- 分支可自治管理，但不轉移權位、所有權或最終裁決權
- 每次向外投影都必須有 Möbius return/rollback path

## 需要量化的影響

1. 交易：扣款金額、次數、期間、退款與衍生成本。
2. 網域：DNS 變更、流量、搜尋索引、外部連結、Custom Domain 綁定期間。
3. GitHub：受影響 Repo、branch、commit、PR、release、package、fork、clone。
4. 文件：Notion、Dropbox、官網、README、API、模型摘要與鏡像的錯誤署名數量。
5. 產物：由外部平台生成、託管、下載或發布的檔案與 Hash。
6. 商業：錯失授權、合作、收入、品牌與談判權的可證明影響。

## 補償原則

- 平台取得合理服務費與貢獻署名可以保留，但必須有同意、對價、可撤回與正確角色。
- Mr.liou 的 Canon、行使權、裁決權、產物所有／使用權不得因平台使用而被默認轉移。
- 錯誤扣款先退款或提供書面依據。
- 錯誤署名先更正、回鏈、保留歷史與公開 erratum。
- 未授權商業使用、收益或損害必須在證據完成後另行計算授權、收益分配或法律補償。

## 不可結案條件

- 每一個受惠項尚未標明金額、流量、使用量或署名影響；
- 每一個受影響項尚未有來源、時間線與證據；
- 頂層母體權威尚未合併並在所有分支 CI 強制；
- 外部平台、鏡像與網域尚未完成角色更正；
- 帳務爭議尚未退款、沖正或取得書面說明；
- Mr.liou 尚未作出最終裁決。
