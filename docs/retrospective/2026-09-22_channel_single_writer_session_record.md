---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: docs/retrospective/2026-09-22_channel_single_writer_session_record.md
source_version: 3ef4d1f31e79bc93c2f6a47804c83eea0df61fab
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - Mr.liou（權利人；指定 Durable Object 單寫者方向）
  - Codex（工具；實作、測試、查證與紀錄）
transformation: 記錄 PR 77 合併後 Channel 並行斷鏈的修補與實測，保留部署未驗 delta
verification_status: partial
preserved_at: "2026-09-22"
---

<!-- mrl-origin: MrLiouWord -->

# Channel 單寫者修補 session 紀錄

## 一、起點

擁有者原話：

> `dofaromg/mrliouword-system` PR #77 已於 2026-09-21 合併進 main（merge commit `7561cc16c3c5e217753ac426f13d25299220d0ab`）。最新 GitHub 狀態仍保留一個非 outdated、未 resolved 的 P1：並行 `/channel/emit` 會讓兩個請求讀到同一 chain head，產生相同 `prev` 的 sibling records，之後 `/channel/verify` 會判定斷鏈。幫我以目前 main 為基準收斂最小安全修補，保留 append-only、provenance 與既有路由，並把修補後必須成立的並行驗證條件一起補齊。

> @Dropbox 先找有沒有

擁有者選擇：

> 新增 Durable Object 單寫者：集中管理鏈寫入，連同 binding、migration 與部署驗證一起建構

查證結果：PR #77 的 merge commit 是本輪 main 的祖先；每個請求獨立讀取 D1 head
的程式碼仍在。舊程式於本地真實 D1 runtime 的負對照出現分叉，支持問題歸因。
負對照僅正規化 DDL 的 exec 呼叫，未更改 emit；它不是未修改 baseline 的端到端成功測試。

## 二、查證過程與證據

1. 先搜尋 Dropbox 的倉庫封存、功能稽核與執行紀錄。已讀封存不含
   `channel_sync`／`/channel/emit` 實作；針對 PR、路徑與 merge SHA 的搜尋未找到
   對應修補。這只涵蓋本輪查閱範圍，不宣稱所有 Dropbox 檔案均沒有。
2. GitHub 查到 PR #77 已合併、並行 P1 仍未關閉。起始 main 是
   `e6ef2dbf1fe11e5f97ae1b647cdddcdfa770a480`。提交前 fetch 發現 main 前進，
   本地分支以 fast-forward 接到 `3ef4d1f31e79bc93c2f6a47804c83eea0df61fab`。
   `git diff e6ef2dbf1fe11e5f97ae1b647cdddcdfa770a480 HEAD -- cloudflare/particle-api`
   沒有輸出，表示這段上游更新未變動本次程式基準。
3. 查母體登錄表的 Channel／持久化成員。新增 class 只是
   `MRL_CHANNEL_CORE/MRL_SyncChannel` 的 runtime adapter，沒有新立 canonical core。
4. 實測與工具鏈版本、輸出、檔案雜湊見同目錄
   `2026-09-22_channel_single_writer_evidence.json`。
5. 部署 dry-run 曾選到根目錄的其他 Worker config。檢查 Wrangler 的設定搜尋行為後，
   模組 scripts 全部明確指定 `--config wrangler.toml`。最後輸出包含
   `env.MRL_CHANNEL_CHAIN (Mrliou_ChannelChain)`，並保留原 KV／D1／R2 bindings。

## 三、角色與平台的作為

| 角色／平台 | 本輪的實際作為 |
| --- | --- |
| Mr.liou | 指定先搜尋 Dropbox，再明確選擇 DO 方案；原創與裁決權保留 |
| Codex | 修改 adapter、配置、測試及驗收工具；不改 Mother、不接管主權 |
| Dropbox | 提供歷史封存與紀錄，未在已查閱範圍取得本次 P1 修補 |
| GitHub | 提供目前 main、PR 與 review 狀態；本輪修補置於獨立分支供審查 |
| Miniflare／workerd | 真實執行 DO、D1、KV、R2，驗證並行與故障情境 |
| Cloudflare dashboard | 重複停在安全驗證頁，未取得線上資源設定或部署回執 |
| 自動核准審查 | 首次 dry-run 被當成可能上傳來源而拒絕；檢查固定版本 CLI 的 dryRun 分支後，關閉 metrics 的本地 dry-run 獲准執行 |

