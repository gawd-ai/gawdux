import type { Snippet } from 'svelte';
import { type DataTableColumn, type DataTableSortDirection } from './data-table';
declare function $$render<T>(): {
    props: {
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
        /** Right side of the card header (a count, a freshness stamp). */
        header?: Snippet;
        /** The section this panel leads to, as the go-to icon at the header's end. */
        link?: {
            label: string;
            href?: string;
            onclick?: (event: MouseEvent) => void;
        } | null;
        /** Screen-reader caption. */
        caption?: string;
        emptyText?: string;
        emptyHint?: string;
        framed?: boolean;
        /** Hover tint on rows; defaults to on when rows are clickable. */
        hoverable?: boolean;
        className?: string;
        tableClass?: string;
    };
    exports: {};
    bindings: "";
    slots: {};
    events: {};
};
declare class __sveltets_Render<T> {
    props(): ReturnType<typeof $$render<T>>['props'];
    events(): ReturnType<typeof $$render<T>>['events'];
    slots(): ReturnType<typeof $$render<T>>['slots'];
    bindings(): "";
    exports(): {};
}
interface $$IsomorphicComponent {
    new <T>(options: import('svelte').ComponentConstructorOptions<ReturnType<__sveltets_Render<T>['props']>>): import('svelte').SvelteComponent<ReturnType<__sveltets_Render<T>['props']>, ReturnType<__sveltets_Render<T>['events']>, ReturnType<__sveltets_Render<T>['slots']>> & {
        $$bindings?: ReturnType<__sveltets_Render<T>['bindings']>;
    } & ReturnType<__sveltets_Render<T>['exports']>;
    <T>(internal: unknown, props: ReturnType<__sveltets_Render<T>['props']> & {}): ReturnType<__sveltets_Render<T>['exports']>;
    z_$$bindings?: ReturnType<__sveltets_Render<any>['bindings']>;
}
declare const DataTable: $$IsomorphicComponent;
type DataTable<T> = InstanceType<typeof DataTable<T>>;
export default DataTable;
