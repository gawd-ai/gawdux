<script lang="ts">
	import DataTable from '../../src/lib/primitives/DataTable.svelte';
	import type { DataTableColumn } from '../../src/lib/primitives/data-table';

	type Row = { id: string; name: string; status: string; latency: number };

	let {
		rows,
		sortField = 'name',
		sortDirection = 'asc',
		onSort,
		onRowClick,
		onAction,
		framed = true,
		title,
		emptyText,
		emptyHint
	}: {
		rows: Row[];
		sortField?: string;
		sortDirection?: 'asc' | 'desc';
		onSort?: (field: string) => void;
		onRowClick?: (row: Row, event: MouseEvent) => void;
		onAction?: (row: Row) => void;
		framed?: boolean;
		title?: string;
		emptyText?: string;
		emptyHint?: string;
	} = $props();

	const columns: DataTableColumn[] = [
		{ key: 'name', label: 'Name', sort: 'name' },
		{ key: 'status', label: 'Status', class: 'status-col' },
		{ key: 'latency', label: 'Latency', sort: 'latency', align: 'right', cellClass: 'tabular-nums' },
		{ key: 'actions', label: 'Actions', align: 'center' }
	];
</script>

<DataTable
	{columns}
	{rows}
	{sortField}
	{sortDirection}
	{onSort}
	{onRowClick}
	{framed}
	{title}
	{emptyText}
	{emptyHint}
	rowKey={(row) => row.id}
	caption="Targets"
>
	{#snippet cell(row, column)}
		{#if column.key === 'name'}{row.name}
		{:else if column.key === 'status'}{row.status}
		{:else if column.key === 'latency'}{row.latency} ms
		{:else}<button type="button" onclick={() => onAction?.(row)}>Test</button>
		{/if}
	{/snippet}
</DataTable>