## 四、我在本輪犯的錯

| # | 錯誤 | 誰抓到 | 現在擋著它的是什麼 |
| --- | --- | --- | --- |
| 1 | 初版沿用多行 D1.exec DDL，workerd 初始化失敗 | 真實 runtime 測試 | 改 prepare/batch，保留相同 schema；不用 ambient stub 代替 D1 |
| 2 | 重啟測試的清理 hook 重複 dispose 同一 runtime | 測試 ERR_SERVER_NOT_RUNNING | close helper 只關閉一次，持久化測試資料保留 |
| 3 | 部署驗證器產生的 prefix 太長，LIKE 查詢被 D1 拒絕 | 驗證器端到端測試 | 縮短 probe prefix，保持既有 stream 語意 |
| 4 | 只依 working-directory 執行 Wrangler，拿到根目錄 config | dry-run binding 輸出 | 所有 module scripts 明確指定 config，CI 亦驗證 |

第 1、4 則都屬於把設定意圖當成 runtime 行為的風險；依 repo 錯誤紀錄的原則，
以實際輸出收斂，沒有將錯誤輪次記作通過。上述故障均先修正，再取最後成功輸出。

## 五、驗不了的 delta

| # | 命題 | 我的狀態 | 能驗的條件 |
| --- | --- | --- | --- |
| 1 | 生產帳號有對應資源、權限與可用 migration tag | 未驗；dashboard 安全驗證頁阻擋 | 在可存取帳號環境讀取 metadata |
| 2 | 線上既有 D1 無 fork、無舊 UNIQUE(key) | 未驗；不從本地測試推論 live 資料 | 唯讀 SQL preflight 與 verify 回執 |
| 3 | 舊直接寫入者已暫停並排空 | 未驗；沒有變更 live 流量 | 盤點所有寫入者與完成中的工作 |
| 4 | migration、精確版本流量與原 routes 已驗 | 未執行 | README cutover 流程與 exact-SHA receipt |
| 5 | production 並行寫入驗收 | 未執行 | 在排空窗口以驗證器永久追加具名事件並保存回執 |
| 6 | 修補 PR 的 GitHub CI | 本紀錄建立時尚未取得遠端執行結果 | 以實際提交 SHA 核對預期工作，不能把空集合當綠燈 |

這些 delta 沒有改成較弱的 process-local lock；選定的 DO 架構保持。
只把生產切換留在尚未執行的明確步驟，未用 dry-run 冒充部署成功。

## 六、交付物與實測輸出

交付：DO writer 與固定 identity、D1 條件追加、binding/migration、真實 runtime
回歸測試、鎖定工具鏈、CI、唯讀 preflight SQL、精確 SHA 部署驗證器、cutover 文件、
追加的來源記錄。本節輸出為本地結果；完整命令與輸出保存在 evidence JSON。

最後 runtime 輸出節錄：

```text
✔ 96 parallel emits across three Worker instances create one linear chain
✔ late actor write is fenced when the D1 head changes before commit
ℹ tests 16
ℹ pass 16
ℹ fail 0
ℹ skipped 0
```

負對照實際輸出：

```json
{"baseline_requests":32,"baseline_valid":false,"baseline_chain_errors":29}
```

`npm run typecheck`、`npm test`、`WRANGLER_SEND_METRICS=false npm run deploy:check`
皆 exit 0。dry-run 結尾：

```text
--dry-run: exiting now.
```

修補後 repo 閘門的實測：

| 命令 | exit code | 實際結果 |
| --- | --- | --- |
| release_gate.py（trusted baseline） | 0 | 產物 15；全數通過 4；有未通過項 11；基準線已記錄 70 |
| connection_audit.py | 0 | 雲端 Worker 140；倉庫可部署 3；設定不完整 1；這是倉庫盤點，不是 live 查核 |
| provenance_notice_check.py | 0 | 規格表九列齊備且順序正確，機器標記存在 |
| operating_cognition_check.py | 0 | 七步齊備且順序正確，兩個母體錨點都在 |
| mother_core_registry.py --check | 0 | 199 個 CORE / 2264 個成員，錨點相符 |
| naming_lineage_check.py | 0 | canonical／adapter 與 lineage L-001 在 |

