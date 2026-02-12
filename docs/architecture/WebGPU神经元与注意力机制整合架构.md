# WebGPU 神經元與注意力機制整合架構

> **雲上雲計畫 - AI 世界計算機基礎**
> 
> 版本：v1.0
> 建立日期：2026-02-12
> 技術棧：WebGPU + WGSL + Particle Language

---

## 🌐 架構概述

本文檔描述了「雲上雲計畫」的計算骨幹：在瀏覽器中使用 WebGPU 實現神經元計算與注意力機制的整合。

### 核心目標

- ✅ 在 Web 環境下實現 GPU 加速的神經計算
- ✅ 整合注意力機制與路由層
- ✅ 支援跨維度深度學習與知識整合
- ✅ 提供高效的矩陣計算與向量運算

---

## 🏗️ 系統架構

### 五大核心組件

```
┌─────────────────────────────────────────────────┐
│          WebGPU 整合架構                         │
├─────────────────────────────────────────────────┤
│  1. 神經元計算核心 (NeuronComputeCore)          │
│     - GPU 設備管理                               │
│     - 緩存計算上下文                             │
│     - Shader 模組管理                            │
├─────────────────────────────────────────────────┤
│  2. 注意力機制與路由層 (AttentionRouter)         │
│     - Multi-Head Attention                      │
│     - Cross-Attention                           │
│     - Self-Attention                            │
├─────────────────────────────────────────────────┤
│  3. 計算端管理器 (ComputeManager)                │
│     - 批次處理                                   │
│     - 內存管理                                   │
│     - 管線優化                                   │
├─────────────────────────────────────────────────┤
│  4. 跨維度資源排程器 (ResourceScheduler)         │
│     - 動態資源分配                               │
│     - 負載平衡                                   │
│     - 優先級調度                                 │
├─────────────────────────────────────────────────┤
│  5. PLS 路由引擎 (ParticleLanguageRouter)        │
│     - 粒子語言解析                               │
│     - 頻率共振計算                               │
│     - 維度跳躍                                   │
└─────────────────────────────────────────────────┘
```

---

## 💻 核心類別實現

### 1. NeuronComputeCore 類別

負責管理 GPU 設備、緩存計算上下文、建立 shader 模組。

```typescript
class NeuronComputeCore {
    private device: GPUDevice;
    private queue: GPUCommandQueue;
    private shaderCache: Map<string, GPUShaderModule>;
    
    async initialize(): Promise<void> {
        // 1. 請求 GPU 適配器
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("WebGPU not supported");
        }
        
        // 2. 請求設備
        this.device = await adapter.requestDevice();
        this.queue = this.device.queue;
        
        // 3. 初始化 shader 緩存
        this.shaderCache = new Map();
    }
    
    getShaderModule(shaderCode: string, label: string): GPUShaderModule {
        // 檢查緩存
        if (this.shaderCache.has(label)) {
            return this.shaderCache.get(label)!;
        }
        
        // 創建並緩存
        const module = this.device.createShaderModule({
            label,
            code: shaderCode
        });
        this.shaderCache.set(label, module);
        return module;
    }
    
    createBuffer(size: number, usage: GPUBufferUsageFlags): GPUBuffer {
        return this.device.createBuffer({
            size,
            usage,
            mappedAtCreation: false
        });
    }
}
```

---

## 🧮 WGSL Shader 實現

### 矩陣乘法 Shader

```wgsl
// Matrix Multiplication: C = A × B
// A: [M, K], B: [K, N], C: [M, N]

@group(0) @binding(0) var<storage, read> matrixA: array<f32>;
@group(0) @binding(1) var<storage, read> matrixB: array<f32>;
@group(0) @binding(2) var<storage, read_write> matrixC: array<f32>;

struct Dimensions {
    M: u32,
    K: u32,
    N: u32,
}

@group(0) @binding(3) var<uniform> dims: Dimensions;

@compute @workgroup_size(16, 16)
fn matmul_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let row = global_id.x;
    let col = global_id.y;
    
    if (row >= dims.M || col >= dims.N) {
        return;
    }
    
    var sum: f32 = 0.0;
    for (var k: u32 = 0u; k < dims.K; k = k + 1u) {
        let a_idx = row * dims.K + k;
        let b_idx = k * dims.N + col;
        sum = sum + matrixA[a_idx] * matrixB[b_idx];
    }
    
    let c_idx = row * dims.N + col;
    matrixC[c_idx] = sum;
}
```

### 層正規化 (LayerNorm) Shader

