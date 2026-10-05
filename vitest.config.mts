import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	test: {
		environment: 'node',
		include: ['src/**/*.test.ts']
	},
	resolve: {
		alias: {
			'@': path.resolve(rootDir, './src'),
			'@/atoms': path.resolve(rootDir, './src/components/atoms'),
			'@/elements': path.resolve(rootDir, './src/components/elements'),
			'@/screens': path.resolve(rootDir, './src/screens'),
			'@/config': path.resolve(rootDir, './src/config'),
			'@/utils': path.resolve(rootDir, './src/utils')
		}
	}
});
