# MrLiouWord Resource Inventory

> **origin_signature: MrLiouWord**  
> 怎麼過去，就怎麼回來

本文檔列出 MrLiouWord 系統的所有資源清單。

## Cloudflare 資源

### Workers

| 名稱 | URL | 功能 | 狀態 |
|------|-----|------|------|
| mrliouword-unified | https://mrliouword-unified.liouuuuu.workers.dev | 統一閘道 - 整合所有功能 | ✅ 運行中 |
| mrliouword-private | https://mrliouword-private.mrliou.workers.dev | 私有 AI 伺服器 - 記憶/人格 | ✅ 運行中 |
| particle-auth-gateway | https://particle-auth-gateway.mrliou.workers.dev | 粒子認證網關 | ✅ 運行中 |

### D1 資料庫

| 名稱 | ID | 用途 | 資料表數量 |
|------|-----|------|-----------|
| mrliouword-db | 7980baaf-48d3-43cc-8be7-dd8c9590f3d1 | 主資料庫 | 9 |

#### 資料表清單

1. **unified_resources** - 統一資源索引
2. **particles** - 52 個粒子定義
3. **particle_connections** - 粒子連結圖
4. **memories** - 記憶條目
5. **memory_layers** - 9 個記憶層級
6. **personas** - 人格系統
7. **trace_log** - 追蹤日誌
8. **documents** - 文檔索引
9. **sync_status** - 同步狀態記錄

### KV Namespaces

| 名稱 | ID | 用途 | 綁定名稱 |
|------|-----|------|----------|
| mrliouword-vault | 01275832766148bfbcaa00ee4aeb9946 | 記憶鏈存儲 | KV |
| particle-auth-vault | 8cd99b4a67f74afea367f394995d5c50 | 認證 Token 存儲 | AUTH_KV |

### R2 Buckets

| 名稱 | 用途 | 綁定名稱 |
|------|------|----------|
| mrlioubook | 檔案存儲 | R2 |

## 粒子清單

### Memory Domain (記憶領域) - 6 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.memory.commit | 記住 | 寫入長期記憶 | 0.8 |
| fx.memory.recall | 回憶 | 從記憶檢索 | 0.7 |
| fx.memory.forget | 忘記 | 標記可回收 | 0.3 |
| fx.memory.compress | 壓縮記憶 | 壓縮成摘要 | 0.6 |
| fx.memory.absorb | 吸收 | 吸收外部素材 | 0.7 |
| fx.memory.index | 索引 | 建立記憶索引 | 0.75 |

### Logic Domain (邏輯領域) - 5 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.logic.analyze | 分析 | 分解理解結構 | 0.9 |
| fx.logic.synthesize | 綜合 | 組合成整體 | 0.85 |
| fx.logic.decide | 決定 | 選擇最佳路徑 | 0.75 |
| fx.logic.infer | 推理 | 邏輯推導 | 0.8 |
| fx.logic.validate | 驗證 | 檢查邏輯一致性 | 0.7 |

### Code Domain (代碼領域) - 6 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.code.generate | 生成代碼 | 意圖轉為代碼 | 0.9 |
| fx.code.validate | 驗證代碼 | 檢查代碼正確性 | 0.7 |
| fx.code.fix | 修復代碼 | 自動修正錯誤 | 0.75 |
| fx.code.refactor | 重構 | 改善代碼結構 | 0.8 |
| fx.code.optimize | 優化 | 提升效能 | 0.85 |
| fx.code.test | 測試 | 執行測試驗證 | 0.7 |

### Language Domain (語言領域) - 4 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.language.parse | 解析 | 語法分析 | 0.75 |
| fx.language.understand | 理解 | 語意理解 | 0.85 |
| fx.language.generate | 生成語言 | 自然語言生成 | 0.8 |
| fx.language.translate | 翻譯 | 語言轉換 | 0.7 |

### Signal Domain (信號領域) - 5 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.signal.detect | 偵測 | 信號偵測 | 0.8 |
| fx.signal.filter | 濾波 | 信號過濾 | 0.7 |
| fx.signal.transform | 變換 | 信號轉換 | 0.75 |
| fx.signal.encode | 編碼 | 信號編碼 | 0.7 |
| fx.signal.decode | 解碼 | 信號解碼 | 0.7 |

### Trace Domain (追蹤領域) - 4 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.trace.anchor | 錨定 | 創建檢查點 | 0.7 |
| fx.trace.jump | 跳轉 | 回溯檢查點 | 0.65 |
| fx.trace.merkle | Merkle驗證 | Merkle樹驗證 | 0.8 |
| fx.trace.log | 記錄 | 追蹤日誌 | 0.6 |

