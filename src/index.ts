import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateRequest } from './middleware/auth.js';
import mcpRouter from './routes/mcp.js';
import monolithRouter from './routes/monolith.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint (no auth required)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv
  });
});

// API routes (with authentication)
app.use('/api/mcp', authenticateRequest, mcpRouter);
app.use('/api/monolith', authenticateRequest, monolithRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

// Start server (only if not in Vercel)
if (config.nodeEnv !== 'production' || process.env.VERCEL !== '1') {
  const PORT = config.port;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`, {
      environment: config.nodeEnv,
      nodeVersion: process.version
    });
  });
}

export default app;
