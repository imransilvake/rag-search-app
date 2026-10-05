# Cursor MCP — search this app's documents

Expose the same `retrieveRelevantChunks` pipeline the in-app chat uses, so Cursor agents can query your uploaded corpus.

## Tools

| Tool               | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| `search_documents` | Semantic search → top chunks (query + optional `match_count`) |
| `list_documents`   | List uploaded files with summaries                            |

## Prerequisites

1. App env is configured (same as [`SETUP.md`](SETUP.md)): `.env.local` with Supabase + OpenAI keys.
2. Documents are uploaded via the app UI (or already in Supabase).
3. Dependencies installed (`yarn install`).

## Run locally (smoke test)

```bash
yarn mcp
```

The process waits on stdin (stdio MCP). Stop with Ctrl+C. Errors log to stderr.

## Add to Cursor

Project config (recommended): use [`.cursor/mcp.json`](../.cursor/mcp.json) in this repo (runs `tsx mcp/server.ts` from the workspace root).

Or add under **Cursor Settings → MCP**:

- **Name:** `rag-docs`
- **Command:** `npx`
- **Args:** `tsx`, `mcp/server.ts`
- **cwd:** workspace folder (repo root)

Example JSON (same as the committed project file):

```json
{
	"mcpServers": {
		"rag-docs": {
			"command": "npx",
			"args": ["tsx", "mcp/server.ts"]
		}
	}
}
```

Restart MCP / Cursor after changing config. Ask Cursor something like: “Use search_documents to find what our docs say about X.”

## Notes

- The MCP server loads `.env.local` then `.env` from the process cwd.
- It does **not** start the Next.js UI; only the shared `src/lib` retrieval code.
- Treat this as a local/dev integration — there is no extra auth layer on the MCP tools.
