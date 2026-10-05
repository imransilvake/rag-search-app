# RAG Search App

**A portfolio-ready RAG assistant** — full-stack GenAI you can clone, run locally, and demo in interviews.

Drop in **PDF, DOCX, or TXT** → **OpenAI** embeds and indexes your content → **Supabase** holds vectors (`pgvector`) and file storage → ask questions in **multi-turn chat** with **source chunks** and **saved conversation history**. Built with **Next.js**, **TypeScript**, and a structured UI you can point to on a resume or in a system-design walkthrough.

## Prerequisites

- **Node.js 18+**
- **Yarn** — this repo uses `yarn.lock`
- **Supabase** account (free tier is enough to start)
- **OpenAI API key** with billing enabled (embeddings + chat)

## Quick start

1. **Install dependencies**

    ```bash
    git clone https://github.com/imransilvake/rag-search-app.git
    cd rag-search-app
    yarn install
    ```

2. **Supabase** — create a project, then:

    - Run [`supabase/schema.sql`](supabase/schema.sql) in the **SQL Editor** (tables, `pgvector`, `match_documents`, conversations).
    - **Storage** → new bucket **`documents`**, **Public: Yes**.

    Step-by-step and credential names: [`docs/SETUP.md`](docs/SETUP.md).

3. **Environment** (do this after Supabase is ready):

    ```bash
    cp .env.example .env.local
    ```

    Fill in:

    | Variable                               | Purpose                                |
    | -------------------------------------- | -------------------------------------- |
    | `NEXT_PUBLIC_SUPABASE_URL`             | Project URL                            |
    | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable / anon key                 |
    | `SUPABASE_SECRET_KEY`                  | Secret key (server uploads to Storage) |
    | `OPENAI_API_KEY`                       | Embeddings + chat                      |

    Never commit `.env.local`. Restart `yarn dev` after changing env.

4. **Run the app**

    ```bash
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) → **Documents** → upload a small `.txt` → **Search** and ask about the file.

5. **Smoke test** — full checklist (history, follow-ups, optional MCP): [`docs/SETUP.md#smoke-test`](docs/SETUP.md#smoke-test).

### Common issues

| Symptom                 | Likely fix                                                   |
| ----------------------- | ------------------------------------------------------------ |
| Upload / Storage errors | Check `SUPABASE_SECRET_KEY`; bucket name must be `documents` |
| Missing env errors      | Complete `.env.local`, restart dev server                    |
| Empty PDF answers       | Image-only PDFs have no text — try `.txt` first              |
| Search / RPC errors     | Re-run `schema.sql`; confirm `vector` extension exists       |

More: [`docs/SETUP.md#common-failures`](docs/SETUP.md#common-failures).

## Documentation

| Doc                                                          | Contents                                                |
| ------------------------------------------------------------ | ------------------------------------------------------- |
| [`docs/SETUP.md`](docs/SETUP.md)                             | Accounts, SQL, Storage, env vars, smoke test            |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)               | RAG flow and module layout                              |
| [`docs/directory-structure.md`](docs/directory-structure.md) | Folder map (`app`, `screens`, `lib`, …)                 |
| [`docs/MCP.md`](docs/MCP.md)                                 | Cursor MCP (`search_documents`, `list_documents`)       |
| [`supabase/schema.sql`](supabase/schema.sql)                 | Database schema (source of truth)                       |
| [`supabase/conversations.sql`](supabase/conversations.sql)   | Only if you applied an older schema without chat tables |

## Scripts

```bash
yarn dev          # development server (localhost:3000)
yarn build        # production build
yarn start        # serve production build
yarn lint         # ESLint
yarn lint:fix     # ESLint --fix
yarn format       # Prettier check
yarn format:fix   # Prettier write
yarn scan         # format:fix + lint:fix + tsc --noEmit
yarn mcp          # stdio MCP server for Cursor (see docs/MCP.md)
```

Commits use **Husky** (lint-staged + commitlint). Message format: [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, …).

## Stack

- Next.js (App Router), React 19, TypeScript, Tailwind CSS v4, tailwind-variants
- Supabase (Postgres, `pgvector`, Storage)
- OpenAI (`text-embedding-3-small`, `gpt-4o-mini`)
- LangChain text splitter; `mammoth`, `pdf2json` for extraction

## Security

- `.env.local` stays local only.
- `SUPABASE_SECRET_KEY` is **server-only** (API routes / ingest).
- The browser calls **your** Next.js API routes, not Supabase with elevated keys.

## Working with AI / Cursor

Conventions for agents and contributors: [`.agents/skills/`](.agents/skills/) and [`.agents/rules/`](.agents/rules/).
