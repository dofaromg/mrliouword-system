---
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: dofaromg/mrliouword-system
source_artifact: .github/workflows/mrliouword-sdk-ci.yml
source_version: ee98b6fed3f6aae2b4b3afc195089900fa8f1598
derivative_role: generated
artifact_owner: Mr.liou
contributors:
  - OpenAI Codex（工程修補與證據紀錄）
transformation: 固定 Codecov v7.1.1，保留 tokenless、files、matrix flags 與 pytest 命令
verification_status: partial
preserved_at: "2026-10-05"
---

<!-- mrl-origin: MrLiouWord -->

# PR #93 Codecov migration session record

## 一、起點
擁有者要求：「在 branch 上把 coverage upload 從舊的 Codecov v3 遷移到目前支援的版本，優先評估並固定到已發布的 `v7.1.1`；保留現有 `files`、matrix flags 與測試語意。」
完成條件為 Python 3.10／3.11 各 281 tests 與 coverage upload 實測成功。

## 二、查證過程與證據
原 head: aef18eecd44b80909a1b642dccc93381b5036a72。
原 run: https://github.com/dofaromg/mrliouword-system/actions/runs/37252579946
- job 111583128456: 281 passed in 6.81s；Coverage XML written to file coverage.xml。
- job 111583128528: 281 passed in 6.82s；Coverage XML written to file coverage.xml。
- 兩者 Run tests success，Upload coverage failure。
- 原 transport error: `Error: write EPROTO ... SSL routines:ssl3_read_bytes:ssl/tls alert handshake failure ... SSL alert number 40`。此處省略各 process 位址；完整原文保留於原始 GitHub job logs。
- Workflow 與 upload 環境沒有 Codecov token 輸入，也沒有 OIDC。未讀取任何 secret 值。
- 官方 v7.1.1 ref 解析為 303a32d7a59b442fa8d48b6a1cc6825c09c847a5，release commit 日期 2026-09-17；讀回 README.md 與 action.yml 核對 files、flags、fail_ci_if_error 及驗證方式。
- 官方來源：https://github.com/codecov/codecov-action/tree/v7.1.1

## 三、角色與平台的作為
Mr.liou 定義修補範圍與驗收；Codex 讀取原始 workflow、job logs、官方 action 原件，經 GitHub contents API 在既有 PR 分支提交修補。
網頁讀取回 DisabledError，改由 GitHub connector 取得官方原件。main 未寫入。

## 四、我在本輪犯的錯
第一次工具探索條件過廣，輸出遭截斷；後續改為 GitHub 工具名稱精確篩選。未將截斷輸出當成證據。

## 五、驗不了的 delta
Codecov 帳戶端是否允許 public repository tokenless uploads，無帳戶設定讀取證據。保留既有 tokenless 呼叫，以實際 upload 判定；不得自行新增 token 或 id-token 權限。
新版能否排除舊 TLS 問題須由新 run 證實；本紀錄建立時尚未完成新 run。

## 六、交付物與實測輸出
修補 commit: ee98b6fed3f6aae2b4b3afc195089900fa8f1598。
讀回 workflow blob: 4e98c855d53afa2187588eb68f96648f08940037。
修改僅 coverage step：固定官方完整 SHA，增加 fail_ci_if_error: true，保留 files、flags、pytest 與驗證方式。
新 run 37301788626 已建立，當次讀取 status=queued。
未執行本地 Python 或治理腳本，沒有本地 exit code；由 GitHub workflow 執行驗證，不能把舊測試通過充作新 head 通過。
本紀錄提交後會產生另一 head，驗收必須重新對齊最終 head 的 run。

## 七、當前狀態
修補已提交並讀回；最終 head 的 matrix 與 upload 驗收待執行。
原 run 的「MRL 來源鏈欄位檢查」亦 failure，與本次 coverage 修補不同範圍，未修改其規則。
未合併 PR，未更動 secrets、權限、其他 workflow 或程式測試。

## 八、我自己的行為與提問
未要求擁有者重複既有資訊。查明現有驗證方式與官方 inputs 後才提交。
未在指令執行前填入成功結果（0 次）；queued 與 SHA 均來自工具回傳。
沒有將可自決的版本固定與相容修補推回擁有者。fail_ci_if_error 明確保留上傳失敗訊號，避免新版預設 false 掩蓋傳輸錯誤。

## 九、矛盾處
9.1 無已發現的前後結論矛盾。
9.2 舊版與新版預設錯誤處理不同，故明確開啟上傳失敗回報；pytest 語意保留。
9.3 原 job failure 與 281 passed 並不矛盾：不同 step 的結果。
9.4 新 head upload 及 Codecov 端 tokenless 接受條件尚待實測；不宣告 DELIVERY_PASS。
