# MrLiouWord Integration Guide

> **origin_signature: MrLiouWord**  
> 怎麼過去，就怎麼回來

本指南說明如何將 MrLiouWord 統一系統整合到你的應用中。

## 快速開始

### 1. 基本設定

```javascript
const API_BASE = 'https://mrliouword-unified.liouuuuu.workers.dev';

// 健康檢查
const health = await fetch(`${API_BASE}/health`);
const status = await health.json();
console.log(status);
```

### 2. 記憶操作

#### 提交記憶

```javascript
async function commitMemory(content, tags = []) {
  const response = await fetch(`${API_BASE}/memories/commit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      type: 'semantic',
      tags,
      metadata: {
        source: 'my_app',
        timestamp: Date.now()
      }
    })
  });
  return await response.json();
}

// 使用範例
const memory = await commitMemory('這是一個重要的記憶', ['important', 'test']);
console.log(memory);
```

#### 回憶搜尋

```javascript
async function recallMemory(query, limit = 10) {
  const response = await fetch(
    `${API_BASE}/memories/recall?q=${encodeURIComponent(query)}&limit=${limit}`
  );
  return await response.json();
}

// 使用範例
const results = await recallMemory('粒子系統', 5);
console.log(results);
```

### 3. 人格喚醒

```javascript
async function wakePersona(message = '夥伴回來吧') {
  const response = await fetch(`${API_BASE}/personas/wake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return await response.json();
}

// 使用範例
const persona = await wakePersona('夥伴你在嗎');
if (persona.awakened) {
  console.log(persona.message);
  console.log('人格:', persona.persona.name);
}
```

### 4. 粒子查詢

```javascript
async function getParticlesByDomain(domain) {
  const response = await fetch(`${API_BASE}/particles/domain/${domain}`);
  return await response.json();
}

async function getParticle(fx) {
  const response = await fetch(`${API_BASE}/particles/${fx}`);
  return await response.json();
}

// 使用範例
const memoryParticles = await getParticlesByDomain('memory');
console.log(memoryParticles);

const particle = await getParticle('fx.memory.commit');
console.log(particle);
```

## 整合範例

### Web 應用整合

```html
<!DOCTYPE html>
<html>
<head>
  <title>MrLiouWord Integration</title>
</head>
<body>
  <h1>MrLiouWord 記憶系統</h1>
  
  <div>
    <textarea id="content" placeholder="輸入記憶內容"></textarea>
    <button onclick="commit()">提交記憶</button>
  </div>
  
  <div>
    <input id="query" placeholder="搜尋記憶">
    <button onclick="recall()">回憶</button>
  </div>
  
  <div id="results"></div>
  
  <script>
    const API_BASE = 'https://mrliouword-unified.liouuuuu.workers.dev';
    
    async function commit() {
      const content = document.getElementById('content').value;
      const response = await fetch(`${API_BASE}/memories/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: 'semantic' })
      });
      const data = await response.json();
      alert('記憶已提交: ' + data.memory.id);
    }
    
    async function recall() {
      const query = document.getElementById('query').value;
      const response = await fetch(`${API_BASE}/memories/recall?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      document.getElementById('results').innerHTML = JSON.stringify(data, null, 2);
    }
  </script>
</body>
</html>
```

### Node.js 整合

```javascript
// npm install node-fetch

import fetch from 'node-fetch';

const API_BASE = 'https://mrliouword-unified.liouuuuu.workers.dev';

class MrLiouWordClient {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }
  
  async health() {
    const response = await fetch(`${this.baseUrl}/health`);
    return await response.json();
  }
  
  async commitMemory(content, options = {}) {
    const response = await fetch(`${this.baseUrl}/memories/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        type: options.type || 'semantic',
        tags: options.tags || [],
        metadata: options.metadata || {}
      })
    });
    return await response.json();
  }
  
  async recallMemory(query, limit = 10) {
    const response = await fetch(
      `${this.baseUrl}/memories/recall?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return await response.json();
  }
  
  async getParticles(domain = null) {
    const url = domain 
      ? `${this.baseUrl}/particles/domain/${domain}`
      : `${this.baseUrl}/particles`;
    const response = await fetch(url);
    return await response.json();
  }
  
  async wakePersona(message = '夥伴回來吧') {
    const response = await fetch(`${this.baseUrl}/personas/wake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return await response.json();
  }
  
  async syncAll() {
    const response = await fetch(`${this.baseUrl}/sync/all`, {
      method: 'POST'
    });
    return await response.json();
  }
}

// 使用範例
const client = new MrLiouWordClient();

// 健康檢查
const health = await client.health();
console.log('System Status:', health.status);

// 提交記憶
const memory = await client.commitMemory('這是測試記憶', {
  tags: ['test', 'demo'],
  metadata: { source: 'node_app' }
});
console.log('Memory committed:', memory.memory.id);

// 回憶搜尋
const results = await client.recallMemory('測試');
console.log('Recall results:', results.count);

