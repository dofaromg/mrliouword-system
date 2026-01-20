/**
 * D1 Database Service
 * origin_signature: MrLiouWord
 */

import type { Particle, Memory, Persona, Resource, TraceLog } from '../types';

export class D1Service {
  constructor(private db: D1Database) {}

  async getParticles(domain?: string): Promise<Particle[]> {
    let query = 'SELECT * FROM particles';
    const params: string[] = [];
    
    if (domain) {
      query += ' WHERE dom = ?';
      params.push(domain);
    }
    
    const result = await this.db.prepare(query).bind(...params).all();
    return (result.results as unknown as Particle[]).map(p => ({
      ...p,
      links: typeof p.links === 'string' ? JSON.parse(p.links) : p.links,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags
    }));
  }

  async getParticle(fx: string): Promise<Particle | null> {
    const result = await this.db.prepare('SELECT * FROM particles WHERE fx = ?').bind(fx).first();
    if (!result) return null;
    const p = result as unknown as Particle;
    return {
      ...p,
      links: typeof p.links === 'string' ? JSON.parse(p.links) : p.links,
      tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : p.tags
    };
  }

  async createParticle(particle: Particle): Promise<void> {
    await this.db.prepare(`
      INSERT INTO particles (fx, hv, av, dom, act, nrg, links, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      particle.fx,
      particle.hv,
      particle.av,
      particle.dom,
      particle.act,
      particle.nrg,
      JSON.stringify(particle.links),
      JSON.stringify(particle.tags)
    ).run();
  }

  async getMemories(limit: number = 100): Promise<Memory[]> {
    const result = await this.db.prepare('SELECT * FROM memories ORDER BY ts DESC LIMIT ?').bind(limit).all();
    return (result.results as unknown as Memory[]).map(m => ({
      ...m,
      tags: typeof m.tags === 'string' ? JSON.parse(m.tags) : m.tags,
      meta: typeof m.meta === 'string' ? JSON.parse(m.meta) : m.meta
    }));
  }

  async createMemory(memory: Memory): Promise<void> {
    await this.db.prepare(`
      INSERT INTO memories (id, content, type, simhash, tags, layer, ts, merkle, prev, meta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      memory.id,
      memory.content,
      memory.type,
      memory.simhash,
      JSON.stringify(memory.tags),
      memory.layer,
      memory.ts,
      memory.merkle,
      memory.prev,
      JSON.stringify(memory.meta)
    ).run();
  }

  async getPersonas(): Promise<Persona[]> {
    const result = await this.db.prepare('SELECT * FROM personas').all();
    return (result.results as unknown as Persona[]).map(p => ({
      ...p,
      traits: typeof p.traits === 'string' ? JSON.parse(p.traits) : p.traits,
      capabilities: typeof p.capabilities === 'string' ? JSON.parse(p.capabilities) : p.capabilities,
      constraints: typeof p.constraints === 'string' ? JSON.parse(p.constraints) : p.constraints,
      meta: typeof p.meta === 'string' ? JSON.parse(p.meta) : p.meta
    }));
  }

  async getPersona(id: string): Promise<Persona | null> {
    const result = await this.db.prepare('SELECT * FROM personas WHERE id = ?').bind(id).first();
    if (!result) return null;
    const p = result as unknown as Persona;
    return {
      ...p,
      traits: typeof p.traits === 'string' ? JSON.parse(p.traits) : p.traits,
      capabilities: typeof p.capabilities === 'string' ? JSON.parse(p.capabilities) : p.capabilities,
      constraints: typeof p.constraints === 'string' ? JSON.parse(p.constraints) : p.constraints,
      meta: typeof p.meta === 'string' ? JSON.parse(p.meta) : p.meta
    };
  }

  async updatePersona(persona: Persona): Promise<void> {
    await this.db.prepare(`
      UPDATE personas 
      SET name = ?, type = ?, state = ?, traits = ?, capabilities = ?, constraints = ?, updated = ?
      WHERE id = ?
    `).bind(
      persona.name,
      persona.type,
      persona.state,
      JSON.stringify(persona.traits),
      JSON.stringify(persona.capabilities),
      JSON.stringify(persona.constraints),
      persona.updated,
      persona.id
    ).run();
  }

  async getResources(source?: string, layer?: string): Promise<Resource[]> {
    let query = 'SELECT * FROM unified_resources WHERE 1=1';
    const params: string[] = [];
    
    if (source) {
      query += ' AND source = ?';
      params.push(source);
    }
    if (layer) {
      query += ' AND layer = ?';
      params.push(layer);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.prepare(query).bind(...params).all();
    return (result.results as unknown as Resource[]).map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta) : r.meta
    }));
  }

  async searchResources(q: string): Promise<Resource[]> {
    const result = await this.db.prepare(`
      SELECT * FROM unified_resources 
      WHERE name LIKE ? OR type LIKE ? OR tags LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(`%${q}%`, `%${q}%`, `%${q}%`).all();
    return (result.results as unknown as Resource[]).map(r => ({
      ...r,
      tags: typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags,
      meta: typeof r.meta === 'string' ? JSON.parse(r.meta) : r.meta
    }));
  }

  async logTrace(log: TraceLog): Promise<void> {
    await this.db.prepare(`
      INSERT INTO trace_log (id, action, particle_fx, timestamp, data)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      log.id,
      log.action,
      log.particle_fx || null,
      log.timestamp,
      JSON.stringify(log.data)
    ).run();
  }
}
