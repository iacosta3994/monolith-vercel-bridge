# Poke Integration Guide

Complete guide for integrating Monolith Vercel Bridge with Poke's MCP client.

## 🎯 Overview

Poke is an MCP (Model Context Protocol) client that connects to MCP servers to extend AI assistant capabilities. This guide shows you how to configure Poke to work with your Monolith Vercel Bridge deployment.

## 📋 Prerequisites

- Deployed Monolith Vercel Bridge instance
- Poke application installed
- Bearer token from your deployment
- Access to Poke settings

## 🚀 Quick Setup

### Step 1: Get Your Deployment URL

After deploying to Vercel, you'll have a URL like:
```
https://monolith-vercel-bridge.vercel.app
```

### Step 2: Get Your Bearer Token

Your bearer token is the `BEARER_TOKEN` environment variable you set during deployment.

### Step 3: Add Server to Poke

1. **Open Poke**
2. **Navigate to Settings** → **MCP Servers**
3. **Click "Add Server"**
4. **Configure**:
   ```
   Server Name: Atlas Monolith
   URL: https://your-deployment.vercel.app
   Authentication: Bearer Token
   Token: your-bearer-token-here
   ```
5. **Click "Save" or "Connect"**

### Step 4: Verify Connection

Poke should automatically:
- ✅ Discover the server via GET /
- ✅ Establish SSE connection to /mcp
- ✅ Load available tools
- ✅ Show "Connected" status

## 🔧 Configuration Examples

### Basic Configuration

```json
{
  "name": "Atlas Monolith",
  "url": "https://monolith-vercel-bridge.vercel.app",
  "transport": "sse",
  "authentication": {
    "type": "bearer",
    "token": "your-bearer-token"
  }
}
```

### Advanced Configuration

```json
{
  "name": "Atlas Monolith",
  "description": "Production Atlas Monolith Agent Bridge",
  "url": "https://monolith-vercel-bridge.vercel.app",
  "transport": "sse",
  "fallbackTransport": "jsonrpc",
  "authentication": {
    "type": "bearer",
    "token": "your-bearer-token"
  },
  "endpoints": {
    "discovery": "/",
    "sse": "/mcp",
    "jsonrpc": "/api/mcp",
    "health": "/health"
  },
  "reconnect": {
    "enabled": true,
    "maxAttempts": 5,
    "interval": 5000
  },
  "timeout": {
    "connection": 10000,
    "request": 30000
  }
}
```

### Environment-Specific Configurations

#### Development
```json
{
  "name": "Atlas Monolith (Dev)",
  "url": "http://localhost:3000",
  "transport": "sse",
  "authentication": {
    "type": "bearer",
    "token": "dev-token-12345"
  }
}
```

#### Staging
```json
{
  "name": "Atlas Monolith (Staging)",
  "url": "https://staging-monolith.vercel.app",
  "transport": "sse",
  "authentication": {
    "type": "bearer",
    "token": "staging-token-67890"
  }
}
```

#### Production
```json
{
  "name": "Atlas Monolith (Prod)",
  "url": "https://monolith-vercel-bridge.vercel.app",
  "transport": "sse",
  "authentication": {
    "type": "bearer",
    "token": "prod-token-abcdef"
  }
}
```

## 🎮 Using Tools in Poke

### Query Monolith Agent

**Natural Language**:
```
"Check the system status on Atlas"
```

**Direct Tool Call**:
```
@monolith_status { "detailed": true }
```

### Execute Commands

**Natural Language**:
```
"Create a new task in Atlas called 'Review deployment'"
```

**Direct Tool Call**:
```
@monolith_execute {
  "command": "task.create",
  "args": {
    "title": "Review deployment",
    "priority": "high"
  }
}
```

### List Tailscale Devices

**Natural Language**:
```
"Show me all online devices on the Tailscale network"
```

**Direct Tool Call**:
```
@tailscale_devices { "onlineOnly": true }
```

## 🔍 Discovery Process

Poke uses the following discovery flow:

