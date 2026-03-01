import { logger } from '../utils/logger.js';
import { MonolithService } from './monolithService.js';
import { ServiceError } from '../middleware/errorHandler.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export class MCPService {
  private monolithService: MonolithService;
  private tools: MCPTool[];

  constructor() {
    this.monolithService = new MonolithService();
    this.tools = this.initializeTools();
  }

  private initializeTools(): MCPTool[] {
    return [
      {
        name: 'monolith_query',
        description: 'Query the Monolith Agent for information',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The query to send to Monolith Agent'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'monolith_execute',
        description: 'Execute a command on the Monolith Agent',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute'
            },
            args: {
              type: 'object',
              description: 'Command arguments'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'monolith_status',
        description: 'Get the current status of the Monolith Agent',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ];
  }

  async execute(method: string, params: any): Promise<any> {
    logger.info('Executing MCP method', { method, params });

    switch (method) {
      case 'tools/list':
        return this.listTools();

      case 'tools/call':
        return this.callTool(params);

      case 'initialize':
        return this.initialize(params);

      default:
        throw new ServiceError(`Unknown method: ${method}`);
    }
  }

  async listTools(): Promise<MCPTool[]> {
    return this.tools;
  }

  async callTool(params: { name: string; arguments: any }): Promise<any> {
    const { name, arguments: args } = params;

    logger.info('Calling tool', { name, args });

    switch (name) {
      case 'monolith_query':
        return this.monolithService.query(args.query);

      case 'monolith_execute':
        return this.monolithService.executeCommand(args.command, args.args);

      case 'monolith_status':
        return this.monolithService.getStatus();

      default:
        throw new ServiceError(`Unknown tool: ${name}`);
    }
  }

  async initialize(params: any): Promise<any> {
    logger.info('Initializing MCP server', { params });

    return {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: 'monolith-vercel-bridge',
        version: '1.0.0'
      }
    };
  }

  async getServerInfo(): Promise<any> {
    return {
      name: 'monolith-vercel-bridge',
      version: '1.0.0',
      description: 'Vercel MCP server bridge to Atlas Monolith Agent',
      capabilities: {
        tools: true,
        tailscale: true,
        authentication: true
      },
      status: 'operational'
    };
  }
}
