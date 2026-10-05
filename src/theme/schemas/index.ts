import { z } from 'zod';

/** Stored preference only — absence of cookie means follow OS until the user toggles. */
export const ThemeSchema = z.union([z.literal('light'), z.literal('dark')]);
export type ITheme = z.infer<typeof ThemeSchema>;
