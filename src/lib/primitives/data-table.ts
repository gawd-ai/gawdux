import type { Component } from 'svelte';

/** One column of a DataTable. */
export interface DataTableColumn {
	/** Stable id; the `cell` snippet switches on it. */
	key: string;
	label: string;
	/** The sort field this column orders by. With the table's `onSort` the
	    header becomes a SortableHeadCell; without either it is plain. */
	sort?: string;
	align?: 'left' | 'center' | 'right';
	/** Classes on both the header and the body cells (a width, `status-col`). */
	class?: string;
	/** Classes on the header cell only. */
	headClass?: string;
	/** Classes on the body cells only. */
	cellClass?: string;
	/** Optional icon in the header, before the label. */
	icon?: Component;
}

export type DataTableSortDirection = 'asc' | 'desc';

const ALIGN_CLASS: Record<NonNullable<DataTableColumn['align']>, string> = {
	left: '',
	center: 'text-center',
	right: 'text-right'
};

export function dataTableAlignClass(align: DataTableColumn['align']): string {
	return align ? ALIGN_CLASS[align] : '';
}

/** The row-click guard: a click on a control inside the row is that
    control's, never the row's (the list-table row-click rule). */
export function isRowClickTarget(event: Event): boolean {
	const target = event.target;
	if (!(target instanceof Element)) return true;
	return !target.closest('button, a, [role="button"], input, select, textarea, label, summary');
}
