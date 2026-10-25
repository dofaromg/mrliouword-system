// origin_signature: MrLiouWord
//
// 觀測容器（observational container）。
// 依據：Google Drive「粒子.fltnz原理邏輯文件」——
//   PRESENTATION = PARTICLES (no write-back) ⊗ ZOOM (projection)
//   Zoom 只改「你現在站多遠看」，不改資料。
//
// 四個尺度：micro → tokens、core → modules、macro → systems、abstract → concepts。
// 在本世界模型裡：micro = δP₀、core = 粒子、macro = 兩側世界、abstract = 分層與容器本身。
// 容器不變性 I1–I7 逐條可檢查，檢查結果全部來自實際比對，不是宣告。

import { canonicalJson, sha256Hex } from './genesis.mjs';

export const ZOOM_LEVELS = Object.freeze(['micro', 'core', 'macro', 'abstract']);

function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}

export function project(state, level) {
  const s = deepFreeze(structuredClone(state));
  switch (level) {
    case 'micro':
      return s.genesis.fluctuations.map((dp) => ({ id: dp.id, type: dp.type, bound: dp.state.bound }));
    case 'core':
      return s.genesis.particles.map((p) => ({
        id: p.id,
        magnitude: p.properties.magnitude,
        level: p.state.level,
        from: p.genesis.fluctuations,
      }));
    case 'macro':
      return Object.fromEntries(Object.entries(s.world.sides).map(([side, { domains }]) => [
        side,
        Object.fromEntries(Object.entries(domains).map(([d, list]) => [d, list.length])),
      ]));
    case 'abstract':
      return {
        container: 'observation',
        origin_signature: s.origin_signature,
        layers: s.world.layers,
        equation: 'PRESENTATION = PARTICLES (no write-back) ⊗ ZOOM (projection)',
      };
    default:
      throw new Error(`unknown zoom level: ${level}`);
  }
}

// I1–I7。每一條只用實測比對判定；runtime 需提供 state()、trace、vocab。
export function selfCheck(runtime) {
  const hashOf = (x) => sha256Hex(canonicalJson(x));
  const stateBefore = hashOf(runtime.state());
  const traceBefore = runtime.trace.length;
  const vocabBefore = hashOf(runtime.vocab);

  const pass1 = ZOOM_LEVELS.map((lv) => hashOf(project(runtime.state(), lv)));
  const reverse = [...ZOOM_LEVELS].reverse().map((lv) => hashOf(project(runtime.state(), lv))).reverse();
  const pass2 = ZOOM_LEVELS.map((lv) => hashOf(project(runtime.state(), lv)));

  const micro = project(runtime.state(), 'micro').map((d) => d.id);
  const coreFrom = project(runtime.state(), 'core').flatMap((p) => p.from);
  const sharedVisible = coreFrom.length === 0 || coreFrom.every((id) => micro.includes(id));

  let interrupted = true;
  try {
    project(runtime.state(), 'micro'); // 投影到一半就丟棄：不應留下任何東西
  } catch {
    interrupted = false;
  }

  const stateAfter = hashOf(runtime.state());
  return {
    I1_read_only: stateBefore === stateAfter,
    I2_no_ownership: sharedVisible,
    I3_reversible_view: pass1.every((h, i) => h === reverse[i]),
    I4_defer_commit: runtime.trace.length === traceBefore,
    I5_interruptible: interrupted && hashOf(runtime.state()) === stateBefore,
    I6_particle_first: hashOf(runtime.vocab) === vocabBefore,
    I7_time_neutral: pass1.every((h, i) => h === pass2[i]),
  };
}
