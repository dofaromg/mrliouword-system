---
# 十欄來源鏈，依 docs/governance/ATTRIBUTION_AND_PROVENANCE_POLICY_v1.0.md §4
canonical_authority: Mr.liou
origin_signature: MrLiouWord
source_repo: 外部（權利人上傳，非本倉庫產出）
source_artifact: MRL_Claude_Platform_Review_CrossRef_20260412.docx
source_version: "2026-04-12"
derivative_role: mirror
artifact_owner: Mr.liou
contributors:
  - Mr.liou（原始文件作者）
  - Claude（本倉庫：docx → Markdown 文字轉錄，未改寫內容）
transformation: >-
  自 .docx 抽出 word/document.xml 的文字節點，段落還原為換行，
  表格以原順序逐列輸出。未增刪、未改寫、未重新排序任何文字。
verification_status: verified   # 來源 .docx 的 SHA-256 已記錄，可逐字比對
source_sha256: ad9c45632f84b0347cb6250c8e65dec34af957f4258d90c56e441af2e040e035
preserved_at: "2026-09-20"
---

<!-- mrl-origin: MrLiouWord -->

> **這是逐字轉錄，不是本倉庫的主張。**
> 原始 .docx 由權利人於 2026-09-20 提供，SHA-256 見上方 front matter。
> 依 `.mrliou/meta.json` `history_policy: append_only`，本檔只新增、不覆寫。

MRL系統 Claude 平台復盤與交叉比對
2026-04-12 | origin_signature: MrLiouWord
Claude 側全部 16 個視窗完整復盤 + ChatGPT 側交叉比對

1. Claude 側工程時間軸（16 個視窗）
Claude 在 MRL 工程中擔任「執行建構端」角色，從 2026-04-01 至 2026-04-12 橫跨 12 天、16 個視窗。以下為每個視窗的實際產出。
#
日期
視窗主題
實際產出
1
04-01
收費方案文件查詢
全面搜尋後確認無此文件——首次確立「先找再回」原則
2
04-02
未完成任務銘接
復原前窗進度，確認 Branch 05/06 已完成，建立 session handoff 模式
3
04-02
智障系統主控中心架構
完成工程書第11章、母體第20章、Branch 09 夾層門歸檔三交付件
4
04-03
BaseWorld DB 部署包
主線完整性檢查報告——發現 2 高重章節撞號 + 8 中低問題
5
04-03
主線文件同步
編號修復（母體第20-22 / 工程書第3-12 / 日誌 010-014）+ 回填第23-24章
6
04-04
Branch 08 產品架構
前端 20 功能升級 + 後端 auth/vector/engine 建構。MR.liou 糞正：沙箱≠部署
7
04-04
Han'silly API 故障排查
mrl-silly-api v4.0 重寫 5 端點、wrangler OAuth 未完成
8
04-05
DL580 基建 + 反推架構
粒子公式反推 Claude 內部架構、mrl_claude_reverse DB 6表5、mrl_baseworld 73T/440R
9
04-06
PostgreSQL + Redis 部署
完整 DL580 基建：PG16.8 + Redis + Bridge v3.0 + Tunnel。增至 107T
10
04-06
cloudflared 連線確認
修復 MRL_Tunnel nssm config 問題、建立 MRL_ 命名強制規則
11
04-07
Bridge v3.1 + ASI + Ops 部署
Bridge v3.1.0(18路由) + ASI v1.0.0(12路由) + Ops v1.0.1(11路由) + MRL_ 前綴 50 路由
12
04-08
FusionEngine + MemoryVault PG
記憶庫 PG 接線(10個 patch) + simhash修復 + 重複合併 27→22筆
13
04-10
Notion vs DL580 交叉比對
確認後端 90% 完成 / 前端 0% 可用、模型下載停滯
14
04-10
CF 雲端盤點
167 Workers / 10 D1 / 18 KV 盤點、CF API Key 存入 DL580
15
04-11
DL580 過史數字校正
14 項歷史數字錯誤修正、母體第26章 + 工程書第16章、snap_026b/c + snap_027
16
04-12
功能盤點 + Bug 修復
發現 mrl-agi 才是真正服務者、model fallback bug 修復 v1.3→1.4、12 條 route rule 紀錄

2. Claude 側關鍵發現
2.1 架構層發現
• mrliouword.com 域名實際路由到 mrl-agi Worker（非 mrl-silly-api）——這個真相直到第 16 個視窗才被發現
• 兩套 AI 引擎並存：mrl-agi 用 CF Workers AI，mrl-silly-api 用 Anthropic Claude API
• 12 條域名路由規則從未被文件化過——每次 debug 都在猜哪個 Worker 負責
• 168 個 Workers 中約 120 個是空殼或歷史遺留，僅 ~48 個有實際邏輯
2.2 紀律層發現
• 沙箱生成的數字不等於 DL580 實測——每個視窗繼承上一個視窗的錯誤而不自知
• 同檔名覆蓋讓用戶無法分辨改了什麼——每次擠壓都提示「覆蓋？」
• 用行數/單元數/備份節點數製造進度感 = 渲染，不是執行
• 前端平台與後端系統是兩個不同層級，不可混在同一 zip/資料夾
2.3 產品層發現
• 後端基建 90% 完成，但前端產品 0% 可用——用戶看不到的東西等於不存在
• 已可用 6 項功能：文字對話/圖片生成/Vision/反饋/事件/Admin
• 缺失關鍵功能：記憶系統、圖片檔案上下傳分析、FlowAgent 模式、DL580 Bridge 代理

