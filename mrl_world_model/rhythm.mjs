// origin_signature: MrLiouWord
//
// 跳點節奏 Jump → Collapse → Trace → Replay。
//
// 每一個動作都寫成一筆軌跡紀錄，並以 prev → hash 串成鏈；
// 人讀的投影是 .fltnz 軌跡行 `[ts] ::verb→ target`。
// Replay 只拿軌跡（不拿任何記憶體狀態）重跑一次，
// 重建出來的狀態雜湊必須與原狀態逐位元相同。
//
// 動詞綁定母體粒子字典 core/particle_dict.json 既有的 fx，不另立粒子：
//   jump → fx.trace.jump    collapse → fx.flow.collapse
//   trace → fx.trace.anchor replay   → fx.flow.restore
// 字典裡找不到對應 fx 就拒絕啟動——綁不上母體詞彙的動作不執行。

import { GenesisField, ORIGIN_SIGNATURE, canonicalJson, sha256Hex } from './genesis.mjs';
import { World } from './world.mjs';

export const VERB_FX = Object.freeze({
  jump: 'fx.trace.jump',
  entangle: 'fx.trace.jump',
  collapse: 'fx.flow.collapse',
  ascend: 'fx.flow.collapse',
  descend: 'fx.flow.restore',
  dissolve: 'fx.flow.restore',
  annihilate: 'fx.meta.origin',
  observe: 'fx.trace.anchor',
  cross: 'fx.trace.anchor',
});

export const REQUIRED_FX = Object.freeze([
  ...new Set([...Object.values(VERB_FX), 'fx.trace.merkle']),
]);

export const GENESIS_HASH = '0'.repeat(64);

export function bindVocabulary(dict) {
  if (dict?.origin !== ORIGIN_SIGNATURE) {
    throw new Error(`particle_dict origin 必須是 ${ORIGIN_SIGNATURE}，實際 ${dict?.origin}`);
  }
  const missing = REQUIRED_FX.filter((fx) => !(fx in (dict.particles ?? {})));
  if (missing.length) throw new Error(`母體粒子字典缺少 ${missing.join(', ')}，拒絕啟動`);
  return Object.fromEntries(REQUIRED_FX.map((fx) => [fx, dict.particles[fx]]));
}

export class Runtime {
  constructor(dict) {
    this.vocab = bindVocabulary(dict);
    this.field = new GenesisField();
    this.world = new World();
    this.trace = [];
  }

  jump(type, magnitude) {
    const dp = this.field.create_fluctuation(type, magnitude);
    this.#record('jump', dp.id, { type, magnitude });
    return dp;
  }

  entangle(id1, id2) {
    const pair = this.field.entangle(id1, id2);
    this.#record('entangle', `${id1}+${id2}`, { id1, id2 });
    return pair;
  }

  collapse(ids, structure, environment = {}) {
    const particle = this.field.crystallize(ids, structure, environment);
    this.#record('collapse', particle.id, { ids, structure, environment });
    return particle;
  }

  ascend(particleId, N_k, η_k) {
    const p = this.field.ascend(particleId, N_k, η_k);
    this.#record('ascend', particleId, { particleId, N_k, η_k });
    return p;
  }

  descend(particleId) {
    const p = this.field.descend(particleId);
    this.#record('descend', particleId, { particleId });
    return p;
  }

  dissolve(particleId) {
    const out = this.field.dissolve(particleId);
    this.#record('dissolve', particleId, { particleId });
    return out;
  }

  annihilate(id) {
    this.field.annihilate(id);
    this.#record('annihilate', id, { id });
  }

  observe(fields) {
    const obs = this.world.observe(fields);
    this.#record('observe', `${obs.world_id}/${obs.domain_id}`, { fields });
    return obs;
  }

  cross(ref, via) {
    const moved = this.world.cross(ref, via);
    this.#record('cross', `${ref.world_id}/${ref.domain_id}→${moved.world_id}`, { ref, via });
    return moved;
  }

  state() {
    return {
      origin_signature: ORIGIN_SIGNATURE,
      genesis: this.field.snapshot(),
      world: this.world.snapshot(),
    };
  }

  stateHash() {
    return sha256Hex(canonicalJson(this.state()));
  }

  head() {
    return this.trace.length ? this.trace[this.trace.length - 1].hash : GENESIS_HASH;
  }

  toFltnz() {
    return this.trace.map((r) => `[${r.ts}] ::${r.verb}→ ${r.target}`).join('\n');
  }

  #record(verb, target, args) {
    const seq = this.trace.length + 1;
    const body = {
      seq,
      ts: String(seq).padStart(6, '0'), // 因果序，不是牆上時間：Replay 不能依賴時鐘
      verb,
      fx: VERB_FX[verb],
      target,
      args: structuredClone(args), // 呼叫端之後改動自己的陣列／物件，不得回頭改寫已記錄的軌跡
      prev: this.head(),
      origin_signature: ORIGIN_SIGNATURE,
    };
    this.trace.push({ ...body, hash: sha256Hex(canonicalJson(body)) });
  }
}

export function verifyTrace(trace) {
  let prev = GENESIS_HASH;
  for (const [i, record] of trace.entries()) {
    const { hash, ...body } = record;
    if (body.seq !== i + 1) throw new Error(`trace seq 斷裂於第 ${i + 1} 筆`);
    if (body.prev !== prev) throw new Error(`trace prev 不連續於 seq ${body.seq}`);
    if (body.origin_signature !== ORIGIN_SIGNATURE) throw new Error(`LAW-0 違反於 seq ${body.seq}`);
    if (sha256Hex(canonicalJson(body)) !== hash) throw new Error(`trace 雜湊不符於 seq ${body.seq}`);
    prev = hash;
  }
  return prev;
}

// Replay：只憑軌跡重建。先驗鏈，再逐筆重做，最後比對重建出的鏈頭。
export function replay(trace, dict) {
  const head = verifyTrace(trace);
  const rt = new Runtime(dict);
  for (const { verb, args } of trace) {
    switch (verb) {
      case 'jump': rt.jump(args.type, args.magnitude); break;
      case 'entangle': rt.entangle(args.id1, args.id2); break;
      case 'collapse': rt.collapse(args.ids, args.structure, args.environment); break;
      case 'ascend': rt.ascend(args.particleId, args.N_k, args.η_k); break;
      case 'descend': rt.descend(args.particleId); break;
      case 'dissolve': rt.dissolve(args.particleId); break;
      case 'annihilate': rt.annihilate(args.id); break;
      case 'observe': rt.observe(args.fields); break;
      case 'cross': rt.cross(args.ref, args.via); break;
      default: throw new Error(`unknown verb in trace: ${verb}`);
    }
  }
  if (rt.head() !== head) throw new Error('replay 重建出的軌跡鏈頭與原軌跡不同');
  return rt;
}
