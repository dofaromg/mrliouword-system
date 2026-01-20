-- MrLiouWord Unified Gateway - D1 Database Schema
-- origin_signature: MrLiouWord

-- Unified Resources Index
CREATE TABLE IF NOT EXISTS unified_resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  source TEXT NOT NULL,
  layer TEXT NOT NULL,
  url TEXT,
  tags TEXT, -- JSON array
  created_at TEXT DEFAULT (datetime('now')),
  meta TEXT -- JSON object
);

CREATE INDEX idx_resources_source ON unified_resources(source);
CREATE INDEX idx_resources_layer ON unified_resources(layer);
CREATE INDEX idx_resources_type ON unified_resources(type);

-- Particles (52 particles)
CREATE TABLE IF NOT EXISTS particles (
  fx TEXT PRIMARY KEY,
  hv TEXT NOT NULL, -- Human value (中文描述)
  av TEXT NOT NULL, -- Action value (功能說明)
  dom TEXT NOT NULL, -- Domain
  act TEXT NOT NULL, -- Action
  nrg REAL NOT NULL, -- Energy level (0-1)
  links TEXT, -- JSON array of connected fx
  tags TEXT, -- JSON array
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_particles_domain ON particles(dom);
CREATE INDEX idx_particles_action ON particles(act);

-- Particle Connections (graph edges)
CREATE TABLE IF NOT EXISTS particle_connections (
  from_fx TEXT NOT NULL,
  to_fx TEXT NOT NULL,
  weight REAL DEFAULT 1.0,
  created_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (from_fx, to_fx),
  FOREIGN KEY (from_fx) REFERENCES particles(fx),
  FOREIGN KEY (to_fx) REFERENCES particles(fx)
);

-- Memories (記憶條目)
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  simhash TEXT NOT NULL, -- 64-bit SimHash
  tags TEXT, -- JSON array
  layer TEXT NOT NULL,
  ts INTEGER NOT NULL, -- Unix timestamp
  merkle TEXT NOT NULL, -- SHA256 hash
  prev TEXT NOT NULL, -- Previous merkle hash
  meta TEXT -- JSON object
);

CREATE INDEX idx_memories_layer ON memories(layer);
CREATE INDEX idx_memories_ts ON memories(ts);
CREATE INDEX idx_memories_simhash ON memories(simhash);

-- Memory Layers (9 layers: L0-L∞)
CREATE TABLE IF NOT EXISTS memory_layers (
  name TEXT PRIMARY KEY,
  frequency REAL NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Personas (人格系統)
CREATE TABLE IF NOT EXISTS personas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  state TEXT NOT NULL, -- active | dormant
  traits TEXT, -- JSON object
  capabilities TEXT, -- JSON array
  constraints TEXT, -- JSON array
  origin TEXT NOT NULL,
  created TEXT NOT NULL,
  updated TEXT NOT NULL,
  meta TEXT -- JSON object
);

CREATE INDEX idx_personas_state ON personas(state);

-- Trace Log (追蹤日誌)
CREATE TABLE IF NOT EXISTS trace_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  particle_fx TEXT,
  timestamp TEXT NOT NULL,
  data TEXT, -- JSON object
  FOREIGN KEY (particle_fx) REFERENCES particles(fx)
);

CREATE INDEX idx_trace_log_timestamp ON trace_log(timestamp);
CREATE INDEX idx_trace_log_particle ON trace_log(particle_fx);

-- Documents (文檔索引)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  simhash TEXT,
  layer TEXT NOT NULL,
  source TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  meta TEXT -- JSON object
);

CREATE INDEX idx_documents_layer ON documents(layer);
CREATE INDEX idx_documents_simhash ON documents(simhash);

-- Sync Status (同步狀態)
CREATE TABLE IF NOT EXISTS sync_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  last_sync TEXT NOT NULL,
  sync_type TEXT NOT NULL,
  records_synced INTEGER NOT NULL,
  status TEXT NOT NULL, -- success | failed
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sync_status_type ON sync_status(sync_type);
CREATE INDEX idx_sync_status_created ON sync_status(created_at);
