import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  port: z.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  bearerToken: z.string().min(1),
  apiKey: z.string().min(1),
  allowedOrigins: z.array(z.string()).default(['*']),
  monolith: z.object({
    url: z.string().url(),
    apiKey: z.string().min(1)
  }),
  tailscale: z.object({
    apiKey: z.string().min(1),
    tailnet: z.string().min(1),
    authKey: z.string().optional()
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info')
  })
});

const parseAllowedOrigins = (origins: string | undefined): string[] => {
  if (!origins) return ['*'];
  return origins.split(',').map(o => o.trim());
};

const rawConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  bearerToken: process.env.BEARER_TOKEN || '',
  apiKey: process.env.API_KEY || '',
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  monolith: {
    url: process.env.MONOLITH_AGENT_URL || '',
    apiKey: process.env.MONOLITH_API_KEY || ''
  },
  tailscale: {
    apiKey: process.env.TAILSCALE_API_KEY || '',
    tailnet: process.env.TAILSCALE_TAILNET || '',
    authKey: process.env.TAILSCALE_AUTH_KEY
  },
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info'
  }
};

export const config = configSchema.parse(rawConfig);

export type Config = z.infer<typeof configSchema>;
