<script lang="ts">
	import Good from './icons/Good.svelte';
	import Bad from './icons/Bad.svelte';
	import Neutral from './icons/Neutral.svelte';

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
	} as { [key: string]: string };

	let dmarcString = '';

	let error: string | null = null;
	let dmarcResult = initialDmarcState;

	$: (() => {
		if (dmarcString.length === 0) {
			error = null;
			return;
		}

		const parts = dmarcString
			.split(/ *; */)
			.filter(Boolean)
			.map((s) => s.split('=').filter(Boolean));

		if (parts.some((pt) => pt.length !== 2)) {
			error = 'Invalid format in record';
			return;
		}

		const invalidPart = parts.find((pt) => !Object.keys(dmarcResult).includes(pt[0]));
		if (invalidPart) {
			error = `${invalidPart[0]} does not exist in DMARC records`;
			return;
		}

		if (parts.length === 0 || parts[0][0] !== 'v' || parts[0][1] !== 'DMARC1') {
			error = 'v=DMARC1 must be provided at the start of the record';
			return;
		}

		let newResults: typeof dmarcResult = {};
		for (const pair of parts) {
			newResults[pair[0]] = pair[1];
		}
		dmarcResult = { ...initialDmarcState, ...newResults };
		error = null;
	})();
</script>

<input
	bind:value={dmarcString}
	class="bg-neutral-50 dark:bg-neutral-900 font-mono px-3 py-2 rounded-sm mb-1"
	spellcheck="false"
/>
{#if error}
	<p class="font-bold text-xs text-red-400">{error}</p>
{/if}

<ul class="mt-8 flex flex-col gap-y-2 text-sm leading-tight max-w-prose">
	<li class="flex flex-row items-center gap-x-2">
		{#if dmarcResult.adkim}
			{#if ['r', 's'].includes(dmarcResult.adkim)}
				<Good />
				<span>DKIM verification set to {dmarcResult.adkim === 'r' ? 'Relaxed' : 'Strict'}</span>
			{:else}
				<Bad />
				<span>DKIM verification configuration {dmarcResult.adkim} invalid</span>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500 dark:text-neutral-400"
				>DKIM verification not configured, defaulting to Relaxed</span
			>
		{/if}
	</li>

	<li class="flex flex-row items-center gap-x-2">
		{#if dmarcResult.aspf}
			{#if ['r', 's'].includes(dmarcResult.aspf)}
				<Good />
				<span>SPF verification set to {dmarcResult.aspf === 'r' ? 'Relaxed' : 'Strict'}</span>
			{:else}
				<Bad />
				<span>SPF verification configuration {dmarcResult.aspf} invalid</span>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500 dark:text-neutral-400"
				>SPF verification not configured, defaulting to Relaxed</span
			>
		{/if}
	</li>

	<li class="flex flex-row items-center gap-x-2">
		{#if dmarcResult.fo}
			{#if ['0', '1', 'd', 's'].includes(dmarcResult.fo)}
				<Good />
				{#if dmarcResult.fo === '0'}
					<span>
						Generate a DMARC failure report if all underlying authentication mechanisms fail to
						produce an aligned "pass" result.
					</span>
				{:else if dmarcResult.fo === '1'}
					<span>
						Generate a DMARC failure report if any underlying authentication mechanism produced
						something other than an aligned "pass" result.
					</span>
				{:else if dmarcResult.fo === 'd'}
					<span>
						Generate a DKIM failure report if the message had a signature that failed evaluation,
						regardless of its alignment.
					</span>
				{:else if dmarcResult.fo === 's'}
					<span>
						Generate an SPF failure report if the message failed SPF evaluation, regardless of its
						alignment.
					</span>
				{/if}
			{:else}
				<Bad />
				<span>Failure reporting option {dmarcResult.fo} invalid</span>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500 dark:text-neutral-400">
				Defaulting to generate a DMARC failure report if all underlying authentication mechanisms
				fail to produce an aligned "pass" result.
			</span>
		{/if}
	</li>

	<li class="flex flex-row items-center gap-x-2">
		{#if dmarcResult.p}
			{#if ['none', 'quarantine', 'reject'].includes(dmarcResult.p)}
				<Good />
				{#if dmarcResult.p === 'none'}
					<span>
						The Domain Owner requests no specific action be taken regarding delivery of messages.
					</span>
				{:else if dmarcResult.p === 'quarantine'}
					<span>
						The Domain Owner wishes to have email that fails the DMARC mechanism check be treated by
						Mail Receivers as suspicious.
					</span>
				{:else if dmarcResult.p === 'reject'}
					<span>
						The Domain Owner wishes for Mail Receivers to reject email that fails the DMARC
						mechanism check.
					</span>
				{/if}
			{:else}
				<Bad />
				<span>Requested Mail Receiver policy {dmarcResult.p} invalid</span>
			{/if}
		{:else}
			<Bad />
			<span class="text-red-400">
				Requested Mail Receiver policy (none, quarantine, or reject) is required.
			</span>
		{/if}
	</li>

	<li class="flex flex-row items-center gap-x-2">
		{#if dmarcResult.pct}
			{#if /^\d+$/.test(dmarcResult.pct) && 0 <= parseInt(dmarcResult.pct) && parseInt(dmarcResult.pct) <= 100}
				<Good />
				<span>
					{dmarcResult.pct}% of messages from the Domain Owner's mail stream will have the DMARC
					policy applied.
				</span>
			{:else}
				<Bad />
				<span>pct has invalid integer value.</span>
			{/if}
		{:else}
			<Neutral />
			<span class="text-neutral-500 dark:text-neutral-400">
				Defaulting to applying this policy to 100% of emails
			</span>
		{/if}
	</li>
</ul>
