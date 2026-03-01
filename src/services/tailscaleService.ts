import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export class TailscaleService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.tailscale.com/api/v2',
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${config.tailscale.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getDevices(onlineOnly: boolean = false): Promise<any> {
    try {
      const tailnet = config.tailscale.tailnet;
      logger.info('Fetching Tailscale devices', { tailnet, onlineOnly });
      
      const response = await this.client.get(`/tailnet/${tailnet}/devices`);
      
      let devices = response.data.devices || [];
      
      if (onlineOnly) {
        devices = devices.filter((device: any) => device.online);
      }

      return {
        devices,
        total: devices.length,
        online: devices.filter((d: any) => d.online).length,
        tailnet
      };

    } catch (error: any) {
      logger.error('Tailscale devices error:', {
        message: error.message,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        throw new Error('Unauthorized: Invalid Tailscale API key');
      }

      throw new Error(`Failed to fetch devices: ${error.message}`);
    }
  }

  async getStatus(): Promise<any> {
    try {
      const tailnet = config.tailscale.tailnet;
      const response = await this.client.get(`/tailnet/${tailnet}/devices`);
      
      const devices = response.data.devices || [];
      const onlineDevices = devices.filter((d: any) => d.online);

      return {
        connected: true,
        tailnet,
        devices: devices.length,
        onlineDevices: onlineDevices.length
      };

    } catch (error: any) {
      logger.warn('Tailscale status check failed:', error.message);
      
      return {
        connected: false,
        tailnet: config.tailscale.tailnet,
        devices: 0,
        onlineDevices: 0,
        error: error.message
      };
    }
  }

  async getDeviceByHostname(hostname: string): Promise<any> {
    try {
      const { devices } = await this.getDevices();
      
      const device = devices.find((d: any) => 
        d.hostname === hostname || d.name === hostname
      );

      if (!device) {
        throw new Error(`Device not found: ${hostname}`);
      }

      return device;

    } catch (error: any) {
      logger.error('Get device by hostname error:', error);
      throw error;
    }
  }
}
