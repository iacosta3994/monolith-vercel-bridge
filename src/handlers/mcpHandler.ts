import { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from '../utils/logger.js';
import { MCPServer } from '../services/mcpServer.js';
import { authenticateRequest } from '../utils/auth.js';

const mcpServer = new MCPServer();

export async function mcpHandler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Authenticate request
    const authResult = authenticateRequest(req);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized MCP request attempt');
      return res.status(401).json({
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'Unauthorized',
          data: { reason: authResult.reason }
        },
        id: null
      });
    }

    // Validate JSON-RPC request
    const request = req.body;
    if (!request || typeof request !== 'object') {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error'
        },
        id: null
      });
    }

    if (request.jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: { reason: 'jsonrpc must be "2.0"' }
        },
        id: request.id || null
      });
    }

    if (!request.method || typeof request.method !== 'string') {
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: { reason: 'method is required and must be a string' }
        },
        id: request.id || null
      });
    }

    logger.info(`Processing MCP request: ${request.method}`, { id: request.id });

    // Handle the request
    const response = await mcpServer.handleRequest(request);

    // Send response
    return res.status(200).json(response);

  } catch (error: any) {
    logger.error('MCP handler error:', error);
    return res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: { message: error.message }
      },
      id: req.body?.id || null
    });
  }
}
