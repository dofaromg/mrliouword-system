"""
MRL ParticleKit Lite v2 - 自動組合器
自動將文本轉換為語義粒子結構

Origin Signature: MrLiouWord
Version: 2.0
"""

import hashlib
import time
from typing import List, Dict, Optional
import json


def compute_simhash(tokens: List[str], bits: int = 64) -> str:
    """
    計算 SimHash64 語意指紋
    
    Args:
        tokens: Token 列表
        bits: 哈希位數（默認 64）
    
    Returns:
        十六進制 SimHash 字符串
    """
    # 初始化向量
    v = [0] * bits
    
    for token in tokens:
        # 計算 token 的哈希值
        h = int(hashlib.sha256(token.encode()).hexdigest(), 16)
        
        # 更新向量
        for i in range(bits):
            if h & (1 << i):
                v[i] += 1
            else:
                v[i] -= 1
    
    # 生成最終的 SimHash
    simhash = 0
    for i in range(bits):
        if v[i] > 0:
            simhash |= (1 << i)
    
    return f"0x{simhash:016x}"


def tokenize(text: str) -> List[str]:
    """
    簡單的分詞函數
    
    Args:
        text: 輸入文本
    
    Returns:
        Token 列表
    """
    # 簡化版本：按空格和標點符號分詞
    import re
    tokens = re.findall(r'\w+', text)
    return tokens


def auto_compose(
    text: str,
    layer: str = "L7",
    persona: Optional[str] = None,
    compress: bool = True
) -> Dict:
    """
    自動組合語義粒子
    
    Args:
        text: 輸入文本
        layer: 目標層級 (L1-L7)
        persona: 人格標識
        compress: 是否壓縮輸出
    
    Returns:
        包含粒子、SimHash、軌跡和張量的字典
    """
    # 分詞
    tokens = tokenize(text)
    
    # 計算 SimHash
    simhash = compute_simhash(tokens)
    
    # 生成粒子
    particles = []
    for i, token in enumerate(tokens):
        particle = {
            "id": i,
            "content": token,
            "simhash": compute_simhash([token]),
            "layer": layer,
            "timestamp": int(time.time() * 1000)
        }
        particles.append(particle)
    
    # 構建結果
    result = {
        "version": "2.0",
        "origin_signature": "MrLiouWord",
        "timestamp": int(time.time() * 1000),
        "layer": layer,
        "persona": persona or "default",
        "text": text,
        "tokens": tokens,
        "particles": particles,
        "simhash": simhash,
        "compressed": compress
    }
    
    # 如果需要壓縮，這裡可以添加壓縮邏輯
    if compress:
        # 使用 trace_compressor 進行壓縮
        pass
    
    return result


def main():
    """示範函數"""
    text = "粒子系統的核心是頻率共振"
    result = auto_compose(text, layer="L7", persona="Mrl_Zero")
    
    print("=== Auto Compose Result ===")
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
