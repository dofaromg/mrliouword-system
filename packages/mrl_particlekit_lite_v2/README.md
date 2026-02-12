# MRL ParticleKit Lite v2

> **語言轉換為語義粒子結構並封存記憶**
> 
> 版本：v2.0
> 建立日期：2026-02-12
> Origin Signature: MrLiouWord

---

## 📖 概述

**MRL ParticleKit Lite** 是一個輕量級工具包，用於將自然語言轉換為語義粒子結構並封存記憶。它提供了基本的語素封存與壓縮工具，是系統語意處理的基礎模組。

### 核心功能

- 🔄 **自動人格對應**：自動識別和映射人格特徵
- 📝 **Trace 回寫與壓縮**：記錄執行軌跡並壓縮存儲
- 🔤 **Token→語素轉換**：將 Token 序列轉換為語義語素
- 🧮 **Tensor 編譯**：將語義結構編譯為張量表示

---

## 🏗️ 架構

```
MRL ParticleKit Lite v2
├── auto_composer.py      # 自動組合器
├── trace_compressor.py   # 軌跡壓縮器
├── tensor_compiler.py    # 張量編譯器
├── fx_register.json      # 效果註冊表
├── demo_cli.py           # 命令行示範
└── README.md             # 本文檔
```

---

## 🚀 快速開始

### 安裝依賴

```bash
pip install numpy msgpack simhash
```

### 使用命令行工具

```bash
# 運行示範
python demo_cli.py

# 使用自動組合
python demo_cli.py --input "這是一段測試文本" --output result.fltnz
```

### 使用 Python API

```python
from auto_composer import auto_compose

# 自動組合語義粒子
result = auto_compose(
    text="粒子系統的核心是頻率共振",
    layer="L7",
    persona="Mrl_Zero"
)

print(result)
# {
#   "particles": [...],
#   "simhash": "0x...",
#   "compressed_trace": [...],
#   "tensor": [...]
# }
```

---

## 📦 模組說明

### 1. auto_composer.py - 自動組合器

將輸入文本自動轉換為語義粒子結構。

**核心函數**：

```python
def auto_compose(
    text: str,
    layer: str = "L7",
    persona: str = None,
    compress: bool = True
) -> dict:
    """
    自動組合語義粒子
    
    參數:
        text: 輸入文本
        layer: 目標層級 (L1-L7)
        persona: 人格標識
        compress: 是否壓縮輸出
        
    返回:
        {
            "particles": List[Particle],
            "simhash": str,
            "compressed_trace": bytes,
            "tensor": np.ndarray
        }
    """
    pass
```

**特性**：
- ✅ 自動分詞與語素提取
- ✅ SimHash64 語意指紋計算
- ✅ 層級自適應編碼
- ✅ 人格特徵映射

**示例**：

```python
from auto_composer import auto_compose

result = auto_compose(
    text="萬物本一體，頻率是鑰匙",
    layer="L5",
    persona="Mrl_Zero",
    compress=True
)

# 保存為 .fltnz 格式
import msgpack
with open("output.fltnz", "wb") as f:
    f.write(msgpack.packb(result))
```

---

### 2. trace_compressor.py - 軌跡壓縮器

記錄和壓縮執行軌跡，支援完整的歷史回溯。

**核心函數**：

```python
def compress_trace(
    trace: List[dict],
    algorithm: str = "zstd"
) -> bytes:
    """
    壓縮執行軌跡
    
    參數:
        trace: 軌跡列表
        algorithm: 壓縮算法 (zstd/gzip/lz4)
        
    返回:
        壓縮後的二進制數據
    """
    pass

def decompress_trace(
    compressed: bytes,
    algorithm: str = "zstd"
) -> List[dict]:
    """
    解壓縮執行軌跡
    
    參數:
        compressed: 壓縮數據
        algorithm: 壓縮算法
        
    返回:
        原始軌跡列表
    """
    pass
```

**軌跡格式**：

```python
trace = [
    {
        "step": 1,
        "operation": "tokenize",
        "input": "原始文本",
        "output": ["token1", "token2"],
        "timestamp": "2026-02-12T00:00:00.000Z",
        "layer": "L7"
    },
    {
        "step": 2,
        "operation": "compute_simhash",
        "input": ["token1", "token2"],
        "output": "0x1234567890abcdef",
        "timestamp": "2026-02-12T00:00:01.000Z",
        "layer": "L7"
    }
]
```

**示例**：

```python
from trace_compressor import compress_trace, decompress_trace

# 壓縮軌跡
compressed = compress_trace(trace, algorithm="zstd")
print(f"壓縮率: {len(compressed) / len(str(trace)):.2%}")

# 解壓縮
restored = decompress_trace(compressed, algorithm="zstd")
assert restored == trace
```

---

### 3. tensor_compiler.py - 張量編譯器

將語義結構編譯為張量表示，支援神經網絡處理。

**核心函數**：

