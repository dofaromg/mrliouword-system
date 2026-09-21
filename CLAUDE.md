<!-- origin_signature: MrLiouWord -->
<!-- mrl-origin: MrLiouWord -->

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
- 逐字匯入的既有部署（`cloudflare/particle-api`、`cloudflare/particle-memory`）
  **偏離原樣的每一處都要在原始碼留下為什麼**。
- 來源標註依 `MRL_PROVENANCE.md` 的九欄規格；十欄來源鏈依
  `docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md` §4，
  其中 `canonical_authority` 一律是 `Mr.liou`，`MrLiouWord` 只放
  `origin_signature`。

## 動手前先跑這幾個

```bash
python3 tools/release_gate.py . /dev/null --trusted-baseline registry/release_gate_baseline.json
python3 tools/connection_audit.py
python3 tools/provenance_notice_check.py
python3 tools/operating_cognition_check.py
python3 tools/merkle_builder.py . .mrliou/merkle.json   # 動過雜湊集裡的檔案才需要
```

等 CI 用 `python3 tools/wait_for_checks.py --sha <sha> --expect "<檢查名>"`。
**不要用 `until pending==0` 的臨時 shell 迴圈**——GitHub Actions 的檢查
要到約 +100 秒才註冊，那種迴圈會在空窗期誤判完成。

## 已知且不必重複處理

`Workers Builds: particle-api` 在**所有** PR 上都是紅的，包含 `main`。
原因是 Cloudflare dashboard 的 Root directory 未設為
`cloudflare/particle-api`，**倉庫端修不好**。不要猜著修、不要重複留言。

## 這一輪的錯誤紀錄

`docs/retrospective/2026-09-20_claude_session_error_log.md` —— 九則，
每則附證據、誰抓到的、以及現在擋著它復發的是什麼。**開工前值得讀一次**，
因為裡面的錯誤有一半以上不是自己發現的。
