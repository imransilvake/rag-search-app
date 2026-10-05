---
name: routing-conventions
description: Enforces Next.js App Router conventions for thin pages/layouts, screen composition, API route handlers, client data loading via fetch, and ROUTES constants. Use when creating or editing app routes, layouts, pages, API handlers, or navigation.
---

# Routing Conventions (Next.js App Router)

## Layout Responsibilities

```
src/app/
├── layout.tsx              # Root shell: fonts, <Navigation />, children
├── page.tsx                # Thin — render <SearchScreen />
├── documents/page.tsx      # Thin — render <DocumentsScreen />
├── globals.css
└── api/
    ├── search/route.ts
    ├── upload/route.ts
    ├── documents/route.ts
    └── conversations/route.ts
```

Feature UI lives under `src/screens/[feature]/`, not in `app/`.

## Thin Pages

`page.tsx` files only compose screens:

```tsx
import SearchScreen from '@/screens/search/SearchScreen';

const SearchPage = () => <SearchScreen />;

export default SearchPage;
```

❌ Don't put fetch loops, chat state, or large JSX trees in `app/**/page.tsx`
❌ Don't remount `Navigation` from each screen — it belongs in `layout.tsx`

## Semantic HTML: One `<main>` Per Page

- Root layout provides chrome (nav)
- Screen (or page) provides a single `<main>`
- ❌ Never nest multiple `<main>` elements

## API Route Handlers

Handlers in `app/api/*/route.ts` stay thin:

1. Parse / validate input
2. Call `src/lib/*` domain functions
3. Return JSON via shared HTTP helpers

```tsx
// ✅ route calls lib
import { chatWithDocuments } from '@/lib/rag/chat';

// ❌ Don't put embedding / ingest / RAG loops inline in the route file
```

- Secrets (`SUPABASE_SECRET_KEY`, OpenAI key) stay server-only in `src/lib`
- ❌ Never import `@/lib/supabase/client` service-role helpers or OpenAI clients into client components

## Client Data Loading

Screens load data with `fetch` to `/api/*` and local `useState`:

```tsx
const [documents, setDocuments] = useState<IDocument[]>([]);
const [isLoading, setIsLoading] = useState(false);

const loadDocuments = async () => {
	setIsLoading(true);
	try {
		const response = await fetch('/api/documents');
		const data = await response.json();
		// ...
	} finally {
		setIsLoading(false);
	}
};
```

- Keep client data in local `useState` / feature hooks (`useSearchChat`, `useDocumentsLibrary`)
- Validate / surface user-facing errors at the fetch boundary

## Route Constants

**Always** use `ROUTES` from `@/config/routes`. Never hardcode path strings in navigation.

```tsx
import { ROUTES } from '@/config/routes';
import Link from 'next/link';

<Link href={ROUTES.search}>Search</Link>
<Link href={ROUTES.documents}>Documents</Link>
```

## Don'ts

- ❌ Don't hardcode route paths — use `ROUTES`
- ❌ Don't grow `page.tsx` into a screen
- ❌ Don't put domain logic in API routes — call `src/lib`
- ❌ Don't import server-only clients into `'use client'` modules
- ❌ Don't nest multiple `<main>` elements
