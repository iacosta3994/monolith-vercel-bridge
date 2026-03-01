import axios, { AxiosInstance } from 'axios';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ServiceError } from '../middleware/errorHandler.js';

export interface TailscaleDevice {
  id: string;
  name: string;
  hostname: string;
  addresses: string[];
  online: boolean;
  lastSeen: string;
}

export class TailscaleService {
  private client: AxiosInstance;
  private deviceCache: Map<string, TailscaleDevice>;
  private lastCacheUpdate: number;
  private cacheTimeout: number = 60000; // 1 minute

  constructor() {
    this.deviceCache = new Map();
    this.lastCacheUpdate = 0;

    this.client = axios.create({
      baseURL: 'https://api.tailscale.com/api/v2',
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${config.tailscaleApiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async ensureConnection(): Promise<void> {
    try {
      const status = await this.getStatus();
      if (!status.connected) {
        logger.warn('Tailscale not connected, attempting to establish connection');
        // In a real implementation, you might trigger connection logic here
      }
    } catch (error: any) {
      logger.error('Failed to ensure Tailscale connection', { error: error.message });
      throw new ServiceError('Tailscale connection unavailable');
    }
  }

  async getStatus(): Promise<any> {
    try {
      const devices = await this.listDevices();
      const onlineDevices = devices.filter(d => d.online);

      return {
        connected: true,
        tailnet: config.tailscaleTailnet,
        devices: devices.length,
        onlineDevices: onlineDevices.length,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      logger.error('Failed to get Tailscale status', { error: error.message });
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async listDevices(forceRefresh: boolean = false): Promise<TailscaleDevice[]> {
    const now = Date.now();
    
    // Return cached devices if available and not expired
    if (!forceRefresh && 
        this.deviceCache.size > 0 && 
        (now - this.lastCacheUpdate) < this.cacheTimeout) {
      return Array.from(this.deviceCache.values());
    }

    try {
      const response = await this.client.get(
        `/tailnet/${config.tailscaleTailnet}/devices`
      );

      const devices: TailscaleDevice[] = response.data.devices.map((device: any) => ({
        id: device.id,
        name: device.name,
        hostname: device.hostname,
        addresses: device.addresses || [],
        online: device.online || false,
        lastSeen: device.lastSeen
      }));

      // Update cache
      this.deviceCache.clear();
      devices.forEach(device => {
        this.deviceCache.set(device.id, device);
      });
      this.lastCacheUpdate = now;

      return devices;
    } catch (error: any) {
      logger.error('Failed to list Tailscale devices', {
        error: error.message,
        status: error.response?.status
      });
      throw new ServiceError(`Failed to list Tailscale devices: ${error.message}`);
    }
  }

  async getDevice(hostname: string): Promise<TailscaleDevice | null> {
    const devices = await this.listDevices();
    return devices.find(d => d.hostname === hostname) || null;
  }

  async isDeviceOnline(hostname: string): Promise<boolean> {
    const device = await this.getDevice(hostname);
    return device?.online || false;
  }
}
