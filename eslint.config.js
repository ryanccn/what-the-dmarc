import { config } from '@ryanccn/eslint-config';
import globals from 'globals';

export default config({
	ignores: ['**/.svelte-kit'],
	svelte: true,
	extraConfigs: [
		{
			files: ['**/*.svelte'],
			languageOptions: {
				globals: {
					...globals.browser
				}
			}
		},
		{
			files: ['postcss.config.cjs'],
			languageOptions: {
				globals: {
					...globals.node
				}
			}
		}
	]
});
