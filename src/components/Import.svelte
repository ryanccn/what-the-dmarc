<script lang="ts">
	import { import_ } from '../import.svelte';
	import { store } from '../store.svelte';

	const FQDN_REGEX = /(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$)/;

	let inProgress = $state(false);

	const importWrapper = async () => {
		inProgress = true;
		await import_();
		inProgress = false;
	};

	const handleKey = (ev: KeyboardEvent) => {
		if (ev.metaKey && ev.key === 'Enter')
			importWrapper().catch((error) => {
				console.error(error);
			});
	};
</script>

<form
	class="flex flex-row gap-x-2"
	onsubmit={(ev) => {
		ev.preventDefault();
		importWrapper().catch((error) => {
			console.error(error);
		});
	}}
>
	<input
		name="fqdn"
		bind:value={store.import_}
		onkeydown={handleKey}
		class="grow rounded bg-neutral-50 px-3 py-2 font-mono text-sm transition-opacity disabled:opacity-75 dark:bg-neutral-900"
		disabled={inProgress}
		placeholder="example.com"
		aria-label="Fully qualified domain name"
		spellcheck="false"
		autocomplete="off"
	/>

	<button
		class="rounded bg-pink-500 px-3 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-75"
		type="submit"
		disabled={!FQDN_REGEX.test(store.import_) || inProgress}
	>
		Import
	</button>
</form>
