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
	class="bg-neutral-50 dark:bg-neutral-900 font-mono px-3 py-2 rounded-sm mb-1"
	spellcheck="false"
/>
{#if error}
	<p class="font-bold text-xs text-red-400">{error}</p>
{/if}

<ul class="mt-8 flex flex-col gap-y-2 text-sm leading-tight max-w-prose mb-4">
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
	<h3 class="font-medium mb-2">Included domains</h3>
	<ul class="flex flex-col gap-y-2 text-sm leading-tight max-w-prose">
		{#each includeState as spfPolicy}
			<li class="flex flex-row items-center gap-x-2">
				<Good />
				<span>{spfPolicy.server}</span>
			</li>
		{/each}
	</ul>
{/if}
