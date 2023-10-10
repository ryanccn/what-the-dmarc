<script lang="ts">
	import Good from './icons/Good.svelte';
	import Bad from './icons/Bad.svelte';
	import Neutral from './icons/Neutral.svelte';

	import { spfString } from '../store';

	const enum SPFPolicy {
		PASS,
		FAIL,
		SOFTFAIL,
		NEUTRAL,
		INCLUDE
	}
	const initialSPFState = [] as { server: string; policy: SPFPolicy }[];

	let error: string | null = null;
	let spfState = initialSPFState;

	$: includeState = spfState.filter((k) => k.policy === SPFPolicy.INCLUDE);

	$: (() => {
		if ($spfString.length === 0) {
			error = null;
			spfState = initialSPFState;
			return;
		}

		if (!$spfString.startsWith('v=spf1 ')) {
			error = 'SPF record must start with v=spf1';
			spfState = initialSPFState;
			return;
		}

		const newState = [] as typeof initialSPFState;

		$spfString
			.split(' ')
			.filter(Boolean)
			.slice(1)
			.forEach((frag) => {
				if (frag.startsWith('redirect=') || frag.startsWith('explanation=')) return;

				if (frag.startsWith('include:')) {
					newState.push({ server: frag.replace('include:', ''), policy: SPFPolicy.INCLUDE });
					return;
				}

				const policy =
					frag[0] === '+'
						? SPFPolicy.PASS
						: frag[0] === '-'
						? SPFPolicy.FAIL
						: frag[0] === '~'
						? SPFPolicy.SOFTFAIL
						: frag[0] === '?'
						? SPFPolicy.NEUTRAL
						: SPFPolicy.PASS;

				newState.push({
					server: ['+', '-', '~', '?'].includes(frag[0]) ? frag.slice(1) : frag,
					policy
				});
			});

		spfState = newState;
		error = null;
	})();
</script>

<input
	bind:value={$spfString}
	class="mb-1 rounded-sm bg-neutral-50 px-3 py-2 font-mono transition-all focus:outline-none focus:ring focus:ring-pink-500/50 dark:bg-neutral-900"
	spellcheck="false"
/>
{#if error}
	<p class="text-xs font-bold text-red-400">{error}</p>
{/if}

<ul class="mb-4 mt-8 flex max-w-prose flex-col gap-y-2 text-sm leading-tight">
	{#each spfState as spfPolicy}
		{#if spfPolicy.policy === SPFPolicy.PASS}
			<li class="flex flex-row items-center gap-x-2">
				<Good />
				<span>{spfPolicy.server} passes checks</span>
			</li>
		{:else if spfPolicy.policy === SPFPolicy.FAIL}
			<li class="flex flex-row items-center gap-x-2">
				<Bad />
				<span>{spfPolicy.server} results in a failure</span>
			</li>
		{:else if spfPolicy.policy === SPFPolicy.NEUTRAL}
			<li class="flex flex-row items-center gap-x-2">
				<Neutral />
				<span>{spfPolicy.server} results in a neutral status</span>
			</li>
		{:else if spfPolicy.policy === SPFPolicy.SOFTFAIL}
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
