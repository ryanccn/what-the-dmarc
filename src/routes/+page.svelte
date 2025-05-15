<script lang="ts">
	import ArrowUpRightIcon from 'lucide-svelte/icons/arrow-up-right';

	import DMARC from '../components/DMARC.svelte';
	import SPF from '../components/SPF.svelte';
	import Import from '../components/Import.svelte';
</script>

<svelte:head>
	<title>What the DMARC?</title>
</svelte:head>

<h1 class="mb-1 text-lg font-extrabold tracking-tight">What the DMARC?</h1>
<p class="mb-4 text-neutral-600 dark:text-neutral-400">
	A small app to explain DMARC and SPF records.
</p>

<a
	class="mb-12 flex w-auto flex-row items-center gap-x-1 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-400"
	href="https://ryanccn.dev/"
>
	<span>By Ryan Cao</span>
	<ArrowUpRightIcon class="block size-4" />
</a>

<section>
	<h2 class="mb-2 font-semibold tracking-tight">Import DNS records</h2>
	<Import />
</section>

<div class="mt-12 flex flex-col gap-8 md:flex-row">
	<section class="md:w-1/2">
		<div class="mb-2 flex flex-row flex-wrap items-baseline gap-x-2">
			<h2 class="font-semibold tracking-tight">DMARC</h2>
			<a
				rel="noreferrer"
				class="text-xs font-medium text-neutral-500"
				href="https://www.rfc-editor.org/rfc/rfc7489">RFC 7489</a
			>
		</div>

		<DMARC />
	</section>

	<section class="md:w-1/2">
		<div class="mb-2 flex flex-row flex-wrap items-baseline gap-x-2">
			<h2 class="font-semibold tracking-tight">SPF</h2>
			<a
				rel="noreferrer"
				class="text-xs font-medium text-neutral-500"
				href="https://www.rfc-editor.org/rfc/rfc7208">RFC 7208</a
			>
		</div>

		<SPF />
	</section>
</div>
