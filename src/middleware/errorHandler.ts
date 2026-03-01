import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error('Error handling request', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode
  });

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : message,
    message: statusCode >= 500 ? 'An unexpected error occurred' : message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

export class BadRequestError extends Error implements AppError {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends Error implements AppError {
  statusCode = 401;
  isOperational = true;

  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ServiceError extends Error implements AppError {
  statusCode = 503;
  isOperational = true;

  constructor(message: string = 'Service unavailable') {
    super(message);
    this.name = 'ServiceError';
  }
}
