---
name: testing-and-quality
description: Enforces lint, format, git hooks, commit conventions, and code quality rules for this Next.js project. Use when running quality checks, configuring husky/commitlint/prettier/eslint, or reviewing code for quality compliance.
---

# Testing & Code Quality

## Quality Tooling

| Tool        | Role                                                  |
| ----------- | ----------------------------------------------------- |
| ESLint      | Next.js base + unused-imports / no-barrels / prettier |
| Prettier    | Format (tabs, single quotes, Tailwind class sort)     |
| Husky       | `pre-commit` → lint-staged; `commit-msg` → commitlint |
| lint-staged | ESLint + Prettier on staged files; `tsc --noEmit`     |
| commitlint  | Conventional commits                                  |

### Scripts

```bash
yarn lint          # eslint .
yarn lint:fix      # eslint . --fix
yarn format        # prettier --check .
yarn format:fix    # prettier --write .
yarn scan          # format:fix + lint:fix + tsc --noEmit + yarn test
yarn test          # Vitest unit tests (no network)
```

## Commit Messages

Conventional commits with allowed types:

`build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

```
feat: extract SearchScreen from app page
fix: handle empty conversation list
```

Scope is optional (no ticket-ID requirement).

## Error Handling Principles

- Validate at boundaries (API routes, fetch responses) — not mid-component
- Show user-facing error messages, not technical stack traces
- Include retry affordances for recoverable errors where the UI already does
- Don't over-validate when TypeScript guarantees types

## Code Quality Rules

### Architecture

- Business / RAG logic belongs in `src/lib` — not in components or thin routes
- Component files: max 200 lines — extract if larger
- Never suppress eslint rules — fix it properly

### Circular dependencies

- Avoid A → B → A import cycles
- Barrel files are a primary cause — don't create them
- Maintain unidirectional dependency flow: `app` → `screens` → `elements`/`atoms` → `utils`; `app/api` → `lib`

## Pre-commit Quality Checklist

- [ ] `yarn scan` would pass on changed files
- [ ] Component files under 200 lines
- [ ] No eslint rule suppressions
- [ ] No barrel `index.ts` files added
- [ ] No secrets in client bundles
- [ ] Commit message matches conventional format
