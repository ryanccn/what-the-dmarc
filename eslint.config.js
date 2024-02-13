import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';

import globals from 'globals';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommendedTypeChecked,

	{
		ignores: ['.svelte-kit/**', '.vercel/**']
	},

	{
		languageOptions: {
			parserOptions: {
				project: true,
				extraFileExtensions: ['.svelte']
			},
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},

	{
		files: ['**/*.svelte'],
		plugins: {
			svelte
		},
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: ts.parser
			}
		},
		rules: {
			...svelte.configs.recommended.rules
		}
	},

	{
		files: ['**/*.{js,mjs,cjs}'],
		...ts.configs.disableTypeChecked
	}
);
