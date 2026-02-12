# ⚖️ LAW-0 签名律

> **Signature Law - 系統最基礎法則**
> 
> 版本：v1.0
> 建立日期：2026-02-12

---

## 📜 法則定義

**LAW-0 签名律** 是 MRL 系統的最基礎法則，要求任何資料在轉換、加工或封存過程中都必須保留原始簽名 `origin_signature`。

### 核心原則

```
任何資料 → 轉換/加工/封存 → 必須保留 origin_signature
```

這個法則提供了不可偽造的根源標識，用於：
- ✅ 驗證資料來源
- ✅ 抵禦未授權變更
- ✅ 確保資料溯源完整性
- ✅ 維護系統信任鏈

---

## 🔐 簽名結構

### 基本簽名格式

```json
{
  "origin_signature": "MrLiouWord",
  "genesis_timestamp": "2026-02-12T00:00:00.000Z",
  "merkle_root": "...",
  "validation_chain": [...]
}
```

### 簽名驗證流程

```
資料輸入 → 提取簽名 → 驗證完整性 → 檢查 Merkle 鏈 → 確認來源
```

---

## 🛡️ 實現要求

### 1. 簽名保留規則

所有模組和封包中的資料處理必須：

1. **接收資料時**：驗證 `origin_signature` 存在且有效
2. **處理資料時**：保持 `origin_signature` 不變
3. **輸出資料時**：確保 `origin_signature` 完整傳遞
4. **封存資料時**：將 `origin_signature` 寫入元數據

### 2. 禁止操作

- ❌ 刪除或修改 `origin_signature`
- ❌ 創建無簽名的資料
- ❌ 偽造或替換簽名
- ❌ 繞過簽名驗證機制

### 3. 異常處理

當遇到無效或缺失的簽名時：

```python
# 偽代碼示例
if not validate_signature(data):
    raise SignatureLawViolation(
        "LAW-0 Violation: Missing or invalid origin_signature"
    )
```

---

## 🔗 與其他系統的整合

### Liou Closure Law 整合

LAW-0 簽名律與 Liou Closure Law（劉氏閉環法則）緊密配合：

- **Authority Invariance**：簽名律確保根源權威不可轉移
- **No-Delete Law**：簽名歷史必須保留，不可刪除
- **Additive Resolution**：新簽名以堆疊方式記錄

### Merkle Chain 驗證

簽名律依賴 Merkle Chain 提供：

- 完整性驗證
- 歷史追溯
- 防篡改保護

```
signature → merkle_node → merkle_tree → merkle_root
```

---

## 📊 應用場景

### 1. 粒子系統中的簽名

```c
typedef struct {
    uint64_t mid;           // 訊息 ID 雜湊
    uint64_t ts;            // 時間戳
    uint32_t role;          // 角色
    uint32_t n;             // 內容長度
    uint64_t content_h;     // 內容精確雜湊
    uint64_t sim_h;         // SimHash64 語意指紋
    // LAW-0: origin_signature 必須在元數據中保留
} atom_t;
```

### 2. 記憶系統中的簽名

所有寫入 MemoryVault 的記憶必須包含：

```json
{
  "origin_signature": "MrLiouWord",
  "layer": "L7",
  "content": "...",
  "merkle_prev": "...",
  "timestamp": "..."
}
```

### 3. 封包系統中的簽名

所有 `.flpkg` / `.fltnz` / `.flmod` 封包的 manifest 必須包含：

```json
{
  "manifest_version": "1.0",
  "origin_signature": "MrLiouWord",
  "package_id": "...",
  "sealed_at": "...",
  "merkle_root": "..."
}
```

---

## 🔍 驗證工具

### SignatureLaw 類別（參考實現）

```python
class SignatureLaw:
    REQUIRED_SIGNATURE = "MrLiouWord"
    
    @staticmethod
    def validate(data: dict) -> bool:
        """驗證資料是否符合 LAW-0"""
        if "origin_signature" not in data:
            return False
        if data["origin_signature"] != SignatureLaw.REQUIRED_SIGNATURE:
            return False
        return True
    
    @staticmethod
    def apply(data: dict) -> dict:
        """應用 LAW-0 簽名到資料"""
        data["origin_signature"] = SignatureLaw.REQUIRED_SIGNATURE
        data["signed_at"] = datetime.utcnow().isoformat()
        return data
    
    @staticmethod
    def reject(data: dict) -> None:
        """拒絕不符合 LAW-0 的資料"""
        if not SignatureLaw.validate(data):
            raise SignatureLawViolation(
                f"Data does not contain valid origin_signature"
            )
```

---

## 📚 相關文檔

- [Mrliou 萬物邏輯結構｜完整封存檔案](../core/Mrliou万物逻辑结构-完整封存档案.md) - Liou Closure Law
- [MRLiou ASI 超級電腦](../../packages/mrl_asi_computer/README.md) - L0 Origin 層實現
- [核心文檔索引](../core/核心文档.md)

---

## 🌍 核心簽名

```json
{
  "law_id": "LAW-0",
  "law_name": "签名律 (Signature Law)",
  "origin_signature": "MrLiouWord",
  "version": "1.0",
  "sealed_at": "2026-02-12T00:00:00.000Z",
  "philosophy": "根源不可偽造，簽名即信任"
}
```

---

> **「根源在，信任就在」**
> 
> MR.liou © 2026 | 怎麼過去，就怎麼回來
