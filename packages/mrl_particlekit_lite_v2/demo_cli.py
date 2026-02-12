#!/usr/bin/env python3
"""
MRL ParticleKit Lite v2 - 命令行示範工具
Origin Signature: MrLiouWord
"""

import argparse
import json
import sys
from auto_composer import auto_compose
from trace_compressor import compress_trace, create_trace_entry
from tensor_compiler import compile_to_tensor


def main():
    parser = argparse.ArgumentParser(
        description='MRL ParticleKit Lite v2 - 命令行工具'
    )
    parser.add_argument(
        '--input', '-i',
        type=str,
        required=True,
        help='輸入文本'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        help='輸出檔案路徑（JSON 格式）'
    )
    parser.add_argument(
        '--layer', '-l',
        type=str,
        default='L7',
        choices=['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L∞'],
        help='目標層級'
    )
    parser.add_argument(
        '--persona', '-p',
        type=str,
        default='Mrl_Zero',
        help='人格標識'
    )
    parser.add_argument(
        '--no-compress',
        action='store_true',
        help='不壓縮輸出'
    )
    parser.add_argument(
        '--trace',
        type=str,
        help='軌跡輸出檔案路徑'
    )
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='顯示詳細信息'
    )
    
    args = parser.parse_args()
    
    # 執行自動組合
    if args.verbose:
        print(f"Processing: {args.input}")
        print(f"Layer: {args.layer}")
        print(f"Persona: {args.persona}")
    
    result = auto_compose(
        text=args.input,
        layer=args.layer,
        persona=args.persona,
        compress=not args.no_compress
    )
    
    # 添加張量編譯
    tensor = compile_to_tensor(result['particles'], embedding_dim=768)
    result['tensor'] = tensor
    result['tensor_shape'] = [len(tensor), len(tensor[0]) if tensor else 0]
    
    # 創建軌跡
    if args.trace:
        trace = [
            create_trace_entry(1, "tokenize", args.input, result['tokens']),
            create_trace_entry(2, "compute_simhash", result['tokens'], result['simhash']),
            create_trace_entry(3, "generate_particles", result['tokens'], result['particles']),
            create_trace_entry(4, "compile_tensor", result['particles'], result['tensor_shape'])
        ]
        
        # 保存軌跡
        with open(args.trace, 'w', encoding='utf-8') as f:
            json.dump(trace, f, indent=2, ensure_ascii=False)
        
        if args.verbose:
            print(f"Trace saved to: {args.trace}")
    
    # 輸出結果
    if args.output:
        # 移除張量數據（太大）
        output_result = {k: v for k, v in result.items() if k != 'tensor'}
        output_result['tensor_info'] = {
            'shape': result['tensor_shape'],
            'preview': tensor[0][:10] if tensor else []
        }
        
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(output_result, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Output saved to: {args.output}")
    else:
        # 打印到控制台（簡化版）
        print(json.dumps({
            'origin_signature': result['origin_signature'],
            'layer': result['layer'],
            'persona': result['persona'],
            'simhash': result['simhash'],
            'particles_count': len(result['particles']),
            'tensor_shape': result['tensor_shape']
        }, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