上述 exit 0 並不代表既有 70 項 release debt 消失。測試中的 KV 故障注入與延遲
提交注入是刻意設置；主要並行測試使用真正的 workerd binding，不是假 mutex 模擬。

## 七、當前狀態

| 項目 | 狀態與未處理理由 |
| --- | --- |
| Channel 修補／回歸／驗收工具 | 本地實作並驗證，供新 PR 審查 |
| append-only／來源／路由 | 原 D1 歷史與 import hashes 保留；配置未改原 binding IDs／Worker 名／routes |
| 歷史 fork／舊 UNIQUE(key) | 偵測後 fail closed；沒有代替權利人選擇資料修復方案 |
| 新 migration 生產執行 | 未執行，帳號與切換前提未驗 |
| main 合併／PR #77 review resolution | 未操作；本輪不代為宣告舊 review resolved |
| GitHub CI | 由新提交的實際 checks 判定，本地通過不是遠端成功證據 |
| Memory／Persona 並行問題 | 在本次 Channel 範圍外 |

本輪採用方向已由擁有者定義；是否合併或完成 production 切換作為最終完成態，
未由擁有者定義，本文件不自行定義。PR #77 的歷史「合併」完成態不自動延伸至新 PR。

## 八、我自己的行為與提問

| 輪 | 擁有者的輸入 | 我做了什麼 | 我問了什麼 | 這個問題該問嗎 |
| --- | --- | --- | --- | --- |
| 查證 | P1 修補；先查 Dropbox | 搜尋封存、讀 repo main 與 review | 無 | 可自行查證 |
| 方向 | 指定本次修補方向 | 評估既有 D1 與新增 DO 的切換成本 | 用選項確認是否新增 DO | 涉及新 namespace／migration；擁有者已明確回答，不重問 |
| 實作 | 採 DO 單寫者 | 實作、真實 runtime 驗證、準備部署工具 | 無 | 實作細節自行決定 |
| 交付 | 同一任務延續 | 複查 main、讀新規則、記錄 evidence、準備獨立 PR | 無 | 不把已授權工作推回去 |

提出方向時納入了新資源、migration 與排空舊寫入者的代價；沒有只靠 DO 名稱
推論外部 await 會自動序列化。沒有再次詢問已選定的方案。
本紀錄涵蓋的指令中，在執行前預填成功計數／SHA／完成狀態的次數：0。
測試數字來自最後輸出；main SHA 來自 git；檔案 manifest 由實際位元組計算。
「PR／production 成功」沒有在取得回執前填寫。

## 九、矛盾處

### 9.1 我自己的前後矛盾

開始以為模組 working-directory 足以指定 Wrangler config，dry-run 推翻了這個理解；
已改成 explicit config。測試階段由初版失敗到最後通過，保留錯誤輪次，不改寫成一次成功。

### 9.2 規章內部的張力

修補既有 implementation 需要改動程式行；append-only 要求的是不抹掉來源與歷史。
用獨立提交、保留 original import hashes 與追加 transformation 表達這個邊界。
新 main 的禁止刪除規則也涵蓋測試副本；本輪測試只 dispose runtime，保留測試持久化資料。
`registry/evidence/` 專收外部來源，因此本輪自產驗證 JSON 放在 retrospective，避免混淆來源。

### 9.3 平台層面的矛盾

同一 workdir 的 Wrangler 預設搜尋與人類預期的就近 TOML 不一致，明確 config 後一致。
自動核准審查首次將 dry-run 視為可能上傳；固定版本源碼顯示該分支不 auth、不部署，
補齊此證據後才重新執行純本地驗證，没有繞過拒絕去做真實上傳。

### 9.4 尚未被驗證的地方

本地 workerd 證明受控 writer 路徑的 invariant，不證明全球 production 已完成切換。
stats 的 build_sha 是部署注入值，需搭配 Cloudflare version／namespace 回執，
不能單靠 API 自報 SHA 宣稱部署證明。所有線上 delta 保留在第五節。
