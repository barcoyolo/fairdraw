---
description: Inspect and use the project Supabase MCP connection
---

This project has a Supabase MCP server configured in `.mcp.json`:

- Server name: `supabase`
- Transport: `http`
- Project ref: `erlcsxqjhtwjzmbisbej`

When this command is used:

1. Read `.mcp.json` and confirm the `supabase` server is present.
2. If the Claude CLI is available, run `claude mcp list` to verify the server is loaded.
3. Use the Supabase MCP server for database, schema, migration, and project inspection tasks when available.
4. If the MCP server is unavailable, explain whether the blocker is missing Claude CLI, authentication, or network access.

Do not print secrets. Do not modify database schema without showing the intended SQL first.