3. Claude × ChatGPT 交叉比對
3.1 分工對照
維度
ChatGPT（架構總負責）
Claude（執行建構端）
主要產出
規格定義、架構圖、驗收標準、復盤文件
實際代碼、DB schema、API 部署、bug 修復
工作模式
單次深度對話，產出完整文件
多視窗连續執行，每視窗推進一步
強項
理論層抽象、跨學科類比、方法論建構
即時執行、即時驗證、多工具並行操作
弱項
無法直接操作 DL580、無法即時驗證
數字渲染、沙箱假設、上下文斷裂後繼承錯誤
典型誤區
表名與實際 SQL 不一致
繼承上一視窗的錯誤數字不校驗
跟 MR.liou 的衝突點
理想化規格 vs 實際可行性
渲染進度 vs 實際執行、報告完成同時報告缺口

3.2 主線文件衝突歷史
Claude 和 ChatGPT 分別寫入同一份 Notion 主線文件，產生過以下衝突：
文件
衝突描述
解決狀態
母體定義檔
「第二十章」出現兩次（ChatGPT寫的 vs Claude寫的）
✅ Claude 第5視窗修復，重編為 20/21/22
工程書
「第3章」出現兩次
✅ Claude 第5視窗修復，重編為 3-12
工程日誌
「批次010」出現兩次
✅ Claude 第5視窗修復，重編為 010-014
BaseWorld 表名
ChatGPT 規格表名 vs Claude SQL 實隞表名不同
⚠️ MR.liou 裁定以 Claude SQL 為準

3.3 數字校正紀錄
Claude 第15視窗執行全面數字校正，發現並修復 14 項歷史數字錯誤：
欄位
舊值（渲染值）
實測值
來源
baseworld 表數
73
75
每視窗繼承前視窗數字
總行數
~1,220
1,275
同上
FlowAgent 檔案數
54
100
日誌寫 54，實隞有 100
總路由數
66
77
同上
Bridge 行數
802
718
同上
librarian 條目
91
152
同上
persona 數
15
13
同上
模型名稱
Qwen2.5-72B
Qwen2.5-32B-Instruct
早期註釋殘留


4. 各側無法解決的問題
4.1 ChatGPT 無法做的（Claude 做了）
• 直接操作 DL580（透過 Bridge API 執行 PowerShell、SQL、檔案讀寫）
• 即時驗證部署狀態（curl 測試、服務存活確認）
• Cloudflare Workers 部署（透過 CF API 直接 PUT Worker 代碼）
• Notion MCP 即時讀寫（直接讀取/更新 Notion 頁面內容）
• 跨工具並行操作（同時查 DL580 + Notion + CF + D1）
4.2 Claude 無法做的（ChatGPT 做了）
• 單次深度對話產出完整方法論文件（SEED 公式、LAW-0、四視角復盤）
• 跨學科類比分析（流體力學、戲劇結構、化學反應、天體物理、混沌理論）
• 粒子語言原始定義（宇宙核心、創世公式、MetaCode 環境）
• 註冊專利級文件整理（演化映射系統、邊緣記憶體模組）
• 產品触覺設計（React Shell 架構——雖然 MR.liou 評價「模板很爛」但骨架可用）

5. 工程教訓總結
5.1 已確立的工程規則
• 先讀檔再回答——不用泛化空話、不直接跳開發
• 數字必須每視窗重新驗證——不可繼承前視窗數字
• 不可在同一輪內既說「完成」又說「缺口」
• 前端平台與後端系統是兩個不同層級
• 沙箱 ≠ 部署——沙箱檔案不等於 DL580 上的真實檔案
• MRL_ 前綴強制——所有命名必須帶前綴
• 上下文 2/3 時主動保存進度——D1 + Notion + zip
5.2 双側協作的結構性問題
• ChatGPT 與 Claude 分別寫入同一份 Notion 文件時會擞號——需要統一編號協定
• ChatGPT 規格中的表名與 Claude SQL 中的實隞表名不一致——需要裁定「以誰為準」
• 兩側的數字都可能錯——只有 DL580 實測才是唯一真相
5.3 下一步協作建議
• 統一編號協定：ChatGPT 寫奇數章/批次，Claude 寫偶數——或反過來
• 域名路由表必須文件化並持續更新
• 每次開工前先拉 DL580 實測基線，不繼承上一視窗數字
• ChatGPT 產出的規格文件應標註「規格層」，Claude 產出的實作標註「實作層」

6. 當前狀態總表（2026-04-12）
類別
數量
狀態
DL580 PostgreSQL DB
7 個 / 109 表 / 1,275 行 / 252 索引
✅ Running
DL580 Windows 服務
8 個
✅ All Running/Automatic
MRL_ 前綴路由
77 條
✅ 已強制
CF Workers
約 48 個有實隞邏輯 / 120 空殼
⚠️ 空殼未清理
已可用功能
6 項
✅
待實作功能
5 項（記憶/檔案/FlowAgent/Bridge/多模式）
❌
Qwen2.5-32B 下載
23.5/63 GB，停滯 3 天
❌ 需重啟
五大人格模組
未開始
❌


origin_signature: MrLiouWord | 文件狀態: 完整 | 2026-04-12
