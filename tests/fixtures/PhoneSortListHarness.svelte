<!--
	A register as a host writes it: its column heads sort it above the
	compact width, and the list's toolbar takes the same sort for the phone
	(ListPageScaffold's `sort`, or ListSurface's in a tab). One sort state:
	a head's click and the phone sort write it alike.
-->
<script lang="ts">
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead } from 'flowbite-svelte';
	import ListPageScaffold from '../../src/lib/primitives/ListPageScaffold.svelte';
	import ListSurface from '../../src/lib/primitives/ListSurface.svelte';
	import SortableHeadCell from '../../src/lib/primitives/SortableHeadCell.svelte';
	import type { ListSort, ListSortDirection } from '../../src/lib/primitives/list-query';

	export let mode: 'scaffold' | 'tab' = 'scaffold';
	export let filters = true;
	export let rail = false;
	export let sorted = true;
	export let field = 'issued';
	export let direction: ListSortDirection = 'desc';

	const keys = [
		{ key: 'issued', label: 'Issued', order: 'date' as const },
		{ key: 'name', label: 'Name' }
	];

	function toggle(next: string) {
		direction = next === field ? (direction === 'asc' ? 'desc' : 'asc') : next === 'name' ? 'asc' : 'desc';
		field = next;
	}

	$: sort = sorted
		? ({
				keys,
				field,
				direction,
				onsort: (next: string, dir: ListSortDirection) => {
					field = next;
					direction = dir;
				}
			} satisfies ListSort)
		: undefined;
</script>

<output data-testid="order">{field}:{direction}</output>

{#if mode === 'scaffold'}
	<ListPageScaffold {sort}>
		<svelte:fragment slot="filters">
			{#if filters}<div class="filter-field" data-filters>Filters</div>{/if}
		</svelte:fragment>
		<Table>
			<TableHead>
				<SortableHeadCell field="issued" label="Issued" sortField={field} sortDirection={direction} onSort={toggle} />
				<SortableHeadCell field="name" label="Name" sortField={field} sortDirection={direction} onSort={toggle} />
			</TableHead>
			<TableBody>
				<TableBodyRow>
					<TableBodyCell data-label="Issued">2026-11-14</TableBodyCell>
					<TableBodyCell data-card="title">Lot 42</TableBodyCell>
				</TableBodyRow>
			</TableBody>
		</Table>
	</ListPageScaffold>
{:else if filters && rail}
	<ListSurface mode="tab" {sort}>
		<div slot="rail" data-rail>Rail</div>
		<div slot="filters" class="filter-field" data-filters>Filters</div>
		<div>Rows</div>
	</ListSurface>
{:else if filters}
	<ListSurface mode="tab" {sort}>
		<div slot="filters" class="filter-field" data-filters>Filters</div>
		<div>Rows</div>
	</ListSurface>
{:else}
	<ListSurface mode="tab" {sort}>
		<div>Rows</div>
	</ListSurface>
{/if}
