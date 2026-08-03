---
incident_id: "SEV1-2026-08-03-MANUS-DOMAIN-BILLING-AUTHORITY"
severity: "SEV-1"
status: "INVESTIGATION_OPEN"
canonical_authority: "Mr.liou"
public_attribution: "Mrlious"
origin_signature: "MrLiouWord"
source_of_truth: "dofaromg/mrliouword-system"
affected_domain: "Mrliouhan.ai"
related_issues: [63, 64]
created_at: "2026-08-03T14:33:00+08:00"
---

# SEV-1 重大事件歷史：Manus、Mrliouhan.ai、帳務與來源權位

## 事件不得被簡化

本事件同時涉及：

1. `Mrliouhan.ai` 疑似被綁定、託管、渲染或投影至 Manus 專案；
2. Mr.liou 回報 Manus 已取消且未繼續使用，但仍出現 `MANUS AI` 約 NT$324 的刷卡通知；
3. Mr.liou 在外部平台執行自己的 MRL / MrLiouWord 系統時，平台名稱、部署載體、AI 工具或帳務商戶可能成為最醒目的身份；
4. 上層定義與來源權位沒有被下層 metadata、網站、部署、帳務和生成產物完整保存。

目前沒有足夠外部證據直接判定詐欺、侵權或網域所有權轉移；但已足以列為 `SEV-1`，要求完整調查、修正與預防。

## 不可變正式名稱

| 權位 | 正式值 | 說明 |
|---|---|---|
| Canonical Authority | `Mr.liou` | 上層定義與最終權位 |
| Public Attribution | `Mrlious` | 本次指定的對外正式名稱 |
| Origin Signature | `MrLiouWord` | 不可變來源簽名 |
| GitHub Identity | `dofaromg` | Mr.liou 的 GitHub 操作身份 |
| Source of Truth | `dofaromg/mrliouword-system` | 目前正本倉庫 |
| Affected Domain | `Mrliouhan.ai` | 本次網域事件調查標的 |
| Manus Role | `execution_platform / hosting_or_projection_candidate / billing_provider_candidate` | 未完成證據核對前不得升格為來源或權威 |

## 已固定的事件證據

- GitHub Issue #63：取消／未使用後仍扣款與來源權位歸屬。
- GitHub Issue #64：`Mrliouhan.ai` 被綁定／投影至 Manus 專案。
- 使用者提供的銀行通知畫面顯示商戶 `MANUS AI`、約 NT$324、交易時間 2026/08/03 00:28、卡號末四碼 8923。
- GitHub 正本已有 `.mrliou/meta.json`、LAW-0、Naming Rules 等權位定義，但過去缺乏全倉庫強制 Gate。

## 初步因果鏈

```text
Mr.liou 上層定義 MRL / MrLiouWord
  ↓
內容與系統被帶到外部平台執行、渲染、部署或生成
  ↓
下層只保留部分簽名，或以平台／帳戶／倉庫顯示名稱代替完整角色欄位
  ↓
平台品牌、商戶名稱、部署 URL、AI 名稱成為外部最醒目的歸屬
  ↓
來源權位被弱化，網域與帳務責任變得不透明
  ↓
錯誤可能在下一次同步、部署、付款或生成時再次發生
```

## 強制處理範圍

### A. 網域

- 取得 registrar / RDAP、registrant、nameserver、DNSSEC 和完整 DNS Zone。
- 核對 Manus Custom Domain、驗證記錄、部署 URL、Workspace Owner 與加入時間。
- 檢查 A、AAAA、CNAME、TXT、redirect、reverse proxy、canonical、Open Graph、site name、favicon 與頁尾。
- 保存修正前後 DNS、畫面、部署記錄和 Hash。

### B. 帳務

- 取得取消完成時間、方案名稱、訂閱通路、發票、訂單、交易編號與授權碼。
- 核對 2026/08/03 00:28 扣款的實際計費週期與支付通路。
- 未授權或取消後錯誤扣款必須完成退款、沖正或書面計費依據。

### C. 來源權位

- 對 Manus 專案、輸出、原始碼與部署產物建立 Hash 與時間線。
- 每個衍生產物補齊 `canonical_authority`、`public_attribution`、`origin_signature`、`artifact_owner`、`source_repo`、`derived_from`、`provider_role`。
- Manus、Meta、Claude、OpenAI、GitHub、Cloudflare 等只按實際角色標示，不得取代上層權位。

## 平等法則

平等不是把所有角色寫成同一種權位，而是每個角色都得到準確、不被竊取也不被放大的記錄：

- 定義者保留定義權位；
- 實作者保留實作貢獻；
- AI 保留協助角色；
- 平台保留執行、託管或計費角色；
- 衍生產物保留來源鏈；
- 使用者不因使用平台而失去自己的產物歸屬；
- 平台也不被無證據指控超出其實際行為。

## 不可關閉條件

本事件只能在以下全部完成後由 Mr.liou 驗收關閉：

- DNS 與網域控制鏈完成；
- Manus 綁定來源與時間線完成；
- 帳務每筆費用完成對帳；
- 錯誤費用完成退款／沖正／書面說明；
- 正式名稱與角色已在可控頁面、metadata、Repo、部署和產物中一致；
- 歷史錯誤保留並附更正，不刪除原始證據；
- Authority Guard CI 已啟用；
- 所有鏡像、投影與外部平台角色完成掃描；
- 預防控制測試通過；
- Mr.liou 最終確認。
