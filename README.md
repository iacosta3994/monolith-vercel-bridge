# DEPRECATED

⚠️ **This repository is deprecated.** Please use https://github.com/iacosta3994/monolith_gateway instead.

---

# Monolith Vercel Bridge - MCP Server

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge&env=BEARER_TOKEN,API_KEY,MONOLITH_AGENT_URL,MONOLITH_API_KEY,TAILSCALE_API_KEY,TAILSCALE_TAILNET&envDescription=Configuration%20for%20Monolith%20Bridge&envLink=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge%23environment-variables)

Production-ready Model Context Protocol (MCP) server with Server-Sent Events (SSE) transport for seamless integration with Poke and other MCP clients. Bridges to Atlas's Monolith Agent via Tailscale for secure communication.

## 🌟 Features

### Core MCP Implementation
- ✅ **MCP Protocol 2024-11-05**: Full compliance with latest MCP specification
- ✅ **SSE Transport**: Server-Sent Events for real-time streaming
- ✅ **JSON-RPC 2.0**: Standard JSON-RPC protocol support
- ✅ **Auto-Discovery**: Root endpoint for Poke's discovery mechanism
- ✅ **Tool Registry**: Dynamic tool registration and execution

### Infrastructure
- 🚀 **Vercel Serverless**: Optimized for Vercel deployment
- 🔒 **Bearer Authentication**: Secure API access
- 🔗 **Tailscale Integration**: Secure VPN tunneling to Monolith Agent
- 📊 **Structured Logging**: Winston-based logging with levels
- 🛡️ **Error Handling**: Comprehensive error handling and validation
- ⚡ **TypeScript**: Full type safety and IntelliSense support

### Atlas Integration
- 🤖 **Monolith Agent Bridge**: Direct communication with Atlas agent
- 🔧 **Command Execution**: Execute operations on Monolith
- 📡 **Status Monitoring**: Real-time health and status checks
- 🌐 **Network Management**: Tailscale device discovery and management

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Poke / MCP Client                 │
│   - Discovery (GET /)               │
│   - SSE Connection (GET /mcp)       │
│   - JSON-RPC (POST /api/mcp)        │
└───────────────┬─────────────────────┘
                │
                │ HTTPS + Bearer Token
                ▼
┌─────────────────────────────────────┐
│   Vercel Edge Network               │
│   ┌─────────────────────────────┐   │
│   │  MCP Server (Serverless)    │   │
│   │  - Root Handler (/)         │   │
│   │  - SSE Handler (/mcp)       │   │
│   │  - JSON-RPC (/api/mcp)      │   │
│   │  - Health Check (/health)   │   │
│   └──────────┬──────────────────┘   │
│              │                       │
│   ┌──────────▼──────────────────┐   │
│   │  MCP Server Instance        │   │
│   │  - Tool Management          │   │
│   │  - Request Routing          │   │
│   │  - Protocol Compliance      │   │
│   └──────────┬──────────────────┘   │
│              │                       │
│   ┌──────────▼──────────────────┐   │
│   │  Service Layer              │   │
│   │  ┌─────────────────────┐    │   │
│   │  │ Monolith Service    │    │   │
│   │  │ - Query/Execute     │    │   │
│   │  └─────────────────────┘    │   │
│   │  ┌─────────────────────┐    │   │
│   │  │ Tailscale Service   │    │   │
│   │  │ - Device Mgmt       │    │   │
│   │  └─────────────────────┘    │   │
│   └─────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               │ Tailscale VPN
               ▼
┌──────────────────────────────────────┐
│   Atlas Monolith Agent               │
│   - Command Processing               │
│   - Query Handling                   │
│   - Status Reporting                 │
└──────────────────────────────────────┘
```

## 📋 MCP Protocol Endpoints

### 1. Root Endpoint - Discovery (/)
**Purpose**: MCP server identification for discovery tools like Poke

```bash
GET https://your-deployment.vercel.app/

# Response:
{
  "protocol": "mcp",
  "version": "2024-11-05",
  "name": "Atlas Monolith Bridge MCP Server",
  "description": "Model Context Protocol server for Atlas Monolith Agent integration",
  "capabilities": {
    "tools": true,
    "resources": false,
    "prompts": false,
    "sampling": false
  },
  "serverInfo": {
    "name": "monolith-vercel-bridge",
    "version": "1.0.0"
  },
  "endpoints": {
    "sse": "/mcp",
    "jsonrpc": "/api/mcp"
  }
}
```

### 2. SSE Endpoint - Streaming (/mcp)
**Purpose**: Server-Sent Events stream for real-time communication

```bash
GET https://your-deployment.vercel.app/mcp
Authorization: Bearer YOUR_TOKEN

# SSE Stream:
event: connection
data: {"protocol":"mcp","version":"2024-11-05",...}

event: tools
data: {"tools":[...]}