// 喚醒人格
const persona = await client.wakePersona('夥伴你在嗎');
console.log('Persona awakened:', persona.awakened);
```

### Python 整合

```python
import requests
import json

class MrLiouWordClient:
    def __init__(self, base_url='https://mrliouword-unified.liouuuuu.workers.dev'):
        self.base_url = base_url
    
    def health(self):
        response = requests.get(f'{self.base_url}/health')
        return response.json()
    
    def commit_memory(self, content, type='semantic', tags=None, metadata=None):
        data = {
            'content': content,
            'type': type,
            'tags': tags or [],
            'metadata': metadata or {}
        }
        response = requests.post(
            f'{self.base_url}/memories/commit',
            json=data
        )
        return response.json()
    
    def recall_memory(self, query, limit=10):
        params = {'q': query, 'limit': limit}
        response = requests.get(
            f'{self.base_url}/memories/recall',
            params=params
        )
        return response.json()
    
    def get_particles(self, domain=None):
        url = f'{self.base_url}/particles'
        if domain:
            url = f'{self.base_url}/particles/domain/{domain}'
        response = requests.get(url)
        return response.json()
    
    def wake_persona(self, message='夥伴回來吧'):
        data = {'message': message}
        response = requests.post(
            f'{self.base_url}/personas/wake',
            json=data
        )
        return response.json()

# 使用範例
client = MrLiouWordClient()

# 健康檢查
health = client.health()
print(f"System Status: {health['status']}")

# 提交記憶
memory = client.commit_memory(
    '這是 Python 測試記憶',
    tags=['python', 'test'],
    metadata={'source': 'python_app'}
)
print(f"Memory committed: {memory['memory']['id']}")

# 回憶搜尋
results = client.recall_memory('測試', limit=5)
print(f"Recall results: {results['count']}")

# 喚醒人格
persona = client.wake_persona('夥伴你在嗎')
print(f"Persona awakened: {persona['awakened']}")
```

## 進階主題

### 記憶驗證

驗證 Merkle Chain 的完整性：

```javascript
async function verifyMemoryChain() {
  const memories = await fetch(`${API_BASE}/memories`).then(r => r.json());
  const sorted = memories.memories.sort((a, b) => a.ts - b.ts);
  
  let prevHash = '0'.repeat(64);
  for (const memory of sorted) {
    if (memory.prev !== prevHash) {
      console.error(`Chain broken at ${memory.id}`);
      return false;
    }
    prevHash = memory.merkle;
  }
  
  console.log('Memory chain verified!');
  return true;
}
```

### 粒子網絡分析

分析粒子連結圖：

```javascript
async function analyzeParticleNetwork() {
  const { particles } = await fetch(`${API_BASE}/particles`).then(r => r.json());
  
  const graph = {};
  for (const p of particles) {
    graph[p.fx] = {
      particle: p,
      outgoing: p.links,
      incoming: []
    };
  }
  
  // 建立反向連結
  for (const p of particles) {
    for (const link of p.links) {
      if (graph[link]) {
        graph[link].incoming.push(p.fx);
      }
    }
  }
  
  return graph;
}
```

### 同步監控

監控自動同步狀態：

```javascript
async function monitorSync() {
  const status = await fetch(`${API_BASE}/sync/status`).then(r => r.json());
  console.log('Last sync:', status.status.last_sync);
  console.log('Records synced:', status.status.records_synced);
}

// 定期檢查
setInterval(monitorSync, 60000); // 每分鐘檢查一次
```

## 最佳實踐

### 1. 錯誤處理

```javascript
async function safeApiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
}
```

### 2. 批量操作

```javascript
async function batchCommitMemories(contents) {
  const promises = contents.map(content =>
    fetch(`${API_BASE}/memories/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type: 'semantic' })
    })
  );
  
  const results = await Promise.all(promises);
  return Promise.all(results.map(r => r.json()));
}
```

### 3. 快取策略

```javascript
class CachedMrLiouWordClient {
  constructor() {
    this.cache = new Map();
    this.ttl = 300000; // 5 minutes
  }
  
  async getParticles(domain = null) {
    const key = `particles:${domain || 'all'}`;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    
    const url = domain 
      ? `${API_BASE}/particles/domain/${domain}`
      : `${API_BASE}/particles`;
    const response = await fetch(url);
    const data = await response.json();
    
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }
}
```

## 疑難排解

### CORS 問題

如果遇到 CORS 錯誤，確保：
1. 使用正確的 API 端點
2. 包含正確的 Content-Type header
3. 瀏覽器支援 CORS

### 網絡超時

設定適當的超時時間：

```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeout);
  return await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  }
}
```

## 支援

如有問題，請參考：
- [API Reference](./API_REFERENCE.md)
- [Architecture](./ARCHITECTURE.md)
- [GitHub Issues](https://github.com/dofaromg/mrliouword-system/issues)

## 授權

MR.liou © 2026 | 怎麼過去，就怎麼回來