```
1. GET / (Discovery)
   → Returns server info, capabilities, endpoints
   
2. GET /mcp (SSE Connection)
   → Establishes event stream
   → Receives connection event
   → Receives tools list
   → Heartbeat begins
   
3. Ready for tool calls
   → POST /api/mcp (for JSON-RPC)
   → Or continue using SSE stream
```

## 📊 Connection States

### Connected
- Green indicator in Poke
- Tools available in UI
- Can execute commands
- Receiving heartbeats

### Connecting
- Yellow indicator
- Attempting to establish connection
- Retrying if configured

### Disconnected
- Red indicator
- No active connection
- Tools unavailable
- May show error message

### Reconnecting
- Yellow indicator
- Previous connection lost
- Attempting to reconnect

## 🐛 Troubleshooting

### Issue: Cannot Connect to Server

**Symptoms**:
- "Connection failed" error
- Red status indicator
- No tools available

**Solutions**:
1. Verify deployment URL is correct
2. Check server is deployed and running:
   ```bash
   curl https://your-deployment.vercel.app/health
   ```
3. Ensure URL has `https://` prefix
4. Check for typos in URL

### Issue: Authentication Failed

**Symptoms**:
- "401 Unauthorized" error
- Connection rejected
- "Invalid token" message

**Solutions**:
1. Verify bearer token matches deployment:
   ```bash
   # Check your Vercel environment variables
   vercel env pull
   ```
2. Ensure no extra spaces in token
3. Try regenerating token:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Update token in both Vercel and Poke

### Issue: Tools Not Appearing

**Symptoms**:
- Connected but no tools listed
- "No tools available" message
- Empty tools list in Poke

**Solutions**:
1. Check SSE connection:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        -H "Accept: text/event-stream" \
        https://your-deployment.vercel.app/mcp
   ```
2. Verify tools list endpoint:
   ```bash
   curl -X POST https://your-deployment.vercel.app/api/mcp \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
   ```
3. Check Poke logs for errors
4. Try disconnecting and reconnecting

### Issue: SSE Connection Drops

**Symptoms**:
- Frequent disconnections
- Connection drops after 10 seconds
- Must reconnect repeatedly

**Cause**: Vercel serverless functions have a 10-second timeout

**Solutions**:
1. **Enable Auto-Reconnect** in Poke settings
2. **Use JSON-RPC fallback** for critical operations
3. **Accept as normal behavior** - reconnection is seamless
4. Configure Poke reconnection settings:
   ```json
   {
     "reconnect": {
       "enabled": true,
       "maxAttempts": 10,
       "interval": 3000
     }
   }
   ```

### Issue: Slow Response Times

**Symptoms**:
- Long wait for tool execution
- Timeout errors
- Slow query responses

**Solutions**:
1. Check Monolith Agent health:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-deployment.vercel.app/api/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"monolith_status"},"id":1}'
   ```
2. Verify Tailscale connection is stable
3. Check Vercel function logs for errors
4. Increase timeout in Poke settings

### Issue: CORS Errors

**Symptoms**:
- "CORS policy" error in browser console
- Preflight request failed
- "Access-Control-Allow-Origin" error

**Solutions**:
1. Add Poke's origin to `ALLOWED_ORIGINS`:
   ```bash
   ALLOWED_ORIGINS=http://localhost:3000,https://poke.app
   ```
2. Redeploy after updating environment variables
3. Verify CORS headers in response:
   ```bash
   curl -I -H "Origin: https://poke.app" \
     https://your-deployment.vercel.app/
   ```

## 🎯 Best Practices

### 1. Use Environment-Specific Configs
```
Development: dev-monolith.vercel.app
Staging: staging-monolith.vercel.app
Production: monolith.your-domain.com
```

### 2. Enable Auto-Reconnect
```json
{
  "reconnect": {
    "enabled": true,
    "maxAttempts": 5,
    "interval": 5000
  }
}
```

