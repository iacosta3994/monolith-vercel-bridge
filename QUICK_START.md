# Quick Start Guide

Get your MCP server running in 5 minutes! ⚡

## 🚀 Deploy Now

### Option 1: One-Click Deploy (30 seconds)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fiacosta3994%2Fmonolith-vercel-bridge)

1. Click button above
2. Sign in to Vercel
3. Configure environment variables (see below)
4. Click "Deploy"
5. **Done!** 🎉

### Option 2: CLI Deploy (2 minutes)

```bash
git clone https://github.com/iacosta3994/monolith-vercel-bridge.git
cd monolith-vercel-bridge
npm install -g vercel
vercel login
vercel
```

## 🔑 Required Environment Variables

Copy these into Vercel:

```bash
# Generate tokens
BEARER_TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
API_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")

# Your Monolith Agent (Tailscale URL)
MONOLITH_AGENT_URL=https://monolith.your-tailnet.ts.net
MONOLITH_API_KEY=your-monolith-api-key

# Tailscale (get from https://login.tailscale.com/admin/settings/keys)
TAILSCALE_API_KEY=tskey-api-xxxxx
TAILSCALE_TAILNET=yourname.ts.net
```

## ✅ Test Your Deployment

```bash
# Replace YOUR_URL with your Vercel deployment URL
export MCP_URL="https://your-project.vercel.app"
export BEARER_TOKEN="your-bearer-token"

# 1. Test health
curl $MCP_URL/health

# 2. Test discovery
curl $MCP_URL/

# 3. Test authentication
curl -H "Authorization: Bearer $BEARER_TOKEN" $MCP_URL/mcp

# 4. Test tool execution
curl -X POST $MCP_URL/api/mcp \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

## 🎮 Add to Poke

1. Open Poke
2. Settings → MCP Servers
3. Add Server:
   - **Name**: Atlas Monolith
   - **URL**: `https://your-project.vercel.app`
   - **Auth**: Bearer Token
   - **Token**: Your `BEARER_TOKEN`
4. Connect!

## 🎯 Available Tools

Try these in Poke:

```
# Check status
@monolith_status

# Query agent
@monolith_query { "query": "What's the system status?" }

# Execute command
@monolith_execute { "command": "system.info" }

# List Tailscale devices
@tailscale_devices { "onlineOnly": true }
```

## 📚 Full Documentation

- **[Complete README](README.md)** - Full documentation
- **[Poke Integration](POKE_INTEGRATION.md)** - Detailed Poke setup
- **[Deployment Guide](DEPLOYMENT.md)** - Step-by-step deployment

## 🐛 Common Issues

### "Cannot connect"
✅ Check URL has `https://`
✅ Verify server is deployed

### "401 Unauthorized"
✅ Check bearer token matches
✅ Ensure no extra spaces

### "No tools available"
✅ Wait for SSE connection
✅ Try refresh/reconnect in Poke

### "Connection drops after 10s"
✅ Normal for Vercel (10s timeout)
✅ Enable auto-reconnect in Poke
✅ Connection will auto-restore

## 🔒 Security Checklist

- [ ] Strong bearer token (32+ bytes)
- [ ] Unique tokens per environment
- [ ] HTTPS only (automatic on Vercel)
- [ ] Secrets not in git
- [ ] CORS configured (if needed)

## 📞 Need Help?

- **Issues**: [GitHub Issues](https://github.com/iacosta3994/monolith-vercel-bridge/issues)
- **Questions**: [Discussions](https://github.com/iacosta3994/monolith-vercel-bridge/discussions)
- **Docs**: [Full README](README.md)

---

**That's it! Your MCP server is ready! 🚀**
