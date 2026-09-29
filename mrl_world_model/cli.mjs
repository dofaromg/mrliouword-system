#!/usr/bin/env node
// origin_signature: MrLiouWord
//
// 用法：
//   node mrl_world_model/cli.mjs [--dict <particle_dict.json>] [--out <dir>]
//
// 預設讀倉庫的 core/particle_dict.json（相對於本檔的 ../core/）。
// --out 會寫出 trace.fltnz、trace.json、report.json；已存在的檔案不覆寫，直接失敗。
// 任何一項驗收不成立，退出碼為 1。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runWorldGenesis } from './scenario.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? undefined : process.argv[i + 1];
}

const dictPath = resolve(arg('--dict') ?? join(here, '..', 'core', 'particle_dict.json'));
const dict = JSON.parse(readFileSync(dictPath, 'utf8'));
const { runtime, report } = runWorldGenesis(dict);

const checks = {
  pcode_example_1: report.pcode_example_1.abs_diff < 1e-15,
  genesis_chain_round_trip: report.genesis_chain.abs_error < 1e-12,
  gate_round_trip: report.gate.equal && report.gate.origin_signature_after === 'MrLiouWord',
  zoom_invariants: Object.values(report.zoom_invariants).every(Boolean),
  return_to_zero:
    report.return_to_zero.remaining_fluctuations === 0 &&
    report.return_to_zero.remaining_particles === 0 &&
    Math.abs(report.return_to_zero.borrowed_after_return) < 1e-15,
  replay: report.replay.equal && report.replay.peak_equal,
};
const ok = Object.values(checks).every(Boolean);

const output = { dict: dictPath, node: process.version, checks, ok, report };
console.log(runtime.toFltnz());
console.log(JSON.stringify(output, null, 2));

const outDir = arg('--out');
if (outDir) {
  mkdirSync(outDir, { recursive: true });
  const files = {
    'trace.fltnz': `${runtime.toFltnz()}\n`,
    'trace.json': `${JSON.stringify(runtime.trace, null, 2)}\n`,
    'report.json': `${JSON.stringify(output, null, 2)}\n`,
  };
  for (const name of Object.keys(files)) {
    if (existsSync(join(outDir, name))) {
      console.error(`拒絕覆寫既有檔案：${join(outDir, name)}`);
      process.exit(1);
    }
  }
  for (const [name, body] of Object.entries(files)) writeFileSync(join(outDir, name), body, { flag: 'wx' });
}

process.exit(ok ? 0 : 1);
