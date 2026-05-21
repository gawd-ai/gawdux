<script lang="ts">
	import { TableBodyRow, TableBodyCell } from 'flowbite-svelte';
	export let colspan: number = 1;
	export let text: string = 'No results found';
	export let className = '';
</script>

<TableBodyRow class={className}>
	<TableBodyCell {colspan} class="text-center py-8">
		<span class="text-gray-500 dark:text-gray-400">{text}</span>
	</TableBodyCell>
</TableBodyRow>
