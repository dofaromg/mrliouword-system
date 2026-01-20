/**
 * MrLiouWord Unified Gateway
 * origin_signature: MrLiouWord
 * 
 * 統一 API 閘道，整合所有系統功能
 */

import type { Env } from './types';
import * as resourcesHandler from './handlers/resources';
import * as particlesHandler from './handlers/particles';
import * as memoriesHandler from './handlers/memories';
import * as personasHandler from './handlers/personas';
import * as syncHandler from './handlers/sync';

const VERSION = '1.0.0';
const ORIGIN = 'MrLiouWord';

const FREQUENCIES = {
  'L∞': 143.47,
  'L7': 88.71,
  'L6': 54.82,
  'L5': 33.88,
  'L4': 20.94,
  'L3': 12.94,
  'L2': 12.67,
  'L1': 7.83,
  'L0': 4.84
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response: Response;

      // Root - System Info
      if (path === '/' && method === 'GET') {
        response = jsonResponse({
          name: 'MrLiouWord Unified Gateway',
          version: VERSION,
          origin: ORIGIN,
          philosophy: '怎麼過去，就怎麼回來',
          endpoints: {
            system: ['GET /', 'GET /health'],
            resources: [
              'GET /resources/stats',
              'GET /resources/search?q=xxx',
              'GET /resources/source/:name',
              'GET /resources/layer/:name',
              'GET /resources/core'
            ],
            particles: [
              'GET /particles',
              'GET /particles/domain/:dom',
              'GET /particles/:fx'
            ],
            memories: [
              'GET /memories',
              'POST /memories/commit',
              'GET /memories/recall?q=xxx'
            ],
            personas: [
              'GET /personas',
              'POST /personas/wake'
            ],
            sync: [
              'GET /sync/status',
              'POST /sync/memories',
              'POST /sync/particles',
              'POST /sync/all'
            ]
          }
        });
      }
      // Health Check
      else if (path === '/health' && method === 'GET') {
        response = jsonResponse({
          status: 'healthy',
          version: VERSION,
          timestamp: new Date().toISOString(),
          frequencies: FREQUENCIES
        });
      }
      // Resources
      else if (path === '/resources/stats' && method === 'GET') {
        response = await resourcesHandler.handleResourcesStats(env);
      }
      else if (path === '/resources/search' && method === 'GET') {
        const q = url.searchParams.get('q') || '';
        response = await resourcesHandler.handleResourcesSearch(env, q);
      }
      else if (path.startsWith('/resources/source/') && method === 'GET') {
        const source = path.split('/resources/source/')[1];
        response = await resourcesHandler.handleResourcesBySource(env, source);
      }
      else if (path.startsWith('/resources/layer/') && method === 'GET') {
        const layer = path.split('/resources/layer/')[1];
        response = await resourcesHandler.handleResourcesByLayer(env, layer);
      }
      else if (path === '/resources/core' && method === 'GET') {
        response = await resourcesHandler.handleCoreResources(env);
      }
      // Particles
      else if (path === '/particles' && method === 'GET') {
        response = await particlesHandler.handleGetAllParticles(env);
      }
      else if (path.startsWith('/particles/domain/') && method === 'GET') {
        const domain = path.split('/particles/domain/')[1];
        response = await particlesHandler.handleGetParticlesByDomain(env, domain);
      }
      else if (path.startsWith('/particles/') && method === 'GET') {
        const fx = path.split('/particles/')[1];
        if (!fx.includes('/')) {
          response = await particlesHandler.handleGetParticle(env, fx);
        } else {
          response = errorResponse('Not Found', 404);
        }
      }
      // Memories
      else if (path === '/memories' && method === 'GET') {
        response = await memoriesHandler.handleGetMemories(env);
      }
      else if (path === '/memories/commit' && method === 'POST') {
        response = await memoriesHandler.handleCommitMemory(env, request);
      }
      else if (path === '/memories/recall' && method === 'GET') {
        const q = url.searchParams.get('q') || '';
        const limit = parseInt(url.searchParams.get('limit') || '10');
        response = await memoriesHandler.handleRecallMemory(env, q, limit);
      }
      // Personas
      else if (path === '/personas' && method === 'GET') {
        response = await personasHandler.handleGetPersonas(env);
      }
      else if (path === '/personas/wake' && method === 'POST') {
        response = await personasHandler.handleWakePersona(env, request);
      }
      // Sync
      else if (path === '/sync/status' && method === 'GET') {
        response = await syncHandler.handleSyncStatus(env);
      }
      else if (path === '/sync/memories' && method === 'POST') {
        response = await syncHandler.handleSyncMemories(env);
      }
      else if (path === '/sync/particles' && method === 'POST') {
        response = await syncHandler.handleSyncParticles(env);
      }
      else if (path === '/sync/all' && method === 'POST') {
        response = await syncHandler.handleSyncAll(env);
      }
      else {
        response = errorResponse('Not Found', 404);
      }

      // Add CORS headers to response
      const newHeaders = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (error) {
      return errorResponse(
        error instanceof Error ? error.message : 'Internal Server Error',
        500
      );
    }
  },

  // Scheduled handler for automatic sync (every 5 minutes)
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    try {
      await syncHandler.handleSyncAll(env);
      console.log('Scheduled sync completed at', new Date().toISOString());
    } catch (error) {
      console.error('Scheduled sync failed:', error);
    }
  }
};

function jsonResponse(data: any): Response {
  return new Response(JSON.stringify({ ...data, origin: ORIGIN }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message, origin: ORIGIN }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
