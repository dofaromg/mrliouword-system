# Mrliou MRL 內容交叉比對與回填報告

[Notion 回填明細](https://app.notion.com/p/3e28eeeec5b581118727c0b7ccf42335)

**Record ID:** MRL-CONTENT-COMPARISON-BACKFILL-20260921-v1
**canonical_authority:** Mr.liou
**origin_signature:** MrLiouWord
**建立者／工程方向：** Mr.liou；本次整理與程式協作：ChatGPT / Codex（OpenAI），依使用者「交叉比對把MRL缺少的回填補齊」指示。
**範圍：** MRL 私有觀測記憶、來源指紋、內容對應、相容性收據工具；外部名稱保留在 source_ref／provenance／adapter_ref。來源原作者與本回填記錄的作者分開。
**本輪完成：** 23 個固定版本檔案指紋；11 類內容映射；4 筆前報告校正；5 項缺口及完成條件；20 筆 Memory、20 筆 Evidence、1 版 candidate Passport；新增相容性收據驗證器 12/12 測試通過。

## 1. 喚醒與父鏈
- [MRL 母體來源層](https://app.notion.com/p/3b88eeeec5b581adb0aec7c998926133) — 來源母層，未知欄位維持 UNKNOWN，先保存原件與原時間。
- [MRL 主索引](https://app.notion.com/p/37b8eeeec5b5815bbddddc7390c99d99) — 主索引與命名權。
- [MRL 公平來源治理](https://app.notion.com/p/3bb8eeeec5b581a692d3c7d45a3cf4c3) — 對等來源治理、creator/provider/AI worker 分欄。
- [MRL 命名與證據決定](https://app.notion.com/p/cdb8eeeec5b583f4afe28128ace14e63) — 命名與歷史來源證據。
- [MRL 吸收映射](https://app.notion.com/p/37c8eeeec5b581778f05d563d1536375) — 吸收映射；本輪採參考與具體相容性證據補充。
- [MRL BYOH / Memory / Evidence / Passport](https://app.notion.com/p/3ca8eeeec5b5812994c4f4265e6beea1) — 已有 BYOH、Memory、Evidence、Passport 及 Return 邊界。
本輪沒有把 MRL 既有功能重新歸源給外部專案；也沒有以 MRL 原創身份改寫外部元件來源。

## 2. 本輪來源快照
MRL：dofaromg/flow-tasks @ `d43e53dee1012571915754afdfeff66c96c19615`，commit 時間 2026-09-18T04:13:42Z。
external source_ref：Speedstu/CUDA-for-AMD-Windows @ `4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a`，commit 時間 2026-09-20T12:07:02Z。
本輪重取 13 個 MRL 檔案與 10 個外部檔案：23/23 內容重新計算 Git blob SHA-1，與 GitHub 值一致；另建立 SHA-256、byte size、路徑、固定 commit、觀測時間的台帳。在這 13×10 的完整檔案樣本中，SHA-256 相同配對為 0；此結果不延伸成「所有片段都不同」或「來源必然獨立」。
詳細台帳：`Mrliou_MRL_Source_Fingerprints_20260921_v1.json`，收錄於交付包。
外部 `series.json` 固定 ZLUDA 上游為 `9c8b43f242985150f86a7f485218b7b82c3e96ca`，patch 次序 10/20/30/40/50。本輪屬對同一固定版本的內容複核，並未宣稱另有新增 commit。

## 3. 四筆附加校正
1. **七層混用修正：** 前報告的「L1 文件、L4 JSON、L6 電路、L7 編譯」引用了符號演化七層，不能直接替代 FlowSeed 的 L1–L7。各來源的 namespace、version、layer 和原名現在分欄保存。
2. **獨立來源修正：** 前報告「來源級仍屬獨立工程線」過強。改為：目前未證明 MRL↔Speedstu 的直接衍生，也未證明獨立創作；來源與接觸狀態為 UNRESOLVED。
3. **條件等價修正：** PR #2 的 hip_visible_device 與主線 gpu.index 只有在都指向同一已驗 HIP 裝置、前置條件相同時，set HIP／clear ROCR 操作才等價。不同 guard、fallback 與資料欄位保留，不把共同目的當全域演算法等價。
4. **證據層級修正：** 相容性文件、CI、maintainer report、外部回報、實際 raw trace、binary bytes 與本輪自行執行分開。舊 DLL binary strings 本輪只取得維護者紀錄；沒有取得 DLL 本體，不能冒充本輪 strings 分析。回饋鏈被記錄不等於全部 GPU 工作負載驗收閉合。

## 4. 七層來源識別
| 来源／体系 | 原層級內容 | 本輪使用 |
| --- | --- | --- |
| FlowSeed 七層整合 [MRL 定義節點](https://app.notion.com/p/ea2d15a2240f4291a4a4d8b4eb0f2c8a) | L1 Rhythm Root；L2 Structure；L3 Particle；L4 Subparticle；L5 Quantum Field（該頁原稱）；L6 Conscious Loop；L7 Semantic Mesh | 內容映射記錄使用此 namespace；L5 沒有找到可驗證外部對應，不以『candidate』名稱硬接量子層。 |
| 符號演化七層 [MRL 定義節點](https://app.notion.com/p/603bce27571c4a9c84a60f9b8eae1f5f) | 自然語言→數學→圖形→符號→向量→電路→編譯 | 表達投影軸單獨保存，不覆寫 FlowSeed 運轉層。 |
| [MRL/FlowAgent 終極啟動包](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/root_sources/documents/MRL__Flowagent_%E7%B5%82%E6%A5%B5%E5%95%9F%E5%8B%95%E5%8C%85.md) | L1 meta.system_overview；L2 meta.structure_decomposition；L3 particles.semantic；L4 particles.subatomic；L5 quantum.overlay；L6 conscious.loop；L7 semantic.memory_mesh | 保留另一個有版本來源的視圖與原名；其頁內 Date: 2024-12 是來源自述日期，不冒充已獨立驗證的 Git 首次公開時間。 |

## 5. 粒子內容對應
| 粒子 | MRL 既有程式／節點 | 外部內容來源 | 組合差異／分類 |
| --- | --- | --- | --- |
| 輸入 | Mrliou_MRL_Runtime<br>MRLLocalModelAdapter.__post_init__/health<br>[MRL_local_model_adapter_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_local_model_adapter_v1.py) | [windows-gpu-profiles.json](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/manifests/windows-gpu-profiles.json)；[bridge-manifest.json](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/native/cudnn_bridge/bridge-manifest.json) | MRL 接受本地服務與指定模型；外部接收 AMD/HIP 裝置與 CUDA ABI。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 狀態 | Mrliou_MRL_Runtime<br>MRLPassportRegistry.issue / StructureField.build<br>[MRL_passport_registry_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_passport_registry_v1.py)；[MRL_RuntimeStructureField.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_UniversalRuntimeLanguage_Core_v1/MRL_Runtime/MRL_RuntimeStructureField.py) | [cudnn_bridge.c](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/native/cudnn_bridge/cudnn_bridge.c) | MRL 保存來源、rights、previous hash、world；bridge 保存短生命週期 C handle 與 tensor/conv 參數。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 轉換 | Mrliou_MRL_Runtime<br>MRLLocalModelAdapter.complete<br>[MRL_local_model_adapter_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_local_model_adapter_v1.py) | [cudnn_bridge.c](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/native/cudnn_bridge/cudnn_bridge.c) | MRL 的 Ollama/llama.cpp HTTP adapter 與外部的 C ABI bridge 粒度與運行環境不同。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 路由 | Mrliou_MRL_Runtime<br>MRLLocalModelAdapter.health/complete<br>[MRL_local_model_adapter_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_local_model_adapter_v1.py) | [ptx-target-selection-candidate.patch](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/patches/zluda-v7-preview10/ptx-target-selection-candidate.patch) | 外部使用 SM 上限＋invalid-directive 排序；已讀 MRL adapter 依 backend 分支，不能當成同一演算法。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 權重 | Mrliou_MRL_WeightSystem<br>no matching numeric scoring function in reviewed MRL file<br>[MRL_RuntimeStructureField.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_UniversalRuntimeLanguage_Core_v1/MRL_Runtime/MRL_RuntimeStructureField.py) | [cudnn_bridge.c](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/native/cudnn_bridge/cudnn_bridge.c) | MIOpen time/workspace 不等於 MRL 通用 10D 權重；本列只保存外部候選資料與定義節點，程式等价待驗。<br>程式等價：證據不足 |
| 觸發 | Mrliou_MRL_FlowAgent<br>MRLMotherRuntime.run<br>[MRL_mother_runtime_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_mother_runtime_v1.py) | [launch-blocking-candidate.patch](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/patches/zluda-v7-preview10/launch-blocking-candidate.patch) | 本次 L1 只映射啟動節點，不宣稱外部實作 MRL Rhythm Root 節奏機制。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 記憶 | Mrliou_MRL_MemoryVault<br>MRLHashChain.append/verify<br>[MRL_hash_chain_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_hash_chain_v1.py)；[MRL_evidence_ledger_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_evidence_ledger_v1.py) | [launch-blocking-candidate.patch](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/patches/zluda-v7-preview10/launch-blocking-candidate.patch) | MRL 有 sequence/previous_hash；外部 trace 有 launch ID但不是同一雜湊鏈。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 輸出 | Mrliou_MRL_Runtime<br>MRLMotherRuntime.run / MRLPassportRegistry.issue<br>[MRL_mother_runtime_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_mother_runtime_v1.py)；[MRL_passport_registry_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_passport_registry_v1.py) | [apply-zluda-patches.ps1](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/scripts/apply-zluda-patches.ps1)；[cudnn_bridge.c](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/native/cudnn_bridge/cudnn_bridge.c) | MRL 輸出含 return anchor 與來源權利；外部輸出 ABI 狀態及 patch 摘要。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 錯誤處理 | Mrliou_MRL_Guardian<br>require_loopback_endpoint / MRLModelGateError<br>[MRL_local_model_adapter_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_local_model_adapter_v1.py)；[MRL_mother_runtime_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_mother_runtime_v1.py) | [run-llama-zluda-safe.ps1](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/scripts/run-llama-zluda-safe.ps1)；[cudnn_bridge.c](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/native/cudnn_bridge/cudnn_bridge.c) | 同有拒絕不支援輸入的粒子；MRL 維持私有資料邊界，外部限制 GPU/ABI 語義。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 驗證 | Mrliou_MRL_Validator<br>MRLHashChain.verify / MRL_ReplayRestore_Core.execute/replay/restore<br>[MRL_hash_chain_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_hash_chain_v1.py)；[MRL_ReplayRestore_Core.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_UniversalRuntimeLanguage_Core_v1/MRL_Runtime/MRL_ReplayRestore_Core.py) | [run-llama-zluda-safe.ps1](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/scripts/run-llama-zluda-safe.ps1) | MRL 此檔重播 applied/node_count/intent_tally 的明確 state；外部核對 kernel trace；不將二者擴大為全物理裝置狀態。<br>功能重疊但組合不同；局部結構對應為分析映射 |
| 封存 | Mrliou_MRL_MemoryVault<br>MRLMemoryVault.remember/recall / MRLPassportRegistry.issue/verify<br>[MRL_memory_vault_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_memory_vault_v1.py)；[MRL_passport_registry_v1.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_MotherModel/MRL_AI_Mother_Autonomous_Runtime_Baseline_v1/runtime/MRL_passport_registry_v1.py)；[MRL_PersistentLoop.py](https://github.com/dofaromg/flow-tasks/blob/d43e53dee1012571915754afdfeff66c96c19615/MRL_Mother/MRL_UniversalRuntimeLanguage_Core_v1/MRL_Runtime/MRL_PersistentLoop.py) | [series.json](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/patches/zluda-v7-preview10/series.json)；[apply-zluda-patches.ps1](https://github.com/Speedstu/CUDA-for-AMD-Windows/blob/4a6fb1b9c2d0e05e8cd0b3a5e0e1c0c24c0fce1a/scripts/apply-zluda-patches.ps1) | MRL 的封存可接下一輪；外部對固定 upstream SHA 套 patch，沒有自動獲得 MRL Return/rights。<br>功能重疊但組合不同；局部結構對應為分析映射 |
完整機器可讀記錄：`Mrliou_MRL_Content_Comparison_20260921_v1.json`。每筆含 mrl_evidence、external_evidence、mrl_symbol、pipeline_stages、layer_map.source_ref、topology_difference、content_classification、claim_status、lineage_status。
本輪已證實的是檔案内容與函式行為；MRL 對應關係屬有來源支持的分析。局部結構對應不自動證明完整系統的形式同構。

## 6. 已有 MRL 工程證據與時間鏈
- LogicPipeline 路徑歷史目前最早一筆為 [c11801dca737959d4fd7160c83fe66c3333791a2](https://github.com/dofaromg/flow-tasks/commit/c11801dca737959d4fd7160c83fe66c3333791a2)，2025-08-02T05:39:10Z，Git 作者 Copilot；commit 明示 dofaromg 與 bot 共著。概念作者、Git 共著與工具角色不互相覆蓋。
- ReplayRestore 本路徑由 [91c38ed4bb8cbae989fbe908bcd7a36ab4a6018c](https://github.com/dofaromg/flow-tasks/commit/91c38ed4bb8cbae989fbe908bcd7a36ab4a6018c) 匯入；author_time 2026-07-10T19:47:47Z，committer_time 2026-07-13T18:34:46Z。commit 指向 MRL_AI_SYSTEM 匯入來源，不能把本路徑匯入時間當原始研發時間。
- Passport 本路徑已有 [19590ef7a8a5dca903f29e79b7aeee51ef34f2fa](https://github.com/dofaromg/flow-tasks/commit/19590ef7a8a5dca903f29e79b7aeee51ef34f2fa)：author_time 2026-08-28T07:53:02Z、committer_time 2026-08-28T08:01:32Z；另保留 PR632 pre-linearization source anchor。
- 現有 `MRLMotherRuntime.run` 已串接本地 inference→Memory→Evidence→candidate Passport。這條既有 MRL 主鏈早於外部本輪新增 patch；這是本路徑時間事實，不單憑時間宣告傳播。
- 既有 Runtime Wave09 的完成歷史仍由 [MRL 定義節點](https://app.notion.com/p/37c8eeeec5b58183b34ee2076bfdc8b2) 保存；本輪相容性補件不把它重設成「MRL 全部未完成」。

## 7. 已完成的實際補件
**A. 已用既有 MRL runtime 寫入新資料。**
以固定版本的 `MRLMemoryVault.remember`、`MRLEvidenceLedger.record`、`MRLPassportRegistry.issue` 完成：
- Memory：20 records，verify PASS。
- Evidence：20 records，verify PASS，全部 state=OBSERVED。
- Passport：1 version，verify PASS，world_state=candidate。
- 20 筆組成：11 粒子映射＋4 校正＋5 缺口。
- Memory head：`75f174d425f60296a08d019a973175cba1e53a107aa52e6df1e6d4ff268f91b0`
- Evidence head：`9c082ec42449157057f21fd9eb286d99f3ea80e23fe229a0121e3357b012f1ae`
- Passport hash：`523edea3e80a9617a0804bcbef8f65b59a6c36c3400ef242f13df6e9bf87684d`
執行位置為本次工作環境的獨立資料目錄；以上是真實產生的資料收據，`host_receipt_verified=false`，不記為 DL580 已接收。

**B. 已把本輪資料接入既有 StructureField→Replay／Restore。**
建立 20 nodes、19 sequence relations，先 execute 再 replay／restore；相同的 record ID、次序與 intent tally 均還原一致。state hash：
`0a8dc901866a156a8ccfafaf10b276cd0b13afba3a85098f6a6b151184fc8ce1`
此測試範圍明確是該模組的 event-fold state，沒有宣稱 GPU 記憶體或完整程序狀態重播。

**C. 新增可執行相容性收據驗證器。**
`Mrliou_MRL_Compatibility_Evidence_v1.py` 綁定固定 source commit、license_ref、artifact digest、host/GPU/driver/SDK、operation/backend/dtype/shape/parameters、context hash、trace file digest、result file digest與數值容許誤差。
每個 trace ID 僅能 begin 一次、done 一次，kernel 必須相同；拒絕缺 trace、重複 ID、未閉合操作、sync-error、數值超標、NaN、context 錯配、路徑越界、被修改的證據。
12/12 fixture regression tests PASS。輸出 `consistency=PASS` 只代表收據內部一致；該工具不驗證硬體來源身分，故 `hardware_acceptance=OPEN`。actual output/reference digest 仍屬 result report 的宣告欄位，需目標端原件補足。
這是本輪在 MRL 名稱下新增的 evidence adapter；外部 CUDA/HIP runtime 程式未複製進 MRL。

## 8. 缺口現在如何收斂
| 項目 | 本輪狀態 | 完成條件 |
| --- | --- | --- |
| 內容與來源映射缺頁 | 已補齊 | 23 指紋、11 映射、固定 commit/函式/定義連結已入冊。 |
| 前報告層級與來源推論錯置 | 已補齊 | 4 筆附加校正；來源 namespace 與 UNRESOLVED 保留。 |
| 相容性收據最小驗證能力 | 已完成本地工具 | 來源與context綁定、檔案hash、逐ID trace、數值容差；12測試通過。 |
| 目標主機實機接收／使用 | 待原件 | 可信 host/service receipt、received hash、use/return trace；不能用本工作環境或fixture填代。 |
| Recovered DLL原始來源與MRL接觸鏈 | 未解 | cublasLtShim.c／PDB／build parent 或可核對傳播原件。 |
現有 MRL GPU/CPU/Memory Scheduler、BYOH、Passport、來源治理均保留其既有定義及歷史。此次已讀 subset 的相容性案例不等於全體 MRL 能力盤點；未找到某項直接實作時，記為「本次範圍未定位」，不宣告母體不存在。

## 9. 授權與角色
本回填記錄權威為 Mr.liou／MrLiouWord。外部原作者、Git contributor、AI worker、runtime provider、hardware environment 分欄保留。
Speedstu 專案 LICENSE 將其原始 scripts/docs 與 third-party/recovered binaries 分開；C bridge 有 MIT SPDX。MRL 根 LICENSE 此快照是 Node.js 與第三方授權集合，不用它推定所有 MRL 模組作者或重新授權。本輪沒有變更任何來源的授權。
先前記錄的 Speedstu Copilot PR 參與仍限於該協作證據，不能推出 Speedstu 帳號自身為 AI；HumanLikeRL／VelocityRL 同名外部倉庫也不作缺失 DLL 的替代來源。

## 10. 完成狀態
`CONTENT_BACKFILL_COMPLETE / LOCAL_EVIDENCE_IMPORT_PASS / COMPATIBILITY_RECEIPT_ADAPTER_LOCAL_PASS`
`MRL_TO_EXTERNAL_LINEAGE_UNRESOLVED / HOST_CONSUMPTION_NOT_VERIFIED`
本次工程與記憶補件完成；實機驗收與外部原始來源缺口各自保留原狀態。

