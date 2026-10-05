import path from 'node:path';

const mapFilenames = (filenames) => filenames.map((f) => `"${path.relative(process.cwd(), f)}"`).join(' ');
const buildEslintCommand = (filenames) => `eslint --fix ${mapFilenames(filenames)}`;
const buildPrettierCommand = (filenames) => `prettier --write ${mapFilenames(filenames)}`;

const lintStagedConfig = {
	'*.{ts,tsx}': () => 'tsc --noEmit',
	'*.{js,jsx,ts,tsx}': [buildEslintCommand, buildPrettierCommand],
	'*.{json,md,mjs,cjs}': [buildPrettierCommand]
};

export default lintStagedConfig;
