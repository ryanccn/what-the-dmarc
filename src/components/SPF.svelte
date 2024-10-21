<script lang="ts">
	import Good from './icons/Good.svelte';
	import Bad from './icons/Bad.svelte';
	import Neutral from './icons/Neutral.svelte';

	import { store } from '../store.svelte';

	type SPFPolicy = 'pass' | 'fail' | 'softfail' | 'neutral' | 'include';

	let error = $state<string | null>(null);

	let spfState = $state<{ server: string; policy: SPFPolicy }[]>([]);
	let includeState = $derived(spfState.filter((k) => k.policy === 'include'));

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

			if (frag.startsWith('include:')) {
				newState.push({ server: frag.replace('include:', ''), policy: 'include' });
				continue;
			}

			const policy =
				frag[0] === '+'
					? 'pass'
					: frag[0] === '-'
						? 'fail'
						: frag[0] === '~'
							? 'softfail'
							: frag[0] === '?'
								? 'neutral'
								: 'pass';

			newState.push({
				server: ['+', '-', '~', '?'].includes(frag[0]) ? frag.slice(1) : frag,
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
	spellcheck="false"
/>

{#if error}
	<p class="text-xs font-bold text-red-500">{error}</p>
{/if}

<ul class="mb-4 mt-8 flex max-w-prose flex-col gap-y-2 text-sm leading-tight">
	{#each spfState as spfPolicy}
		{#if spfPolicy.policy === 'pass'}
			<li class="flex flex-row items-center gap-x-2">
				<Good />
				<span>{spfPolicy.server} passes checks</span>
			</li>
		{:else if spfPolicy.policy === 'fail'}
			<li class="flex flex-row items-center gap-x-2">
				<Bad />
				<span>{spfPolicy.server} results in a failure</span>
			</li>
		{:else if spfPolicy.policy === 'neutral'}
			<li class="flex flex-row items-center gap-x-2">
				<Neutral />
				<span>{spfPolicy.server} results in a neutral status</span>
			</li>
		{:else if spfPolicy.policy === 'softfail'}
			<li class="flex flex-row items-center gap-x-2">
				<Bad />
				<span>{spfPolicy.server} results in a softfail</span>
			</li>
		{/if}
	{/each}
</ul>

{#if includeState.length > 0}
	<h3 class="mb-2 font-medium">Included domains</h3>
	<ul class="flex max-w-prose flex-col gap-y-2 text-sm leading-tight">
		{#each includeState as spfPolicy}
			<li class="flex flex-row items-center gap-x-2">
				<Good />
				<span>{spfPolicy.server}</span>
			</li>
		{/each}
	</ul>
{/if}
