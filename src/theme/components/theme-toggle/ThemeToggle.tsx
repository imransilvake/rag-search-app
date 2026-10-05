'use client';

import { Button } from '@/atoms/button/Button';
import { useTheme } from '@/theme/components/theme-provider/ThemeProvider';

export const ThemeToggle = () => {
	const { theme, setTheme } = useTheme();
	const nextTheme = theme === 'dark' ? 'light' : 'dark';

	return (
		<Button
			type="button"
			variant="secondary"
			size="sm"
			onClick={() => setTheme(nextTheme)}
			aria-label="Toggle color theme"
			title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>
			{theme === 'dark' ? 'Light' : 'Dark'}
		</Button>
	);
};
