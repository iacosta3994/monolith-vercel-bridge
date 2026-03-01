# MCP Protocol Specification Reference

Implementation details for the Model Context Protocol (MCP) in Monolith Vercel Bridge.

## 📋 Protocol Version

**MCP Version**: `2024-11-05`  
**Transport**: Server-Sent Events (SSE) + JSON-RPC 2.0  
**Encoding**: UTF-8  
**Content-Type**: `application/json` (JSON-RPC) / `text/event-stream` (SSE)

## 🌐 Endpoints

### Root Endpoint - Server Discovery

**Method**: `GET /`  
**Auth**: Not required  
**Purpose**: MCP server identification and discovery

**Response**:
```json
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
  },
  "documentation": "https://github.com/iacosta3994/monolith-vercel-bridge"
}
```

### SSE Endpoint - Event Stream

**Method**: `GET /mcp`  
**Auth**: Required (Bearer token)  
**Content-Type**: `text/event-stream`

**Headers**:
```
Authorization: Bearer YOUR_TOKEN
Accept: text/event-stream
```

**Event Stream**:
```
event: connection
data: {"protocol":"mcp","version":"2024-11-05",...}

event: tools
data: {"tools":[...]}

:heartbeat 1709280000000

event: close
data: {"reason":"timeout"}
```

### JSON-RPC Endpoint

**Method**: `POST /api/mcp`  
**Auth**: Required (Bearer token)  
**Content-Type**: `application/json`

**Request Format**:
```json
{
  "jsonrpc": "2.0",
  "method": "METHOD_NAME",
  "params": {},
  "id": 1
}
```

**Response Format**:
```json
{
  "jsonrpc": "2.0",
  "result": {},
  "id": 1
}
```

**Error Response**:
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request",
    "data": {}
  },
  "id": 1
}
```

## 🔧 JSON-RPC Methods

### initialize

Initialize the MCP session.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "clientInfo": {
      "name": "poke",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "protocolVersion": "2024-11-05",
    "serverInfo": {
      "name": "monolith-vercel-bridge",
      "version": "1.0.0",
      "description": "Atlas Monolith Agent MCP Bridge"
    },
    "capabilities": {
      "tools": {
        "listChanged": false
      },
      "resources": {},
      "prompts": {}
    }
  },
  "id": 1
}
```

### tools/list

List all available tools.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "tools": [
      {
        "name": "monolith_query",
        "description": "Query the Atlas Monolith Agent for information",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "The query to send to the Monolith Agent"
            }
          },
          "required": ["query"]
        }
      }
    ]
  },
  "id": 1
}
```

### tools/call

Execute a specific tool.

**Request**:
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

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "System status: operational"
      }
    ]
  },
  "id": 1
}
```

### ping

Health check / keep-alive.

**Request**:
```json
{
  "jsonrpc": "2.0",
  "method": "ping",
  "id": 1
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "status": "pong",
    "timestamp": "2026-03-01T07:30:00.000Z"
  },
  "id": 1
}
```

## 🛠️ Tool Definitions

### monolith_query

Query the Monolith Agent for information.

```typescript
{
  name: "monolith_query",
  description: "Query the Atlas Monolith Agent for information. Use this tool to retrieve data, get status, or ask questions to the agent.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The query or question to send to the Monolith Agent"
      }
    },
    required: ["query"]
  }
}
```

**Example Usage**:
```json
{
  "name": "monolith_query",
  "arguments": {
    "query": "What are the active tasks?"
  }
}
```

### monolith_execute

Execute a command on the Monolith Agent.

```typescript
{
  name: "monolith_execute",
  description: "Execute a command on the Atlas Monolith Agent. Use this for operations that modify state or perform actions.",
  inputSchema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to execute (e.g., 'system.info', 'task.create')"
      },
      args: {
        type: "object",
        description: "Arguments for the command",
        properties: {},
        additionalProperties: true
      }
    },
    required: ["command"]
  }
}
```

**Example Usage**:
```json
{
  "name": "monolith_execute",
  "arguments": {
    "command": "task.create",
    "args": {
      "title": "Review deployment",
      "priority": "high"
    }
  }
}
```

### monolith_status

Get status of the Monolith Agent and Tailscale.

