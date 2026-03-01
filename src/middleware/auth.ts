import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  authenticated: boolean;
}

export const authenticateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    logger.warn('Missing authorization header', { path: req.path, ip: req.ip });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing authorization header'
    });
    return;
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer') {
    logger.warn('Invalid authorization type', { type, path: req.path, ip: req.ip });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authorization type. Expected Bearer token'
    });
    return;
  }

  if (!token || token !== config.bearerToken) {
    logger.warn('Invalid bearer token', { path: req.path, ip: req.ip });
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid bearer token'
    });
    return;
  }

  // Token is valid
  (req as AuthenticatedRequest).authenticated = true;
  logger.debug('Request authenticated successfully', { path: req.path });
  next();
};
