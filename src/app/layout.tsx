import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '@/elements/navigation/Navigation';
import { ThemeProvider } from '@/theme/components/theme-provider/ThemeProvider';
import { THEME_FOUC_SCRIPT } from '@/theme/constants';
import './globals.css';

const inter = Inter({
	variable: '--font-inter-family',
	subsets: ['latin'],
	display: 'swap'
});

export const metadata: Metadata = {
	title: 'RAG Search',
	description: 'Upload documents and search them with retrieval-augmented generation.'
};

const RootLayout = ({ children }: LayoutProps<'/'>) => (
	<html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
		<head>
			<script dangerouslySetInnerHTML={{ __html: THEME_FOUC_SCRIPT }} />
		</head>
		<body className="flex min-h-full flex-col">
			<ThemeProvider>
				<Navigation />
				<div className="min-h-screen flex-1">{children}</div>
			</ThemeProvider>
		</body>
	</html>
);

export default RootLayout;
