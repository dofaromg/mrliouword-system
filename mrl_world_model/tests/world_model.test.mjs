// origin_signature: MrLiouWord
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CombinationRule, FluctuationType, GenesisField, calculate_structure_factor,
} from '../genesis.mjs';
import { LAYERS, World, lambda, makeObservation, rho } from '../world.mjs';
import { Runtime, replay, verifyTrace } from '../rhythm.mjs';
import { project, selfCheck } from '../zoom.mjs';
import { OWNER_COMMAND, PCODE_EXAMPLE_1, runWorldGenesis } from '../scenario.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dict = JSON.parse(readFileSync(join(here, '..', '..', 'core', 'particle_dict.json'), 'utf8'));

test('pcode 範例一：0.001 × 6 × 6 × 0.95', () => {
  const { report } = runWorldGenesis(dict);
  assert.equal(report.pcode_example_1.actual, PCODE_EXAMPLE_1.expected);
  assert.equal(report.pcode_example_1.N_seed, 6);
  assert.equal(report.pcode_example_1.η_seed, 0.95);
});

test('完整閉環：鏈回算、Gate 回返、Zoom I1–I7、回到 Zero、Replay 終態與峰值', () => {
  const { report } = runWorldGenesis(dict);
  assert.ok(report.genesis_chain.abs_error < 1e-12);
  assert.equal(report.gate.equal, true);
  assert.deepEqual(report.gate.path, ['REAL', 'AI', 'REAL']);
  for (const [k, v] of Object.entries(report.zoom_invariants)) assert.equal(v, true, k);
  assert.equal(report.return_to_zero.remaining_fluctuations, 0);
  assert.equal(report.return_to_zero.remaining_particles, 0);
  assert.ok(Math.abs(report.return_to_zero.borrowed_after_return) < 1e-15);
  assert.equal(report.replay.equal, true);
  assert.equal(report.replay.peak_equal, true);
});

test('同一條軌跡跑兩次，狀態雜湊與鏈頭完全相同（無亂數、無時鐘）', () => {
  const a = runWorldGenesis(dict).report.replay;
  const b = runWorldGenesis(dict).report.replay;
  assert.equal(a.original_state_sha256, b.original_state_sha256);
  assert.equal(a.trace_head, b.trace_head);
});

test('四種 CombinationRule 的結構因子照原文', () => {
  const f = new GenesisField();
  const two = [f.create_fluctuation('EXISTENCE', 1), f.create_fluctuation('RHYTHM', 1)];
  assert.equal(calculate_structure_factor(two, CombinationRule.HETEROGENEOUS), 2 * Math.pow(1.1, 2));
  assert.equal(calculate_structure_factor(two, CombinationRule.SYMMETRIC), 2 * 1.2);
  assert.equal(calculate_structure_factor(two, CombinationRule.OPEN_CHAIN), 2 * 0.9);
  assert.throws(() => f.crystallize(two.map((d) => d.id), CombinationRule.HOMOGENEOUS), /same type/);
  const three = ['EXISTENCE', 'EXISTENCE', 'EXISTENCE'].map((t) => f.create_fluctuation(t, 1).id);
  assert.throws(() => f.crystallize(three, CombinationRule.SYMMETRIC), /pairs/);
  assert.throws(() => f.crystallize(three, CombinationRule.HETEROGENEOUS), /multiple types/);
});

test('已綁定的 δP₀ 不能湮滅；零 magnitude 不能創生', () => {
  const f = new GenesisField();
  const ids = [f.create_fluctuation('EXISTENCE', 0.5).id, f.create_fluctuation('EXISTENCE', 0.5).id];
  f.crystallize(ids, CombinationRule.HOMOGENEOUS);
  assert.throws(() => f.annihilate(ids[0]), /bound/);
  assert.throws(() => f.create_fluctuation('EXISTENCE', 0), /不為零/);
  assert.throws(() => f.create_fluctuation('NOT_A_TYPE', 1), /unknown FluctuationType/);
});

