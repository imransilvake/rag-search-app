---
name: component-architecture
description: Enforces component structure, naming, file organization, and React patterns for this Next.js App Router + React 19 project using tailwind-variants. Use when creating or editing atom components, element components, screen feature components, or any UI component file.
---

# Component Architecture

## File Structure

### Atom Components (`src/components/atoms/component-name/`)

```
component-name/             	# lowercase kebab-case folder
├── Component.tsx           	# PascalCase (or Base.tsx for complex)
├── types.ts                	# ALL types/interfaces (never inline)
├── styles.ts (optional)        # ONLY tv() variants
├── schemas.ts (optional)   	# Zod schemas for validation
├── config.ts (optional)    	# ONLY constants
├── utils.ts (optional)     	# Atom-local utilities
├── *Context.tsx (optional) 	# Compound component context + hook
└── *Provider.tsx (optional)	# Compound component provider logic
```

No `index.ts` barrel files — ever.

### Element Components (`src/components/elements/`)

Same structure as atoms. Follow all the same rules. Use for app chrome composed from atoms (e.g. Navigation, ModalShell wrappers shared across screens).

### Feature Components (`src/screens/[feature]/`)

- Optional folders: `components/`, `schemas/`, `utils/`, `hooks/`, `config/`, `styles/`, `types/`
- Screen entry: default-export `*Screen` component (e.g. `SearchScreen.tsx`)
- Feature-only widgets live under `screens/[feature]/components/`

Feature props and API shapes that need validation live in `schemas/index.ts` as Zod schemas with co-located `z.infer` types (see `typescript-conventions` skill). Use `types/` only for shapes that cannot be expressed as Zod.

## Naming Conventions

| Element            | Pattern                   | Example                    |
| ------------------ | ------------------------- | -------------------------- |
| Folder             | kebab-case                | `modal-shell/`             |
| Component file     | PascalCase                | `ModalShell.tsx`           |
| Non-component file | kebab-case                | `format-file-size.ts`      |
| Hook file          | camelCase                 | `useSearchChat.ts`         |
| Props interface    | `I[Component]Props`       | `IModalShellProps`         |
| Styles props type  | `I[Component]StylesProps` | `IButtonStylesProps`       |
| Variant exports    | `*Variants` suffix        | `buttonVariants`           |
| Booleans           | `is*` / `has*` prefix     | `isDisabled`, `isOpen`     |
| Event handlers     | `on*` prefix              | `onClick`, `onSubmit`      |
| Refs               | `*Ref` suffix             | `inputRef`, `containerRef` |
| Data attributes    | `data-slot="name"`        | `data-slot="trigger"`      |

## Code Rules

- **Always arrow functions** — components, hooks, utilities: `const MyComponent = () => {}`
- **Named exports for atoms and element components** — `export const Button = ...`
- **Default exports for screen/feature components** — `export default SearchScreen`
- **Zero `cn()` usage** — use only `tv()` from tailwind-variants instead
- **No `React.` namespace** — import directly
- Component files must stay under 200 lines — extract sub-components or hooks

## TypeScript Rules

- **Atom / element components:** ALL types ONLY in co-located `types.ts` — never inline in component files. Props: use `interface`. StylesProps: use `type` with `VariantProps<>`.
- **Feature components:** prefer schema-derived types from `@/screens/[feature]/schemas`.
- Type imports: always use `type` keyword — `import type { IButtonProps } from './types'`
- No `any` type, no non-null assertions (`!`)

## Context / Provider Pattern

Use only when shared client state truly needs a provider (e.g. theme). Prefer feature hooks for screen state.

- Keep the context value private; export a `use*` hook that throws if used outside the provider
- Hook error message: `'use* must be used within <*Provider />'`
- Theme lives under `src/theme/components/` — not under atoms/elements

## Imports

### Atom Components

Use short aliases — NEVER `@/components/atoms/*`:

```tsx
import { Button } from '@/atoms/button/Button';
import { Textarea } from '@/atoms/textarea/Textarea';
```

### Element Components

```tsx
import { Navigation } from '@/elements/navigation/Navigation';
```

### Screens

```tsx
import SearchScreen from '@/screens/search/SearchScreen';
```

## Don'ts

- ❌ Don't use `function` declarations — always arrow functions
- ❌ Don't create barrel `index.ts` files (re-exports only)
- ❌ Don't use default exports for atom and element components — always use named exports
- ❌ Don't inline types in component files
- ❌ Don't exceed 200 lines per component file
- ❌ Don't use old `@/components/atoms/*` path — use `@/atoms/*`
- ❌ Don't use old `@/components/elements/*` path — use `@/elements/*`
- ❌ Don't suppress eslint rules — fix it properly
