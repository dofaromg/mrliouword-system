// origin_signature: MrLiouWord
//
// Seed.PreParticle.v1 的可執行實作（implementation，不是 canonical 本身）。
// 來源：Google Drive「Seed.PreParticle.v1.pcode」（@layer L1, @dimension D0,
// @signature MRSIG-SEED-PREPARTICLE-V1-COMPLETE）。
//
//   Zero → δP₀ → P₀ → P₁ → P₂ → ...
//     ↑                      ↓
//     └──────────────────────┘   怎麼過去就怎麼回來
//
//   layer_minus_1:  δP₀ = ZeroPoint.expand()        ↔  ZeroPoint.return(δP₀)
//   layer_0:        P₀ = ΣδP₀ · N_seed · η_seed     ↔  ΣδP₀ = P₀ / (N_seed · η_seed)
//   layer_k:        P_{k+1} = N_k · P_k · η_k        ↔  P_k = P_{k+1} / (N_k · η_k)
//
// 偏離原文之處（每一處都寫明為什麼）：
// 1. 原文 direction 用 random_unit_vector、id 用 generate_uuid、時間用 now()。
//    這裡全部改由 SHA-256 與因果序決定——Replay 必須能從軌跡逐位元重建，
//    亂數會讓「怎麼過去就怎麼回來」無法驗證。
// 2. 原文未定義 StateSpace 的維度；這裡取 FluctuationType 的數量（6）。
// 3. 原文未給 calculate_entanglement_strength 與 calculate_stability 的定義。
//    strength 取兩個方向向量的內積（兩者皆單位向量，值域 [-1, 1]）；
//    stability 原文無定義 → 記為 null 並標「待找回」，不自行發明。
// 4. 原文未給 calculate_environment_factor；範例一以
//    environment = { resonance: 0.95 } 得到「0.001 × 6 × 6 × 0.95」，
//    所以 η_seed = environment.resonance（缺省為 1）。

import { createHash } from 'node:crypto';

export const ORIGIN_SIGNATURE = 'MrLiouWord';

export const FluctuationType = Object.freeze({
  EXISTENCE: 'EXISTENCE',   // 有／無
  INTENSITY: 'INTENSITY',   // 多／少
  DIRECTION: 'DIRECTION',   // 往哪
  CONNECTION: 'CONNECTION', // 與誰關聯
  RHYTHM: 'RHYTHM',         // 快／慢
  RESONANCE: 'RESONANCE',   // 同步／失調
});

export const CombinationRule = Object.freeze({
  HOMOGENEOUS: 'HOMOGENEOUS',
  HETEROGENEOUS: 'HETEROGENEOUS',
  SYMMETRIC: 'SYMMETRIC',
  OPEN_CHAIN: 'OPEN_CHAIN',
});

// 最小可感知差異 ε。原文為符號 Δε，未給數值；取 IEEE-754 的機器 ε。
export const EPSILON = Number.EPSILON;

const STATE_SPACE_DIM = Object.keys(FluctuationType).length;

