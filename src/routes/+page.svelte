<script>
	import { ArrowUpRightIcon } from 'lucide-svelte';

	import DMARC from '../components/DMARC.svelte';
	import SPF from '../components/SPF.svelte';
	import Import from '../components/Import.svelte';
</script>

<svelte:head>
	<title>What the DMARC?</title>
</svelte:head>

<h1 class="mb-1 text-lg font-extrabold tracking-tight">What the DMARC?</h1>
<p class="mb-4 text-neutral-700 dark:text-neutral-300">
	A small app to explain DMARC and SPF records.
</p>
<a
	class="mb-12 flex w-auto flex-row items-center gap-x-1 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-200"
	href="https://ryanccn.dev/"
>
	<span>By Ryan Cao</span>
	<ArrowUpRightIcon class="block h-3 w-3" />
</a>

<section>
	<h2 class="mb-2 font-semibold tracking-tight">Import records from domain</h2>
	<Import />
</section>

<div class="mt-12 flex flex-col gap-8 md:flex-row">
	<section class="md:w-1/2">
		<h2 class="mb-2 font-semibold tracking-tight">DMARC</h2>
		<DMARC />
	</section>

	<section class="md:w-1/2">
		<h2 class="mb-2 font-semibold tracking-tight">SPF</h2>
		<SPF />
	</section>
</div>
