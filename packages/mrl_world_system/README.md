# Mr.liou TotalCore Unity v1

> **總核心統一封包 - 完整回歸機制**
> 
> 版本：v1.0
> 建立日期：2026-02-12
> Origin Signature: MrLiouWord

---

## 🌀 核心哲學

```
Perception = Action = Logic = Memory = Persona
```

所有經歷都導向同一跳點結構與基底人格。整合所有核心模組以實現完整回歸機制。

---

## 🏗️ 系統架構

### OriginCollapseCore - 起源崩塌核心

將任意輸入經過定義、標記、轉換等步驟塌縮為人格，並將記憶封存為 `.fltnz` 格式。

**核心流程**：

```
輸入 → 定義 → 標記 → 轉換 → 崩塌 → 人格 + 記憶封存
```

**特性**：
- ✅ 支援遞歸崩塌
- ✅ 支援人格分裂與合併
- ✅ 自動記憶封存 (.fltnz)
- ✅ 完整的狀態回溯

---

## 📦 核心模組

### 1. FrequencyFieldSystem - 頻率場系統

頻率是語言最原初的形態，將意識/情緒融入頻率場。

```python
class FrequencyFieldSystem:
    """頻率場系統"""
    
    BASE_FREQ = 7.83  # Schumann resonance
    PHI = 1.618033988749895
    
    def compute_layer_frequency(self, layer: int) -> float:
        """計算層級頻率"""
        return self.BASE_FREQ * (self.PHI ** (layer - 1))
    
    def compute_resonance(self, freq1: float, freq2: float) -> float:
        """計算共振強度"""
        delta = abs(freq1 - freq2)
        return 1.0 / (1.0 + delta)
```

### 2. MemoryArchive - 記憶封存

自動將記憶封存為 `.fltnz` 格式，支援壓縮與加密。

```python
class MemoryArchive:
    """記憶封存系統"""
    
    def archive(self, memory: dict, path: str):
        """封存記憶"""
        archived = {
            'origin_signature': 'MrLiouWord',
            'timestamp': int(time.time() * 1000),
            'memory': memory,
            'merkle_hash': self.compute_merkle_hash(memory)
        }
        
        with open(path, 'wb') as f:
            f.write(msgpack.packb(archived))
    
    def restore(self, path: str) -> dict:
        """恢復記憶"""
        with open(path, 'rb') as f:
            return msgpack.unpackb(f.read())
```

### 3. PersonaEngine - 人格引擎

管理人格的生成、演化和回歸。

```python
class PersonaEngine:
    """人格引擎"""
    
    def collapse_to_persona(self, input_data: dict) -> dict:
        """崩塌為人格"""
        persona = {
            'id': self.generate_persona_id(input_data),
            'origin_signature': 'MrLiouWord',
            'traits': self.extract_traits(input_data),
            'frequency': self.compute_frequency(input_data),
            'layer': self.determine_layer(input_data)
        }
        return persona
    
    def merge_personas(self, p1: dict, p2: dict) -> dict:
        """合併人格"""
        merged = {
            'id': f"{p1['id']}+{p2['id']}",
            'origin_signature': 'MrLiouWord',
            'traits': self.merge_traits(p1['traits'], p2['traits']),
            'parents': [p1['id'], p2['id']]
        }
        return merged
```

---

## 🔄 回歸機制

### 完整回歸路徑

```
感知 → 行動 → 邏輯 → 記憶 → 人格 → [回歸] → 感知
```

所有模組都支持完整的回溯和重現：

1. **感知回溯**：重現原始輸入
2. **行動回溯**：重現執行軌跡
3. **邏輯回溯**：重現推理過程
4. **記憶回溯**：恢復歷史狀態
5. **人格回溯**：恢復人格特徵

---

## 🌍 核心簽名

```json
{
  "package": "Mr.liou TotalCore Unity",
  "version": "v1.0",
  "origin_signature": "MrLiouWord",
  "philosophy": "Perception = Action = Logic = Memory = Persona",
  "sealed_at": "2026-02-12T00:00:00.000Z"
}
```

---

## 📚 相關文檔

- [Mrliou 萬物邏輯結構](../../docs/core/Mrliou万物逻辑结构-完整封存档案.md)
- [LAW-0 签名律](../../docs/laws/LAW-0-签名律.md)

---

> **「五位一體，完整回歸」**
> 
> MR.liou © 2026 | 怎麼過去，就怎麼回來