test('糾纏雙向、湮滅時自動解糾纏', () => {
  const f = new GenesisField();
  const a = f.create_fluctuation(FluctuationType.RESONANCE, 1).id;
  const b = f.create_fluctuation(FluctuationType.RESONANCE, 1).id;
  const pair = f.entangle(a, b);
  assert.ok(pair.strength >= -1 && pair.strength <= 1);
  assert.deepEqual(f.fluctuations.get(b).state.entangled_with, [a]);
  f.annihilate(a);
  assert.deepEqual(f.fluctuations.get(b).state.entangled_with, []);
});

test('Gate：翻譯途中被改寫，λ 拒絕回返', () => {
  const obs = makeObservation(OWNER_COMMAND);
  const inAI = rho(obs);
  assert.equal(inAI.world_id, 'AI');
  const tampered = structuredClone(inAI);
  tampered.state.text = '被改過的指令';
  assert.throws(() => lambda(tampered), /雜湊不符/);
  assert.deepEqual(lambda(inAI), obs);
});

test('Gate：方向錯誤與 LAW-0 違反都被擋', () => {
  const obs = makeObservation(OWNER_COMMAND);
  assert.throws(() => lambda(obs), /只接受 AI/);
  const forged = { ...obs, origin_signature: 'someone-else' };
  assert.throws(() => rho(forged), /LAW-0/);
});

test('AI 側原生觀測也能經 λ 去、ρ 回（兩側對稱）', () => {
  const ai = makeObservation({ ...OWNER_COMMAND, world_id: 'AI', observer: 'partner' });
  const inReal = lambda(ai);
  assert.equal(inReal.world_id, 'REAL');
  assert.deepEqual(rho(inReal), ai);
});

test('World_State_Observation 缺必填欄位即拒絕；ontology_status 預設不預判', () => {
  assert.throws(() => makeObservation({ ...OWNER_COMMAND, observer: '' }), /observer/);
  assert.throws(() => makeObservation({ ...OWNER_COMMAND, world_id: 'PLATFORM' }), /REAL 或 AI/);
  assert.equal(makeObservation(OWNER_COMMAND).ontology_status, 'UNRESOLVED / NO_PREJUDGMENT');
  assert.deepEqual(new World().snapshot().layers, [...LAYERS]);
});

test('軌跡被竄改任何一筆，verifyTrace 與 replay 都失敗', () => {
  const { runtime } = runWorldGenesis(dict);
  const bad = structuredClone(runtime.trace);
  bad[3].args.magnitude = 0.002;
  assert.throws(() => verifyTrace(bad), /雜湊不符/);
  assert.throws(() => replay(bad, dict), /雜湊不符/);
  const dropped = structuredClone(runtime.trace);
  dropped.splice(5, 1);
  assert.throws(() => verifyTrace(dropped), /斷裂|不連續/);
});

test('母體字典缺 fx 或 origin 不符就拒絕啟動', () => {
  const missing = structuredClone(dict);
  delete missing.particles['fx.flow.collapse'];
  assert.throws(() => new Runtime(missing), /fx\.flow\.collapse/);
  assert.throws(() => new Runtime({ ...dict, origin: 'other' }), /origin/);
});

test('Zoom 只讀：投影結果凍結、四級投影後狀態與軌跡不變', () => {
  const { runtime } = runWorldGenesis(dict);
  const before = runtime.stateHash();
  const view = project(runtime.state(), 'abstract');
  assert.throws(() => { view.layers.push('X'); });
  for (const lv of ['micro', 'core', 'macro', 'abstract']) project(runtime.state(), lv);
  assert.equal(runtime.stateHash(), before);
  assert.ok(Object.values(selfCheck(runtime)).every(Boolean));
  assert.throws(() => project(runtime.state(), 'galaxy'), /unknown zoom level/);
});

test('.fltnz 軌跡行格式 [ts] ::verb→ target', () => {
  const { runtime } = runWorldGenesis(dict);
  const lines = runtime.toFltnz().split('\n');
  assert.equal(lines.length, runtime.trace.length);
  for (const line of lines) assert.match(line, /^\[\d{6}\] ::[a-z]+→ \S/);
});
