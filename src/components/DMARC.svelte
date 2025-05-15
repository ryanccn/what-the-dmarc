<script lang="ts">
	import Good from './icons/Good.svelte';
	import Bad from './icons/Bad.svelte';
	import Neutral from './icons/Neutral.svelte';

	import { store } from '../store.svelte';

	const initialDmarcState = {
		adkim: '',
		aspf: '',
		fo: '',
		p: '',
		pct: '',
		rf: '',
		ri: '',
		rua: '',
		ruf: '',
		sp: '',
		v: ''
	};

	let error = $state<string | null>(null);
	let dmarcResult = $state<Record<string, string>>({ ...initialDmarcState });

	$effect(() => {
		if (store.dmarc.length === 0) {
			dmarcResult = { ...initialDmarcState };
			error = null;
			return;
		}

		let cleanDMARCString = store.dmarc;

		if (cleanDMARCString.startsWith('"') && cleanDMARCString.endsWith('"')) {
			cleanDMARCString = cleanDMARCString.slice(1, -1);
		}

		if (cleanDMARCString.startsWith("'") && cleanDMARCString.endsWith("'")) {
			cleanDMARCString = cleanDMARCString.slice(1, -1);
		}

		const parts = cleanDMARCString
			.split(/ *; */)
			.filter(Boolean)
			.map((s) => s.split('=').filter(Boolean));

		if (parts.some((pt) => pt.length !== 2)) {
			error = 'Invalid format in record';
			return;
		}

		const invalidPart = parts.find((pt) => !Object.keys(initialDmarcState).includes(pt[0]));
		if (invalidPart) {
			error = `${invalidPart[0]} does not exist in DMARC records`;
			return;
		}

		if (parts.length === 0 || parts[0][0] !== 'v' || parts[0][1] !== 'DMARC1') {
			error = 'v=DMARC1 must be provided at the start of the record';
			return;
		}

		let newResults: Record<string, string> = {};
		for (const pair of parts) {
			newResults[pair[0]] = pair[1];
		}

		dmarcResult = { ...initialDmarcState, ...newResults };
		error = null;
	});
</script>

<input
	bind:value={store.dmarc}
	class="mb-1 w-full rounded bg-neutral-50 px-3 py-2 font-mono text-sm dark:bg-neutral-900"
	aria-label="DMARC record"
	spellcheck="false"
	autocomplete="off"
/>

{#if error}
	<p class="mt-1 text-xs font-medium text-red-500 dark:text-red-400">{error}</p>
{/if}

<ul
	class="mt-8 flex max-w-prose flex-col gap-y-2.5 text-sm leading-tight text-neutral-700 dark:text-neutral-300"
>
	<li class="flex flex-row items-start gap-x-2">
		{#if dmarcResult.p}
			{#if ['none', 'quarantine', 'reject'].includes(dmarcResult.p)}
				<Good />
				{#if dmarcResult.p === 'none'}
					<span>
						The Domain Owner requests <span class="font-semibold text-black dark:text-white"
							>no specific action</span
						> be taken regarding delivery of messages.
					</span>
				{:else if dmarcResult.p === 'quarantine'}
					<span>
						The Domain Owner wishes to have email that fails the DMARC mechanism check be <span
							class="font-semibold text-black dark:text-white"
							>treated by Mail Receivers as suspicious</span
						>.
					</span>
				{:else if dmarcResult.p === 'reject'}
					<span>
						The Domain Owner wishes for Mail Receivers to <span
							class="font-semibold text-black dark:text-white">reject</span
						> email that fails the DMARC mechanism check.
					</span>
				{/if}
			{:else}
				<Bad />
				<span class="text-red-500 dark:text-red-400"
					>Requested Mail Receiver policy {dmarcResult.p} invalid</span
				>
			{/if}
		{:else}
			<Bad />
			<span class="text-red-500 dark:text-red-400">
				Requested Mail Receiver policy (none, quarantine, or reject) is required.
			</span>
		{/if}
	</li>

	<li class="flex flex-row items-start gap-x-2">
		{#if dmarcResult.adkim}
			{#if ['r', 's'].includes(dmarcResult.adkim)}
				<Good />
				<span
					>DKIM verification set to <span class="font-semibold text-black dark:text-white"
						>{dmarcResult.adkim === 'r' ? 'Relaxed' : 'Strict'}</span
					></span
				>
			{:else}
				<Bad />
				<span class="text-red-500 dark:text-red-400"
					>DKIM verification configuration {dmarcResult.adkim} invalid</span
				>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500 dark:text-neutral-400"
				>DKIM verification not configured, defaulting to Relaxed</span
			>
		{/if}
	</li>

	<li class="flex flex-row items-start gap-x-2">
		{#if dmarcResult.aspf}
			{#if ['r', 's'].includes(dmarcResult.aspf)}
				<Good />
				<span
					>SPF verification set to <span class="font-semibold text-black dark:text-white"
						>{dmarcResult.aspf === 'r' ? 'Relaxed' : 'Strict'}</span
					></span
				>
			{:else}
				<Bad />
				<span class="text-red-500 dark:text-red-400"
					>SPF verification configuration {dmarcResult.aspf} invalid</span
				>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500 dark:text-neutral-400"
				>SPF verification not configured, defaulting to Relaxed</span
			>
		{/if}
	</li>

	<li class="flex flex-row items-start gap-x-2">
		{#if dmarcResult.fo}
			{#if ['0', '1', 'd', 's'].includes(dmarcResult.fo)}
				<Good />
				{#if dmarcResult.fo === '0'}
					<span>
						Generate a DMARC failure report if <span
							class="font-semibold text-black dark:text-white"
							>all underlying authentication mechanisms fail to produce an aligned "pass" result</span
						>.
					</span>
				{:else if dmarcResult.fo === '1'}
					<span>
						Generate a DMARC failure report if <span
							class="font-semibold text-black dark:text-white"
							>any underlying authentication mechanism produced something other than an aligned
							"pass" result</span
						>.
					</span>
				{:else if dmarcResult.fo === 'd'}
					<span>
						Generate a DKIM failure report if <span class="font-semibold text-black dark:text-white"
							>the message had a signature that failed evaluation, regardless of its alignment</span
						>.
					</span>
				{:else if dmarcResult.fo === 's'}
					<span>
						Generate an SPF failure report if <span class="font-semibold text-black dark:text-white"
							>the message failed SPF evaluation, regardless of its alignment</span
						>.
					</span>
				{/if}
			{:else}
				<Bad />
				<span class="text-red-500 dark:text-red-400"
					>Failure reporting option {dmarcResult.fo} invalid</span
				>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500">
				Default to generating a DMARC failure report if all underlying authentication mechanisms
				fail to produce an aligned "pass" result.
			</span>
		{/if}
	</li>

	<li class="flex flex-row items-start gap-x-2">
		{#if dmarcResult.pct}
			{#if /^\d+$/.test(dmarcResult.pct) && 0 <= Number.parseInt(dmarcResult.pct) && Number.parseInt(dmarcResult.pct) <= 100}
				<Good />
				<span>
					<span class="font-semibold text-black dark:text-white">{dmarcResult.pct}%</span> of messages
					from the Domain Owner's mail stream will have the DMARC policy applied.
				</span>
			{:else}
				<Bad />
				<span class="text-red-500 dark:text-red-400">pct has invalid integer value.</span>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500"> Default to applying this policy to 100% of emails </span>
		{/if}
	</li>
</ul>
