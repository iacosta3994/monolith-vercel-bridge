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

// Security middleware - disable CSP for SSE
app.use(helmet({
  contentSecurityPolicy: false
}));
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

// Root handler - MCP server identification
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'monolith-vercel-bridge',
    version: '1.0.0',
    description: 'Production-ready Vercel MCP server implementation that connects to Atlas\'s Monolith Agent',
    protocol: 'mcp',
    protocolVersion: '2024-11-05',
    capabilities: {
      tools: true,
      sse: true,
      tailscale: true
    },
    endpoints: {
      mcp: '/mcp',
      discovery: '/.well-known/mcp-server',
      health: '/health',
      monolith: '/api/monolith'
    },
    timestamp: new Date().toISOString()
  });
});

// Poke discovery mechanism
app.get('/.well-known/mcp-server', (req: Request, res: Response) => {
  res.json({
    mcpServers: {
      'monolith-vercel-bridge': {
        url: `${req.protocol}://${req.get('host')}/mcp`,
        name: 'monolith-vercel-bridge',
        version: '1.0.0',
        description: 'Vercel MCP server bridge to Atlas Monolith Agent',
        transport: 'sse',
        capabilities: {
          tools: {},
          experimental: {
            tailscale: true
          }
        }
      }
    }
  });
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

// MCP SSE endpoint (with authentication)
app.use('/mcp', mcpRouter);

// API routes (with authentication)
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
