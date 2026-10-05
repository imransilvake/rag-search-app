---
name: styling-system
description: Enforces the design token system, semantic color usage, typography classes, spacing tokens, z-index tokens, and tailwind-variants (tv) patterns for a Next.js App Router + Tailwind CSS v4 project. Use when writing any className, styling a component, choosing colors, spacing, typography, or z-index values.
---

# Styling System

## Core Rule

Always use `tv()` from `tailwind-variants` for conditional className logic. Never use `cn()` or `@/lib/utils`.

```tsx
import { tv } from 'tailwind-variants';

const buttonVariants = tv({
	base: 'inline-flex items-center gap-sm rounded-md',
	variants: {
		variant: {
			primary: 'bg-primary text-primary-foreground',
			secondary: 'bg-secondary text-secondary-foreground'
		},
		size: {
			sm: 'h-8 p-sm',
			md: 'h-10 p-md'
		}
	}
});
```

## Semantic Colors — ALWAYS use project tokens, never third-party palette classes from tailwind

### ❌ Forbidden

```
bg-white  bg-black  bg-gray-100  text-blue-500  border-blue-600
#ffffff   rgb(255,255,255)  bg-black/50
```

### ✅ Required — by intent

| Intent             | Background         | Text                          |
| ------------------ | ------------------ | ----------------------------- |
| Page body          | `bg-background`    | `text-foreground`             |
| High emphasis text | —                  | `text-midnight`               |
| Secondary text     | —                  | `text-overcast`               |
| Primary action     | `bg-primary`       | `text-primary-foreground`     |
| Secondary action   | `bg-secondary`     | `text-secondary-foreground`   |
| Destructive action | `bg-destructive`   | `text-destructive-foreground` |
| Warning            | `bg-warning`       | `text-warning-foreground`     |
| Success            | `bg-success`       | `text-success-foreground`     |
| Disabled/muted     | `bg-muted`         | `text-muted-foreground`       |
| Hover state        | `bg-accent`        | `text-accent-foreground`      |
| Active/pressed     | `bg-accent-active` | —                             |
| Modal backdrop     | `bg-surface-fog`   | —                             |
| Borders            | `border-border`    | —                             |
| Separators         | `bg-border`        | —                             |

## Typography — Inter (single font)

All typography uses **Inter**. Headings use `text-h*` for size/weight; UI controls and body copy use `label-*`.

### Heading Classes

| Class                      | Size          | Weight  | Use                     |
| -------------------------- | ------------- | ------- | ----------------------- |
| `text-h1-bold`             | clamp 32–48px | 700     | Large display headings  |
| `text-h1`                  | clamp 28–40px | 700     | Page hero headings      |
| `text-h2` / `text-h2-bold` | clamp 24–30px | 700/600 | Screen / section titles |
| `text-h3-bold`             | 24px          | 600     | Subsections             |
| `text-h4-semibold`         | 20px          | 600     | Modal / panel titles    |
| `text-h5`                  | 18px, lh 1.7  | 400     | Lead / supporting copy  |

### Label Classes (use in tv() variants for UI + body copy)

| Class        | Maps to            | Size |
| ------------ | ------------------ | ---- |
| `label-1`    | `text-l1`          | 16px |
| `label-1-m`  | `text-l1-medium`   | 16px |
| `label-1-sb` | `text-l1-semibold` | 16px |
| `label-2`    | `text-l2`          | 14px |
| `label-2-m`  | `text-l2-medium`   | 14px |
| `label-2-sb` | `text-l2-semibold` | 14px |
| `label-3`    | `text-l3`          | 12px |
| `label-3-m`  | `text-l3-medium`   | 12px |
| `label-3-sb` | `text-l3-semibold` | 12px |
| `label-4`    | `text-l4`          | 11px |
| `label-5`    | `text-l5`          | 10px |

### ⚠️ tv() Typography Rule

- ✅ Use `label-*` in `tv()` for interactive UI slots and body copy
- ✅ Use `text-h*` in `tv()` only for semantically heading slots (dialog titles, etc.)
- ❌ Never use `text-l*` in `tv()` variants (font-family cascading issues)
- ❌ Never combine a `text-h*` class with any `text-{color}` class in the same slot string — tailwind-merge treats both as `text-color` group and silently drops the first one

```ts
// ❌ Wrong — text-h4-semibold is silently dropped by tailwind-merge
title: 'text-h4-semibold text-midnight';

// ✅ Correct — heading and color in separate slots
title: 'text-h4-semibold';
description: 'text-midnight';
```

### Generic → Design System Mapping

| Generic     | Design System  | Size          |
| ----------- | -------------- | ------------- |
| `text-xs`   | `label-3`      | 12px          |
| `text-sm`   | `label-2`      | 14px          |
| `text-base` | `label-1`      | 16px          |
| `text-xl`   | `text-h4`      | 20px          |
| `text-2xl`  | `text-h2-bold` | clamp 24–30px |

### Token sources

- [`src/styles/tokens.css`](../../src/styles/tokens.css) — light (`:root`) + dark (`.dark`) semantic CSS variables
- [`src/styles/tailwind-stack.css`](../../src/styles/tailwind-stack.css) — `@theme` mapping, spacing, typography, `label-*`

