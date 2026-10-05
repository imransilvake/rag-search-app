/** @type {import('prettier').Config} */
const config = {
	semi: true,
	singleQuote: true,
	printWidth: 200,
	useTabs: true,
	tabWidth: 4,
	trailingComma: 'none',
	bracketSpacing: true,
	htmlWhitespaceSensitivity: 'ignore',
	bracketSameLine: true,
	plugins: ['prettier-plugin-tailwindcss'],
	tailwindFunctions: ['tv'],
	tailwindStylesheet: './src/styles/prettier-tailwind-entry.css'
};

export default config;
