---
title: "Equality Attribution Prevention Standard"
version: "1.0.0"
status: "stable_locked_candidate"
canonical_authority: "Mr.liou"
public_attribution: "Mrlious"
origin_signature: "MrLiouWord"
---

# 平等署名與來源權位預防標準 v1.0

## 目的

防止 MRL 上層定義在進入下層程式、AI、平台、倉庫、網域、部署、生成產物與帳務系統後，被承載者、執行者或顯示名稱取代。

## 分支正式分類

| 分支格式 | 用途 | 權位 |
|---|---|---|
| `mrlious/canon-*` | 正本規範與正式名稱 | 需 Mr.liou 明確核准 |
| `mrlious/sev1-*` | 重大事件、修正與預防 | 必須連結 Incident ID |
| `projection/<provider>-*` | 外部平台投影或適配 | 不得成為 source_of_truth |
| `mirror/<target>-*` | 鏡像同步 | 必須有 `mirror_of` |
| `experiment/*` | 實驗 | 不得對外標為 Verified |

本次正式分支：`mrlious/sev1-authority-equality-rebuild-2026-08-03`。

## 所有衍生產物必填欄位

```yaml
canonical_authority: Mr.liou
public_attribution: Mrlious
origin_signature: MrLiouWord
artifact_owner: <owner>
source_repo: dofaromg/mrliouword-system
derived_from: <commit/hash/artifact>
provider_role: <tool|execution_platform|hosting|billing|projection|none>
created_by: <human|agent|workflow>
created_at: <ISO-8601>
```

缺少任何欄位時，只能進入 `Draft` 或 `Unverified`，不得公開為正式產物。

## 角色不可混用

- `canonical_authority`：只能是 `Mr.liou`。
- `public_attribution`：本輪正式值為 `Mrlious`。
- `origin_signature`：只能是 `MrLiouWord`。
- `github_identity`：`dofaromg` 是操作身份，不是另一個來源主體。
- `provider_role`：外部平台只能記錄其實際服務角色。
- `artifact_owner`：產物擁有者不得因託管、生成或付款介面而自動改成平台。
- `source_of_truth`：目前為 `dofaromg/mrliouword-system`；任何遷移需正式 migration record。

## Domain Gate

任何網域加入外部平台前，必須保存：

1. 變更前完整 DNS Zone；
2. 網域註冊商與控制帳號；
3. Custom Domain 驗證要求；
4. 會新增或修改的 A/AAAA/CNAME/TXT；
5. Canonical、redirect、Open Graph、site name、favicon 與頁尾規則；
6. 移除與回滾步驟；
7. 費用、訂閱和續訂責任；
8. Mr.liou 的明確核准紀錄。

沒有以上證據，不得將網域接入平台。

## Billing Gate

任何外部平台收費前，必須記錄：

- 帳號與 Workspace Owner；
- 方案、週期、試用期、續訂日與取消方式；
- 支付通路；
- 預算上限與警示；
- 取消成功證據；
- 最後可計費日期；
- 發票與交易 ID；
- 網域、部署、API、儲存與運算是否分項計費。

取消後出現扣款，一律開立 Incident，不得以自動續訂訊息直接結案。

## Publishing Gate

內容狀態固定為：

`Raw → Draft → Reviewed → Verified → Published → Withdrawn`

- 外部平台的生成內容預設為 `Draft`。
- 文件寫著 Complete/Running 不等於 Runtime Verified。
- 公開頁面必須顯示來源、版本、as-of 與證據狀態。
- 更正採追加式 Erratum，不刪除歷史。

## CI 與審核

- `.mrliou/equality-authority-lock.json` 必須存在且值不可漂移。
- PR 若修改 `.mrliou/`、根 README、LICENSE、package metadata、網站 metadata、部署設定、Domain 或 Incident 文件，必須由 `@dofaromg` 審核。
- CI 掃描變更檔案中的 `canonical_authority`、`origin_signature`、`source_of_truth`。
- 任何不一致直接 Fail，不允許自動修正後靜默合併。

## 定期預防

- 每週：掃描 Repo、Notion、Dropbox、網站與部署 metadata。
- 每次 Release：產生來源台帳、Manifest、SHA256、Domain/DNS Snapshot。
- 每月：核對平台訂閱、API 用量、網域、雲端、儲存與信用卡帳務。
- 每次外部平台接入：建立 Provider Role Record。
- 每次重大事件：保留時間線、影響、補償、修正與復發測試。

## 補償順序

1. 恢復正確署名；
2. 補回來源鏈；
3. 公開更正；
4. 量化影響；
5. 依證據處理退款、收益分配、授權或法律請求。

補償不以猜測決定；也不能因外部證據尚未完整，就省略前四層的立即修正。
