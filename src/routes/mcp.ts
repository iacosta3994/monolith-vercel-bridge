import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { MCPService } from '../services/mcpService.js';
import { BadRequestError } from '../middleware/errorHandler.js';
import { authenticateRequest } from '../middleware/auth.js';

const router = Router();
const mcpService = new MCPService();

// SSE connection tracking
const sseConnections = new Map<string, Response>();

// Helper to send SSE message
function sendSSEMessage(res: Response, event: string, data: any) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  res.write(message);
}

// SSE endpoint for MCP protocol
router.get('/', authenticateRequest, (req: Request, res: Response) => {
  logger.info('SSE connection established');

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Generate connection ID
  const connectionId = `${Date.now()}-${Math.random()}`;
  sseConnections.set(connectionId, res);

  // Send initial endpoint event
  sendSSEMessage(res, 'endpoint', {
    jsonrpc: '2.0',
    method: 'endpoint',
    params: {
      endpoint: '/mcp/message'
    }
  });

  // Keep-alive ping every 30 seconds
  const keepAliveInterval = setInterval(() => {
    if (!res.writableEnded) {
      res.write(': ping\n\n');
    } else {
      clearInterval(keepAliveInterval);
    }
  }, 30000);

  // Cleanup on connection close
  req.on('close', () => {
    logger.info('SSE connection closed', { connectionId });
    clearInterval(keepAliveInterval);
    sseConnections.delete(connectionId);
  });
});

// Message endpoint for bidirectional communication
router.post('/message', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const request = req.body;

    // Validate JSON-RPC 2.0 request
    if (request.jsonrpc !== '2.0') {
      throw new BadRequestError('Invalid JSON-RPC version. Must be 2.0');
    }

    if (!request.method) {
      throw new BadRequestError('Method is required');
    }

    logger.info('MCP message received', { 
      method: request.method, 
      id: request.id,
      params: request.params 
    });

    const result = await mcpService.execute(request.method, request.params);

    // Send JSON-RPC 2.0 response
    const response = {
      jsonrpc: '2.0',
      result,
      id: request.id || null
    };

    res.json(response);
  } catch (error: any) {
    logger.error('MCP message error', { 
      error: error.message, 
      stack: error.stack 
    });

    // Send JSON-RPC 2.0 error response
    const errorResponse = {
      jsonrpc: '2.0',
      error: {
        code: error.code || -32603,
        message: error.message || 'Internal error',
        data: error.data
      },
      id: req.body.id || null
    };

    res.status(error.statusCode || 500).json(errorResponse);
  }
});

// Legacy POST endpoint for backward compatibility
router.post('/execute', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const { method, params } = req.body;

    if (!method) {
      throw new BadRequestError('Method is required');
    }

    logger.info('MCP execute request (legacy)', { method, params });

    const result = await mcpService.execute(method, params);

    res.json({
      jsonrpc: '2.0',
      result,
      id: req.body.id || null
    });
  } catch (error: any) {
    logger.error('MCP execute error', { error: error.message, stack: error.stack });
    res.status(error.statusCode || 500).json({
      jsonrpc: '2.0',
      error: {
        code: error.statusCode || -32603,
        message: error.message || 'Internal error'
      },
      id: req.body.id || null
    });
  }
});

// List available tools
router.get('/tools', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const tools = await mcpService.listTools();
    res.json({ tools });
  } catch (error: any) {
    logger.error('Error listing tools', { error: error.message });
    res.status(500).json({
      error: 'Failed to list tools',
      message: error.message
    });
  }
});

// Get server info
router.get('/info', authenticateRequest, async (req: Request, res: Response) => {
  try {
    const info = await mcpService.getServerInfo();
    res.json(info);
  } catch (error: any) {
    logger.error('Error getting server info', { error: error.message });
    res.status(500).json({
      error: 'Failed to get server info',
      message: error.message
    });
  }
});

// Helper to broadcast to all SSE connections
export function broadcastSSE(event: string, data: any) {
  sseConnections.forEach((res) => {
    if (!res.writableEnded) {
      sendSSEMessage(res, event, data);
    }
  });
}

export default router;
