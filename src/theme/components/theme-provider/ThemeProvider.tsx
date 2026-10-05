'use client';

import { createContext, startTransition, use, useEffect, useState } from 'react';
import type { IThemeContextVal, IThemeProviderProps } from '@/theme/types';
import type { ITheme } from '@/theme/schemas';
import { applyTheme, getDocumentTheme, readThemePreference, setThemeCookie } from '@/theme/utils';

const ThemeContext = createContext<IThemeContextVal | null>(null);

export const ThemeProvider = ({ children }: IThemeProviderProps) => {
	const [theme, setThemeState] = useState<ITheme>('light');

	useEffect(() => {
		const next = readThemePreference() ?? getDocumentTheme();
		applyTheme(next);
		startTransition(() => setThemeState(next));
	}, []);

	const setTheme = (value: ITheme) => {
		setThemeCookie(value);
		setThemeState(value);
		applyTheme(value);
	};

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
	const context = use(ThemeContext);
	if (!context) throw new Error('useTheme must be used within <ThemeProvider />');
	return context;
};
