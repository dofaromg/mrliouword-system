/**
 * Particle Chat v42
 * 
 * MrLiouWord Cloudflare Worker - AI Chat Integration
 * 
 * Features:
 * - Chat with MrLiou AI backend
 * - Streaming responses
 * - CORS support
 * - Origin signature: MrLiouWord
 * 
 * Author: MR.liou
 * Philosophy: 怎麼過去，就怎麼回來
 */

// origin_signature: MrLiouWord

const ORIGIN = 'MrLiouWord';
const VERSION = '1.0.0';

interface Env {
  MRLIOU_AI_KEY: string;
  MRLIOU_AI_URL?: string;
  ENVIRONMENT?: string;
  VERSION?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  messages?: ChatMessage[];
  model?: string;
  max_tokens?: number;
  stream?: boolean;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
      'X-Origin-Signature': ORIGIN,
      'X-Version': env.VERSION || VERSION,
    };
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    try {
      // Root endpoint - API info
      if (path === '/' && request.method === 'GET') {
        return new Response(JSON.stringify({
          name: 'Particle Chat v42',
          version: env.VERSION || VERSION,
          philosophy: '怎麼過去，就怎麼回來',
          origin: ORIGIN,
          environment: env.ENVIRONMENT || 'production',
          endpoints: {
            'GET /': 'API information',
            'POST /chat': 'Send a chat message',
            'GET /health': 'Health check',
          },
          status: 'operational',
        }, null, 2), { headers });
      }
      
      // Health check
      if (path === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({
          status: 'healthy',
          origin: ORIGIN,
          timestamp: Date.now(),
          api_configured: !!env.MRLIOU_AI_KEY,
        }), { headers });
      }
      
      // Chat endpoint
      if (path === '/chat' && request.method === 'POST') {
        if (!env.MRLIOU_AI_KEY) {
          return new Response(JSON.stringify({
            error: 'MRLIOU_AI_KEY not configured',
            message: 'Please set the MRLIOU_AI_KEY secret using: wrangler secret put MRLIOU_AI_KEY',
            origin: ORIGIN,
          }), { 
            status: 500, 
            headers 
          });
        }
        
        const body = await request.json() as ChatRequest;
        
        if (!body.message && (!body.messages || body.messages.length === 0)) {
          return new Response(JSON.stringify({
            error: 'Missing message',
            message: 'Please provide either "message" or "messages" in the request body',
            origin: ORIGIN,
          }), { 
            status: 400, 
            headers 
          });
        }
        
        const aiUrl = env.MRLIOU_AI_URL || 'http://localhost:7890';
        const model = body.model || 'mrliou-model-b1';
        const max_tokens = body.max_tokens || 1024;

        const messages: ChatMessage[] = body.messages || [
          { role: 'user', content: body.message }
        ];

        // Call MrLiou AI backend
        const aiResponse = await fetch(`${aiUrl}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-MrLiou-Key': env.MRLIOU_AI_KEY,
            'X-Origin-Signature': ORIGIN,
          },
          body: JSON.stringify({ model, max_tokens, messages }),
        });

        if (!aiResponse.ok) {
          throw new Error(`MrLiou AI backend error: ${aiResponse.status}`);
        }

        const result = await aiResponse.json() as any;
        
        return new Response(JSON.stringify({
          origin: ORIGIN,
          model: result.model || model,
          response: result.content?.[0]?.text || result.response || '',
          usage: result.usage,
          timestamp: Date.now(),
        }, null, 2), { headers });
      }
      
      // 404 - Not found
      return new Response(JSON.stringify({
        error: 'Not found',
        path: path,
        origin: ORIGIN,
      }), { 
        status: 404, 
        headers 
      });
      
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({
        error: 'Internal error',
        message: error instanceof Error ? error.message : 'Unknown error',
        origin: ORIGIN,
      }), { 
        status: 500, 
        headers 
      });
    }
  },
};
