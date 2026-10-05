import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import barrelFiles from 'eslint-plugin-barrel-files';
import prettier from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**']),
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'unused-imports': unusedImports,
			'barrel-files': barrelFiles,
			prettier
		},
		rules: {
			...prettierConfig.rules,
			'unused-imports/no-unused-imports': 'error',
			'barrel-files/avoid-re-export-all': 'error',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true
				}
			],
			'prettier/prettier': 'error',
			'no-console': ['warn', { allow: ['info', 'warn', 'error', 'debug'] }]
		}
	}
]);

export default eslintConfig;