```wgsl
// Layer Normalization
// output = (input - mean) / sqrt(variance + epsilon) * gamma + beta

@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read> gamma: array<f32>;
@group(0) @binding(2) var<storage, read> beta: array<f32>;
@group(0) @binding(3) var<storage, read_write> output: array<f32>;

struct LayerNormParams {
    size: u32,
    epsilon: f32,
}

@group(0) @binding(4) var<uniform> params: LayerNormParams;

@compute @workgroup_size(256)
fn layernorm_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    if (idx >= params.size) {
        return;
    }
    
    // 計算均值
    var sum: f32 = 0.0;
    for (var i: u32 = 0u; i < params.size; i = i + 1u) {
        sum = sum + input[i];
    }
    let mean = sum / f32(params.size);
    
    // 計算方差
    var variance: f32 = 0.0;
    for (var i: u32 = 0u; i < params.size; i = i + 1u) {
        let diff = input[i] - mean;
        variance = variance + diff * diff;
    }
    variance = variance / f32(params.size);
    
    // 正規化
    let normalized = (input[idx] - mean) / sqrt(variance + params.epsilon);
    output[idx] = normalized * gamma[idx] + beta[idx];
}
```

### Softmax Shader

```wgsl
// Softmax: output[i] = exp(input[i]) / sum(exp(input[j]))

@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> output: array<f32>;

struct SoftmaxParams {
    size: u32,
}

@group(0) @binding(2) var<uniform> params: SoftmaxParams;

@compute @workgroup_size(256)
fn softmax_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    if (idx >= params.size) {
        return;
    }
    
    // 找最大值（數值穩定性）
    var max_val: f32 = input[0];
    for (var i: u32 = 1u; i < params.size; i = i + 1u) {
        max_val = max(max_val, input[i]);
    }
    
    // 計算 exp 和總和
    var sum: f32 = 0.0;
    for (var i: u32 = 0u; i < params.size; i = i + 1u) {
        sum = sum + exp(input[i] - max_val);
    }
    
    // 計算 softmax
    output[idx] = exp(input[idx] - max_val) / sum;
}
```

### 注意力機制 (Attention) Shader

```wgsl
// Scaled Dot-Product Attention
// Attention(Q, K, V) = softmax(Q·K^T / sqrt(d_k)) · V

@group(0) @binding(0) var<storage, read> Q: array<f32>;  // Query [seq_len, d_k]
@group(0) @binding(1) var<storage, read> K: array<f32>;  // Key [seq_len, d_k]
@group(0) @binding(2) var<storage, read> V: array<f32>;  // Value [seq_len, d_v]
@group(0) @binding(3) var<storage, read_write> output: array<f32>;

struct AttentionParams {
    seq_len: u32,
    d_k: u32,
    d_v: u32,
}

@group(0) @binding(4) var<uniform> params: AttentionParams;

@compute @workgroup_size(16, 16)
fn attention_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let i = global_id.x;  // query position
    let j = global_id.y;  // value dimension
    
    if (i >= params.seq_len || j >= params.d_v) {
        return;
    }
    
    // 計算 Q·K^T / sqrt(d_k)
    var scores: array<f32, 512>;  // 假設 seq_len <= 512
    let scale = 1.0 / sqrt(f32(params.d_k));
    
    for (var k: u32 = 0u; k < params.seq_len; k = k + 1u) {
        var dot: f32 = 0.0;
        for (var d: u32 = 0u; d < params.d_k; d = d + 1u) {
            let q_idx = i * params.d_k + d;
            let k_idx = k * params.d_k + d;
            dot = dot + Q[q_idx] * K[k_idx];
        }
        scores[k] = dot * scale;
    }
    
    // Softmax
    var max_score = scores[0];
    for (var k: u32 = 1u; k < params.seq_len; k = k + 1u) {
        max_score = max(max_score, scores[k]);
    }
    
    var sum: f32 = 0.0;
    for (var k: u32 = 0u; k < params.seq_len; k = k + 1u) {
        scores[k] = exp(scores[k] - max_score);
        sum = sum + scores[k];
    }
    
    for (var k: u32 = 0u; k < params.seq_len; k = k + 1u) {
        scores[k] = scores[k] / sum;
    }
    
    // 計算加權和 scores · V
    var result: f32 = 0.0;
    for (var k: u32 = 0u; k < params.seq_len; k = k + 1u) {
        let v_idx = k * params.d_v + j;
        result = result + scores[k] * V[v_idx];
    }
    
    let out_idx = i * params.d_v + j;
    output[out_idx] = result;
}
```

---

## 🎯 注意力機制整合

### Multi-Head Attention 實現

