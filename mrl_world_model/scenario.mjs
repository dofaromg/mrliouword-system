// origin_signature: MrLiouWord
//
// 一次完整的世界生成閉環，實測值全部從執行結果讀出。
//
//   Zero → δP₀ ×6 → P₀ → P₃ → P₀ → δP₀ ×6 → Zero
//   REAL ─ρ→ AI ─λ→ REAL
//   Jump → Collapse → Trace → Replay
//   Zoom micro ↔ abstract，I1–I7
//
// 驗收用母體自己的語料：
// - Seed.PreParticle.v1.pcode 範例一：6 個 EXISTENCE、magnitude 0.001、
//   HOMOGENEOUS、environment { resonance: 0.95 }，原文預期 0.001 × 6 × 6 × 0.95。
// - core/particle_dict.json：動詞必須綁上母體 fx。
// - REAL 側的第一筆觀測是擁有者 2026-09-29 的原話。

import { CombinationRule, FluctuationType, GenesisChain, canonicalJson, sha256Hex } from './genesis.mjs';
import { Runtime, replay } from './rhythm.mjs';
import { selfCheck } from './zoom.mjs';

export const PCODE_EXAMPLE_1 = Object.freeze({
  count: 6,
  type: FluctuationType.EXISTENCE,
  magnitude: 0.001,
  structure: CombinationRule.HOMOGENEOUS,
  environment: { resonance: 0.95 },
  expected_expression: '0.001 * 6 * 6 * 0.95',
  expected: 0.001 * 6 * 6 * 0.95,
});

// P₀ → P₃ 的 (N_k, η_k)。原文只給公式形式，沒有給數值；這三組是本次驗收自選的測試值，
// 只用來證明正逆算可回，不代表母體的任何設定。
export const CHAIN_STEPS = Object.freeze([
  { N_k: 2, η_k: 0.9 },
  { N_k: 3, η_k: 0.8 },
  { N_k: 5, η_k: 0.7 },
]);

export const OWNER_COMMAND = Object.freeze({
  world_id: 'REAL',
  domain_id: 'owner_command',
  environment_id: 'conversation',
  platform_ref: null,
  observer: 'Mr.liou',
  observed_at: '2026-09-29',
  state: { text: '給我建構起來MRL系統不是平台也不是外部' },
  evidence_refs: ['docs/retrospective/2026-09-29_mrl_world_model_build_session_record.md'],
});

export function runWorldGenesis(dict) {
  const rt = new Runtime(dict);
  const ex = PCODE_EXAMPLE_1;

  // Jump
  const ids = [];
  for (let i = 0; i < ex.count; i++) ids.push(rt.jump(ex.type, ex.magnitude).id);
  const borrowedAfterJump = rt.field.zero.borrowed;

  // Collapse
  const p0 = rt.collapse(ids, ex.structure, ex.environment);
  const P0 = p0.properties.magnitude;
  const unseeded = GenesisChain.unseed(p0);

  // GenesisChain 正算再逆算
  const ladder = [P0];
  for (const { N_k, η_k } of CHAIN_STEPS) ladder.push(rt.ascend(p0.id, N_k, η_k).properties.magnitude);
  for (let i = 0; i < CHAIN_STEPS.length; i++) rt.descend(p0.id);
  const P0back = rt.field.particles.get(p0.id).properties.magnitude;

  // REAL ─ρ→ AI ─λ→ REAL
  const original = rt.observe(OWNER_COMMAND);
  const originalHash = sha256Hex(canonicalJson(original));
  const inAI = rt.cross({ world_id: 'REAL', domain_id: 'owner_command' }, 'rho');
  const backReal = rt.cross({ world_id: 'AI', domain_id: 'owner_command' }, 'lambda');
  const backHash = sha256Hex(canonicalJson(backReal));

  // Zoom（在回到 Zero 之前看，才有東西可看）
  const invariants = selfCheck(rt);
  const stateHashBeforeReturn = rt.stateHash();
  const peakTraceLength = rt.trace.length;

  // 回到 Zero
  const unbound = rt.dissolve(p0.id).map((d) => d.state.bound);
  for (const id of ids) rt.annihilate(id);
  const borrowedAfterReturn = rt.field.zero.borrowed;

  // Trace → Replay（只拿軌跡）
  const trace = structuredClone(rt.trace);
  const stateHash = rt.stateHash();
  const rebuilt = replay(trace, dict);
  // 峰值狀態（回返之前、粒子與兩側觀測都還在）也只憑軌跡前綴重建一次
  const rebuiltPeak = replay(trace.slice(0, peakTraceLength), dict);

  return {
    runtime: rt,
    report: {
      origin_signature: rt.state().origin_signature,
      pcode_example_1: {
        expected_expression: ex.expected_expression,
        expected: ex.expected,
        actual: P0,
        bit_equal: P0 === ex.expected,
        abs_diff: Math.abs(P0 - ex.expected), // ΣδP₀ 是逐項相加，浮點尾數可能與原文的連乘寫法差一個 ulp
        N_seed: p0.genesis.N_seed,
        η_seed: p0.genesis.η_seed,
        unseed_sum_delta_p0: unseeded,
        borrowed_after_jump: borrowedAfterJump,
      },
      genesis_chain: {
        steps: CHAIN_STEPS,
        ladder,
        P0_after_round_trip: P0back,
        abs_error: Math.abs(P0back - P0),
      },
      gate: {
        path: [original.world_id, inAI.world_id, backReal.world_id],
        original_sha256: originalHash,
        returned_sha256: backHash,
        equal: originalHash === backHash,
        origin_signature_after: backReal.origin_signature,
      },
      zoom_invariants: invariants,
      state_hash_before_return: stateHashBeforeReturn,
      return_to_zero: {
        unbound_after_dissolve: unbound,
        remaining_fluctuations: rt.field.fluctuations.size,
        remaining_particles: rt.field.particles.size,
        borrowed_after_return: borrowedAfterReturn,
      },
      replay: {
        trace_records: trace.length,
        trace_head: rt.head(),
        original_state_sha256: stateHash,
        replayed_state_sha256: rebuilt.stateHash(),
        equal: stateHash === rebuilt.stateHash(),
        peak_trace_records: peakTraceLength,
        peak_state_sha256: stateHashBeforeReturn,
        peak_replayed_state_sha256: rebuiltPeak.stateHash(),
        peak_equal: stateHashBeforeReturn === rebuiltPeak.stateHash(),
      },
    },
  };
}