```python
def compile_to_tensor(
    particles: List[dict],
    embedding_dim: int = 768
) -> np.ndarray:
    """
    將粒子列表編譯為張量
    
    參數:
        particles: 粒子列表
        embedding_dim: 嵌入維度
        
    返回:
        shape = (num_particles, embedding_dim) 的張量
    """
    pass

def tensor_to_particles(
    tensor: np.ndarray,
    metadata: dict
) -> List[dict]:
    """
    將張量解碼回粒子列表
    
    參數:
        tensor: 輸入張量
        metadata: 元數據（用於反向解碼）
        
    返回:
        粒子列表
    """
    pass
```

**編譯流程**：

```
1. 語素提取    → 2. SimHash 計算
       ↓                ↓
3. 頻率映射    → 4. 張量編碼
       ↓                ↓
5. 層級標記    → 6. 輸出張量
```

**示例**：

```python
from tensor_compiler import compile_to_tensor, tensor_to_particles

particles = [
    {"content": "粒子", "layer": "L7", "simhash": "0x..."},
    {"content": "頻率", "layer": "L5", "simhash": "0x..."}
]

# 編譯為張量
tensor = compile_to_tensor(particles, embedding_dim=768)
print(tensor.shape)  # (2, 768)

# 反向解碼
restored = tensor_to_particles(tensor, metadata={"particles": particles})
```

---

### 4. fx_register.json - 效果註冊表

記錄所有可用的效果和轉換規則。

**格式**：

```json
{
  "version": "2.0",
  "origin_signature": "MrLiouWord",
  "effects": [
    {
      "id": "fx_001",
      "name": "frequency_resonance",
      "description": "計算頻率共振",
      "layer": "L5",
      "params": {
        "base_freq": 33.88,
        "phi": 1.618033988749895
      }
    },
    {
      "id": "fx_002",
      "name": "simhash_distance",
      "description": "計算 SimHash Hamming 距離",
      "layer": "L7",
      "params": {
        "threshold": 3
      }
    }
  ]
}
```

---

## 🔧 命令行工具

### demo_cli.py

```bash
# 基本使用
python demo_cli.py --input "輸入文本" --output result.fltnz

# 指定層級和人格
python demo_cli.py \
  --input "輸入文本" \
  --layer L5 \
  --persona Mrl_Zero \
  --output result.fltnz

# 查看軌跡
python demo_cli.py \
  --input "輸入文本" \
  --trace trace.json \
  --verbose

# 不壓縮輸出
python demo_cli.py \
  --input "輸入文本" \
  --no-compress \
  --output result.json
```

---

## 📊 檔案格式

### .fltnz 格式（MessagePack）

```python
{
  "version": "2.0",
  "origin_signature": "MrLiouWord",
  "timestamp": "2026-02-12T00:00:00.000Z",
  "layer": "L7",
  "persona": "Mrl_Zero",
  "particles": [
    {
      "content": "...",
      "simhash": "0x...",
      "frequency": 88.71
    }
  ],
  "tensor": [...],  # NumPy array
  "compressed_trace": b"..."  # 壓縮的執行軌跡
}
```

---

## 🔗 與 MRL 系統整合

### 與 atom_t 結構整合

```python
import struct
from auto_composer import auto_compose

# 生成粒子
result = auto_compose("測試文本", layer="L1")

# 轉換為 atom_t (40 bytes)
atom_data = struct.pack(
    "QQIIQQ",
    result["mid"],          # 8 bytes: message ID
    result["timestamp"],    # 8 bytes: timestamp
    result["role"],         # 4 bytes: role
    result["content_len"],  # 4 bytes: content length
    result["content_hash"], # 8 bytes: content hash
    result["simhash"]       # 8 bytes: SimHash64
)

assert len(atom_data) == 40
```

### 與 Merkle Chain 整合

```python
from trace_compressor import compress_trace

# 記錄軌跡
trace = [...]

# 計算 Merkle 節點
merkle_node = {
    "data": compress_trace(trace),
    "hash": hashlib.sha256(data).hexdigest(),
    "prev_hash": "...",
    "timestamp": "...",
    "origin_signature": "MrLiouWord"
}
```

---

## 🧪 測試

```bash
# 運行單元測試
python -m pytest tests/

# 運行集成測試
python tests/integration_test.py

# 性能基準測試
python tests/benchmark.py
```

---

## 🌍 核心簽名

```json
{
  "package": "MRL ParticleKit Lite",
  "version": "v2.0",
  "origin_signature": "MrLiouWord",
  "sealed_at": "2026-02-12T00:00:00.000Z",
  "philosophy": "語言即粒子，粒子即結構"
}
```

---

## 📚 相關文檔

- [LAW-0 签名律](../../docs/laws/LAW-0-签名律.md)
- [Mrliou 萬物邏輯結構](../../docs/core/Mrliou万物逻辑结构-完整封存档案.md)
- [核心文檔索引](../../docs/core/核心文档.md)

---

> **「語言化為粒子，粒子凝結記憶」**
> 
> MR.liou © 2026 | 怎麼過去，就怎麼回來
