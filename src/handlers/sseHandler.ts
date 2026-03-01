import { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from '../utils/logger.js';
import { MCPServer } from '../services/mcpServer.js';
import { authenticateRequest } from '../utils/auth.js';

const mcpServer = new MCPServer();

export async function sseHandler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Authenticate request
    const authResult = authenticateRequest(req);
    if (!authResult.authenticated) {
      logger.warn('Unauthorized SSE request attempt');
      return res.status(401).json({
        error: 'Unauthorized',
        reason: authResult.reason
      });
    }

    logger.info('SSE connection established');

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send initial connection event
    const connectionEvent = {
      type: 'connection',
      data: {
        protocol: 'mcp',
        version: '2024-11-05',
        serverInfo: {
          name: 'monolith-vercel-bridge',
          version: '1.0.0'
        },
        capabilities: {
          tools: true,
          resources: false,
          prompts: false
        },
        timestamp: new Date().toISOString()
      }
    };

    res.write(`event: connection\n`);
    res.write(`data: ${JSON.stringify(connectionEvent.data)}\n\n`);

    // Send available tools
    const tools = await mcpServer.listTools();
    const toolsEvent = {
      type: 'tools',
      data: tools
    };

    res.write(`event: tools\n`);
    res.write(`data: ${JSON.stringify(toolsEvent.data)}\n\n`);

    // Keep connection alive with heartbeat
    const heartbeatInterval = setInterval(() => {
      try {
        res.write(`:heartbeat ${Date.now()}\n\n`);
      } catch (error) {
        logger.error('Heartbeat error:', error);
        clearInterval(heartbeatInterval);
      }
    }, 30000); // Every 30 seconds

    // Handle client disconnect
    req.on('close', () => {
      logger.info('SSE connection closed by client');
      clearInterval(heartbeatInterval);
      res.end();
    });

    // For Vercel, we need to handle the connection differently
    // Vercel has a 10-second execution timeout for serverless functions
    // For long-lived connections, we should use a different approach
    // For now, we'll send the initial data and close
    setTimeout(() => {
      logger.info('Closing SSE connection (Vercel timeout prevention)');
      clearInterval(heartbeatInterval);
      res.write(`event: close\n`);
      res.write(`data: {"reason":"timeout"}\n\n`);
      res.end();
    }, 9000); // Close after 9 seconds to avoid Vercel timeout

  } catch (error: any) {
    logger.error('SSE handler error:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}
