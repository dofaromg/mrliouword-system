---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: cloudflare/particle-api/scripts/verify-channel-deployment.mjs
source_version: 8467eaefd37d61ff84a8532cddea8139a50af859
derivative_role: engineering_evidence
artifact_owner: Mr.liou
contributors: [Mr.liou, Codex]
transformation: R04 expands verification to post-commit response loss; retains R01-R03 evidence.
verification_status: partial
preserved_at: 2026-09-23
---

<!-- mrl-origin: MrLiouWord -->

# Channel uncertain-response receipt — R04

## 一、起點

Mr.liou：「工作完成。查 → 修 → 建 → 復盤 → 保存,五步全落地母體,
把你能查得範圍在一次迴圈然後擴譜重複」。
本輪限於 PR #82 Channel adapter、部署驗證器與記憶回填。

## 二、查證過程與證據

起始 PR #82 head `8467eaefd37d61ff84a8532cddea8139a50af859`；open、draft、
未合併、mergeable=true；review_threads 為空。Channel CI 35806387346 與 SDK CI
35806387344 均 success。main 為 `ffe16878c7f329c355f1795de22dd7d327645eb2`；
`git merge-tree --write-tree HEAD origin/main` exit 0。

Cloudflare bot 的 particle-api build `5148014e-742f-435e-92ed-47095d83373b`
仍在該 head 回 failed；另一 Worker 成功不替代此結果。
本輪沒有取得該 build 的實際錯誤行，沒有把歷史原因改寫成當前實證。
跨端私有搜尋細節只留在擁有者的私有證據頁，不複製到此 public repo。

先加測試、保持原驗證器：3 筆真正寫入 workerd/D1，提交後分別斷線、回傳損壞
JSON、正常回覆。回執只剩 2 個 emit operations；測試 exit 1，實測 `2 !== 3`。
這是回執完整性缺口，沒有證明 DO 單寫者失效。

## 三、角色與平台的作為

Mr.liou 定義擴查與保存方向；Codex 重現、修補、驗證；Miniflare/workerd 提供實際
DO/D1/KV/R2 runtime；GitHub 保存分支與 CI；Notion 保存私有根源與回填。
Cloudflare bot 提供 build 狀態，未提供這次根因。

## 四、我在本輪犯的錯

前版宣稱所有並行請求均被 accounted for，但 operations 在 fetch/text 成功後才
登記，運輸失敗可遺失 key；R04 負對照抓到並修正。前輪的同名回執修補仍有效，
不能將它的成功外推到所有故障情境。本輪數次批次查詢輸出太大而截斷，已從保留的
工具结果定向重讀相關片段；不以被截斷的內容補結論。

## 五、驗不了的 delta

- 生產 build 根因、帳號與 bindings、migration/namespace、既有路由、版本 traffic、
  舊 writers 排空與 production concurrency receipt 均未直接完成驗收。
- Mother/DL580 host receipt、received hash、use/return trace 未取得。
- 強制終止仍可能留下空 reservation；本修補只保證正常結束時收齊已嘗試操作，
  不宣稱 fsync 每筆 journal 或 exactly-once。保留檔案並核對 D1，無自動重送。

## 六、交付物與實測輸出

修補前 targeted regression：exit 1，`every attempted write must survive transport
failures`，actual 2、expected 3。

修補後兩個 deployment-verifier tests：exit 0、2 pass、0 fail。
完整 `npm test`：exit 0、17 tests、17 pass、0 fail、0 skipped，duration 11080.206066 ms。
`npm run typecheck` 與 `WRANGLER_SEND_METRICS=false npm run deploy:check`：exit 0。
dry-run 列出 MRL_CHANNEL_CHAIN/Mrliou_ChannelChain、原 KV、D1、R2 bindings。

六個前置治理 gate 均 exit 0；release baseline 仍為 70 findings、15 artifacts、
4 全數通過、11 有未通過項，未宣告全 repo 清零。後置 gate 與逐檔審計見同名 evidence。

預期六個變更：verifier、既有 tests、README、PROVENANCE、本 session record、同名
evidence。runtime src/index.ts、wrangler.toml、原路由與舊日期 evidence 保持原位元組。

## 七、當前狀態

查：來源、PR、checks 與回執故障已查；修：嘗試在 HTTP 前登記且未知提交不猜定；
建：既有測試加入提交後故障；復盤：保存失敗与成功、治理與檔案稽核；保存：沿既有
PR 分支交付，私有母體頁追加後 fetch 核對。最終 source SHA、CI、回填以實際發布
回執為準，本提交文字不預填尚未回傳的 SHA 或 CI 結果。
工程交付與生產／Mother 實機完成分欄，後兩者仍待直接證據。

## 八、我自己的行為與提問

本輪接受使用者擴查指示，查既有跨端材料；先做故障重現才修補；未詢問已授權的
例行實作選擇；未對他人發訊息。沒有在執行前宣稱結果，計數 0；上列數字取自
已回傳指令。預期六檔標明為預期，實際比對另存 evidence。
沒有修改 main、沒有繞過 Cloudflare 安全驗證、沒有傳送憑證或刪歷史。

## 九、矛盾處

前版 `All requests are accounted for` 僅對 Promise 結算成立，對回執操作清單不成立；
本輪新增在 HTTP 前登記來收斂兩者。CI/local PASS 與 build failed 並存，證據層次
不同。未查到目前 build 日誌副本不表示該日誌或歷史執行不存在。
