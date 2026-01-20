/**
 * MrLiouWord Unified Gateway - TypeScript Types
 * origin_signature: MrLiouWord
 */

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  AUTH_KV: KVNamespace;
  R2: R2Bucket;
}

export interface Particle {
  fx: string;
  hv: string;
  av: string;
  dom: string;
  act: string;
  nrg: number;
  links: string[];
  tags: string[];
  created_at?: string;
}

export interface ParticleConnection {
  from_fx: string;
  to_fx: string;
  weight: number;
}

export interface Memory {
  id: string;
  content: string;
  type: string;
  simhash: string;
  tags: string[];
  layer: string;
  ts: number;
  merkle: string;
  prev: string;
  meta: Record<string, any>;
}

export interface MemoryLayer {
  name: string;
  frequency: number;
  description: string;
}

export interface Persona {
  id: string;
  name: string;
  type: string;
  state: 'active' | 'dormant';
  traits: Record<string, PersonaTrait>;
  capabilities: string[];
  constraints: string[];
  origin: string;
  created: string;
  updated: string;
  meta: Record<string, any>;
}

export interface PersonaTrait {
  name: string;
  value: number;
  category: string;
  description: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  source: string;
  layer: string;
  url?: string;
  tags: string[];
  created_at: string;
  meta: Record<string, any>;
}

export interface SyncStatus {
  last_sync: string;
  sync_type: string;
  records_synced: number;
  status: 'success' | 'failed';
  message?: string;
}

export interface TraceLog {
  id: string;
  action: string;
  particle_fx?: string;
  timestamp: string;
  data: Record<string, any>;
}
