import { logger } from '../utils/logger.js';
import { MonolithService } from './monolithService.js';
import { TailscaleService } from './tailscaleService.js';

export interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: string | number | null;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number | null;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export class MCPServer {
  private monolithService: MonolithService;
  private tailscaleService: TailscaleService;
  private tools: MCPTool[];

  constructor() {
    this.monolithService = new MonolithService();
    this.tailscaleService = new TailscaleService();
    this.tools = this.defineTools();
  }

  private defineTools(): MCPTool[] {
    return [
      {
        name: 'monolith_query',
        description: 'Query the Atlas Monolith Agent for information. Use this tool to retrieve data, get status, or ask questions to the agent.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The query or question to send to the Monolith Agent'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'monolith_execute',
        description: 'Execute a command on the Atlas Monolith Agent. Use this for operations that modify state or perform actions.',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute (e.g., "system.info", "task.create")'
            },
            args: {
              type: 'object',
              description: 'Arguments for the command',
              properties: {},
              additionalProperties: true
            }
          },
          required: ['command']
        }
      },
      {
        name: 'monolith_status',
        description: 'Get the current status and health of the Atlas Monolith Agent and Tailscale connection.',
        inputSchema: {
          type: 'object',
          properties: {
            detailed: {
              type: 'boolean',
              description: 'Include detailed connection and device information'
            }
          }
        }
      },
      {
        name: 'tailscale_devices',
        description: 'List all devices on the Tailscale network with their status.',
        inputSchema: {
          type: 'object',
          properties: {
            onlineOnly: {
              type: 'boolean',
              description: 'Only return devices that are currently online'
            }
          }
        }
      }
    ];
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params, id } = request;

    try {
      logger.info(`Handling MCP method: ${method}`, { id });

      switch (method) {
        case 'initialize':
          return this.handleInitialize(params, id);
        
        case 'tools/list':
          return this.handleToolsList(id);
        
        case 'tools/call':
          return await this.handleToolCall(params, id);
        
        case 'ping':
          return {
            jsonrpc: '2.0',
            result: { status: 'pong', timestamp: new Date().toISOString() },
            id
          };
        
        default:
          return {
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: 'Method not found',
              data: { method }
            },
            id
          };
      }
    } catch (error: any) {
      logger.error(`Error handling MCP method ${method}:`, error);
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: { message: error.message }
        },
        id
      };
    }
  }

  private handleInitialize(params: any, id: string | number | null): MCPResponse {
    logger.info('Initialize request received', params);
    
    return {
      jsonrpc: '2.0',
      result: {
        protocolVersion: '2024-11-05',
        serverInfo: {
          name: 'monolith-vercel-bridge',
          version: '1.0.0',
          description: 'Atlas Monolith Agent MCP Bridge'
        },
        capabilities: {
          tools: {
            listChanged: false
          },
          resources: {},
          prompts: {}
        }
      },
      id
    };
  }

  private handleToolsList(id: string | number | null): MCPResponse {
    return {
      jsonrpc: '2.0',
      result: {
        tools: this.tools
      },
      id
    };
  }

  async listTools(): Promise<MCPTool[]> {
    return this.tools;
  }

  private async handleToolCall(params: any, id: string | number | null): Promise<MCPResponse> {
    const { name, arguments: args } = params;

    if (!name) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: 'Invalid params',
          data: { reason: 'Tool name is required' }
        },
        id
      };
    }

    logger.info(`Calling tool: ${name}`, { args });

    try {
      let result: any;

      switch (name) {
        case 'monolith_query':
          result = await this.monolithService.query(args.query);
          break;
        
        case 'monolith_execute':
          result = await this.monolithService.execute(args.command, args.args);
          break;
        
        case 'monolith_status':
          result = await this.getMonolithStatus(args.detailed);
          break;
        
        case 'tailscale_devices':
          result = await this.tailscaleService.getDevices(args.onlineOnly);
          break;
        
        default:
          return {
            jsonrpc: '2.0',
            error: {
              code: -32602,
              message: 'Invalid params',
              data: { reason: `Unknown tool: ${name}` }
            },
            id
          };
      }

      return {
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        },
        id
      };

    } catch (error: any) {
      logger.error(`Tool call error for ${name}:`, error);
      return {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Tool execution error',
          data: { tool: name, message: error.message }
        },
        id
      };
    }
  }

  private async getMonolithStatus(detailed: boolean = false): Promise<any> {
    const monolithHealth = await this.monolithService.getHealth();
    const tailscaleStatus = await this.tailscaleService.getStatus();

    const status: any = {
      monolith: {
        status: monolithHealth.status,
        url: monolithHealth.url
      },
      tailscale: {
        connected: tailscaleStatus.connected,
        tailnet: tailscaleStatus.tailnet
      },
      timestamp: new Date().toISOString()
    };

    if (detailed) {
      status.monolith.health = monolithHealth.health;
      status.tailscale.devices = tailscaleStatus.devices;
      status.tailscale.onlineDevices = tailscaleStatus.onlineDevices;
    }

    return status;
  }
}
