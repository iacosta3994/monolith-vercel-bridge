import { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from '../src/config/index.js';
import { logger } from '../src/utils/logger.js';
import { mcpHandler } from '../src/handlers/mcpHandler.js';
import { sseHandler } from '../src/handlers/sseHandler.js';

// Main serverless function handler
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  const origin = req.headers.origin || '';
  if (config.allowedOrigins.includes('*') || config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url || '/';
  
  try {
    // Root endpoint - MCP server identification
    if (path === '/' && req.method === 'GET') {
      logger.info('Root endpoint accessed for MCP discovery');
      return res.status(200).json({
        protocol: 'mcp',
        version: '2024-11-05',
        name: 'Atlas Monolith Bridge MCP Server',
        description: 'Model Context Protocol server for Atlas Monolith Agent integration',
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
          sampling: false
        },
        serverInfo: {
          name: 'monolith-vercel-bridge',
          version: '1.0.0'
        },
        endpoints: {
          sse: '/mcp',
          jsonrpc: '/api/mcp'
        },
        documentation: 'https://github.com/iacosta3994/monolith-vercel-bridge'
      });
    }

    // SSE endpoint for MCP streaming
    if (path.startsWith('/mcp') && req.method === 'GET') {
      logger.info('SSE MCP endpoint accessed');
      return sseHandler(req, res);
    }

    // JSON-RPC MCP endpoint
    if (path.startsWith('/api/mcp') && req.method === 'POST') {
      logger.info('JSON-RPC MCP endpoint accessed');
      return mcpHandler(req, res);
    }

    // Health check
    if (path === '/health' && req.method === 'GET') {
      return res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: config.nodeEnv,
        mcp: {
          protocol: '2024-11-05',
          endpoints: {
            root: '/',
            sse: '/mcp',
            jsonrpc: '/api/mcp'
          }
        }
      });
    }

    // Route not found
    logger.warn(`Route not found: ${req.method} ${path}`);
    return res.status(404).json({
      error: 'Not Found',
      message: `Route ${req.method} ${path} not found`,
      availableEndpoints: ['/', '/mcp', '/api/mcp', '/health']
    });

  } catch (error: any) {
    logger.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}