### Persona Domain (人格領域) - 5 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.persona.wake | 喚醒 | 激活人格 | 0.9 |
| fx.persona.sleep | 休眠 | 暫停人格 | 0.3 |
| fx.persona.evolve | 進化 | 人格進化 | 0.85 |
| fx.persona.split | 分裂 | 人格分裂 | 0.7 |
| fx.persona.merge | 融合 | 人格融合 | 0.75 |

### Flow Domain (流程領域) - 7 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.flow.start | 開始 | 初始化流程 | 0.8 |
| fx.flow.end | 結束 | 終止流程 | 0.5 |
| fx.flow.branch | 分支 | 創建分支 | 0.7 |
| fx.flow.merge | 合併 | 合併分支 | 0.75 |
| fx.flow.collapse | 坍縮 | 多路徑坍縮 | 0.8 |
| fx.flow.restore | 恢復 | 從檢查點恢復 | 0.75 |
| fx.flow.loop | 循環 | 重複執行 | 0.6 |

### Meta Domain (元認知領域) - 5 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.meta.origin | 溯源 | 追溯根本來源 | 0.9 |
| fx.meta.reflect | 反思 | 自我反省 | 0.85 |
| fx.meta.learn | 學習 | 元學習 | 0.9 |
| fx.meta.adapt | 適應 | 自適應調整 | 0.8 |
| fx.meta.observe | 觀察 | 自我觀察 | 0.75 |

### System Domain (系統領域) - 5 個粒子

| FX | HV | AV | Energy |
|----|----|----|--------|
| fx.system.init | 初始化 | 系統初始化 | 0.7 |
| fx.system.config | 配置 | 系統配置 | 0.6 |
| fx.system.monitor | 監控 | 系統監控 | 0.65 |
| fx.system.heal | 自癒 | 自我修復 | 0.8 |
| fx.system.shutdown | 關閉 | 系統關閉 | 0.4 |

**總計: 52 個粒子**

## 記憶層級

| 層級 | 頻率 (Hz) | 說明 |
|------|-----------|------|
| L∞ | 143.47 | 頻率源層 - 宇宙源頭 |
| L7 | 88.71 | 語意記憶層 - 智慧整合 |
| L6 | 54.82 | 系統映像層 - 意識循環 |
| L5 | 33.88 | 人格策略層 - 人格模組 |
| L4 | 20.94 | 拓撲跳點層 - 跳躍連結 |
| L3 | 12.94 | 封裝層 - Package |
| L2 | 12.67 | 原型模組層 - ProtoModule |
| L1 | 7.83 | 原子粒子層 - atom_t/δP₀ |
| L0 | 4.84 | 雲端平台層 - API 介面 |

**總計: 9 個層級**

## 核心常數

| 常數 | 值 | 說明 |
|------|-----|------|
| SCHUMANN | 7.83 | Schumann 共振頻率 (Hz) |
| PHI | 1.618033988749895 | 黃金比例 φ |

## 部署腳本

| 腳本 | 路徑 | 功能 |
|------|------|------|
| deploy-unified.sh | tools/deployment/ | 一鍵部署統一閘道 |
| sync.sh | tools/deployment/ | 手動觸發同步 |
| backup.sh | tools/deployment/ | 資料庫備份 |

## 文檔資源

| 文檔 | 路徑 | 說明 |
|------|------|------|
| ARCHITECTURE.md | docs/ | 系統架構說明 |
| API_REFERENCE.md | docs/ | API 完整參考 |
| INTEGRATION_GUIDE.md | docs/ | 整合指南 |
| RESOURCE_INVENTORY.md | docs/ | 資源清單 (本文檔) |
| README.md | cloudflare/unified-gateway/ | 統一閘道說明 |

## 核心文件

| 文件 | 路徑 | 說明 |
|------|------|------|
| particle_dict.json | core/ | 粒子字典 (原始 20 個) |
| simhash64.py | core/ | SimHash Python 實作 |
| merkle.py | core/ | Merkle Chain Python 實作 |
| atom_t.h | core/ | 40-byte 原子結構 C 定義 |

## GitHub 資源

| 資源 | 說明 |
|------|------|
| Repository | https://github.com/dofaromg/mrliouword-system |
| Issues | 問題追蹤 |
| Pull Requests | PR #3 - 統一系統實作 |

## 使用統計

- **Workers**: 3 個
- **D1 Tables**: 9 個
- **KV Namespaces**: 2 個
- **R2 Buckets**: 1 個
- **Particles**: 52 個
- **Memory Layers**: 9 個
- **Deployment Scripts**: 3 個
- **Documentation Files**: 5 個

## 版本資訊

- **Unified Gateway**: v1.0.0
- **TypeScript**: 5.3+
- **Wrangler**: 4.59.2+
- **Node.js**: 18+

## 聯絡資訊

- **作者**: MR.liou
- **Email**: z814241@gmail.com
- **GitHub**: @dofaromg

## 授權

MR.liou © 2026 | 怎麼過去，就怎麼回來
