/**
 * Particles Handler
 * origin_signature: MrLiouWord
 */

import { D1Service } from '../services/d1';
import type { Env } from '../types';

export async function handleGetAllParticles(env: Env): Promise<Response> {
  const db = new D1Service(env.DB);
  const particles = await db.getParticles();
  return jsonResponse({ particles, count: particles.length });
}

export async function handleGetParticlesByDomain(env: Env, domain: string): Promise<Response> {
  const db = new D1Service(env.DB);
  const particles = await db.getParticles(domain);
  return jsonResponse({ particles, count: particles.length, domain });
}

export async function handleGetParticle(env: Env, fx: string): Promise<Response> {
  const db = new D1Service(env.DB);
  const particle = await db.getParticle(fx);
  
  if (!particle) {
    return new Response(JSON.stringify({ error: 'Particle not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return jsonResponse({ particle });
}

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
}
