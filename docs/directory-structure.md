# Directory Structure

```
.agents/
├── rules/                # Always-on agent guidelines (guidelines.mdc)
└── skills/               # Topic skills (component-architecture, routing, …)
docs/                     # Architecture, setup, MCP, this file
mcp/
└── server.ts             # Cursor MCP stdio entry (outside src/)
public/                   # Static assets
src/
├── app/                  # Next.js App Router — thin routes only
│   ├── layout.tsx        # Inter + ThemeProvider + Navigation + FOUC script
│   ├── page.tsx          # → SearchScreen
│   ├── documents/page.tsx# → DocumentsScreen
│   ├── globals.css       # imports tokens + tailwind-stack
│   └── api/              # Thin Route Handlers → src/lib
├── components/
│   ├── atoms/            # UI primitives (Button, Textarea, ModalShell, …)
│   └── elements/         # App chrome (Navigation + ThemeToggle)
├── config/               # ROUTES and shared app constants
├── lib/                  # Domain modules (documents, rag, conversations, env, http)
├── screens/
│   ├── search/           # SearchScreen + conversation sidebar / chat UI
│   └── documents/        # DocumentsScreen + upload / PDF modals
├── styles/
│   ├── tokens.css        # GENERAL light/dark semantic CSS variables
│   ├── tailwind-stack.css# @theme, spacing, typography, label-*
│   └── prettier-tailwind-entry.css
├── theme/                # ThemeSchema, cookie, ThemeProvider, ThemeToggle
└── utils/                # Shared formatters (dates, file size)
supabase/                 # SQL schema + incremental migrations
```

## Conventions

- **Routes stay thin** — feature UI lives under `screens/`; API handlers call `lib/`.
- **Design tokens only** — no Tailwind palette colors (`zinc-*`, `blue-*`); see styling-system skill.
- **No barrel files** — import concrete modules (`@/atoms/button/Button`), never re-export `index.ts` folders (except schema/type defining files).
- **Aliases** — `@/atoms/*`, `@/elements/*`, `@/screens/*`, `@/config/*`, `@/utils/*`, `@/*`.
- Agent coding conventions: see [`.agents/skills/`](../.agents/skills/).
