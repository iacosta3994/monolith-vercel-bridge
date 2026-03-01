import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class MonolithService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.monolith.url,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${config.monolith.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Monolith-Vercel-Bridge/1.0.0'
      }
    });
  }

  async query(query: string): Promise<any> {
    try {
      logger.info('Sending query to Monolith Agent', { query });
      
      const response = await this.client.post('/api/v1/query', {
        query,
        timestamp: new Date().toISOString()
      });

      logger.info('Query response received from Monolith');
      return response.data;

    } catch (error: any) {
      logger.error('Monolith query error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Invalid Monolith API key');
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Monolith Agent. Check Tailscale connection.');
      }

      throw new Error(`Monolith query failed: ${error.message}`);
    }
  }

  async execute(command: string, args: any = {}): Promise<any> {
    try {
      logger.info('Executing command on Monolith Agent', { command, args });
      
      const response = await this.client.post('/api/v1/execute', {
        command,
        args,
        timestamp: new Date().toISOString()
      });

      logger.info('Command executed successfully on Monolith');
      return response.data;

    } catch (error: any) {
      logger.error('Monolith execute error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Invalid Monolith API key');
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to Monolith Agent. Check Tailscale connection.');
      }

      throw new Error(`Monolith execute failed: ${error.message}`);
    }
  }

  async getHealth(): Promise<any> {
    try {
      const response = await this.client.get('/health');
      
      return {
        status: 'connected',
        health: response.data,
        url: config.monolith.url
      };

    } catch (error: any) {
      logger.warn('Monolith health check failed:', error.message);
      
      return {
        status: 'disconnected',
        health: null,
        url: config.monolith.url,
        error: error.message
      };
    }
  }

  async forwardRequest(endpoint: string, method: string, data?: any): Promise<any> {
    try {
      logger.info('Forwarding request to Monolith', { endpoint, method });
      
      const response = await this.client.request({
        url: endpoint,
        method,
        data
      });

      return response.data;

    } catch (error: any) {
      logger.error('Monolith forward error:', {
        message: error.message,
        status: error.response?.status
      });

      throw new Error(`Forward request failed: ${error.message}`);
    }
  }
}