:heartbeat 1709280000000
```

### 3. JSON-RPC Endpoint (/api/mcp)
**Purpose**: Standard JSON-RPC 2.0 requests

```bash
POST https://your-deployment.vercel.app/api/mcp
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "monolith_query",
    "arguments": {
      "query": "What is the system status?"
    }
  },
  "id": 1
}
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- Vercel account
- Tailscale account and API key
- Access to Atlas Monolith Agent

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/iacosta3994/monolith-vercel-bridge.git
   cd monolith-vercel-bridge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   BEARER_TOKEN=your-secure-bearer-token
   MONOLITH_AGENT_URL=https://your-monolith-agent.ts.net
   MONOLITH_API_KEY=your-monolith-api-key
   TAILSCALE_API_KEY=your-tailscale-api-key
   TAILSCALE_TAILNET=your-tailnet-name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The server will be available at `http://localhost:3000`

5. **Test the endpoints**
   ```bash
   # Test discovery
   curl http://localhost:3000/
   
   # Test SSE (requires auth)
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/mcp
   
   # Test JSON-RPC
   curl -X POST http://localhost:3000/api/mcp \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "method": "tools/list",
       "id": 1
     }'
   ```

## 🚀 Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to preview**
   ```bash
   vercel
   ```

4. **Set environment variables**
   
   In Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Set for Production, Preview, and Development

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Post-Deployment

After deployment, your MCP server will be available at:
- Discovery: `https://your-project.vercel.app/`
- SSE Stream: `https://your-project.vercel.app/mcp`
- JSON-RPC: `https://your-project.vercel.app/api/mcp`
- Health: `https://your-project.vercel.app/health`

## 🔌 Poke Integration

### Adding to Poke

1. **Open Poke** and navigate to MCP servers

2. **Add new server**:
   ```
   URL: https://your-deployment.vercel.app/
   Auth: Bearer YOUR_BEARER_TOKEN
   ```

3. **Poke will automatically**:
   - Discover the server via GET /
   - Connect to SSE stream at /mcp
   - List available tools
   - Enable tool execution

### Custom MCP Configuration

If using a custom MCP client, configure:

```json
{
  "mcpServers": {
    "atlas-monolith": {
      "url": "https://your-deployment.vercel.app",
      "transport": "sse",
      "auth": {
        "type": "bearer",
        "token": "YOUR_BEARER_TOKEN"
      },
      "endpoints": {
        "discovery": "/",
        "sse": "/mcp",
        "jsonrpc": "/api/mcp"
      }
    }
  }
}
```

## 🔧 Available Tools

The MCP server provides these tools to clients:

### 1. monolith_query
Query the Atlas Monolith Agent for information.

```typescript
{
  name: "monolith_query",
  description: "Query the Atlas Monolith Agent for information",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The query to send to the Monolith Agent"
      }
    },
    required: ["query"]
  }
}
```

**Example Usage**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "monolith_query",
    "arguments": {
      "query": "What is the current system status?"
    }
  },
  "id": 1
}
```

### 2. monolith_execute
Execute commands on the Monolith Agent.

```typescript
{
  name: "monolith_execute",
  description: "Execute a command on the Atlas Monolith Agent",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to execute"
      },
      args: {
        type: "object",
        description: "Command arguments"
      }
    },
    required: ["command"]
  }
}
```

**Example Usage**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "monolith_execute",
    "arguments": {
      "command": "system.info",
      "args": { "detailed": true }
    }
  },
  "id": 2
}
```

### 3. monolith_status
Get status and health of the Monolith Agent.

```typescript
{
  name: "monolith_status",
  description: "Get status of Monolith Agent and Tailscale",
  inputSchema: {
    type: "object",
    properties: {
      detailed: {
        type: "boolean",
        description: "Include detailed information"
      }
    }
  }
}
```

### 4. tailscale_devices
List devices on the Tailscale network.

```typescript
{
  name: "tailscale_devices",
  description: "List Tailscale network devices",
  inputSchema: {
    type: "object",
    properties: {
      onlineOnly: {
        type: "boolean",
        description: "Only return online devices"
      }
    }
  }
}
```

## ⚙️ Environment Variables

### Required Variables

```bash
# Authentication
BEARER_TOKEN=<your-secure-bearer-token>
API_KEY=<your-api-key>

# Monolith Agent
MONOLITH_AGENT_URL=https://monolith.your-tailnet.ts.net
MONOLITH_API_KEY=<monolith-agent-api-key>

# Tailscale
TAILSCALE_API_KEY=<tailscale-api-key>
TAILSCALE_TAILNET=<your-tailnet-name>
```

### Optional Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Tailscale (Optional)
TAILSCALE_AUTH_KEY=<auth-key-for-device-registration>

# Logging
LOG_LEVEL=info  # error, warn, info, debug

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Generating Secure Tokens

