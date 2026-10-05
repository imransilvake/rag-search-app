# Architecture

This app implements a **RAG** (Retrieval-Augmented Generation) loop with tool calling:

1. **Ingest** — upload a file → extract text → clean → summarize → chunk → embed → store in Postgres (`pgvector`) + Storage
2. **Query (in-app)** — multi-turn chat → model may call `search_documents` / `list_documents` → answer + sources
3. **Query (Cursor)** — same retrieval via stdio MCP (`mcp/server.ts`); see [`docs/MCP.md`](MCP.md)

## Why this layout

Routes stay thin. Domain work lives in `src/lib`. UI lives under `components/` (atoms/elements) and `screens/`. See [`docs/directory-structure.md`](directory-structure.md).

```
src/
  app/                        # Thin App Router pages + API handlers
  components/atoms|elements/  # Shared UI primitives and chrome
  screens/search|documents/   # Feature screens
  styles/                     # Design tokens + Tailwind @theme stack
  theme/                      # light/dark ThemeProvider + cookie toggle
  config/                     # ROUTES constants
  utils/                      # Shared formatters
  lib/
    env.ts                    # Typed env reads (fail clearly when keys missing)
    supabase/client.ts        # Anon + service-role clients
    openai/client.ts          # OpenAI client
    documents/                # extract → clean → summarize → chunk → embed → ingest
    rag/                      # retrieve, tools, chat
    conversations/            # Persist and load chat history
mcp/
  server.ts                   # Cursor MCP (stdio) over retrieve + list
```

## Design system

- Tokens: [`src/styles/tokens.css`](../src/styles/tokens.css) (light/dark semantic variables)
- Theme toggle: cookie `theme` (`light`|`dark`) + FOUC script; no `cookies()` in layout
- Styling rules: [styling-system skill](../.agents/skills/styling-system/SKILL.md)

## Agent skills

Coding conventions live in [`.agents/skills/`](../.agents/skills/) and always-on rules in [`.agents/rules/`](../.agents/rules/).

| Skill                                                                       | Covers                                  |
| --------------------------------------------------------------------------- | --------------------------------------- |
| [component-architecture](../.agents/skills/component-architecture/SKILL.md) | Atoms / elements / screens structure    |
| [typescript-conventions](../.agents/skills/typescript-conventions/SKILL.md) | Zod, naming, path aliases, no barrels   |
| [styling-system](../.agents/skills/styling-system/SKILL.md)                 | Tokens, `tv()`, theme light/dark        |
| [routing-conventions](../.agents/skills/routing-conventions/SKILL.md)       | Thin pages/API routes, fetch + useState |
| [testing-and-quality](../.agents/skills/testing-and-quality/SKILL.md)       | lint, format, husky, commitlint         |

## Data model

- Table `library_files`: **one row per uploaded file** (name, type, size, path, url, summary, chunk count). Listing and delete use this table.
- Table `documents`: one row per **chunk** (content + embedding). `metadata.document_id` points at `library_files.id`.
- Chunk rows still carry denormalized file metadata for retrieval snippets; the library row is the source of truth for the Documents UI.
- Original bytes live in the Supabase Storage bucket `documents`.
- Table `conversations`: one row per chat thread (title from first question).
- Table `messages`: user + assistant turns; assistant rows may store retrieved `sources` as JSON.
- In-app search loads prior messages for the conversation and passes them into the chat model (last 20 turns).
- Sources on the assistant message are the union of chunks returned by tool calls in that turn.
- Retrieval clamps `match_count` to 1–10; `match_threshold` defaults to **0** so small corpora still return hits.

## Quality constraints (kept intentionally)

- No route file should grow into a god-handler.
- Extraction, cleaning, chunking, embedding, and persistence are separate modules.
- Types describe real invariants (`DocumentMetadata`, `MatchedChunk`) instead of `any` bags.
- Service role key is server-only (upload/delete); browser never sees it.
- Unit tests cover clean/chunk/file-type/ingest guards (`yarn test`); no live OpenAI or Supabase in CI-local unit runs.
- This is a **local single-user demo** — APIs are intentionally open (no auth/RLS).
