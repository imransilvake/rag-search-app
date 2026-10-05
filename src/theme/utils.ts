import type { ITheme } from '@/theme/schemas';
import { THEME_COOKIE_KEY, THEME_COOKIE_MAX_AGE, parseThemeCookieValue } from '@/theme/constants';

export const readThemePreference = (): ITheme | null => {
	const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_KEY}=([^;]*)`));
	return parseThemeCookieValue(match ? decodeURIComponent(match[1]) : null);
};

export const applyTheme = (theme: ITheme) => {
	const root = document.documentElement;
	root.classList.remove('light', 'dark');
	root.classList.add(theme);
};

export const setThemeCookie = (theme: ITheme) => {
	document.cookie = `${THEME_COOKIE_KEY}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
};

export const getDocumentTheme = (): ITheme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
