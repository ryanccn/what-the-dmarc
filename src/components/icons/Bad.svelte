<script lang="ts">
	const { soft = false }: { soft?: boolean } = $props();
	import CircleXIcon from 'lucide-svelte/icons/circle-x';
</script>

<CircleXIcon
	class={`block size-5 shrink-0 ${soft ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}
/>
