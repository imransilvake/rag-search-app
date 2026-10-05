import { ThemeSchema, type ITheme } from '@/theme/schemas';

export const THEME_COOKIE_KEY = 'theme';
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Single resolve rule used by FOUC script and client code.
 * `preference === null` → follow OS (`systemIsDark`).
 */
export const resolveTheme = (preference: ITheme | null, systemIsDark: boolean): ITheme => preference ?? (systemIsDark ? 'dark' : 'light');

/** FOUC script embeds the same resolve rule as `resolveTheme`. */
export const THEME_FOUC_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_COOKIE_KEY)};var m=document.cookie.match(new RegExp('(?:^|; )'+k+'=([^;]*)'));var raw=m?decodeURIComponent(m[1]):'';var pref=raw==='light'||raw==='dark'?raw:null;var systemIsDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=pref||(systemIsDark?'dark':'light');var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);}catch(e){}})();`;

export const parseThemeCookieValue = (raw: string | undefined | null): ITheme | null => {
	if (!raw) return null;
	const parsed = ThemeSchema.safeParse(raw);
	return parsed.success ? parsed.data : null;
};
