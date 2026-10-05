# RAG Search App

Local learning project: upload PDF / DOCX / TXT files, embed chunks with OpenAI, store them in Supabase (`pgvector`), and ask questions with RAG.

Based on the [FreeCodeCamp RAG tutorial](https://www.freecodecamp.org/news/how-to-build-an-ai-powered-rag-search-application-with-nextjs-supabase-and-openai/), restructured for maintainability (thin routes, typed domain modules, atoms/elements/screens UI).

## Quick start

1. **Configure cloud services** — follow [`docs/SETUP.md`](docs/SETUP.md) (Supabase SQL + Storage bucket).
2. **Add keys last** (before testing):

    ```bash
    cp .env.example .env.local
    # edit .env.local with your Supabase + OpenAI values
    ```

3. **Run locally:**

    ```bash
    yarn install
    yarn dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) → **Documents** → upload a small `.txt` → **Search**.

## Docs

| Doc                                                          | Contents                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------- |
| [`docs/SETUP.md`](docs/SETUP.md)                             | Accounts, SQL, Storage, env vars, smoke test              |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)               | Module layout and RAG data flow                           |
| [`docs/directory-structure.md`](docs/directory-structure.md) | Folder layout (app / screens / atoms)                     |
| [`docs/MCP.md`](docs/MCP.md)                                 | Cursor MCP server (`search_documents` / `list_documents`) |
| [`supabase/schema.sql`](supabase/schema.sql)                 | Tables, index, `match_documents` RPC                      |

## Scripts

```bash
yarn dev         # local Next.js server
yarn build       # production build
yarn lint        # ESLint
yarn lint:fix    # ESLint --fix
yarn format      # Prettier check
yarn format:fix  # Prettier write
yarn scan        # format:fix + lint:fix + tsc --noEmit
yarn mcp         # stdio MCP server for Cursor (see docs/MCP.md)
```

## Stack

- Next.js (App Router) + TypeScript + Tailwind + tailwind-variants
- Supabase (Postgres + `pgvector` + Storage)
- OpenAI (`text-embedding-3-small` + `gpt-4o-mini`)
- LangChain text splitter, `mammoth`, `pdf2json`

## Agent conventions

See [`.agents/skills/`](.agents/skills/) and [`.agents/rules/`](.agents/rules/).

## Security

- Never commit `.env.local`.
- `SUPABASE_SECRET_KEY` is server-only (used in API routes for Storage).
- The browser only talks to your Next.js API routes.

## TODOs

Integrations

- with Google (Gmail/Calendar)
- lookup to fetch content fast instead of live search
- pull recent data every hr
- notifications on new emails/meetings
- clean stalled data week's old
- create new meetings
- send an email to someone
