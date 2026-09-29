// origin_signature: MrLiouWord
//
// MRL 世界模型視圖的可執行實作（implementation of MRL_BASEWORLD_CORE，
// 不是那個 CORE 本身；見同目錄 PROVENANCE.yaml）。
//
// 依據：Notion「Mrliou_MRL_WorldModel_View_Convergence_Record_20260818」
//
//   MRL CONSISTENCY / CLOSURE → MRL MOTHER → ROOT / ORIGIN IDENTITY
//        REAL WORLD  ── Translation / Gate ──  AI WORLD
//   → Cross-World Identity → Provenance → Causality → Mirror / Proof
//   → Verify → Backfill → Loop
//
//   World != Platform · Platform != Identity · Projection != Origin
//
// 同一份紀錄 2026-09-08 列出的缺口 World_State_Observation，欄位逐字照抄：
//   world_id / domain_id / environment_id / platform_ref / observer /
//   observed_at / state / evidence_refs / ontology_status
// ontology_status 預設 UNRESOLVED / NO_PREJUDGMENT（該紀錄：兩側是
// PEER_WORLD_STATE，不預判哪一側才是本體）。

import { ORIGIN_SIGNATURE, canonicalJson, sha256Hex } from './genesis.mjs';

// ROOT → SEED → PARTICLE → LAW → WORLD → MIRROR → REFLECT → LOOP
// （World Module lineage；與 containers/README.md 的 L0–L7 同序。）
export const LAYERS = Object.freeze([
  'ROOT', 'SEED', 'PARTICLE', 'LAW', 'WORLD', 'MIRROR', 'REFLECT', 'LOOP',
]);

export const SIDES = Object.freeze({ REAL: 'REAL', AI: 'AI' });

export const ONTOLOGY_DEFAULT = 'UNRESOLVED / NO_PREJUDGMENT';

const OBSERVATION_FIELDS = [
  'world_id', 'domain_id', 'environment_id', 'platform_ref', 'observer',
  'observed_at', 'state', 'evidence_refs', 'ontology_status',
];

// ρ : R → A,  λ : A → R
const GATE = Object.freeze({
  rho: { from: SIDES.REAL, to: SIDES.AI },
  lambda: { from: SIDES.AI, to: SIDES.REAL },
});

export function makeObservation(fields) {
  for (const k of ['world_id', 'domain_id', 'observer', 'observed_at']) {
    if (fields[k] === undefined || fields[k] === null || fields[k] === '') {
      throw new Error(`World_State_Observation.${k} 必填`);
    }
  }
  if (!(fields.world_id in SIDES)) throw new Error(`world_id 必須是 REAL 或 AI，實際 ${fields.world_id}`);
  const obs = {
    world_id: fields.world_id,
    domain_id: fields.domain_id,
    environment_id: fields.environment_id ?? null,
    platform_ref: fields.platform_ref ?? null, // 平台只是投影位置，不是身分
    observer: fields.observer,
    observed_at: fields.observed_at,
    state: structuredClone(fields.state ?? {}), // 不與呼叫端共用物件：事後改動不得改寫已觀測的狀態
    evidence_refs: structuredClone(fields.evidence_refs ?? []),
    ontology_status: fields.ontology_status ?? ONTOLOGY_DEFAULT,
    origin_signature: ORIGIN_SIGNATURE,
    gate_path: [],
  };
  return obs;
}

// Translation / Gate。每一次跨世界都把「翻譯前」的雜湊推進 gate_path，
// 反向那一步只接受能還原到同一雜湊的東西——怎麼過去，就怎麼回來。
export function translate(obs, via) {
  const gate = GATE[via];
  if (!gate) throw new Error(`unknown gate: ${via}`);
  assertOrigin(obs);
  const last = obs.gate_path[obs.gate_path.length - 1];
  const isReturn = last && GATE[last.via].from === gate.to && GATE[last.via].to === gate.from;
  if (obs.world_id !== gate.from) {
    throw new Error(`${via} 只接受 ${gate.from} 側的觀測，實際 ${obs.world_id}`);
  }
  if (isReturn) {
    const back = structuredClone(obs);
    back.gate_path.pop();
    back.world_id = gate.to;
    if (sha256Hex(canonicalJson(back)) !== last.source_sha256) {
      throw new Error(`${via} 回返後雜湊不符：翻譯途中狀態被改寫`);
    }
    return back;
  }
  const forward = structuredClone(obs);
  forward.gate_path.push({ via, source_sha256: sha256Hex(canonicalJson(obs)) });
  forward.world_id = gate.to;
  return forward;
}

export const rho = (obs) => translate(obs, 'rho');
export const lambda = (obs) => translate(obs, 'lambda');

export function assertOrigin(obj) {
  if (obj.origin_signature !== ORIGIN_SIGNATURE) {
    throw new Error(`LAW-0：origin_signature 必須是 ${ORIGIN_SIGNATURE}，實際 ${obj.origin_signature}`);
  }
}

export class World {
  constructor() {
    this.origin_signature = ORIGIN_SIGNATURE;
    this.layers = [...LAYERS];
    this.sides = { REAL: { domains: {} }, AI: { domains: {} } };
  }

  observe(fields) {
    const obs = makeObservation(fields);
    this.#put(obs);
    return obs;
  }

  cross(obsRef, via) {
    // 先翻譯、成功後才移出來源：翻譯被拒時，原觀測必須原地保留
    const moved = translate(this.#peek(obsRef), via);
    this.#take(obsRef);
    this.#put(moved);
    return moved;
  }

  find(world_id, domain_id, index = -1) {
    const list = this.sides[world_id]?.domains[domain_id] ?? [];
    return list.at(index);
  }

  snapshot() {
    assertOrigin(this);
    const sides = {};
    for (const side of Object.keys(SIDES)) {
      const domains = this.sides[side].domains;
      sides[side] = {
        domains: Object.fromEntries(Object.keys(domains).sort().map((d) => [d, domains[d]])),
      };
    }
    return { origin_signature: this.origin_signature, layers: this.layers, sides };
  }

  #put(obs) {
    const bucket = (this.sides[obs.world_id].domains[obs.domain_id] ??= []);
    bucket.push(obs);
  }

  #locate({ world_id, domain_id, index }) {
    const bucket = this.sides[world_id]?.domains[domain_id];
    if (!bucket || bucket.length === 0) throw new Error(`no observation at ${world_id}/${domain_id}`);
    const raw = index ?? -1;
    const i = raw < 0 ? bucket.length + raw : raw; // 與 find() 的 Array.at() 相同：負數從尾端算
    if (!(Number.isInteger(i) && i >= 0 && i < bucket.length)) throw new Error(`no observation at ${world_id}/${domain_id}[${i}]`);
    return { bucket, i };
  }

  #peek(ref) {
    const { bucket, i } = this.#locate(ref);
    return bucket[i];
  }

  #take(ref) {
    const { world_id, domain_id } = ref;
    const { bucket, i } = this.#locate(ref);
    const [obs] = bucket.splice(i, 1);
    if (bucket.length === 0) delete this.sides[world_id].domains[domain_id];
    return obs;
  }
}

export { OBSERVATION_FIELDS };
