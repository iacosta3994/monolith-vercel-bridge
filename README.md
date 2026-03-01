# Monolith Vercel Bridge

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge&env=BEARER_TOKEN,API_KEY,MONOLITH_AGENT_URL,MONOLITH_API_KEY,TAILSCALE_API_KEY,TAILSCALE_TAILNET&envDescription=Configuration%20for%20Monolith%20Bridge&envLink=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge%23environment-variables)

Production-ready Vercel MCP (Model Context Protocol) server implementation that bridges to Atlas's Monolith Agent with Tailscale integration for secure communication.

## 🚀 Features

- **MCP Protocol Support**: Full implementation of the Model Context Protocol for AI agent communication
- **Express Server**: Production-grade Express.js server with TypeScript
- **Bearer Token Authentication**: Secure API access with bearer token validation
- **Tailscale Integration**: Secure network communication via Tailscale
- **Monolith Agent Bridge**: Direct connection to Atlas's Monolith Agent
- **Error Handling**: Comprehensive error handling and logging with Winston
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Vercel Ready**: Optimized for Vercel deployment with serverless functions
- **Production Ready**: Includes security headers, CORS, rate limiting considerations

## 📋 Architecture Overview

```
┌─────────────────┐
│   MCP Client    │
│  (AI Assistant) │
└────────┬────────┘
         │
         │ HTTPS + Bearer Token
         ▼
┌─────────────────────────────┐
│  Vercel MCP Server          │
│  ┌──────────────────────┐   │
│  │  Express Server      │   │
│  │  - Auth Middleware   │   │
│  │  - MCP Routes        │   │
│  │  - Error Handling    │   │
│  └──────────┬───────────┘   │
│             │                │
│  ┌──────────▼───────────┐   │
│  │  MCP Service         │   │
│  │  - Tool Management   │   │
│  │  - Request Routing   │   │
│  └──────────┬───────────┘   │
│             │                │
│  ┌──────────▼───────────┐   │
│  │  Monolith Service    │   │
│  │  - API Client        │   │
│  │  - Request Forward   │   │
│  └──────────┬───────────┘   │
│             │                │
│  ┌──────────▼───────────┐   │
│  │  Tailscale Service   │   │
│  │  - Device Management │   │
│  │  - Connection Check  │   │
│  └──────────────────────┘   │
└─────────────┬───────────────┘
              │
              │ Tailscale VPN
              ▼
┌─────────────────────────────┐
│   Monolith Agent (Atlas)    │
│   - Command Execution       │
│   - Query Processing        │
│   - Status Reporting        │
└─────────────────────────────┘
```

## 🛠️ Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Vercel account (for deployment)
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

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration (see [Environment Variables](#environment-variables) below)

4. **Start development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 🌐 Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge&env=BEARER_TOKEN,API_KEY,MONOLITH_AGENT_URL,MONOLITH_API_KEY,TAILSCALE_API_KEY,TAILSCALE_TAILNET&envDescription=Configuration%20for%20Monolith%20Bridge&envLink=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge%23environment-variables)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables**
   
   In the Vercel dashboard:
   - Navigate to your project
   - Go to Settings → Environment Variables
   - Add all required variables (see below)

5. **Redeploy**
   ```bash
   vercel --prod
   ```

## ⚙️ Environment Variables

Create a `.env` file with the following variables:

### Required Variables

```bash
# Authentication
BEARER_TOKEN=your-secure-bearer-token-here
API_KEY=your-api-key-here

# Monolith Agent Configuration
MONOLITH_AGENT_URL=https://monolith-agent.example.com
MONOLITH_API_KEY=your-monolith-api-key

# Tailscale Configuration
TAILSCALE_API_KEY=your-tailscale-api-key
TAILSCALE_TAILNET=your-tailnet-name
```

### Optional Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Tailscale (Optional)
TAILSCALE_AUTH_KEY=your-tailscale-auth-key

# Logging
LOG_LEVEL=info

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Generating Secure Tokens

```bash
# Generate a secure bearer token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📚 API Documentation

### Health Check

**GET** `/health`

No authentication required.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-01T07:16:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### MCP Endpoints

All MCP endpoints require Bearer token authentication.

#### Execute MCP Method

**POST** `/api/mcp/execute`

**Headers:**
```
Authorization: Bearer YOUR_BEARER_TOKEN
Content-Type: application/json
```

**Request:**
```json
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

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": "System is operational"
  },
  "id": 1
}
```

#### List Available Tools

**GET** `/api/mcp/tools`

**Response:**
```json
{
  "tools": [
    {
      "name": "monolith_query",
      "description": "Query the Monolith Agent for information",
      "inputSchema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "The query to send to Monolith Agent"
          }
        },
        "required": ["query"]
      }
    }
  ]
}
```

#### Get Server Info

**GET** `/api/mcp/info`

**Response:**
```json
{
  "name": "monolith-vercel-bridge",
  "version": "1.0.0",
  "description": "Vercel MCP server bridge to Atlas Monolith Agent",
  "capabilities": {
    "tools": true,
    "tailscale": true,
    "authentication": true
  },
  "status": "operational"
}
```

### Monolith Endpoints

#### Forward Request

**POST** `/api/monolith/forward`

**Request:**
```json
{
  "endpoint": "/api/v1/query",
  "method": "POST",
  "data": {
    "query": "system status"
  }
}
```

#### Get Monolith Status

**GET** `/api/monolith/status`

**Response:**
```json
{
  "monolith": {
    "status": "connected",
    "health": {
      "status": "ok"
    },
    "url": "https://monolith-agent.example.com"
  },
  "tailscale": {
    "connected": true,
    "tailnet": "your-tailnet",
    "devices": 5,
    "onlineDevices": 3
  },
  "timestamp": "2026-03-01T07:16:00.000Z"
}
```

#### Execute Command

**POST** `/api/monolith/execute`

**Request:**
```json
{
  "command": "system.info",
  "args": {
    "detailed": true
  }
}
```

## 🔒 Security

- **Bearer Token Authentication**: All API endpoints (except `/health`) require valid bearer tokens
- **Helmet.js**: Security headers automatically applied
- **CORS**: Configurable allowed origins
- **Rate Limiting**: Consider adding rate limiting for production
- **Input Validation**: Using Zod for runtime type validation
- **Tailscale**: Secure VPN tunnel for Monolith Agent communication

## 🧪 Testing

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```

### Test MCP Endpoint

```bash
curl -X POST http://localhost:3000/api/mcp/tools \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Monolith Status

```bash
curl http://localhost:3000/api/monolith/status \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN"
```

## 📝 Available MCP Tools

1. **monolith_query**: Query the Monolith Agent for information
2. **monolith_execute**: Execute a command on the Monolith Agent
3. **monolith_status**: Get the current status of the Monolith Agent

## 🔧 Development

### Project Structure

```
monolith-vercel-bridge/
├── src/
│   ├── config/          # Configuration management
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript (generated)
├── .env.example         # Environment variables template
├── tsconfig.json        # TypeScript configuration
├── vercel.json          # Vercel deployment configuration
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

### Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run type-check`: Run TypeScript type checking
- `npm run lint`: Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 👤 Author

**Ian Acosta**

## 🙏 Acknowledgments

- Model Context Protocol (MCP) Specification
- Atlas Monolith Agent
- Tailscale for secure networking
- Vercel for serverless deployment

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Note**: This is a production-ready implementation. Ensure all environment variables are properly configured before deployment.
