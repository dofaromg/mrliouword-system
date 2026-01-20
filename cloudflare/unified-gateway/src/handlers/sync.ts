/**
 * Sync Handler
 * origin_signature: MrLiouWord
 */

import { D1Service } from '../services/d1';
import { KVService } from '../services/kv';
import type { Env, SyncStatus } from '../types';

export async function handleSyncStatus(env: Env): Promise<Response> {
  const kv = new KVService(env.KV);
  const status = await kv.get<SyncStatus>('sync:status');
  
  return jsonResponse({ status: status || { message: 'No sync performed yet' } });
}

export async function handleSyncMemories(env: Env): Promise<Response> {
  const db = new D1Service(env.DB);
  const kv = new KVService(env.KV);
  
  const memories = await db.getMemories(1000);
  let synced = 0;
  
  for (const memory of memories) {
    await kv.put(`mem:${memory.id}`, memory);
    synced++;
  }
  
  const status: SyncStatus = {
    last_sync: new Date().toISOString(),
    sync_type: 'memories',
    records_synced: synced,
    status: 'success'
  };
  
  await kv.put('sync:status', status);
  
  return jsonResponse({ message: 'Memories synced to KV', synced });
}

export async function handleSyncParticles(env: Env): Promise<Response> {
  const db = new D1Service(env.DB);
  const kv = new KVService(env.KV);
  
  const particles = await db.getParticles();
  let synced = 0;
  
  for (const particle of particles) {
    await kv.put(`particle:${particle.fx}`, particle);
    synced++;
  }
  
  const status: SyncStatus = {
    last_sync: new Date().toISOString(),
    sync_type: 'particles',
    records_synced: synced,
    status: 'success'
  };
  
  await kv.put('sync:status', status);
  
  return jsonResponse({ message: 'Particles synced to KV', synced });
}

export async function handleSyncAll(env: Env): Promise<Response> {
  const memResult = await handleSyncMemories(env);
  const partResult = await handleSyncParticles(env);
  
  const memData = await memResult.json() as { synced: number };
  const partData = await partResult.json() as { synced: number };
  
  return jsonResponse({
    message: 'All data synced to KV',
    memories: memData.synced,
    particles: partData.synced,
    total: memData.synced + partData.synced
  });
}

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
