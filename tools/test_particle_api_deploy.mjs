// mrl-origin: MrLiouWord
// canonical_authority: Mr.liou
// origin_signature: MrLiouWord
// Codex contribution: deployment safety tests; derivative_role: implementation.
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const dir = mkdtempSync(join(tmpdir(), 'particle-deploy-test-'));
const shim = join(dir, 'mock.mjs');
const cli = join(dir, 'wrangler');
writeFileSync(cli, `#!/usr/bin/env node
require('node:fs').writeFileSync(process.env.WRANGLER_OUTPUT_FILE_PATH, JSON.stringify({type:'version-upload',version_id:'11111111-1111-1111-1111-111111111111'})+'\\n');
`, { mode: 0o755 });
writeFileSync(shim, `
import {appendFileSync} from 'node:fs';
const scenario=process.env.SCENARIO;
const old={id:'old',versions:[{version_id:'00000000-0000-0000-0000-000000000000',percentage:100}]};
let active=old, deploymentReads=0;
globalThis.setTimeout=(f)=>{queueMicrotask(f);return 0;};
globalThis.fetch=async (input,options={})=>{
 const url=new URL(input), path=url.pathname, method=options.method??'GET';
 appendFileSync(process.env.CALLS,JSON.stringify({path,method,payload:options.body?JSON.parse(options.body):null})+'\\n');
 let result;
 if(url.hostname.endsWith('.workers.dev')) return new Response(JSON.stringify({version:'3.0.0',origin:'MrLiouWord',origin_signature:'MrLiouWord'}),{status:path==='/memory/stats'?(scenario==='open-private'?200:401):200});
 if(path.endsWith('/settings')) result={compatibility_date:'2024-01-01',compatibility_flags:['nodejs_compat'],bindings:[
 {name:'MRLIOUWORD_VAULT',type:'kv_namespace',namespace_id:scenario==='wrong-binding'?'wrong':'01275832766148bfbcaa00ee4aeb9946'},
 {name:'DB',type:'d1',id:'7980baaf-48d3-43cc-8be7-dd8c9590f3d1'},
 {name:'PARTICLES',type:'r2_bucket',bucket_name:'mrlioubook'},
 ...(scenario==='no-master'?[]:[{name:'MASTER_KEY',type:'secret_text'}])]};
 else if(path.endsWith('/query')) result=[{success:true,results:scenario==='old-unique'?(JSON.parse(options.body).sql.includes('index_list')?[{name:'oldkey',unique:1}]:[{name:'key'}]):[]}];
 else if(path.endsWith('/deployments')) {
  if(method==='POST') {active={id:active.id==='old'?'new':'rollback',versions:JSON.parse(options.body).versions};result=active;}
  else {deploymentReads++;result={deployments:[scenario==='concurrent'&&deploymentReads>1?{...old,id:'other'}:active]};}
 }
 else if(path.endsWith('/workers/subdomain')) result={subdomain:'deployment-test'};
 else if(path.endsWith('/subdomain')) result={enabled:true};
 else if(path.includes('/versions/')) result={annotations:{'workers/message':'source='+process.env.GITHUB_SHA+';run='+process.env.GITHUB_RUN_ID}};
 else throw Error('Unexpected endpoint '+path);
 return new Response(JSON.stringify({success:true,result}),{status:200});
};
`);

for (const scenario of ['wrong-binding', 'no-master', 'old-unique', 'concurrent', 'open-private', 'success']) {
  test(scenario, () => {
    const calls = join(dir, scenario + '.jsonl');
    writeFileSync(calls, '');
    const run = spawnSync(process.execPath, ['--import', shim, 'tools/particle-api-deploy.mjs'], {
      encoding: 'utf8', timeout: 15000,
      env: { ...process.env, SCENARIO: scenario, CALLS: calls,
        CLOUDFLARE_ACCOUNT_ID: '0b36a4577da7fced6df2e062fa5f6fa2',
        CLOUDFLARE_API_TOKEN: 'test-token', PARTICLE_WRANGLER: cli,
        PARTICLE_RECEIPT_PATH: join(dir, 'mock-receipt.json'),
        GITHUB_SHA: '6575468d8e5d11236a3dbe4bfd5f43ff78c2fd7f', GITHUB_RUN_ID: 'test' },
    });
    assert.equal(run.error, undefined);
    assert.equal(run.status === 0, scenario === 'success', run.stderr);
    const events = readFileSync(calls, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
    const mutations = events.filter(e => e.method === 'POST' && e.path.endsWith('/deployments'));
    assert.equal(mutations.length, scenario === 'success' ? 1 : scenario === 'open-private' ? 2 : 0);
    if (scenario === 'open-private') assert.equal(mutations[1].payload.versions[0].version_id, '00000000-0000-0000-0000-000000000000');
  });
}