export function sha256Hex(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

// 鍵排序後的 JSON：同一個狀態永遠得到同一串位元組，才有資格拿來比雜湊。
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

function directionFromSeed(seed) {
  const digest = createHash('sha256').update(seed, 'utf8').digest();
  const raw = [];
  for (let i = 0; i < STATE_SPACE_DIM; i++) raw.push(digest.readInt32BE(i * 4));
  const norm = Math.hypot(...raw);
  return raw.map((x) => x / norm);
}

export class ZeroPoint {
  constructor() {
    this.state = '未決定';
    this.borrowed = 0;
  }
  borrow(magnitude) {
    this.borrowed += magnitude;
    return magnitude;
  }
  return(magnitude) {
    this.borrowed -= magnitude;
  }
}

// FluctuationLifecycle + ParticleGenesis。所有物件以 id 互指，
// 使整個場可以直接序列化成 canonical JSON。
export class GenesisField {
  constructor({ emit } = {}) {
    this.zero = new ZeroPoint();
    this.causal = 0;
    this.fluctuations = new Map();
    this.particles = new Map();
    this.emit = emit ?? (() => {});
  }

  create_fluctuation(type, magnitude = EPSILON) {
    if (!(type in FluctuationType)) throw new Error(`unknown FluctuationType: ${type}`);
    if (!(magnitude > 0)) throw new Error('magnitude 可以無限小，但不為零');
    const causal_order = ++this.causal;
    const seed = `${ORIGIN_SIGNATURE}|δP₀|${causal_order}|${type}|${magnitude}`;
    const borrowed = this.zero.borrow(magnitude);
    const fluctuation = {
      id: `dp0-${sha256Hex(seed).slice(0, 16)}`,
      essence: {
        delta_epsilon: magnitude,
        direction: directionFromSeed(seed),
        magnitude,
        causal_order,
      },
      type,
      state: { bound: false, parent_particle: null, entangled_with: [] },
      origin: { from: 'ZeroPoint', borrowed, causal_order },
    };
    this.fluctuations.set(fluctuation.id, fluctuation);
    this.emit('FLUCTUATION_CREATED', fluctuation);
    return fluctuation;
  }

  annihilate(id) {
    const dp = this.#fluct(id);
    if (dp.state.bound) throw new Error('Cannot annihilate bound fluctuation');
    for (const partner of [...dp.state.entangled_with]) this.disentangle(id, partner);
    this.zero.return(dp.origin.borrowed);
    this.fluctuations.delete(id);
    this.emit('FLUCTUATION_ANNIHILATED', dp);
  }

  entangle(id1, id2) {
    const a = this.#fluct(id1);
    const b = this.#fluct(id2);
    if (id1 === id2) throw new Error('cannot entangle a fluctuation with itself');
    a.state.entangled_with.push(id2);
    b.state.entangled_with.push(id1);
    const strength = a.essence.direction.reduce((s, x, i) => s + x * b.essence.direction[i], 0);
    const pair = { particles: [id1, id2], strength };
    this.emit('ENTANGLEMENT_CREATED', pair);
    return pair;
  }

  disentangle(id1, id2) {
    const a = this.#fluct(id1);
    const b = this.#fluct(id2);
    a.state.entangled_with = a.state.entangled_with.filter((p) => p !== id2);
    b.state.entangled_with = b.state.entangled_with.filter((p) => p !== id1);
    this.emit('ENTANGLEMENT_BROKEN', { particles: [id1, id2] });
  }

  crystallize(ids, structure, environment = {}) {
    const fluctuations = ids.map((id) => this.#fluct(id));
    for (const dp of fluctuations) {
      if (dp.state.bound) throw new Error(`fluctuation ${dp.id} is already bound`);
    }
    validate_combination(fluctuations, structure);
    const N_seed = calculate_structure_factor(fluctuations, structure);
    const η_seed = calculate_environment_factor(environment);
    const total = fluctuations.reduce((sum, dp) => sum + dp.essence.magnitude, 0);
    const particle = {
      id: `p0-${sha256Hex(`${ORIGIN_SIGNATURE}|P₀|${ids.join(',')}|${structure}`).slice(0, 16)}`,
      type: 'MRLsmall',
      properties: {
        magnitude: total * N_seed * η_seed,
        complexity: fluctuations.length,
        stability: null, // calculate_stability：原文未定義，待找回
      },
      genesis: {
        fluctuations: [...ids],
        structure,
        N_seed,
        η_seed,
        environment_snapshot: { ...environment },
      },
      state: { age: 0, level: 0, chain: [], mutations: [], children: [] },
    };
    for (const dp of fluctuations) {
      dp.state.bound = true;
      dp.state.parent_particle = particle.id;
    }
    this.particles.set(particle.id, particle);
    this.emit('PARTICLE_CRYSTALLIZED', particle);
    return particle;
  }

  dissolve(particleId) {
    const particle = this.#particle(particleId);
    if (particle.state.level !== 0) throw new Error('descend to P₀ before dissolving');
    const fluctuations = particle.genesis.fluctuations.map((id) => {
      const dp = this.#fluct(id);
      dp.state.bound = false;
      dp.state.parent_particle = null;
      return dp;
    });
    this.particles.delete(particleId);
    this.emit('PARTICLE_DISSOLVED', { particle, fluctuations: fluctuations.map((d) => d.id) });
    return fluctuations;
  }

  // P_{k+1} = N_k · P_k · η_k
  ascend(particleId, N_k, η_k) {
    const particle = this.#particle(particleId);
    if (!(N_k > 0) || !(η_k > 0)) throw new Error('N_k 與 η_k 必須為正，否則無法逆算');
    const before = particle.properties.magnitude;
    particle.properties.magnitude = GenesisChain.forward(before, N_k, η_k);
    particle.state.chain.push({ N_k, η_k });
    particle.state.level += 1;
    this.emit('PARTICLE_ASCENDED', { id: particleId, level: particle.state.level });
    return particle;
  }

  // P_k = P_{k+1} / (N_k · η_k)
  descend(particleId) {
    const particle = this.#particle(particleId);
    const step = particle.state.chain.pop();
    if (!step) throw new Error('particle is already at P₀');
    particle.properties.magnitude = GenesisChain.reverse(particle.properties.magnitude, step.N_k, step.η_k);
    particle.state.level -= 1;
    this.emit('PARTICLE_DESCENDED', { id: particleId, level: particle.state.level });
    return particle;
  }

  snapshot() {
    const byId = (a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    return {
      origin_signature: ORIGIN_SIGNATURE,
      zero: { state: this.zero.state, borrowed: this.zero.borrowed },
      causal: this.causal,
      fluctuations: [...this.fluctuations.values()].sort(byId),
      particles: [...this.particles.values()].sort(byId),
    };
  }

  #fluct(id) {
    const dp = this.fluctuations.get(id);
    if (!dp) throw new Error(`unknown fluctuation: ${id}`);
    return dp;
  }

  #particle(id) {
    const p = this.particles.get(id);
    if (!p) throw new Error(`unknown particle: ${id}`);
    return p;
  }
}

export function validate_combination(fluctuations, rule) {
  const types = new Set(fluctuations.map((dp) => dp.type));
  switch (rule) {
    case CombinationRule.HOMOGENEOUS:
      if (types.size > 1) throw new Error('Homogeneous combination requires same type');
      break;
    case CombinationRule.HETEROGENEOUS:
      if (types.size < 2) throw new Error('Heterogeneous combination requires multiple types');
      break;
    case CombinationRule.SYMMETRIC:
      if (fluctuations.length % 2 !== 0) throw new Error('Symmetric combination requires pairs');
      break;
    case CombinationRule.OPEN_CHAIN:
      break;
    default:
      throw new Error(`unknown CombinationRule: ${rule}`);
  }
  if (fluctuations.length === 0) throw new Error('cannot crystallize zero fluctuations');
  return true;
}

export function calculate_structure_factor(fluctuations, rule) {
  const base = fluctuations.length;
  switch (rule) {
    case CombinationRule.HOMOGENEOUS:
      return base;                                   // 同類疊加：線性增長
    case CombinationRule.HETEROGENEOUS: {
      const types = new Set(fluctuations.map((dp) => dp.type)).size;
      return base * Math.pow(1.1, types);            // 異類組合：複雜性紅利
    }
    case CombinationRule.SYMMETRIC:
      return base * 1.2;                             // 對稱結構：穩定性紅利
    case CombinationRule.OPEN_CHAIN:
      return base * 0.9;                             // 開放鏈：基礎值
    default:
      throw new Error(`unknown CombinationRule: ${rule}`);
  }
}

export function calculate_environment_factor(environment) {
  const η = environment?.resonance ?? 1;
  if (!(η > 0 && η <= 1)) throw new Error(`η_seed 必須在 (0, 1]，實際 ${η}`);
  return η;
}

export const GenesisChain = Object.freeze({
  forward: (P_k, N_k, η_k) => N_k * P_k * η_k,
  reverse: (P_next, N_k, η_k) => P_next / (N_k * η_k),
  // layer_0 的逆算：ΣδP₀ = P₀ / (N_seed · η_seed)
  unseed: (particle) => particle.properties.magnitude / (particle.genesis.N_seed * particle.genesis.η_seed),
});
