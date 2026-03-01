# Deployment Guide

Complete step-by-step guide for deploying Monolith Vercel Bridge to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Methods](#deployment-methods)
3. [Environment Setup](#environment-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment](#post-deployment)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## ✅ Prerequisites

### Required Accounts
- ✅ GitHub account (for repository access)
- ✅ Vercel account (free tier works)
- ✅ Tailscale account (for secure networking)
- ✅ Access to Atlas Monolith Agent

### Required Information
- ✅ Monolith Agent URL (Tailscale address)
- ✅ Monolith Agent API key
- ✅ Tailscale API key
- ✅ Tailscale tailnet name

### Tools
- ✅ Git (for cloning repository)
- ✅ Node.js 18+ (for local testing)
- ✅ Vercel CLI (optional, for CLI deployment)

## 🚀 Deployment Methods

### Method 1: One-Click Deploy (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge)

1. **Click the button above**
2. **Sign in to Vercel** (or create an account)
3. **Fork or Clone** the repository
4. **Configure environment variables** (see below)
5. **Deploy**

That's it! Your MCP server will be live in ~2 minutes.

### Method 2: Vercel Dashboard (Recommended)

1. **Go to** [vercel.com/new](https://vercel.com/new)
2. **Import Git Repository**:
   - Select your GitHub account
   - Choose `monolith-vercel-bridge`
   - Click "Import"
3. **Configure Project**:
   - Project Name: `monolith-vercel-bridge` (or custom)
   - Framework Preset: Other
   - Root Directory: `./`
4. **Set Environment Variables** (see section below)
5. **Deploy**

### Method 3: Vercel CLI (Advanced)

```bash
# 1. Clone repository
git clone https://github.com/iacosta3994/monolith-vercel-bridge.git
cd monolith-vercel-bridge

# 2. Install Vercel CLI
npm install -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy to preview
vercel

# 5. Follow prompts to configure
# Set up environment variables in Vercel dashboard

# 6. Deploy to production
vercel --prod
```

## ⚙️ Environment Setup

### Step 1: Generate Tokens

Generate secure tokens for authentication:

```bash
# Generate Bearer Token (64 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Example output: a3f8c9d2e1b4567890abcdef1234567890abcdef1234567890abcdef12345678

# Generate API Key (32 characters)  
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
# Example output: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

Save these tokens securely - you'll need them!

### Step 2: Get Tailscale Information

1. **Get Tailscale API Key**:
   - Go to [Tailscale Admin Console](https://login.tailscale.com/admin)
   - Navigate to Settings → Keys
   - Generate API key
   - Save the key securely

2. **Get Tailnet Name**:
   - In Tailscale Admin Console
   - Check DNS settings or Overview
   - Format: `yourname.ts.net` or `yourorg.github.ts.net`

3. **Get Monolith Agent URL**:
   - Find your Monolith Agent device in Tailscale
   - Copy the Tailscale IP or DNS name
   - Format: `https://monolith-agent.yournet.ts.net` or `https://100.x.x.x`

### Step 3: Configure Environment Variables in Vercel

In Vercel Dashboard:

1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables

| Variable | Value | Example | Environment |
|----------|-------|---------|-------------|
| `BEARER_TOKEN` | Your generated bearer token | `a3f8c9d2e1b4567890...` | All |
| `API_KEY` | Your generated API key | `1a2b3c4d5e6f7g8h9i...` | All |
| `MONOLITH_AGENT_URL` | Monolith Tailscale URL | `https://monolith.tail123.ts.net` | All |
| `MONOLITH_API_KEY` | Monolith Agent API key | `monolith-key-12345` | All |
| `TAILSCALE_API_KEY` | Tailscale API key | `tskey-api-xxxxx` | All |
| `TAILSCALE_TAILNET` | Your tailnet name | `yourname.ts.net` | All |

#### Optional Variables

| Variable | Value | Default | Description |
|----------|-------|---------|-------------|
| `NODE_ENV` | `production` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | `info` | Logging level (error, warn, info, debug) |
| `ALLOWED_ORIGINS` | `https://yourdomain.com` | `*` | CORS allowed origins (comma-separated) |
| `TAILSCALE_AUTH_KEY` | Auth key for device | - | Optional auth key |

### Step 4: Set Variables in Vercel

#### Via Dashboard:
1. Paste each variable name in the "Key" field
2. Paste the value in the "Value" field
3. Select environments: Production, Preview, Development
4. Click "Add"

#### Via CLI:
```bash
# Set for all environments
vercel env add BEARER_TOKEN

# Set for specific environment
vercel env add MONOLITH_API_KEY production

# Import from .env file
vercel env pull .env.local
vercel env add < .env.local
```

## 🚀 Vercel Deployment

### Initial Deployment

1. **Trigger Deployment**:
   - Push to main branch (auto-deploy)
   - Or click "Deploy" in Vercel dashboard
   - Or run `vercel --prod`

2. **Monitor Build**:
   - Watch build logs in Vercel dashboard
   - Check for errors or warnings
   - Wait for "Deployment Ready" message

3. **Get Deployment URL**:
   - Copy from Vercel dashboard
   - Format: `https://your-project.vercel.app`

### Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Settings → Domains
   - Click "Add"
   - Enter your domain: `mcp.yourdomain.com`

2. **Configure DNS**:
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or use Vercel nameservers

3. **Verify Domain**:
   - Wait for DNS propagation (5-30 minutes)
   - Vercel will automatically provision SSL

4. **Update Poke Configuration**:
   ```
   URL: https://mcp.yourdomain.com
   ```

## ✅ Post-Deployment

### Step 1: Test Deployment

```bash
# Test health endpoint
curl https://your-deployment.vercel.app/health

# Expected response:
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

### Step 2: Test Discovery

```bash
# Test MCP discovery
curl https://your-deployment.vercel.app/

# Expected response:
{
  "protocol": "mcp",
  "version": "2024-11-05",
  "name": "Atlas Monolith Bridge MCP Server",
  ...
}
```

### Step 3: Test Authentication

```bash
# Test with authentication
curl -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
     https://your-deployment.vercel.app/mcp

# Should return SSE stream
event: connection
data: {"protocol":"mcp",...}
```

### Step 4: Test Tool Execution

```bash
# List available tools
curl -X POST https://your-deployment.vercel.app/api/mcp \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# Execute a tool
curl -X POST https://your-deployment.vercel.app/api/mcp \
  -H "Authorization: Bearer YOUR_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "monolith_status",
      "arguments": { "detailed": true }
    },
    "id": 2
  }'
```

## 🔍 Verification Checklist

### Basic Functionality
- [ ] Health endpoint returns 200
- [ ] Discovery endpoint returns server info
- [ ] SSE endpoint accepts connections
- [ ] JSON-RPC endpoint processes requests
- [ ] Authentication is enforced

### MCP Protocol
- [ ] Server identifies correctly
- [ ] Tools are listed properly
- [ ] Tool execution works
- [ ] Responses follow JSON-RPC 2.0
- [ ] SSE events are formatted correctly

### Integration
- [ ] Can connect to Monolith Agent
- [ ] Tailscale connection works
- [ ] Tools return expected results
- [ ] Errors are handled gracefully

### Security
- [ ] Bearer token is required
- [ ] Invalid tokens are rejected
- [ ] HTTPS is enforced
- [ ] CORS is configured
- [ ] Secrets are not exposed

## 🐛 Troubleshooting

### Deployment Failed

**Issue**: Build or deployment fails

**Check**:
```bash
# View build logs in Vercel dashboard
# Common issues:
# - TypeScript errors
# - Missing dependencies
# - Environment variable issues
```

**Solutions**:
1. Check build logs for specific errors
2. Verify `package.json` has all dependencies
3. Ensure `vercel.json` is valid
4. Try local build: `npm run build`

### Environment Variables Not Set

**Issue**: App can't access environment variables

**Symptoms**:
- Config validation errors
- "Required variable missing" errors
- Authentication failures

**Solutions**:
1. Double-check all variables are set in Vercel
2. Ensure variables are set for correct environment
3. Redeploy after adding variables
4. Check variable names match exactly (case-sensitive)

### Cannot Connect to Monolith

**Issue**: Connection to Monolith Agent fails

**Symptoms**:
- "Connection refused" errors
- "Cannot connect to Monolith Agent" messages
- Timeout errors

**Solutions**:
1. Verify Monolith Agent is running
2. Check Tailscale connection:
   ```bash
   curl https://api.tailscale.com/api/v2/tailnet/YOUR_TAILNET/devices \
     -H "Authorization: Bearer YOUR_TAILSCALE_KEY"
   ```
3. Ensure `MONOLITH_AGENT_URL` is correct Tailscale URL
4. Test Monolith health directly (if accessible)
5. Verify Monolith API key is valid

### CORS Errors

**Issue**: CORS policy blocks requests

**Symptoms**:
- "CORS policy" errors in browser
- "Access-Control-Allow-Origin" errors
- Preflight request failures

**Solutions**:
1. Add your domain to `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://poke.app,https://yourdomain.com
   ```
2. Use `*` for testing (not recommended for production)
3. Redeploy after changing CORS settings
4. Clear browser cache

### Function Timeout

**Issue**: Vercel function times out

**Symptoms**:
- 504 Gateway Timeout errors
- "Function execution timed out" messages
- SSE connections close after 10 seconds

**Solutions**:
1. This is normal for SSE (10s limit)
2. Configure auto-reconnect in client
3. Use JSON-RPC for long-running operations
4. Consider Vercel Pro for longer timeouts

## 📊 Monitoring

### Vercel Analytics
1. Enable in Vercel dashboard
2. View request metrics
3. Monitor error rates
4. Track response times

### Custom Logging
```bash
# View logs in Vercel dashboard
# Filter by:
# - Deployment
# - Time range
# - Log level
# - Search term
```

### Health Monitoring
Set up external monitoring:
```bash
# Example with uptimerobot.com or similar
# Monitor: https://your-deployment.vercel.app/health
# Interval: 5 minutes
# Alert on: Status != 200
```

## 🔄 Updates and Maintenance

### Updating Code
```bash
# 1. Pull latest changes
git pull origin main

# 2. Test locally
npm install
npm run dev

# 3. Push to trigger deployment
git push origin main
```

### Rotating Tokens
```bash
# 1. Generate new token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Update in Vercel dashboard
# Settings → Environment Variables → Edit

# 3. Update in Poke
# Settings → MCP Servers → Edit → Update token

# 4. Redeploy
vercel --prod
```

### Rolling Back
```bash
# Via dashboard:
# 1. Go to Deployments
# 2. Find previous working deployment
# 3. Click "..." → "Promote to Production"

# Via CLI:
vercel rollback
```

## 🎯 Production Best Practices

### 1. Security
- [ ] Use strong, random tokens
- [ ] Restrict CORS origins
- [ ] Rotate credentials regularly
- [ ] Monitor access logs
- [ ] Enable Vercel's security features

### 2. Monitoring
- [ ] Set up health check monitoring
- [ ] Configure alerts for downtime
- [ ] Monitor error rates
- [ ] Track response times
- [ ] Review logs regularly

### 3. Performance
- [ ] Use Vercel Edge Network
- [ ] Enable caching where appropriate
- [ ] Optimize Monolith Agent responses
- [ ] Monitor function execution times

### 4. Documentation
- [ ] Document custom configuration
- [ ] Keep deployment notes
- [ ] Track environment changes
- [ ] Document troubleshooting steps

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Tailscale Setup Guide](https://tailscale.com/kb/)
- [Main README](README.md)
- [Poke Integration Guide](POKE_INTEGRATION.md)

## 🆘 Getting Help

- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **GitHub Issues**: [Report Issues](https://github.com/iacosta3994/monolith-vercel-bridge/issues)
- **Discussions**: [Ask Questions](https://github.com/iacosta3994/monolith-vercel-bridge/discussions)

---

**Deployment complete! 🎉**

Your MCP server is now live and ready to integrate with Poke!
