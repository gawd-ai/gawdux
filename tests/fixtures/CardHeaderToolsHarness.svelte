<!--
	A DataTable's card header as a host fills it: a title, a freshness note, a
	filter row and a search of a fixed width. `tools="few"` leaves the note
	alone, which fits beside the title at any width.
-->
<script lang="ts">
	import DataTable from '../../src/lib/primitives/DataTable.svelte';
	import FilterPillRow from '../../src/lib/primitives/FilterPillRow.svelte';
	import type { DataTableColumn } from '../../src/lib/primitives/data-table';

	let { tools = 'all' }: { tools?: 'all' | 'few' } = $props();

	const columns: DataTableColumn[] = [{ key: 'name', label: 'Name' }];
	const rows = [{ id: 'a', name: 'North door' }];
	const pills = [
		{ id: 'all', label: 'All', count: 14 },
		{ id: 'up', label: 'Up', count: 9 },
		{ id: 'degraded', label: 'Degraded', count: 2 },
		{ id: 'down', label: 'Down', count: 1 },
		{ id: 'unknown', label: 'Unknown', count: 2 }
	];
	let selected = $state('all');
</script>

<div style="padding: 8px">
	<DataTable title="Targets" {columns} {rows}>
		{#snippet header()}
			<span data-note style="white-space: nowrap; font-size: 11px">no recent results</span>
			{#if tools === 'all'}
				<FilterPillRow {pills} {selected} onSelect={(id) => (selected = id)} ariaLabel="Status" />
				<div data-search style="width: 11rem; flex-shrink: 0">
					<input style="width: 100%" placeholder="Search" />
				</div>
			{/if}
		{/snippet}
		{#snippet row(item)}
			<td>{item.name}</td>
		{/snippet}
	</DataTable>
</div>
