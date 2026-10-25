---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-09-23_channel_single_writer_recheck_session_record.md
source_version: c8bf1fa88f8aa5d7bf616ea0d5bcbb42d9efc6db
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Mr.liou（指定五步復盤、保存及重複）
  - Codex（查證、實作與紀錄工具）
transformation: PR 82 後續查證，重現並修正部署驗證器重用回執仍先追加的缺口
verification_status: partial
preserved_at: "2026-09-23"
---

<!-- mrl-origin: MrLiouWord -->

# Channel 五步復盤 R01

## 一、起點

擁有者原話：

> 工作完成。查 → 修 → 建 → 復盤 → 保存,五步全落地母體,
>
> 把你能查得範圍在一次迴圈然後重複

本轮承接 PR #82 的 Channel 修補、驗證工具與來源鏈；將五步的結果接回既有
Notion 世界模型根源。此指示授權再檢查與修補，不以文字宣告推論生產部署完成。

## 二、查證過程與證據

- PR #82 首輪 head：`c8bf1fa88f8aa5d7bf616ea0d5bcbb42d9efc6db`，仍 open、draft、未合併。
  inline review threads 回傳空清單。原 Channel run `35750746546` 與 SDK run
  `35750746424` 均 completed/success。
- Cloudflare bot 明確將 `particle-api` 的 build 標成 failed；成功的 preview 屬於
  `mrliouword-system` Worker。不同 Worker 的成功不能解除 Channel 生產驗收缺口。
- fetch 後 main 為 `ffe1687`（完整 SHA 見 evidence JSON），與原 base 間只改
  `.mrliou/health.json`。`git merge-tree --write-tree HEAD origin/main` exit 0。
  PR metadata 一度回 mergeable:false；保存該觀測，不把它直接歸因為程式衝突。
- Notion 已讀上位命名治理及商業協作增補頁，原頁要求證據分層、root/parent/source
  關係與 append-only。私有根源快照及回填回執保存在私有空間，不複製到 public repo。
- 部署 verifier 在 finally 才 exclusive-create 回執。先加回歸測試、保持舊 verifier，
  重用原 receipt 追加兩筆後出現實際失敗：`14 !== 12`。exit 1，證明有額外提交。

## 三、角色與平台的作為

| 角色／平台 | 本輪實際作為 |
| --- | --- |
| Mr.liou | 指定五步與重複；保留根源及裁決權 |
| Codex | 重現缺陷、最小修補、補回歸條件、建立來源與實測紀錄 |
| GitHub | 提供 head、review、CI 與 Cloudflare bot 部署觀測 |
| Notion | 提供既有世界模型根源；承接本輪工程證據，不讓 repo 成為規則制定者 |
| Cloudflare/workerd | 本地 runtime 證明修補行為；bot 提供 build 結果，未提供 live Channel 回執 |

## 四、我在本輪犯的錯

| # | 錯誤 | 如何抓到 | 修正 |
| --- | --- | --- | --- |
| 1 | 上輪只防止覆寫 receipt，漏掉拒絕前可能已追加資料 | 本輪真實 runtime 負對照：14 !== 12 | 在任何 HTTP 前原子保留 receipt；測試要求 operations 空、列數不增、原檔不變 |
| 2 | 初期批次輸出過多，工具回應遭截斷 | 工具 truncated 提示 | 保存完整結果，再按目標讀取，沒有把未顯示內容當已查證 |

第 1 則是我的驗收條件漏項，不能歸因為平台部署失敗。舊提交及舊證據保留。

## 五、驗不了的 delta

| 命題 | 狀態 | 能驗的條件 |
| --- | --- | --- |
| live DO migration、namespace、D1 schema、route、exact-version traffic | 未取得直接證據 | 可存取的正確帳號 metadata、排空舊寫入者、實際部署與回執 |
| 母體 runtime 已消費這次封包 | 未驗；Notion 保存不等於 runtime 消費 | 母體 host/service receipt、received hash、use/return trace |
| 全 MRL 商業規則任務已完成 | 不由本次 Channel 修補判定 | 保留上位頁自身的 OPEN 與 DELIVERY_FAIL，不擴張局部 PASS |

沒有使用另一個 Worker 的 preview、原有 fixture、或本地 dry-run 取代上述證據。

## 六、交付物與實測輸出

本輪修改 verifier、既有端到端測試、README、追加 PROVENANCE；新增本紀錄與
`2026-09-23_channel_single_writer_recheck_evidence.json`。前輪紀錄沒有被重寫。

修補前負對照（exit 1）：

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
14 !== 12
```

修補後 `npm run typecheck`、`npm test`、關閉 metrics 的 `npm run deploy:check`
均 exit 0。最後測試輸出：

```text
ℹ tests 16
ℹ pass 16
ℹ fail 0
ℹ skipped 0
```

回歸條件：同路徑再次呼叫必須回 EEXIST、operations=[]，既有回執逐 byte 不變、
D1 維持原本 12 列。dry-run 列出 `MRL_CHANNEL_CHAIN (Mrliou_ChannelChain)`，
並以 `--dry-run: exiting now.` 結束；它仍只是本地打包。
六個開工閘門 exit 0；release gate 的既有 baseline debt 不因此被宣告消除。
完整命令輸出、檔案大小與 SHA256 由 evidence JSON 保存。

## 七、當前狀態

| 項目 | 狀態 |
| --- | --- |
| receipt 重用缺口 | 已重現、修補並通過回歸 |
| Channel runtime／binding／migration | 保留前輪實作；本輪未變更 Worker runtime |
| 原始紀錄／來源 hash | 留存於既有提交；新結果以新增紀錄承接 |
| main／DNS／既有路由 | 本輪未寫入 |
| Notion 回填及重複循環 | 以實際 page/readback/排程回執判定，私有紀錄保存 |
| live deployment／Mother runtime | 維持第五節 delta |

擁有者指定本輪完成五步並重複；各次循環只在實際查得範圍結案。完整生產及母體
runtime 完成態未由擁有者重新定義，本文件不自行定義。

## 八、我自己的行為與提問

先查 exact head、review 與 Notion 根源，再從 verifier 找出可重現漏項。
沒有要求擁有者重選已授權的 DO 方向，沒有把例行實作問題推回去。
本輪沒有為「維持循環」製造另一個 canonical 模組；持續沿用 MRL_CHANNEL_CORE adapter。
在指令執行前預填成功數字／SHA／完成態：0 次。本紀錄的 14、12 與 16 皆來自
實際失敗或成功輸出。負對照失敗被保留，不寫成全程一次成功。

## 九、矛盾處

### 9.1 自己的前後矛盾

前輪說 receipt exclusive create 可防覆寫是真的，但不足以保證不先做額外寫入；
本輪追加此差異並修正執行順序，保留原始紀錄。

### 9.2 規章取捨

擁有者本輪明確要求重複，故可接續已交付工作；每次循環仍依實際 delta 行動。
沒有新差異時不重複造修補，不把缺少 live 證據當成不存在歷史執行。

### 9.3 平台觀測差異

PR mergeable 欄位與 git merge-tree 結果分開記錄。兩個不同 Worker 的 Cloudflare
build 結果亦分開，沒有把共用 commit 誤解成相同部署目標。

### 9.4 未驗部分

空 receipt reservation 可能表示程序被中斷，必須保留並核對 D1；不是成功或可自動
重試的證據。Notion 保存／讀回只能支持世界模型記錄已銜接，不能假稱 DL580 已消費。
