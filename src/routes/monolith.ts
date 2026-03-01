import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { MonolithService } from '../services/monolithService.js';
import { BadRequestError } from '../middleware/errorHandler.js';

const router = Router();
const monolithService = new MonolithService();

// Forward request to Monolith Agent
router.post('/forward', async (req: Request, res: Response) => {
  try {
    const { endpoint, method, data } = req.body;

    if (!endpoint) {
      throw new BadRequestError('Endpoint is required');
    }

    logger.info('Forwarding request to Monolith Agent', { endpoint, method });

    const result = await monolithService.forwardRequest(endpoint, method, data);

    res.json(result);
  } catch (error: any) {
    logger.error('Monolith forward error', { error: error.message, stack: error.stack });
    res.status(error.statusCode || 500).json({
      error: 'Failed to forward request',
      message: error.message
    });
  }
});

// Get Monolith Agent status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await monolithService.getStatus();
    res.json(status);
  } catch (error: any) {
    logger.error('Error getting Monolith status', { error: error.message });
    res.status(500).json({
      error: 'Failed to get Monolith status',
      message: error.message
    });
  }
});

// Execute agent command
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { command, args } = req.body;

    if (!command) {
      throw new BadRequestError('Command is required');
    }

    logger.info('Executing Monolith command', { command, args });

    const result = await monolithService.executeCommand(command, args);

    res.json(result);
  } catch (error: any) {
    logger.error('Monolith execute error', { error: error.message, stack: error.stack });
    res.status(error.statusCode || 500).json({
      error: 'Failed to execute command',
      message: error.message
    });
  }
});

export default router;
