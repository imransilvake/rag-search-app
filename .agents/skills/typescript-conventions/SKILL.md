---
name: typescript-conventions
description: Enforces TypeScript, Zod schema naming, type file organization, import conventions, and variable naming rules for this project. Use when writing types, interfaces, Zod schemas, imports, or any TypeScript code.
---

# TypeScript Conventions

## Core TypeScript Rules

- Strict mode enabled — no escape hatches
- No `any` type — use `unknown` with type guards if needed
- No non-null assertions (`!`) — use optional chaining (`?.`) or explicit null checks
- Arrays: `T[]` syntax (not `Array<T>`)
- Always use `type` keyword for type-only imports
- No `React.` namespace — import directly

## Type File Organization

### File naming

Non-component files (anything that is not `.tsx`) use **kebab-case** file names, except **hooks** which stay camelCase:

| Kind               | Pattern    | Example               |
| ------------------ | ---------- | --------------------- |
| Utility            | kebab-case | `format-file-size.ts` |
| Hook               | camelCase  | `useSearchChat.ts`    |
| Server module      | kebab-case | `ingest.ts`           |
| Styles / config    | kebab-case | `routes.ts`           |
| Component (`.tsx`) | PascalCase | `SearchScreen.tsx`    |

### Where types live

| Scope                             | Location                                                               |
| --------------------------------- | ---------------------------------------------------------------------- |
| Domain lib types                  | `src/lib/[module]/types.ts`                                            |
| Feature schemas + types           | `src/screens/[feature]/schemas/index.ts`                               |
| Feature manual types _(optional)_ | `src/screens/[feature]/types/index.ts` — only when Zod cannot model it |
| Atom / element component types    | `src/components/atoms\|elements/[component]/types.ts`                  |

**Feature-level types are schema-derived by default** — define a Zod `*Schema` / `*Enum` in `schemas/index.ts` and export `type IX = z.infer<typeof XSchema>`.

Use `types/index.ts` only for manual interfaces that cannot be expressed as Zod. Do **not** re-export schema-derived types from `types/`.

Atom/element components may use plain `interface` in co-located `types.ts` (props extend `ComponentProps`, styles use `VariantProps`).

**NEVER** define types inline in component files.

### Section-based organization in type files

Use section headers in `schemas/index.ts`, optional feature `types/index.ts`, and atom `types.ts`:

```ts
// ============================================================
// DOMAIN TYPES (Data Models)
// ============================================================

// ============================================================
// API TYPES (Request/Response)
// ============================================================

// ============================================================
// COMPONENT PROPS
// ============================================================
```

Rules:

- Use `// ====` section headers with equals-sign delimiters
- No inline comments or JSDoc — types should be self-documenting
- In `schemas/index.ts`: every exported type must be `z.infer<typeof SomeSchema>` (or `z.infer<typeof SomeEnum>`) co-located with its schema

## Zod Schema Naming — Mandatory

All Zod schemas **must be PascalCase** and follow the suffix pattern:

| Zod Type         | Suffix    | Example                            |
| ---------------- | --------- | ---------------------------------- |
| `z.object()`     | `Schema`  | `UserProfileSchema`                |
| `z.array()`      | `Schema`  | `FetchConversationsResponseSchema` |
| `z.union()`      | `Schema`  | `ThemeSchema`                      |
| `z.enum()`       | `Enum`    | `DocumentStatusEnum`               |
| `z.literal()`    | `Literal` | `AuthCompletedEventLiteral`        |
| `z.instanceof()` | `Schema`  | `UploadFilesInputSchema`           |

```ts
export const UserProfileSchema = z.object({ name: z.string() });
export type IUserProfile = z.infer<typeof UserProfileSchema>;
```

## Path Aliases — Always use, never relative cross-module

| Alias          | Maps to                     |
| -------------- | --------------------------- |
| `@/*`          | `src/*`                     |
| `@/atoms/*`    | `src/components/atoms/*`    |
| `@/elements/*` | `src/components/elements/*` |
| `@/config/*`   | `src/config/*`              |
| `@/screens/*`  | `src/screens/*`             |
| `@/utils/*`    | `src/utils/*`               |
| `@/lib/*`      | `src/lib/*`                 |

Rules:

- Same-folder siblings: relative `./`
- Parent-relative (`../`): OK within same feature directory
- Cross-feature or cross-module: **must** use `@/` aliases
- ❌ Never use `@/components/atoms/*` — use `@/atoms/*`

## No Barrel Files

Never create `index.ts` that only re-exports other modules.

**Exception:** `schemas/index.ts` and optional `types/index.ts` (manual interfaces only) are defining files — they are allowed.

```
❌ src/screens/search/components/index.ts  (just re-exporting)
✅ import { ConversationSidebar } from '@/screens/search/components/ConversationSidebar'
```

## Variable Naming

| Rule                 | Wrong                | Right                               |
| -------------------- | -------------------- | ----------------------------------- |
| No abbreviations     | `msg`, `err`, `vars` | `message`, `error`, `variables`     |
| No generic callbacks | `newMsg`             | `newMessage`                        |
| No `handleX` events  | `handleClick`        | `onClick`                           |
| Boolean prefix       | `disabled`, `open`   | `isDisabled`, `isOpen`              |
| Ref suffix           | `input`, `container` | `inputRef`, `containerRef`          |
| Catch variable       | `catch (e)`          | `catch (error)` or `catch (_error)` |
| Array names          | `arr`, `el`, `idx`   | `array`, `element`, `index`         |

## Exports

- **Atom / element components**: named exports only
- **Screen/feature components**: default exports
- **Utilities, hooks, types**: named exports
- **Never export types from non-`types.ts` files** (except schema-derived types in `schemas/index.ts` and domain `lib/*/types.ts`)

## Don'ts

- ❌ Don't use `any`
- ❌ Don't use `!` non-null assertions
- ❌ Don't put schema-derived feature types in `types/index.ts`
- ❌ Don't create barrel re-export `index.ts` files
- ❌ Don't use `React.` namespace prefix
- ❌ Don't use camelCase for Zod schema exports
- ❌ Don't name a `z.enum()` with `Schema` suffix (use `Enum`)
