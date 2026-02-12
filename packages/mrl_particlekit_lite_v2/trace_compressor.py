"""
MRL ParticleKit Lite v2 - 軌跡壓縮器
記錄和壓縮執行軌跡

Origin Signature: MrLiouWord
Version: 2.0
"""

import json
import zlib
from typing import List, Dict


def compress_trace(
    trace: List[Dict],
    algorithm: str = "zlib"
) -> bytes:
    """
    壓縮執行軌跡
    
    Args:
        trace: 軌跡列表
        algorithm: 壓縮算法 (zlib/gzip)
    
    Returns:
        壓縮後的二進制數據
    """
    # 將軌跡序列化為 JSON
    trace_json = json.dumps(trace, ensure_ascii=False)
    trace_bytes = trace_json.encode('utf-8')
    
    # 使用 zlib 壓縮
    if algorithm == "zlib":
        compressed = zlib.compress(trace_bytes, level=9)
    else:
        # 默認使用 zlib
        compressed = zlib.compress(trace_bytes, level=9)
    
    return compressed


def decompress_trace(
    compressed: bytes,
    algorithm: str = "zlib"
) -> List[Dict]:
    """
    解壓縮執行軌跡
    
    Args:
        compressed: 壓縮數據
        algorithm: 壓縮算法
    
    Returns:
        原始軌跡列表
    """
    # 解壓縮
    if algorithm == "zlib":
        decompressed_bytes = zlib.decompress(compressed)
    else:
        decompressed_bytes = zlib.decompress(compressed)
    
    # 反序列化 JSON
    trace_json = decompressed_bytes.decode('utf-8')
    trace = json.loads(trace_json)
    
    return trace


def create_trace_entry(
    step: int,
    operation: str,
    input_data: any,
    output_data: any,
    layer: str = "L7"
) -> Dict:
    """
    創建軌跡條目
    
    Args:
        step: 步驟編號
        operation: 操作名稱
        input_data: 輸入數據
        output_data: 輸出數據
        layer: 層級
    
    Returns:
        軌跡條目字典
    """
    import time
    
    entry = {
        "step": step,
        "operation": operation,
        "input": str(input_data),
        "output": str(output_data),
        "timestamp": int(time.time() * 1000),
        "layer": layer,
        "origin_signature": "MrLiouWord"
    }
    
    return entry


def main():
    """示範函數"""
    # 創建示例軌跡
    trace = [
        create_trace_entry(1, "tokenize", "測試文本", ["測試", "文本"]),
        create_trace_entry(2, "compute_simhash", ["測試", "文本"], "0x1234567890abcdef"),
        create_trace_entry(3, "generate_particles", ["測試", "文本"], [{"id": 0}, {"id": 1}])
    ]
    
    print("=== Original Trace ===")
    print(json.dumps(trace, indent=2, ensure_ascii=False))
    
    # 壓縮
    compressed = compress_trace(trace)
    print(f"\n=== Compressed ===")
    print(f"Original size: {len(json.dumps(trace))} bytes")
    print(f"Compressed size: {len(compressed)} bytes")
    print(f"Compression ratio: {len(compressed) / len(json.dumps(trace)) * 100:.2f}%")
    
    # 解壓縮
    restored = decompress_trace(compressed)
    print(f"\n=== Decompressed ===")
    print(json.dumps(restored, indent=2, ensure_ascii=False))
    
    # 驗證
    assert trace == restored
    print("\n✓ Compression/Decompression successful!")


if __name__ == "__main__":
    main()
