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
    /** Optional icon in the header, before the label. It renders through the
        one header shape (`.table-head-label > .table-head-icon`), aria-hidden,
        sized and spaced by the --gawdux-table-head-icon-* knobs, on a plain
        and a sortable header alike. */
    icon?: Component;
}
export type DataTableSortDirection = 'asc' | 'desc';
export declare function dataTableAlignClass(align: DataTableColumn['align']): string;
/** The row-click guard is the row link's (`utils/row-link`): one guard for a
    row that opens a page and a row that answers a click of its own. */
export { isRowClickTarget } from '../utils/row-link';
