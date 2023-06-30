<script>
	import { ArrowUpRightIcon } from 'lucide-svelte';

	import DMARC from '../components/DMARC.svelte';
	import SPF from '../components/SPF.svelte';
	import Import from '../components/Import.svelte';
</script>

<svelte:head>
	<title>What the DMARC?</title>
</svelte:head>

<h1 class="font-extrabold">What the DMARC?</h1>
<p class="text-neutral-700 dark:text-neutral-300 mb-2">
	A small app to explain DMARC and SPF records.
</p>
<a
	class="flex flex-row items-center gap-x-1 font-medium text-sm w-auto text-neutral-700 hover:text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-200 transition-colors mb-12"
	href="https://ryanccn.dev/"
>
	<span>By Ryan Cao</span>
	<ArrowUpRightIcon class="block w-3 h-3" />
</a>

<h2 class="font-semibold mb-2">Import records from domain</h2>
<Import />

<h2 class="mt-12 font-semibold mb-2">DMARC</h2>
<DMARC />

<h2 class="mt-12 font-semibold mb-2">SPF</h2>
<SPF />
