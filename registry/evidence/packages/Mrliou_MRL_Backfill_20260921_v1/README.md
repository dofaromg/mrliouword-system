# Mrliou MRL 內容交叉比對回填包

canonical_authority: Mr.liou  
origin_signature: MrLiouWord  
程式與整理協作：ChatGPT / Codex，依 Mr.liou 指示。

先讀 `Mrliou_MRL_Backfill_Report_20260921_v1.md`。Notion 主記錄：
https://app.notion.com/p/3e28eeeec5b581118727c0b7ccf42335

本包含 11 個粒子映射、4 個校正、5 個缺口狀態，共 20 個觀測事件。
`runtime_records/` 是用 MRL 既有固定版本程式實際生成的獨立資料；
20 筆 Memory、20 筆 Evidence、1 版 candidate Passport 的驗證收據均在包內。
目標 DL580 / 既有運行服務的接收尚未驗證。本包不自動合併任何既有台帳。

## 執行相容性收據驗證

Python 3.12 已驗證，僅使用標準函式庫。進入解壓後的資料夾：

```sh
python -m unittest -v test_Mrliou_MRL_Compatibility_Evidence_v1.py
python Mrliou_MRL_Compatibility_Evidence_v1.py examples/fixture/receipt.json --evidence-root examples/fixture
```

範例明確為 fixture，來源與硬體欄位均為示例值。它驗證 schema、context 綁定、
本地證據檔案 SHA-256、逐 ID 的 begin / done 閉合與宣告數值誤差。
範例和測試通過均不構成實機收據；工具輸出 `hardware_acceptance=OPEN`。
result 中 output / reference hash 仍是宣告欄位，未驗證相應原始輸出檔案內容。
填入真實材料時，應另保存 host 身份、原始輸出、reference、接收與使用證據。

## 以既有 MRL Runtime 重建一份獨立記憶資料

使用已有的 dofaromg/flow-tasks 固定版本：
`d43e53dee1012571915754afdfeff66c96c19615`。

```sh
python Mrliou_MRL_Source_Backfill_Import_v1.py \
  --dataset Mrliou_MRL_Content_Comparison_20260921_v1.json \
  --runtime-dir /path/to/flow-tasks/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime \
  --output-dir /path/to/NEW_MRL_observation_directory
```

輸出目錄必須尚未存在。匯入器會核對所用 MRL 模組的 Git blob SHA-1，
再呼叫既有 MemoryVault、EvidenceLedger 和 PassportRegistry。
本包保留來源指紋與固定版本連結，不重散布 GitHub 的程式副本。
匯入程式不進行網路下載，也不會向既有主機或 canonical ledger 寫入。
重跑時的新時間戳可能產生不同鏈頭；包內收據證明本次原始執行。

## 驗證交付檔案

`SHA256SUMS` 涵蓋除自身以外的每個交付檔案。
可在支援的系統執行 `sha256sum -c SHA256SUMS`。
`MRL_Notion_Readback_Receipt.json` 保存五頁回讀和原有章節保留檢查。
`MRL_Test_Result.json` 是交付目錄實際測試結果，scope 為本地 fixture。
`MRL_replay_receipt.json` 的還原範圍是 20 個觀測事件 ID、次序與 intent tally。

原創者、Git 協作者、AI 工作者和外部 runtime provider 維持分欄。
內容相似分類與來源傳播判定分開；未解欄位不以推論補成事實。

