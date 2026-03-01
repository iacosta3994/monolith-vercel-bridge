import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { MCPService } from '../services/mcpService.js';
import { BadRequestError } from '../middleware/errorHandler.js';

const router = Router();
const mcpService = new MCPService();

// MCP protocol endpoint
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { method, params } = req.body;

    if (!method) {
      throw new BadRequestError('Method is required');
    }

    logger.info('MCP execute request', { method, params });

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
router.get('/tools', async (req: Request, res: Response) => {
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
router.get('/info', async (req: Request, res: Response) => {
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

export default router;
