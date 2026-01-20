/**
 * Resources Handler
 * origin_signature: MrLiouWord
 */

import { D1Service } from '../services/d1';
import type { Env } from '../types';

export async function handleResourcesStats(env: Env): Promise<Response> {
  const db = new D1Service(env.DB);
  const resources = await db.getResources();
  
  const stats = {
    total: resources.length,
    by_source: {} as Record<string, number>,
    by_layer: {} as Record<string, number>,
    by_type: {} as Record<string, number>
  };
  
  for (const resource of resources) {
    stats.by_source[resource.source] = (stats.by_source[resource.source] || 0) + 1;
    stats.by_layer[resource.layer] = (stats.by_layer[resource.layer] || 0) + 1;
    stats.by_type[resource.type] = (stats.by_type[resource.type] || 0) + 1;
  }
  
  return jsonResponse({ stats });
}

export async function handleResourcesSearch(env: Env, query: string): Promise<Response> {
  const db = new D1Service(env.DB);
  const results = await db.searchResources(query);
  return jsonResponse({ results, count: results.length });
}

export async function handleResourcesBySource(env: Env, source: string): Promise<Response> {
  const db = new D1Service(env.DB);
  const results = await db.getResources(source);
  return jsonResponse({ results, count: results.length, source });
}

export async function handleResourcesByLayer(env: Env, layer: string): Promise<Response> {
  const db = new D1Service(env.DB);
  const results = await db.getResources(undefined, layer);
  return jsonResponse({ results, count: results.length, layer });
}

export async function handleCoreResources(env: Env): Promise<Response> {
  const db = new D1Service(env.DB);
  const results = await db.getResources(undefined, 'L7');
  return jsonResponse({ results, count: results.length, layer: 'L7' });
}

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