```bash
# Generate bearer token (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate API key (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## 🔒 Security

### Authentication
All endpoints except `/` and `/health` require Bearer token authentication:

```bash
Authorization: Bearer YOUR_BEARER_TOKEN
```

### Best Practices

1. **Use Strong Tokens**: Generate cryptographically secure tokens
2. **Rotate Keys**: Regularly rotate bearer tokens and API keys
3. **HTTPS Only**: Always use HTTPS in production
4. **Environment Variables**: Never commit secrets to git
5. **CORS Configuration**: Restrict allowed origins in production
6. **Rate Limiting**: Consider adding rate limiting for production

### Tailscale Security

- Connections to Monolith Agent go through Tailscale VPN
- End-to-end encrypted communication
- No public exposure of Monolith Agent
- Device authentication and authorization

## 📊 Monitoring & Logging

### Health Check

```bash
GET https://your-deployment.vercel.app/health

Response:
{
  "status": "healthy",
  "timestamp": "2026-03-01T07:30:00.000Z",
  "version": "1.0.0",
  "environment": "production",
  "mcp": {
    "protocol": "2024-11-05",
    "endpoints": {
      "root": "/",
      "sse": "/mcp",
      "jsonrpc": "/api/mcp"
    }
  }
}
```

### Logging

The server uses Winston for structured logging:

```typescript
logger.info('Message', { context: 'value' });
logger.warn('Warning message');
logger.error('Error message', error);
```

Logs include:
- Timestamp
- Log level
- Message
- Contextual metadata
- Stack traces for errors

### Vercel Logs

View logs in Vercel Dashboard:
1. Go to your project
2. Navigate to "Logs" tab
3. Filter by deployment, function, or time range

## 🧪 Testing

### Test Discovery Endpoint

```bash
curl https://your-deployment.vercel.app/
```

### Test SSE Connection

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Accept: text/event-stream" \
     https://your-deployment.vercel.app/mcp
```

### Test Tool Execution

```bash
curl -X POST https://your-deployment.vercel.app/api/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "monolith_status",
      "arguments": { "detailed": true }
    },
    "id": 1
  }'
```

### Test with Poke

1. Add server in Poke settings
2. Verify connection in Poke UI
3. Test tool execution from Poke chat

## 📁 Project Structure

```
monolith-vercel-bridge/
├── api/
│   └── index.ts              # Vercel serverless entry point
├── src/
│   ├── config/
│   │   └── index.ts          # Configuration management
│   ├── handlers/
│   │   ├── mcpHandler.ts     # JSON-RPC handler
│   │   └── sseHandler.ts     # SSE stream handler
│   ├── services/
│   │   ├── mcpServer.ts      # MCP server implementation
│   │   ├── monolithService.ts # Monolith Agent client
│   │   └── tailscaleService.ts # Tailscale API client
│   └── utils/
│       ├── auth.ts           # Authentication utilities
│       └── logger.ts         # Logging configuration
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json               # Vercel deployment config
└── README.md
```

## 🔄 MCP Protocol Flow

### 1. Discovery Phase
```
Client → GET / → Server
       ← Server Info
```

### 2. Connection Phase (SSE)
```
Client → GET /mcp (with auth) → Server
       ← event: connection
       ← event: tools
       ← :heartbeat (every 30s)
```

### 3. Request/Response (JSON-RPC)
```
Client → POST /api/mcp
         {
           "jsonrpc": "2.0",
           "method": "tools/call",
           "params": {...},
           "id": 1
         }
       ← {
           "jsonrpc": "2.0",
           "result": {...},
           "id": 1
         }
```

## 🐛 Troubleshooting

### Common Issues

#### 1. SSE Connection Timeout
**Issue**: SSE connection closes after 10 seconds

**Cause**: Vercel serverless functions have 10s timeout

**Solution**: This is expected behavior. Clients should reconnect for long-lived connections.

#### 2. Authentication Failed
**Issue**: 401 Unauthorized

**Solutions**:
- Verify `BEARER_TOKEN` in environment variables
- Ensure `Authorization: Bearer <token>` header is set
- Check token matches exactly (no extra spaces)

#### 3. Cannot Connect to Monolith
**Issue**: Connection refused to Monolith Agent

**Solutions**:
- Verify Tailscale connection is active
- Check `MONOLITH_AGENT_URL` is correct Tailscale URL
- Ensure Monolith Agent is running
- Verify `MONOLITH_API_KEY` is valid

#### 4. Tailscale API Error
**Issue**: 401 from Tailscale API

**Solutions**:
- Verify `TAILSCALE_API_KEY` is valid
- Check API key has necessary permissions
- Ensure `TAILSCALE_TAILNET` is correct

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug
```

## 🚧 Limitations

### Vercel Constraints
- 10-second function timeout (affects SSE long-polling)
- 4.5MB request size limit
- 6MB response size limit

### Workarounds
- SSE connections auto-close before timeout
- Large responses are paginated
- Consider Vercel Pro for higher limits

## 📚 Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailscale API](https://tailscale.com/api)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file

## 👤 Author

**Ian Acosta**
- GitHub: [@iacosta3994](https://github.com/iacosta3994)

## 🙏 Acknowledgments

- Model Context Protocol team
- Atlas Monolith Agent
- Tailscale team
- Vercel platform
- Poke team for MCP client implementation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/iacosta3994/monolith-vercel-bridge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iacosta3994/monolith-vercel-bridge/discussions)

---

**Made with ❤️ for the MCP ecosystem**