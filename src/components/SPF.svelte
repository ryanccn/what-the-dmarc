<script lang="ts">
	import Good from './icons/Good.svelte';
	import Bad from './icons/Bad.svelte';
	import Neutral from './icons/Neutral.svelte';

	import { store } from '../store.svelte';
	import { import_ } from '../import.svelte';

	type SPFPolicy = 'pass' | 'fail' | 'softfail' | 'neutral' | 'include';

	let error = $state<string | null>(null);

	let spfState = $state<{ server: string; include: boolean; policy: SPFPolicy }[]>([]);

	$effect(() => {
		if (store.spf.length === 0) {
			error = null;
			spfState = [];
			return;
		}

		let cleanSPFString = store.spf;

		if (cleanSPFString.startsWith('"') && cleanSPFString.endsWith('"')) {
			cleanSPFString = cleanSPFString.slice(1, -1);
		}

		if (cleanSPFString.startsWith("'") && cleanSPFString.endsWith("'")) {
			cleanSPFString = cleanSPFString.slice(1, -1);
		}

		if (!cleanSPFString.startsWith('v=spf1 ')) {
			error = 'SPF record must start with v=spf1';
			spfState = [];
			return;
		}

		const newState = [] as typeof spfState;

		for (const frag of cleanSPFString.split(' ').filter(Boolean).slice(1)) {
			if (frag.startsWith('redirect=') || frag.startsWith('explanation=')) continue;

			const [policy, rest]: [SPFPolicy, string] =
				frag[0] === '+'
					? ['pass', frag.slice(1)]
					: frag[0] === '-'
						? ['fail', frag.slice(1)]
						: frag[0] === '~'
							? ['softfail', frag.slice(1)]
							: frag[0] === '?'
								? ['neutral', frag.slice(1)]
								: ['pass', frag];

			newState.push({
				server: rest.replace(/^include:/, ''),
				include: rest.startsWith('include:'),
				policy
			});
		}

		spfState = newState;
		error = null;
	});
</script>

<input
	bind:value={store.spf}
	class="mb-1 w-full rounded bg-neutral-50 px-3 py-2 font-mono text-sm dark:bg-neutral-900"
	aria-label="SPF record"
	spellcheck="false"
	autocomplete="off"
/>

{#if error}
	<p class="mt-1 text-xs font-medium text-red-500 dark:text-red-400">{error}</p>
{/if}

<ul
	class="mt-8 mb-4 flex max-w-prose flex-col gap-y-2.5 text-sm leading-tight text-neutral-700 dark:text-neutral-300"
>
	{#each spfState as spfPolicy, idx (idx)}
		<li class="flex flex-row items-center gap-x-2">
			{#if spfPolicy.policy === 'pass'}
				<Good />
				<span
					><span class="font-semibold text-black dark:text-white">{spfPolicy.server}</span> passes checks</span
				>
			{:else if spfPolicy.policy === 'fail'}
				<Bad />
				<span
					><span class="font-semibold text-black dark:text-white">{spfPolicy.server}</span> results in
					a failure</span
				>
			{:else if spfPolicy.policy === 'neutral'}
				<Neutral />
				<span
					><span class="font-semibold text-black dark:text-white">{spfPolicy.server}</span> results in
					a neutral status</span
				>
			{:else if spfPolicy.policy === 'softfail'}
				<Bad soft />
				<span
					><span class="font-semibold text-black dark:text-white">{spfPolicy.server}</span> results in
					a softfail</span
				>
			{/if}

			{#if spfPolicy.include}
				<button
					class="rounded-sm border-1 border-current px-1 py-0.5 text-[0.625rem] text-blue-500 dark:text-blue-400"
					onclick={() => {
						store.import_ = spfPolicy.server;
						import_().catch((error) => {
							console.error(error);
						});
					}}
				>
					Include
				</button>
			{/if}
		</li>
	{/each}
</ul>
