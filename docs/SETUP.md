# Setup guide

Follow these steps **before** starting the app. Keys are only needed at the end of this checklist.

## 1. Prerequisites

- Node.js 18+ and Yarn (see `yarn.lock`)
- A free [Supabase](https://supabase.com) account
- An [OpenAI API](https://platform.openai.com/api-keys) key with billing enabled

## 2. Supabase project

1. Create a new project (name e.g. `rag-search-app`).
2. Wait until the project is ready.
3. Open **SQL Editor** and run the full contents of [`supabase/schema.sql`](../supabase/schema.sql).
4. Open **Storage** → **New bucket**:
    - Name: `documents`
    - Public: **Yes**

## 3. Copy credentials

From Supabase **Connect** dialog or **Settings → API Keys**:

| Env var in this app                    | What Supabase shows now                                                 |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project URL / `SUPABASE_URL`                                            |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_…`)                                    |
| `SUPABASE_SECRET_KEY`                  | Secret key (`sb_secret_…`) — this replaces the old **service_role** key |

Optional env aliases: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key), `SUPABASE_SERVICE_ROLE_KEY` (secret key).

You do **not** need `SUPABASE_JWKS_URL` for this app.

From OpenAI:

| Env var          | Where to find it                                 |
| ---------------- | ------------------------------------------------ |
| `OPENAI_API_KEY` | [API keys](https://platform.openai.com/api-keys) |

## 4. Local env file

```bash
cp .env.example .env.local
```

Paste real values into `.env.local`. Do not commit that file.

## 5. Run

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### If chat history tables are missing

If you applied an **older** `schema.sql` (before conversations were included), run [`supabase/conversations.sql`](../supabase/conversations.sql) in the SQL Editor. Fresh installs only need `schema.sql`.

### If `library_files` is missing

If you applied an older schema (chunks-only, no library index), run [`supabase/library-files.sql`](../supabase/library-files.sql). It creates `library_files` and backfills rows from existing chunk metadata. Fresh installs get this table from `schema.sql`.

### Smoke test

1. Go to **Documents** → upload a small `.txt` file (max **10 MB**; `.pdf`, `.docx`, or `.txt`).
2. Confirm one row in Supabase **Table Editor** → `library_files`, and chunk rows in `documents`.
3. Go to **Search** and ask a question about the file.
4. You should see an answer plus source chunks, and a new entry under **History**.
5. Refresh the page — the conversation should still appear in History.
6. Ask a follow-up in the same thread (e.g. “summarize that in one sentence”) — the answer should use prior context.
7. Optional: connect Cursor via [`docs/MCP.md`](MCP.md) and call `list_documents` / `search_documents`.

## Common failures

| Symptom                            | Likely cause                                                                                  |
| ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Storage RLS error on upload        | Missing / wrong `SUPABASE_SECRET_KEY`                                                         |
| Env / missing key errors           | Incomplete `.env.local` — restart `yarn dev` after edits                                      |
| Empty PDF text                     | Scanned/image PDF (no extractable text) — try `.txt` first                                    |
| File too large / unsupported       | Max 10 MB; only `.pdf`, `.docx`, `.txt`                                                       |
| Documents list empty after upgrade | Run [`library-files.sql`](../supabase/library-files.sql) to create/backfill `library_files`   |
| `match_documents` errors           | Schema SQL not applied, or `vector` extension missing                                         |
| Index creation fails on empty DB   | Rare with `pgvector`; if `ivfflat` index errors, create it after your first successful upload |

## Cost note

OpenAI usage is pay-as-you-go. With small files and a few searches, cost is typically cents. Set a usage cap in the OpenAI dashboard if you want a hard limit.
