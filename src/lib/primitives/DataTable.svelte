<!-- A table for a card, a tab body or a dashboard panel: a TableContainer
     holding flowbite's Table, with headers from the column definitions
     (SortableHeadCell where a column sorts), one body cell per column
     rendered by the host's `cell` snippet, and the house empty row.

     - Sorting is the host's: pass `sortField`, `sortDirection` and `onSort`,
       and give a column `sort`; the table reorders nothing itself.
     - `onRowClick` makes rows clickable (whole-row target, pointer, hover
       tint); a click on a control inside the row stays the control's.
     - `title` (and the `header` snippet beside it) gives the panel a card
       header. `framed={false}` drops the container's border and shadow for
       a table that already sits inside a card.
     - `row` replaces the per-column cells for a row the host lays out
       itself (cells it writes are still TableBodyCell).
     The container is not a page surface (it never fills the page or welds to
     the command bar). Cell padding is the --gawdux-table-* density knobs. -->
<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import { Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
	import EmptyStateRow from './EmptyStateRow.svelte';
	import SortableHeadCell from './SortableHeadCell.svelte';
	import TableContainer from './TableContainer.svelte';
	import {
		dataTableAlignClass,
		isRowClickTarget,
		type DataTableColumn,
		type DataTableSortDirection
	} from './data-table';

	let {
		columns,
		rows,
		cell,
		row,
		rowKey,
		rowClass,
		onRowClick,
		sortField = '',
		sortDirection = 'asc',
		onSort,
		title,
		header,
		caption,
		emptyText = 'No results found',
		emptyHint = '',
		framed = true,
		hoverable,
		className = '',
		tableClass = ''
	}: {
		columns: DataTableColumn[];
		rows: T[];
		/** One body cell's content: (row, column, rowIndex). */
		cell?: Snippet<[T, DataTableColumn, number]>;
		/** A whole row's cells, instead of `cell`: (row, rowIndex). */
		row?: Snippet<[T, number]>;
		/** Keys the rows (an id); defaults to the index. */
		rowKey?: (item: T, index: number) => string | number;
		rowClass?: (item: T, index: number) => string;
		onRowClick?: (item: T, event: MouseEvent) => void;
		/** The active sort field. */
		sortField?: string;
		sortDirection?: DataTableSortDirection;
		onSort?: (field: string) => void;
		/** A card header above the table. */
		title?: string;
		/** Right side of the card header (a count, a link). */
		header?: Snippet;
		/** Screen-reader caption. */
		caption?: string;
		emptyText?: string;
		emptyHint?: string;
		framed?: boolean;
		/** Hover tint on rows; defaults to on when rows are clickable. */
		hoverable?: boolean;
		className?: string;
		tableClass?: string;
	} = $props();

	const clickable = $derived(Boolean(onRowClick));
	const hover = $derived(hoverable ?? clickable);
	const hasHeader = $derived(Boolean(title) || Boolean(header));

	function keyOf(item: T, index: number): string | number {
		return rowKey ? rowKey(item, index) : index;
	}

	function headClass(column: DataTableColumn): string {
		return [column.class, column.headClass].filter(Boolean).join(' ');
	}

	function bodyClass(column: DataTableColumn): string {
		return [dataTableAlignClass(column.align), column.class, column.cellClass]
			.filter(Boolean)
			.join(' ');
	}

	function rowClasses(item: T, index: number): string {
		return [clickable ? 'interactive-hover' : '', rowClass?.(item, index) ?? '']
			.filter(Boolean)
			.join(' ');
	}

	function handleRowClick(item: T, event: MouseEvent): void {
		if (!onRowClick || !isRowClickTarget(event)) return;
		onRowClick(item, event);
	}
</script>

{#snippet content()}
	{#if hasHeader}
		<div class="card-header flex items-center justify-between gap-3">
			{#if title}
				<h3 class="card-header-title">{title}</h3>
			{/if}
			{#if header}
				<div class="ml-auto flex min-w-0 items-center gap-2">{@render header()}</div>
			{/if}
		</div>
	{/if}
	<Table hoverable={hover} class={`w-full ${tableClass}`}>
		{#if caption}
			<caption class="sr-only">{caption}</caption>
		{/if}
		<TableHead>
			{#each columns as column (column.key)}
				{#if column.sort && onSort}
					<SortableHeadCell
						field={column.sort}
						label={column.label}
						{sortField}
						{sortDirection}
						{onSort}
						icon={column.icon}
						align={column.align ?? 'left'}
						className={headClass(column)}
					/>
				{:else}
					<TableHeadCell
						class={`whitespace-nowrap ${dataTableAlignClass(column.align)} ${headClass(column)}`}
					>
						{#if column.icon}
							{@const ColumnIcon = column.icon}
							<span class="inline-flex items-center gap-2">
								<ColumnIcon class="h-4 w-4" aria-hidden="true" />{column.label}
							</span>
						{:else}
							{column.label}
						{/if}
					</TableHeadCell>
				{/if}
			{/each}
		</TableHead>
		<TableBody>
			{#if rows.length === 0}
				<EmptyStateRow colspan={columns.length} text={emptyText} hint={emptyHint} />
			{:else}
				{#each rows as item, index (keyOf(item, index))}
					<TableBodyRow
						class={rowClasses(item, index)}
						onclick={clickable ? (event: MouseEvent) => handleRowClick(item, event) : undefined}
					>
						{#if row}
							{@render row(item, index)}
						{:else}
							{#each columns as column (column.key)}
								<TableBodyCell class={bodyClass(column)}>
									{@render cell?.(item, column, index)}
								</TableBodyCell>
							{/each}
						{/if}
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
{/snippet}

{#if framed}
	<TableContainer surface={false} className={`data-table overflow-hidden ${className}`}>
		{@render content()}
	</TableContainer>
{:else}
	<div class={`data-table ${className}`}>
		{@render content()}
	</div>
{/if}
