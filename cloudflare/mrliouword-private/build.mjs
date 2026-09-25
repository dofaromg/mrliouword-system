// Local compilation only. No account access or Cloudflare API calls.
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('.', import.meta.url);
const config = JSON.parse(await readFile(new URL('wrangler.jsonc', root), 'utf8'));
if (!config.durable_objects?.bindings.some(b => b.name === 'MRL_CORE_MEMORY' && b.class_name === 'Mrliou_CoreMemory')) throw new Error('Missing memory binding');
if (!config.migrations?.some(m => m.new_sqlite_classes?.includes('Mrliou_CoreMemory'))) throw new Error('Missing SQLite migration');
const output = new URL('.wrangler/local-build/', root);
await mkdir(output, { recursive: true });
const bundle = await build({ entryPoints: [new URL('src/index.ts', root).pathname], bundle: true, format: 'esm', platform: 'browser', target: 'es2022', write: false, metafile: true });
const code = bundle.outputFiles[0].contents;
await writeFile(new URL('index.mjs', output), code);
const exports = Object.values(bundle.metafile.outputs).flatMap(v => v.exports);
if (!exports.includes('default') || !exports.includes('Mrliou_CoreMemory')) throw new Error('Worker exports incomplete');
const receipt = { origin_signature: 'MrLiouWord', mode: 'LOCAL_BUILD_ONLY', size_bytes: code.length, sha256: createHash('sha256').update(code).digest('hex'), exports, configured_worker_name: config.name, deployment_verified: false };
await writeFile(new URL('build-receipt.json', output), JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt));