### 3. Set Appropriate Timeouts
```json
{
  "timeout": {
    "connection": 10000,
    "request": 30000
  }
}
```

### 4. Monitor Connection Health
- Check Poke status indicator regularly
- Review logs for connection issues
- Set up alerts for disconnections

### 5. Secure Your Tokens
- Use strong, random bearer tokens
- Don't share tokens
- Rotate tokens regularly
- Use different tokens per environment

## 📈 Performance Optimization

### 1. Reduce Latency
- Deploy to Vercel region closest to you
- Use Tailscale's FastPath for direct connections
- Optimize Monolith Agent response times

### 2. Handle Reconnections Gracefully
```json
{
  "reconnect": {
    "enabled": true,
    "exponentialBackoff": true,
    "maxAttempts": 10,
    "initialInterval": 1000,
    "maxInterval": 30000
  }
}
```

### 3. Use Appropriate Transports
- **SSE**: For streaming and real-time updates
- **JSON-RPC**: For request/response operations
- **Fallback**: Configure JSON-RPC as fallback

## 🔐 Security Considerations

### 1. Token Management
- Generate strong tokens (32+ bytes)
- Store tokens securely
- Never commit tokens to git
- Use environment variables

### 2. Network Security
- Always use HTTPS in production
- Leverage Tailscale's encryption
- Restrict CORS origins
- Monitor access logs

### 3. Authentication
- Verify bearer token on every request
- Implement rate limiting if needed
- Log authentication failures
- Alert on suspicious activity

## 📱 Poke UI Features

### Tool Execution
- **Natural Language**: Type commands naturally
- **Direct Calls**: Use `@tool_name` syntax
- **Auto-complete**: Poke suggests tools
- **Parameter Help**: Shows required fields

### Connection Management
- **Status Indicator**: Visual connection state
- **Manual Reconnect**: Force reconnection
- **Connection Details**: View endpoint info
- **Error Messages**: Clear error descriptions

### Tool Discovery
- **Auto-Discovery**: Tools load on connect
- **Tool List**: Browse available tools
- **Tool Details**: View schemas and descriptions
- **Usage Examples**: See tool examples

## 🎓 Advanced Usage

### Custom Tool Wrapper

```javascript
// Wrapper for monolith_query with error handling
async function safeMonolithQuery(query) {
  try {
    const result = await poke.callTool('monolith_query', { query });
    return result;
  } catch (error) {
    console.error('Query failed:', error);
    // Fallback or retry logic
    return { error: error.message };
  }
}
```

### Batch Operations

```javascript
// Execute multiple queries
async function batchQuery(queries) {
  const results = await Promise.all(
    queries.map(q => poke.callTool('monolith_query', { query: q }))
  );
  return results;
}
```

### Status Monitoring

```javascript
// Monitor connection status
poke.on('connection', (status) => {
  if (status === 'connected') {
    console.log('Atlas Monolith connected');
  } else if (status === 'disconnected') {
    console.warn('Atlas Monolith disconnected');
    // Handle disconnection
  }
});
```

## 📚 Additional Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Poke Documentation](https://poke.app/docs)
- [Main README](README.md)
- [Server-Sent Events Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

## 🆘 Getting Help

### Support Channels
- **GitHub Issues**: [Report Issues](https://github.com/iacosta3994/monolith-vercel-bridge/issues)
- **GitHub Discussions**: [Ask Questions](https://github.com/iacosta3994/monolith-vercel-bridge/discussions)
- **Poke Support**: Contact Poke team for client-specific issues

### Diagnostic Information

When reporting issues, include:

1. **Server Health**:
   ```bash
   curl https://your-deployment.vercel.app/health
   ```

2. **Discovery Response**:
   ```bash
   curl https://your-deployment.vercel.app/
   ```

3. **Tool List**:
   ```bash
   curl -X POST https://your-deployment.vercel.app/api/mcp \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
   ```

4. **Vercel Logs**: Export from Vercel Dashboard

5. **Poke Logs**: Export from Poke settings

---

**Happy integrating! 🚀**
