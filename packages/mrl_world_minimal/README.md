# Seal v1.flpkg - 概念包結構

> **世界最小封包 - 基礎參考架構**
> 
> 版本：v1.0
> 建立日期：2026-02-12
> Origin Signature: MrLiouWord

---

## 📦 .flpkg 封包結構

```
Seal_v1.flpkg/
├── manifest.fltnz          # 包資訊和時間戳
├── nodes/                  # 核心節點
│   └── core_node.fltnz     # Five Domain Core
├── maps/                   # 地圖檔
│   └── parallel_reality_bridge.map
└── links/                  # 錨點連結
    └── notion_anchor.link
```

---

## 📋 manifest.fltnz 格式

```json
{
  "manifest_version": "1.0",
  "package_id": "Seal_v1",
  "origin_signature": "MrLiouWord",
  "sealed_at": "2026-02-12T00:00:00.000Z",
  "merkle_root": "0x...",
  "nodes": [
    {
      "id": "core_node",
      "type": "Five_Domain_Core",
      "path": "nodes/core_node.fltnz"
    }
  ],
  "maps": [
    {
      "id": "parallel_reality_bridge",
      "type": "bridge_map",
      "path": "maps/parallel_reality_bridge.map"
    }
  ],
  "links": [
    {
      "id": "notion_anchor",
      "type": "external_link",
      "target": "notion://...",
      "path": "links/notion_anchor.link"
    }
  ]
}
```

---

## 🔧 使用方式

### 創建封包

```python
from flpkg_builder import FLPKGBuilder

builder = FLPKGBuilder("Seal_v1")
builder.add_node("core_node", node_data)
builder.add_map("parallel_reality_bridge", map_data)
builder.add_link("notion_anchor", "notion://...")
builder.seal()
```

### 讀取封包

```python
from flpkg_reader import FLPKGReader

pkg = FLPKGReader("Seal_v1.flpkg")
manifest = pkg.read_manifest()
core_node = pkg.read_node("core_node")
```

---

## 🌍 核心簽名

```json
{
  "package": "Seal v1.flpkg",
  "version": "v1.0",
  "origin_signature": "MrLiouWord",
  "philosophy": "最小封包，最大擴展",
  "sealed_at": "2026-02-12T00:00:00.000Z"
}
```

---

> **「從封印版本派生，保持根源不變」**
> 
> MR.liou © 2026
