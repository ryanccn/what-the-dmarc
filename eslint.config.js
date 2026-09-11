import { config } from '@ryanccn/eslint-config';

export default config({
	svelte: true,
	rules: {
		'no-undef': 'off',
		'unicorn/no-top-level-assignment-in-function': 'off',
		'unicorn/single-line-block-comment-style': 'off',
		'unicorn/name-replacements': 'off',
		'unicorn/consistent-boolean-name': 'off',
		'unicorn/prefer-await': 'off',
		'unicorn/no-unreadable-for-of-expression': 'off'
	}
});
