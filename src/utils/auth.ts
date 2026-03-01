import { VercelRequest } from '@vercel/node';
import { config } from '../config/index.js';
import { logger } from './logger.js';

export interface AuthResult {
  authenticated: boolean;
  reason?: string;
}

export function authenticateRequest(req: VercelRequest): AuthResult {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return {
      authenticated: false,
      reason: 'No authorization header provided'
    };
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return {
      authenticated: false,
      reason: 'Invalid authorization header format. Expected: Bearer <token>'
    };
  }

  const token = parts[1];
  
  if (token !== config.bearerToken) {
    logger.warn('Authentication failed: Invalid token');
    return {
      authenticated: false,
      reason: 'Invalid token'
    };
  }

  return { authenticated: true };
}