❌ Never use `text-[Xrem]` or `text-[clamp(...)]` — always use design system tokens

## Theme (light / dark)

- Stored cookie values: `light` | `dark` only (`ThemeSchema`)
- No cookie → FOUC + first paint follow OS preference; toggle then persists `light`/`dark`
- Single resolve rule: `resolveTheme(preference, systemIsDark)` in [`src/theme/constants.ts`](../../src/theme/constants.ts); FOUC script embeds the same rule
- Root layout does **not** call `cookies()` — theme is client + FOUC only (pages stay static)
- Toggle in Navigation cycles current theme light ↔ dark via `useTheme`

```tsx
import { useTheme } from '@/theme/components/theme-provider/ThemeProvider';

const { theme, setTheme } = useTheme();
setTheme(theme === 'dark' ? 'light' : 'dark');
```

## Spacing Tokens

| Generic          | Token              | Size |
| ---------------- | ------------------ | ---- |
| `p-1`, `gap-1`   | `p-xs`, `gap-xs`   | 4px  |
| `p-2`, `gap-2`   | `p-sm`, `gap-sm`   | 8px  |
| `p-4`, `gap-4`   | `p-md`, `gap-md`   | 16px |
| `p-6`, `gap-6`   | `p-lg`, `gap-lg`   | 24px |
| `p-8`, `gap-8`   | `p-xl`, `gap-xl`   | 32px |
| `p-12`, `gap-12` | `p-2xl`, `gap-2xl` | 48px |
| `p-16`, `gap-16` | `p-3xl`, `gap-3xl` | 64px |

Also available: `p-xxs` / `gap-xxs` (2px)

## Dimensions (width, height, size)

- **Tailwind numeric scale**: `h-8`, `size-4`, `w-32`, `max-w-50`
- **Design tokens**: `p-md`, `gap-sm`, `rounded-sm`
- **Arbitrary rem**: `size-[6.25rem]` only when no scale value fits
- **`px` ONLY for 1px hairlines**: `h-px`, `w-px`, `border`

### Max-width (`max-w-sm` … `max-w-7xl`)

Named spacing tokens (`--spacing-sm` … `--spacing-3xl`) collide with container names in Tailwind v4 — `max-w-*` prefers spacing, so `max-w-2xl` would become `3rem` without an override. Container widths are restored via `--max-width-*` in [`src/styles/tailwind-stack.css`](../../src/styles/tailwind-stack.css). Prefer `max-w-2xl` / `max-w-md` / etc. as usual; do not use `max-w-(--container-*)` unless adding a size outside that scale.

❌ Never use `px` in dimensions other than hairlines
❌ Never use `px` in `calc()` — use rem: `calc(var(--radius-sm) - 0.0625rem)`

## Z-Index Tokens — Always semantic, never arbitrary

| Token        | Value | Use                           |
| ------------ | ----- | ----------------------------- |
| `z-below`    | -1    | Behind normal flow            |
| `z-base`     | 0     | Normal flow                   |
| `z-surface`  | 1     | Elevated cards                |
| `z-header`   | 10    | Fixed headers, sidebars       |
| `z-dropdown` | 20    | Dropdowns, popovers, tooltips |
| `z-overlay`  | 30    | Modal backdrops               |
| `z-dropzone` | 35    | File drop zone overlays       |
| `z-modal`    | 40    | Modal content                 |
| `z-toast`    | 50    | Toast notifications           |

❌ Never use `z-10`, `z-50`, `z-[999]`, or `style={{ zIndex: ... }}`

## Focus Patterns — Always `focus-visible:`

```tsx
// Buttons and other chrome without a permanent border ring
'focus-visible:ring-ring focus-visible:ring-1';

// Controls with a visible border (Textarea uses border-ring instead of a ring)
'focus-visible:border-ring focus-visible:outline-none';
```

Rules:

- ✅ Always `focus-visible:` (not `focus:`) — keyboard-only
- ✅ Always `ring-1` when using a ring — never `ring-2`+
- ✅ Always `ring-ring` — never opacity modifier `ring-ring/50`
- ❌ Textarea: NO focus ring (cursor + border change is the indicator)

## Custom CSS Classes

Only create custom classes in `@layer components` or `@layer utilities`.
Only create for components used 3+ times. One-off → use Tailwind utilities directly.

- Lowercase-with-hyphens only: `.btn-primary` ✅ — `.btnPrimary` ❌
- State classes: `is-` or `has-` prefix
- JS hooks: `js-` prefix
- No nesting deeper than 2 levels
- No `!important` in `@layer components`

## Don'ts

- ❌ No inline styles
- ❌ No `cn()` — use `tv()`
- ❌ No generic text/spacing classes — always tokens
- ❌ No hardcoded colors or Tailwind palette colors
- ❌ No opacity on hardcoded colors (`bg-black/50` → `bg-surface-fog`)
- ❌ No arbitrary z-index values
- ❌ No `focus:` without `-visible`
- ❌ No `!important`
- ❌ No `text-l*` in `tv()` variants — use `label-*`