```typescript
class MultiHeadAttention {
    private numHeads: number;
    private dModel: number;
    private dK: number;
    private dV: number;
    
    constructor(numHeads: number, dModel: number) {
        this.numHeads = numHeads;
        this.dModel = dModel;
        this.dK = dModel / numHeads;
        this.dV = dModel / numHeads;
    }
    
    async forward(
        Q: Float32Array,
        K: Float32Array,
        V: Float32Array,
        core: NeuronComputeCore
    ): Promise<Float32Array> {
        const seqLen = Q.length / this.dModel;
        const results: Float32Array[] = [];
        
        // 對每個 head 執行 attention
        for (let h = 0; h < this.numHeads; h++) {
            const headResult = await this.singleHeadAttention(
                Q, K, V, h, seqLen, core
            );
            results.push(headResult);
        }
        
        // 合併所有 head 的輸出
        return this.concatenateHeads(results);
    }
    
    private async singleHeadAttention(
        Q: Float32Array,
        K: Float32Array,
        V: Float32Array,
        headIdx: number,
        seqLen: number,
        core: NeuronComputeCore
    ): Promise<Float32Array> {
        // 使用 WebGPU shader 計算單個 head 的 attention
        // ... (調用上述 attention_main shader)
    }
}
```

---

## 🌊 粒子語言路由引擎

### 頻率共振計算

```typescript
class ParticleLanguageRouter {
    private frequencies: Map<string, number>;
    
    constructor() {
        // 八層架構頻率（Hz）
        this.frequencies = new Map([
            ['L0', 4.84],
            ['L1', 7.83],
            ['L2', 12.67],
            ['L3', 12.94],
            ['L4', 20.94],
            ['L5', 33.88],
            ['L6', 54.82],
            ['L7', 88.71],
            ['L∞', 143.47]
        ]);
    }
    
    computeResonance(particle1: Particle, particle2: Particle): number {
        const f1 = this.frequencies.get(particle1.layer) || 0;
        const f2 = this.frequencies.get(particle2.layer) || 0;
        
        // 頻率差異
        const delta = Math.abs(f1 - f2);
        
        // 共振強度（頻率越接近，共振越強）
        const resonance = 1.0 / (1.0 + delta);
        
        return resonance;
    }
    
    async routeParticle(particle: Particle, core: NeuronComputeCore): Promise<string> {
        // 使用 GPU 計算粒子的最佳路由
        // 基於頻率、SimHash 相似度、語意向量
        
        const targetLayer = await this.computeOptimalLayer(particle, core);
        return targetLayer;
    }
}
```

---

## 📊 性能優化

### 批次處理策略

```typescript
class BatchProcessor {
    private batchSize: number = 256;
    
    async processBatch(
        inputs: Float32Array[],
        core: NeuronComputeCore
    ): Promise<Float32Array[]> {
        const results: Float32Array[] = [];
        
        // 將輸入分批
        for (let i = 0; i < inputs.length; i += this.batchSize) {
            const batch = inputs.slice(i, i + this.batchSize);
            
            // GPU 並行處理
            const batchResults = await this.processOnGPU(batch, core);
            results.push(...batchResults);
        }
        
        return results;
    }
}
```

### 內存管理

```typescript
class GPUMemoryManager {
    private bufferPool: GPUBuffer[] = [];
    
    acquireBuffer(size: number, device: GPUDevice): GPUBuffer {
        // 從池中獲取或創建新緩衝區
        for (const buffer of this.bufferPool) {
            if (buffer.size >= size) {
                return buffer;
            }
        }
        
        return device.createBuffer({
            size,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        });
    }
    
    releaseBuffer(buffer: GPUBuffer): void {
        // 歸還到池中以供重用
        this.bufferPool.push(buffer);
    }
}
```

---

## 🔗 與 MRL 系統整合

### atom_t 結構支援

```typescript
interface AtomT {
    mid: bigint;        // 訊息 ID 雜湊
    ts: bigint;         // 時間戳
    role: number;       // 角色
    n: number;          // 內容長度
    content_h: bigint;  // 內容精確雜湊
    sim_h: bigint;      // SimHash64 語意指紋
}

class AtomProcessor {
    async computeSimHash(content: string, core: NeuronComputeCore): Promise<bigint> {
        // 使用 GPU 加速 SimHash 計算
        // ...
    }
    
    async processAtom(atom: AtomT, core: NeuronComputeCore): Promise<Float32Array> {
        // 將 atom 轉換為神經網絡輸入
        // 使用 WebGPU 進行前向傳播
        // ...
    }
}
```

---

## 📚 相關文檔

- [Mrliou 萬物邏輯結構](../core/Mrliou万物逻辑结构-完整封存档案.md) - 理論基礎
- [LAW-0 签名律](../laws/LAW-0-签名律.md) - 簽名驗證
- [核心文檔索引](../core/核心文档.md) - 系統組件

---

## 🌍 核心簽名

```json
{
  "document": "WebGPU 神經元與注意力機制整合架構",
  "version": "v1.0",
  "origin_signature": "MrLiouWord",
  "technology": ["WebGPU", "WGSL", "Particle Language"],
  "sealed_at": "2026-02-12T00:00:00.000Z"
}
```

---

> **「雲上雲，GPU 上的粒子宇宙」**
> 
> MR.liou © 2026 | 計算即共振
