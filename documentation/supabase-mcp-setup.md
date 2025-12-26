# Supabase MCP Server Setup

## Status: Pending Setup

## Overview

The Supabase MCP server allows Claude Code to interact directly with Supabase:
- Query data using SQL
- Design tables and generate migrations
- Manage database branches
- Retrieve logs for debugging
- Generate TypeScript types

## Setup Method: Self-Hosted (stdio)

Supabase MCP requires the self-hosted approach using the npm package.

### Command to Run

```bash
claude mcp add --transport stdio supabase \
  --env SUPABASE_ACCESS_TOKEN=<your-access-token> \
  -- npx -y @supabase/mcp-server-supabase
```

### Getting Your Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Give it a descriptive name (e.g., "Claude Code MCP")
4. Copy the token immediately (it won't be shown again)
5. Use the token in the command above

## What's NOT an MCP Integration

The Supabase dashboard Integrations page (Settings → Integrations) shows:
- GitHub Integration - for branch syncing
- Vercel Integration - for deployments
- AWS PrivateLink - for VPC connections

These are platform integrations, **not MCP servers**.

## Security Notes

- Access tokens have full account access - treat them like passwords
- Consider using a development/staging project first
- Never commit tokens to git
- The token is stored securely by Claude Code, not in `.mcp.json`

## Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase MCP GitHub](https://github.com/supabase-community/supabase-mcp)
- [Access Token Management](https://supabase.com/dashboard/account/tokens)

## Next Steps

1. [ ] Generate Supabase access token
2. [ ] Run the `claude mcp add` command above
3. [ ] Test with `/mcp` in Claude Code
4. [ ] Verify connection with a simple query
