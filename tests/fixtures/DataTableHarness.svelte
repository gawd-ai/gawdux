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
		link = null,
		emptyText,
		emptyHint,
		columns: columnsOverride
	}: {
		rows: Row[];
		sortField?: string;
		sortDirection?: 'asc' | 'desc';
		onSort?: (field: string) => void;
		onRowClick?: (row: Row, event: MouseEvent) => void;
		onAction?: (row: Row) => void;
		framed?: boolean;
		title?: string;
		link?: { label: string; href?: string } | null;
		emptyText?: string;
		emptyHint?: string;
		/** Replaces the default columns (the header-icon tests). */
		columns?: DataTableColumn[];
	} = $props();

	const defaultColumns: DataTableColumn[] = [
		{ key: 'name', label: 'Name', sort: 'name' },
		{ key: 'status', label: 'Status', class: 'status-col' },
		{ key: 'latency', label: 'Latency', sort: 'latency', align: 'right', cellClass: 'tabular-nums' },
		{ key: 'actions', label: 'Actions', align: 'center' }
	];
	const columns = $derived(columnsOverride ?? defaultColumns);
</script>

<DataTable
	{link}
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
