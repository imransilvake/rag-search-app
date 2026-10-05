import type { PropsWithChildren } from 'react';
import type { ITheme } from '@/theme/schemas';

// ============================================================
// CONTEXT TYPES
// ============================================================

export type IThemeContextVal = { theme: ITheme; setTheme: (val: ITheme) => void };
export type IThemeProviderProps = PropsWithChildren;
