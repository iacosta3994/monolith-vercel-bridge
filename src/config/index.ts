import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  port: z.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  bearerToken: z.string().min(1, 'Bearer token is required'),
  apiKey: z.string().min(1, 'API key is required'),
  monolithAgentUrl: z.string().url('Valid Monolith Agent URL is required'),
  monolithApiKey: z.string().min(1, 'Monolith API key is required'),
  tailscaleApiKey: z.string().min(1, 'Tailscale API key is required'),
  tailscaleTailnet: z.string().min(1, 'Tailscale tailnet is required'),
  tailscaleAuthKey: z.string().optional(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  allowedOrigins: z.array(z.string()).default(['*'])
});

export type Config = z.infer<typeof configSchema>;

const parseConfig = (): Config => {
  const rawConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    bearerToken: process.env.BEARER_TOKEN || '',
    apiKey: process.env.API_KEY || '',
    monolithAgentUrl: process.env.MONOLITH_AGENT_URL || '',
    monolithApiKey: process.env.MONOLITH_API_KEY || '',
    tailscaleApiKey: process.env.TAILSCALE_API_KEY || '',
    tailscaleTailnet: process.env.TAILSCALE_TAILNET || '',
    tailscaleAuthKey: process.env.TAILSCALE_AUTH_KEY,
    logLevel: process.env.LOG_LEVEL || 'info',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*']
  };

  try {
    return configSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration. Check your environment variables.');
    }
    throw error;
  }
};

export const config = parseConfig();
