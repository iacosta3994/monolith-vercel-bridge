import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { TailscaleService } from './tailscaleService.js';
import { ServiceError, NotFoundError } from '../middleware/errorHandler.js';

export class MonolithService {
  private client: AxiosInstance;
  private tailscaleService: TailscaleService;

  constructor() {
    this.tailscaleService = new TailscaleService();
    this.client = axios.create({
      baseURL: config.monolithAgentUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.monolithApiKey}`
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('Monolith request', {
          method: config.method,
          url: config.url,
          data: config.data
        });
        return config;
      },
      (error) => {
        logger.error('Monolith request error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('Monolith response', {
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error) => {
        logger.error('Monolith response error', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  async forwardRequest(endpoint: string, method: string = 'GET', data?: any): Promise<any> {
    try {
      // Ensure Tailscale connection is active
      await this.tailscaleService.ensureConnection();

      const response = await this.client.request({
        method,
        url: endpoint,
        data
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new NotFoundError(`Endpoint not found: ${endpoint}`);
      }
      throw new ServiceError(`Failed to forward request to Monolith Agent: ${error.message}`);
    }
  }

  async getStatus(): Promise<any> {
    try {
      const tailscaleStatus = await this.tailscaleService.getStatus();
      const response = await this.client.get('/health');

      return {
        monolith: {
          status: 'connected',
          health: response.data,
          url: config.monolithAgentUrl
        },
        tailscale: tailscaleStatus,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Failed to get Monolith status', { error: error.message });
      return {
        monolith: {
          status: 'disconnected',
          error: error.message,
          url: config.monolithAgentUrl
        },
        tailscale: await this.tailscaleService.getStatus(),
        timestamp: new Date().toISOString()
      };
    }
  }

  async executeCommand(command: string, args?: any): Promise<any> {
    try {
      await this.tailscaleService.ensureConnection();

      const response = await this.client.post('/execute', {
        command,
        args
      });

      return response.data;
    } catch (error: any) {
      throw new ServiceError(`Failed to execute command: ${error.message}`);
    }
  }

  async query(query: string): Promise<any> {
    try {
      await this.tailscaleService.ensureConnection();

      const response = await this.client.post('/query', {
        query
      });

      return response.data;
    } catch (error: any) {
      throw new ServiceError(`Failed to query Monolith Agent: ${error.message}`);
    }
  }
}
