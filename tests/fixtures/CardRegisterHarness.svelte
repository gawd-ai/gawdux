<!--
	A register in a card of a detail page, as a host writes it: no list page,
	no toolbar. It reads as labelled cards at or below the compact width
	(`.responsive-card-table`), and its heads' sort is drawn above it there:
	- `drawn="table"`: a DataTable given `sort`;
	- `drawn="own"`: a table the host writes out, with `ListPhoneSort` above
	  it in its container.
	One sort state: a head's click and the phone sort write it alike.
	`rowHeight` is a host's row height (`--gawdux-table-row-height`), which
	the library applies as a cell's height; the Address column has a second
	line, and in `own` its cell carries a height utility of its own.
-->
<script lang="ts">
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead } from 'flowbite-svelte';
	import DataTable from '../../src/lib/primitives/DataTable.svelte';
	import HeadCell from '../../src/lib/primitives/HeadCell.svelte';
	import ListPhoneSort from '../../src/lib/primitives/ListPhoneSort.svelte';
	import SortableHeadCell from '../../src/lib/primitives/SortableHeadCell.svelte';
	import TableContainer from '../../src/lib/primitives/TableContainer.svelte';
	import type { DataTableColumn } from '../../src/lib/primitives/data-table';
	import type { ListSort, ListSortDirection, ListSortKey } from '../../src/lib/primitives/list-query';

	type Row = { id: string; name: string; code: string; street: string; city: string; latency: number };

	let {
		drawn = 'table',
		rowHeight = '',
		sorted = true
	}: { drawn?: 'table' | 'own'; rowHeight?: string; sorted?: boolean } = $props();

	const ROWS: Row[] = [
		{ id: 'a', name: 'North door', code: 'ND-1', street: '12 Quay Street', city: 'Harbour East', latency: 40 },
		{ id: 'b', name: 'Camera 4', code: 'CAM-4', street: '3 Mill Lane', city: 'Old Town', latency: 12 },
		{ id: 'c', name: 'Switch', code: 'SW-2', street: '40 Ridge Road', city: 'Upper Field', latency: 95 }
	];

	const keys: ListSortKey[] = [
		{ key: 'name', label: 'Name' },
		{ key: 'latency', label: 'Latency', order: 'number' }
	];
	const columns: DataTableColumn[] = [
		{ key: 'name', label: 'Name', sort: 'name' },
		{ key: 'code', label: 'Code' },
		{ key: 'address', label: 'Address' },
		{ key: 'latency', label: 'Latency', sort: 'latency' }
	];

	let field = $state('name');
	let direction = $state<ListSortDirection>('asc');

	function onSort(next: string) {
		direction = next === field && direction === 'asc' ? 'desc' : 'asc';
		field = next;
	}

	const sort = $derived<ListSort>({
		keys,
		field,
		direction,
		onsort: (next, dir) => {
			field = next;
			direction = dir;
		}
	});

	const rows = $derived(
		[...ROWS].sort((a, b) => {
			const order = field === 'latency' ? a.latency - b.latency : a.name.localeCompare(b.name);
			return direction === 'asc' ? order : -order;
		})
	);
</script>

<output data-testid="order">{field}:{direction}</output>

<div data-panel style={rowHeight ? `--gawdux-table-row-height: ${rowHeight}` : ''}>
	{#if drawn === 'table'}
		<DataTable
			title="Targets"
			{columns}
			{rows}
			rowKey={(row) => row.id}
			sortField={field}
			sortDirection={direction}
			{onSort}
			{...sorted ? { sort } : {}}
			className="responsive-card-table"
		>
			{#snippet cell(row, column)}
				{#if column.key === 'name'}
					<span data-value data-name>{row.name}</span>
				{:else if column.key === 'code'}
					<span data-value>{row.code}</span>
				{:else if column.key === 'address'}
					<div data-value>
						<div>{row.street}</div>
						<div>{row.city}</div>
					</div>
				{:else}
					<span data-value>{row.latency} ms</span>
				{/if}
			{/snippet}
		</DataTable>
	{:else}
		<TableContainer fill={false} className="responsive-card-table">
			<ListPhoneSort {sort} />
			<Table class="w-full">
				<TableHead>
					<SortableHeadCell field="name" label="Name" sortField={field} sortDirection={direction} {onSort} />
					<HeadCell label="Code" />
					<HeadCell label="Address" />
					<SortableHeadCell field="latency" label="Latency" sortField={field} sortDirection={direction} {onSort} />
				</TableHead>
				<TableBody>
					{#each rows as row (row.id)}
						<TableBodyRow>
							<TableBodyCell data-card="title"><span data-value data-name>{row.name}</span></TableBodyCell>
							<TableBodyCell data-label="Code"><span data-value>{row.code}</span></TableBodyCell>
							<TableBodyCell data-label="Address" class="h-10">
								<div data-value>
									<div>{row.street}</div>
									<div>{row.city}</div>
								</div>
							</TableBodyCell>
							<TableBodyCell data-label="Latency"><span data-value>{row.latency} ms</span></TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</TableContainer>
	{/if}
</div>
