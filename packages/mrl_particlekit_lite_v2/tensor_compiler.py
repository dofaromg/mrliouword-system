"""
MRL ParticleKit Lite v2 - 張量編譯器
將語義結構編譯為張量表示

Origin Signature: MrLiouWord
Version: 2.0
"""

import hashlib
from typing import List, Dict
import json


def compile_to_tensor(
    particles: List[Dict],
    embedding_dim: int = 768
) -> List[List[float]]:
    """
    將粒子列表編譯為張量
    
    Args:
        particles: 粒子列表
        embedding_dim: 嵌入維度
    
    Returns:
        shape = (num_particles, embedding_dim) 的張量（列表形式）
    """
    tensor = []
    
    for particle in particles:
        # 生成粒子的嵌入向量
        embedding = generate_embedding(particle, embedding_dim)
        tensor.append(embedding)
    
    return tensor


def generate_embedding(particle: Dict, dim: int) -> List[float]:
    """
    為單個粒子生成嵌入向量
    
    Args:
        particle: 粒子字典
        dim: 嵌入維度
    
    Returns:
        嵌入向量
    """
    # 使用粒子內容生成確定性的嵌入
    content = particle.get("content", "")
    simhash = particle.get("simhash", "0x0")
    layer = particle.get("layer", "L7")
    
    # 組合特徵
    feature_str = f"{content}:{simhash}:{layer}"
    
    # 生成哈希並轉換為嵌入向量
    hash_obj = hashlib.sha256(feature_str.encode())
    hash_bytes = hash_obj.digest()
    
    # 將哈希字節擴展到所需維度
    embedding = []
    for i in range(dim):
        # 使用哈希字節的循環索引
        byte_val = hash_bytes[i % len(hash_bytes)]
        # 歸一化到 [-1, 1]
        normalized_val = (byte_val / 255.0) * 2.0 - 1.0
        embedding.append(normalized_val)
    
    return embedding


def tensor_to_particles(
    tensor: List[List[float]],
    metadata: Dict
) -> List[Dict]:
    """
    將張量解碼回粒子列表
    
    Args:
        tensor: 輸入張量
        metadata: 元數據（用於反向解碼）
    
    Returns:
        粒子列表
    """
    # 從元數據中恢復粒子信息
    particles = metadata.get("particles", [])
    
    # 驗證張量形狀
    if len(tensor) != len(particles):
        raise ValueError(f"Tensor size {len(tensor)} does not match particles count {len(particles)}")
    
    # 重建粒子（這裡簡化處理，實際應該從張量反向解碼）
    restored_particles = []
    for i, particle in enumerate(particles):
        restored = {
            "id": i,
            "content": particle.get("content", ""),
            "simhash": particle.get("simhash", "0x0"),
            "layer": particle.get("layer", "L7"),
            "tensor_embedding": tensor[i][:10]  # 只保留前10個維度作為示例
        }
        restored_particles.append(restored)
    
    return restored_particles


def compute_tensor_similarity(
    tensor1: List[List[float]],
    tensor2: List[List[float]]
) -> float:
    """
    計算兩個張量的相似度（餘弦相似度）
    
    Args:
        tensor1: 第一個張量
        tensor2: 第二個張量
    
    Returns:
        相似度分數 [0, 1]
    """
    # 簡化版本：計算第一個向量的餘弦相似度
    if not tensor1 or not tensor2:
        return 0.0
    
    vec1 = tensor1[0]
    vec2 = tensor2[0]
    
    # 計算點積
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    
    # 計算模長
    norm1 = sum(a * a for a in vec1) ** 0.5
    norm2 = sum(b * b for b in vec2) ** 0.5
    
    # 避免除零
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    # 餘弦相似度
    similarity = dot_product / (norm1 * norm2)
    
    # 歸一化到 [0, 1]
    return (similarity + 1.0) / 2.0


def main():
    """示範函數"""
    # 創建示例粒子
    particles = [
        {"content": "粒子", "layer": "L7", "simhash": "0x1234567890abcdef"},
        {"content": "頻率", "layer": "L5", "simhash": "0xfedcba0987654321"},
        {"content": "共振", "layer": "L5", "simhash": "0xabcdef1234567890"}
    ]
    
    print("=== Original Particles ===")
    print(json.dumps(particles, indent=2, ensure_ascii=False))
    
    # 編譯為張量
    tensor = compile_to_tensor(particles, embedding_dim=768)
    print(f"\n=== Compiled Tensor ===")
    print(f"Shape: ({len(tensor)}, {len(tensor[0])})")
    print(f"First vector (first 10 dims): {tensor[0][:10]}")
    
    # 反向解碼
    metadata = {"particles": particles}
    restored = tensor_to_particles(tensor, metadata)
    print(f"\n=== Restored Particles ===")
    print(json.dumps(restored, indent=2, ensure_ascii=False))
    
    # 計算相似度
    tensor2 = compile_to_tensor(particles[:2], embedding_dim=768)
    similarity = compute_tensor_similarity(tensor, tensor2)
    print(f"\n=== Similarity ===")
    print(f"Similarity score: {similarity:.4f}")


if __name__ == "__main__":
    main()
