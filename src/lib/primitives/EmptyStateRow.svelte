<script lang="ts">
	import { TableBodyRow, TableBodyCell } from 'flowbite-svelte';
	export let colspan: number = 1;
	export let text: string = 'No results found';
	/** Optional second muted line under the text (e.g. "Adjust the filters"). */
	export let hint: string = '';
	export let className = '';
</script>

<TableBodyRow class={className}>
	<TableBodyCell {colspan} class="text-center py-8">
		<span class="text-gray-500 dark:text-gray-400">{text}</span>
		{#if hint}
			<span class="block mt-1 text-sm text-gray-400 dark:text-gray-500">{hint}</span>
		{/if}
	</TableBodyCell>
</TableBodyRow>
