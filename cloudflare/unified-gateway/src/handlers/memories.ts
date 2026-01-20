/**
 * Memories Handler
 * origin_signature: MrLiouWord
 */

import { D1Service } from '../services/d1';
import { KVService } from '../services/kv';
import { simhash64, hammingDistance } from '../utils/simhash';
import { computeMerkleHash } from '../utils/merkle';
import type { Env, Memory } from '../types';

export async function handleGetMemories(env: Env): Promise<Response> {
  const db = new D1Service(env.DB);
  const memories = await db.getMemories(100);
  return jsonResponse({ memories, count: memories.length });
}

export async function handleCommitMemory(env: Env, request: Request): Promise<Response> {
  const body = await request.json() as { content: string; type?: string; tags?: string[]; metadata?: Record<string, any> };
  
  if (!body.content) {
    return errorResponse('Content is required', 400);
  }
  
  const db = new D1Service(env.DB);
  const kv = new KVService(env.KV);
  
  const id = crypto.randomUUID();
  const simhash = simhash64(body.content);
  const ts = Date.now();
  const prev = await kv.get<string>('mem:head') || '0'.repeat(64);
  const merkle = await computeMerkleHash(body.content, simhash, ts, prev);
  
  const memory: Memory = {
    id,
    content: body.content,
    type: body.type || 'semantic',
    simhash,
    tags: body.tags || [],
    layer: 'L7',
    ts,
    merkle,
    prev,
    meta: body.metadata || {}
  };
  
  await db.createMemory(memory);
  await kv.put('mem:head', merkle);
  
  return jsonResponse({ memory });
}

export async function handleRecallMemory(env: Env, query: string, limit: number = 10): Promise<Response> {
  const db = new D1Service(env.DB);
  const queryHash = simhash64(query);
  const memories = await db.getMemories(1000);
  
  const scored = memories
    .map(m => ({ ...m, distance: hammingDistance(queryHash, m.simhash) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
  
  return jsonResponse({ results: scored, count: scored.length });
}

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
