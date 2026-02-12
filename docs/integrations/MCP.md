# Model Context Protocol (MCP) 整合指南

> **連接 ChatGPT / Claude Code 到外部工具**
> 
> 版本：v1.0
> 建立日期：2026-02-12
> 協議：Model Context Protocol

---

## 📖 什麼是 MCP？

**Model Context Protocol (MCP)** 是一種標準化協議，用於將 AI 助手（如 ChatGPT、Claude）連接到外部工具和服務。通過 MCP，AI 可以：

- 📊 讀取和寫入資料庫
- 🗂️ 存取檔案系統
- 🌐 調用外部 API
- 🔧 執行自定義工具

---

## 🏗️ MCP 架構

```
┌─────────────────┐
│   AI Assistant  │
│ (ChatGPT/Claude)│
└────────┬────────┘
         │ MCP Protocol
         │
┌────────▼────────┐
│   MCP Server    │
│  (Tool Bridge)  │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    ▼         ▼        ▼        ▼
┌───────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Airtable│ │Figma │ │Asana │ │ ... │
└───────┘ └──────┘ └──────┘ └──────┘
```

---

## 🚀 快速開始

### 安裝 Claude Desktop

1. 下載並安裝 [Claude Desktop](https://claude.ai/download)
2. 啟動應用程式

### 添加 MCP Server

使用以下命令格式添加 MCP server：

```bash
claude mcp add <server-name> --config <config-json>
```

---

## 🔧 支援的 MCP Servers

### 1. Airtable

**類別**：資料庫
**驗證**：API Token
**傳輸**：HTTP

```bash
claude mcp add airtable \
  --config '{
    "transport": "http",
    "auth": {
      "type": "token",
      "token": "YOUR_AIRTABLE_API_TOKEN"
    },
    "endpoint": "https://api.airtable.com/v0"
  }'
```

**功能**：
- ✅ 讀取 Airtable 表格
- ✅ 創建、更新、刪除記錄
- ✅ 查詢過濾與排序

---

### 2. Figma

**類別**：設計工具
**驗證**：OAuth 2.0
**傳輸**：HTTP

```bash
claude mcp add figma \
  --config '{
    "transport": "http",
    "auth": {
      "type": "oauth2",
      "client_id": "YOUR_CLIENT_ID",
      "client_secret": "YOUR_CLIENT_SECRET"
    },
    "endpoint": "https://api.figma.com/v1"
  }'
```

**功能**：
- ✅ 讀取設計檔案
- ✅ 導出圖片資產
- ✅ 查詢組件資訊

---

### 3. Asana

**類別**：專案管理
**驗證**：Personal Access Token
**傳輸**：HTTP

```bash
claude mcp add asana \
  --config '{
    "transport": "http",
    "auth": {
      "type": "token",
      "token": "YOUR_ASANA_PAT"
    },
    "endpoint": "https://app.asana.com/api/1.0"
  }'
```

**功能**：
- ✅ 創建和更新任務
- ✅ 查詢專案與工作區
- ✅ 管理任務狀態

---

### 4. Notion

**類別**：筆記與資料庫
**驗證**：OAuth 2.0 或 Internal Integration Token
**傳輸**：HTTP

```bash
claude mcp add notion \
  --config '{
    "transport": "http",
    "auth": {
      "type": "token",
      "token": "YOUR_NOTION_INTEGRATION_TOKEN"
    },
    "endpoint": "https://api.notion.com/v1"
  }'
```

**功能**：
- ✅ 讀取頁面內容
- ✅ 查詢資料庫
- ✅ 創建和更新頁面

---

### 5. GitHub

**類別**：代碼託管
**驗證**：Personal Access Token
**傳輸**：HTTP

```bash
claude mcp add github \
  --config '{
    "transport": "http",
    "auth": {
      "type": "token",
      "token": "YOUR_GITHUB_PAT"
    },
    "endpoint": "https://api.github.com"
  }'
```

**功能**：
- ✅ 讀取和創建 Issues
- ✅ 管理 Pull Requests
- ✅ 讀取代碼內容

---

### 6. Slack

**類別**：通訊協作
**驗證**：OAuth 2.0 或 Bot Token
**傳輸**：WebSocket / HTTP

```bash
claude mcp add slack \
  --config '{
    "transport": "websocket",
    "auth": {
      "type": "token",
      "token": "YOUR_SLACK_BOT_TOKEN"
    },
    "endpoint": "wss://slack.com/api/rtm.connect"
  }'
```

**功能**：
- ✅ 發送和接收訊息
- ✅ 管理頻道
- ✅ 查詢用戶資訊

---

### 7. Google Drive

**類別**：檔案存儲
**驗證**：OAuth 2.0
**傳輸**：HTTP

```bash
claude mcp add gdrive \
  --config '{
    "transport": "http",
    "auth": {
      "type": "oauth2",
      "client_id": "YOUR_CLIENT_ID",
      "client_secret": "YOUR_CLIENT_SECRET",
      "scopes": ["https://www.googleapis.com/auth/drive"]
    },
    "endpoint": "https://www.googleapis.com/drive/v3"
  }'
```

**功能**：
- ✅ 上傳和下載檔案
- ✅ 搜尋檔案
- ✅ 管理資料夾

---

### 8. PostgreSQL / MySQL

**類別**：關聯式資料庫
**驗證**：使用者名稱 / 密碼
**傳輸**：TCP

```bash
claude mcp add postgres \
  --config '{
    "transport": "tcp",
    "host": "localhost",
    "port": 5432,
    "database": "mydb",
    "auth": {
      "type": "password",
      "username": "user",
      "password": "pass"
    }
  }'
```

**功能**：
- ✅ 執行 SQL 查詢
- ✅ 讀取表結構
- ✅ 資料增刪改查

---

## 🔐 驗證方式

### 1. API Token

最簡單的驗證方式，適用於大多數服務：

```json
{
  "auth": {
    "type": "token",
    "token": "YOUR_API_TOKEN"
  }
}
```

### 2. OAuth 2.0

適用於需要用戶授權的服務：

```json
{
  "auth": {
    "type": "oauth2",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "http://localhost:8080/callback",
    "scopes": ["read", "write"]
  }
}
```

### 3. 用戶名密碼

適用於資料庫等服務：

```json
{
  "auth": {
    "type": "password",
    "username": "user",
    "password": "pass"
  }
}
```

---

## 🌐 傳輸模式

### HTTP / HTTPS

最常見的傳輸方式：

```json
{
  "transport": "http",
  "endpoint": "https://api.example.com"
}
```

### WebSocket

適用於即時通訊：

```json
{
  "transport": "websocket",
  "endpoint": "wss://api.example.com/socket"
}
```

### TCP

適用於資料庫等服務：

```json
{
  "transport": "tcp",
  "host": "localhost",
  "port": 5432
}
```

---

## 🔗 與 MRL 系統整合

### 整合 MRL Particle System

創建自定義 MCP server 連接到 MRL 粒子系統：

```bash
claude mcp add mrliou \
  --config '{
    "transport": "http",
    "auth": {
      "type": "token",
      "token": "YOUR_MRLIOU_MASTER_KEY"
    },
    "endpoint": "https://particle-edge.mrliou.workers.dev"
  }'
```

**可用操作**：
- 📝 寫入記憶（`/memory/commit`）
- 🔍 檢索記憶（`/memory/recall`）
- 🧠 計算注意力（`/attention/compute`）
- 👤 喚醒人格（`/wake`）
- 📊 查看系統狀態（`/status`）

### 範例：記憶寫入

```typescript
// MCP Server 端實現
async function commitMemory(content: string): Promise<any> {
  const response = await fetch(
    'https://particle-edge.mrliou.workers.dev/memory/commit',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': process.env.MRLIOU_MASTER_KEY
      },
      body: JSON.stringify({ content })
    }
  );
  
  return response.json();
}
```

---

## 📚 開發自定義 MCP Server

### 基本結構

```typescript
import { MCPServer, Tool } from '@modelcontextprotocol/sdk';

const server = new MCPServer({
  name: 'my-custom-server',
  version: '1.0.0'
});

// 定義工具
server.addTool({
  name: 'my_tool',
  description: '我的自定義工具',
  parameters: {
    type: 'object',
    properties: {
      input: { type: 'string', description: '輸入參數' }
    },
    required: ['input']
  },
  execute: async (params) => {
    // 工具邏輯
    const result = await doSomething(params.input);
    return { result };
  }
});

// 啟動服務器
server.listen(8080);
```

### 整合到 Claude

```bash
claude mcp add my-custom-server \
  --config '{
    "transport": "http",
    "endpoint": "http://localhost:8080"
  }'
```

---

## 🛠️ 故障排除

### 常見問題

**問題 1：無法連接到 MCP Server**

解決方案：
1. 檢查網絡連接
2. 驗證 endpoint URL 是否正確
3. 確認防火牆設置

**問題 2：驗證失敗**

解決方案：
1. 檢查 API Token 是否有效
2. 確認 OAuth 2.0 配置正確
3. 驗證權限範圍（scopes）

**問題 3：操作超時**

解決方案：
1. 增加超時設置
2. 檢查伺服器負載
3. 優化查詢效率

---

## 🌍 核心簽名

```json
{
  "document": "Model Context Protocol (MCP) 整合指南",
  "version": "v1.0",
  "origin_signature": "MrLiouWord",
  "protocol": "MCP",
  "sealed_at": "2026-02-12T00:00:00.000Z"
}
```

---

## 📖 參考資源

- [MCP 官方文檔](https://modelcontextprotocol.io/)
- [Claude MCP 指南](https://docs.anthropic.com/claude/docs/mcp)
- [MCP SDK GitHub](https://github.com/modelcontextprotocol/sdk)

---

> **「連接一切，整合萬物」**
> 
> MR.liou © 2026 | 怎麼過去，就怎麼回來