```typescript
{
  name: "monolith_status",
  description: "Get the current status and health of the Atlas Monolith Agent and Tailscale connection.",
  inputSchema: {
    type: "object",
    properties: {
      detailed: {
        type: "boolean",
        description: "Include detailed connection and device information"
      }
    }
  }
}
```

**Example Usage**:
```json
{
  "name": "monolith_status",
  "arguments": {
    "detailed": true
  }
}
```

### tailscale_devices

List devices on the Tailscale network.

```typescript
{
  name: "tailscale_devices",
  description: "List all devices on the Tailscale network with their status.",
  inputSchema: {
    type: "object",
    properties: {
      onlineOnly: {
        type: "boolean",
        "description": "Only return devices that are currently online"
      }
    }
  }
}
```

**Example Usage**:
```json
{
  "name": "tailscale_devices",
  "arguments": {
    "onlineOnly": true
  }
}
```

## 📡 SSE Events

### connection

Sent when SSE connection is established.

```
event: connection
data: {
  "protocol": "mcp",
  "version": "2024-11-05",
  "serverInfo": {
    "name": "monolith-vercel-bridge",
    "version": "1.0.0"
  },
  "capabilities": {
    "tools": true,
    "resources": false,
    "prompts": false
  },
  "timestamp": "2026-03-01T07:30:00.000Z"
}
```

### tools

Sent after connection with available tools.

```
event: tools
data: {
  "tools": [
    {
      "name": "monolith_query",
      "description": "...",
      "inputSchema": {...}
    }
  ]
}
```

### heartbeat

Keep-alive ping (sent every 30 seconds).

```
:heartbeat 1709280000000
```

### close

Sent when connection is closing.

```
event: close
data: {"reason": "timeout"}
```

## ❌ Error Codes

Standard JSON-RPC 2.0 error codes:

| Code | Message | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON |
| -32600 | Invalid Request | Missing required fields |
| -32601 | Method not found | Unknown method |
| -32602 | Invalid params | Invalid parameters |
| -32603 | Internal error | Server error |
| -32001 | Unauthorized | Authentication failed |

## 🔒 Authentication

### Bearer Token

All endpoints except `/` require Bearer token authentication.

**Header Format**:
```
Authorization: Bearer YOUR_BEARER_TOKEN
```

**Valid Request**:
```bash
curl -H "Authorization: Bearer a3f8c9d2..." \
     https://your-server.vercel.app/mcp
```

**Invalid Request** (missing token):
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32001,
    "message": "Unauthorized",
    "data": {
      "reason": "No authorization header provided"
    }
  },
  "id": null
}
```

## 🔄 Connection Flow

### Standard Flow

```
1. Discovery
   Client → GET /
          ← Server info, capabilities, endpoints

2. Authentication Check
   Client → GET /mcp with Bearer token
          ← 401 if invalid, SSE stream if valid

3. SSE Connection
   Client → GET /mcp (authenticated)
          ← event: connection
          ← event: tools
          ← :heartbeat (every 30s)

4. Tool Execution
   Client → POST /api/mcp (authenticated)
            { "method": "tools/call", ... }
          ← { "result": {...} }

5. Connection Management
   - Automatic reconnection on disconnect
   - Heartbeat keeps connection alive
   - Graceful close on timeout
```

### Reconnection Flow

```
1. Connection Lost
   - SSE stream closes
   - No more heartbeats

2. Client Detects Disconnect
   - No heartbeat received for >45s
   - Or explicit close event

3. Reconnection Attempt
   Client → GET /mcp (with backoff)
          ← New SSE stream
          ← Updated tools if changed

4. Resume Operations
   - Continue tool execution
   - No data loss
```

## 🎯 Best Practices

### 1. Client Implementation

- Implement automatic reconnection
- Handle SSE timeouts gracefully
- Cache tool definitions
- Use exponential backoff for reconnection
- Monitor heartbeat for connection health

### 2. Error Handling

- Always check JSON-RPC response for errors
- Handle network errors gracefully
- Retry failed requests with backoff
- Log errors for debugging

### 3. Performance

- Reuse SSE connections when possible
- Batch tool calls if supported
- Cache responses when appropriate
- Monitor response times

## 📚 References

- [MCP Specification](https://modelcontextprotocol.io/)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [JSON Schema](https://json-schema.org/)

---

**Protocol Version**: 2024-11-05  
**Last Updated**: March 1, 2026  
**Status**: Stable
