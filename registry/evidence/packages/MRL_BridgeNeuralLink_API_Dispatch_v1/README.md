# MRL BridgeNeuralLink 商業治理與三方 API 派工增量

origin_signature: MrLiouWord

Notion 正典增補頁：https://app.notion.com/p/3e38eeeec5b581ed9b54cc274d3be698

本包承接 `Mrliou_MRL_RooClaudeCode_BridgeNeuralLink_v1`。Notion 為唯一內部定義根源；本包與 Drive 是派生工程／證據副本。`GOVERNANCE_ADDENDUM.md` 含 18 節商業規則增補與指定跨 AI 報告的逐項校正。正式權威修訂仍沿既有 Notion Authority Decision Gate 記錄，本包不能自行核准交易。

## 已實作

- 三個 provider 工作項、SQLite 持久佇列、workspace 冪等鍵、衝突拒絕、交易鎖。
- OpenAI Responses、Anthropic Messages、Gemini generateContent REST adapter；model ID 明示配置，不猜版本。
- 任務、狀態與輸出 SHA256 的回執鏈；斷線／當機結果 UNKNOWN，不自動重送計費。
- 服務端 workspace token 綁定；dispatcher 與 reader 分權；拒絕跨工作區查詢。
- 有期限的規則快照 pin；未啟用 live、缺憑證／模型、規則衝突時留下 BLOCKED 回執。
- `bridge-client.mjs` 提供 submit/result/watch 供既有橋接的服務端任務控制器接入。
- `commercial_gate.py` 核對十二項權利及依賴／退出／證據欄位；只報缺口，不核准商業。

## 目前邊界

LOCAL_VALIDATED / LIVE_NOT_CONNECTED / COMMERCIAL_UNRESOLVED。

這不是已部署的三方聊天控制系統。原生 ChatGPT、Claude、Gemini 視窗各自需要有權限的 reader 連接或讀取回執檔；不能由 API 金鑰直接接管既有聊天會話。模型僅接收 task prompt 與 source_refs，URL 是來源指標，不會自動抓取內容；需要分析的授權材料應明示置入 prompt。

本次沒有修改 DNS、Cloudflare 路由、Vercel、Sites production，沒有發送真實模型請求、清除探針、宣告付款或客戶驗收。測試中的 provider 回覆全是 fixture。

Notion 的快照以明確讀取頁及雜湊保存。`valid_until_epoch=0`、`live_enabled=false` 是交付預設；沒有假裝永久同步 Notion。啟用前應用受信任的 Notion 讀取流程重新核對來源、版次及有效決策，替換派生 policy，重新固定 hash。不可由模型输出修改 policy。

## 相依樹與既有橋接缺口

```text
Notion 世界模型頂層修訂 + 商業／公平治理憲章
  governance/*.json -> policy.json -> dispatch.py (Python >= 3.11 standard library)
    SQLite tasks/jobs/receipts -> authenticated GET /v1/tasks/{id}
    provider REST APIs -> candidate outputs
    bridge-client.mjs (Node >= 18, fetch) -> existing task controller
  GOVERNANCE_ADDENDUM.md -> commercial_gate.py -> registry-example.json
upstream/*.ts (five byte-preserved Drive originals, reference only)
  @roo-code/types + socket.io-client + vscode
  BridgeOrchestrator.ts -> ExtensionChannel.ts (NOT PRESENT in retrieved package)
```

原套件並非可直接執行的獨立 Node server：BaseChannel import `vscode`；BridgeOrchestrator import 缺少的 ExtensionChannel；沒有取得鎖定套件版本。GitHub 預設分支上的文件所述路徑查詢回 404，不能據此斷言全 repo 沒有檔案。本包保留五個原始檔，不編造缺少檔案來冒充原件。

原碼的 `BridgeOrchestrator.connect(options)` 與 `subscribeToTask(TaskLike)` 是實際介面；文件提到的 `getInstance(options).connect()` 不吻合。新 client 不依賴原碼不存在的 `on('taskEvent')`。

接入位置：現有服務端已驗證 workspace 的任務控制器，在收到使用者明示 MRL review 任務時呼叫 `client.submit(...)`；以 `watch` 將回執當文字／資料渲染回該任務視窗。不要把所有 Roo TaskChannel Message 自動轉成派工，也不要讓回執觸發 ApproveAsk。實際 Socket.IO server 未取得，因此這個掛載步驟尚未完成或聲稱通過。

## 本機驗證與启动

```bash
python3 -m unittest -v test_dispatch
node --check bridge-client.mjs
python3 commercial_gate.py registry-example.json
```

使用獨立可寫目錄保存 SQLite；套件檔案及 policy 由 operator 管理。服務只聽 `127.0.0.1:8101`，不修改既有 8099 或 public routing。Windows 可使用 Python 3.11+ 的 `py -3`。

先在本機秘密管理器設定 `MRL_DISPATCH_TOKENS_JSON`，內容為至少 32 字元高熵 token → `{role: dispatcher|reader, workspace: mrl}` 映射。不同身分使用不同 token。不要把實際值貼到聊天或提交 Git。

```bash
python3 dispatch.py --db dispatch.sqlite3 --port 8101
```

尚未啟用 live 時，提交的三個項目會留下 LIVE_DISABLED，不會冒充成功。API：

- `GET /v1/policy`：讀取本次派生 policy 與其 SHA256，需 x-api-key。
- `POST /v1/tasks`：以 `task-example.json` 的 schema 提交，dispatcher token 的 workspace 必須吻合。
- `GET /v1/tasks/{task_id}`：讀取三方工作狀態與完整回執，限同 workspace。

模型實接另需 `OPENAI_API_KEY`、`ANTHROPIC_API_KEY`、`GEMINI_API_KEY`、policy 中有效 model IDs、live_enabled、有效 valid_until_epoch，及環境 `MRL_POLICY_SHA256` 與最終 policy hash 一致。這些設定尚未填入或測試。每任務每供應商最多一次請求，輸出上限 2048 tokens；未提供全帳號費用預算管理。

task 純屬 review_only；不含 shell／工具執行。新 prompt 需要新冪等鍵，同鍵異內容拒絕。UNKNOWN 須先與供應商 request receipt 對帳再由 operator 提出新的補償任務，不自動排程重試。單程序 lock 限制同一 DB 一個 dispatcher；資料庫與檔案 ACL、備份及磁碟加密由部署環境提供。雜湊鏈與 SQLite trigger 不是不可竄改外部公證；DB 管理員仍可改 schema，正式驗收需外部錨定。

## 規則來源與 API 規格

Notion 原文及版次見 governance/*.json，來源原碼的 Drive IDs／時間／大小見 upstream/SOURCES.json。新增規則候選見 Notion 增補頁，未用本地測試冒充 Notion native verified 標記。

- https://developers.openai.com/api/docs/quickstart
- https://platform.claude.com/docs/en/api/messages/create
- https://ai.google.dev/api/generate-content

上述 API adapter 以讀取的官方 REST 格式實作；目前驗證是 fixture transport 與本機 HTTP，尚無各供應商 live 回執。

## 本次仍需外部證據

具名權威 reviewer/approver、實際第三方授權、商品 offer／entitlement 映射、商戶實體與適用法域、客戶條款、正確帳號的資源 binding、真實推論／付款／驗收，均不可用生成字串補齊。治理欄位與缺口處理已具體化，但這些項目仍 UNRESOLVED。
