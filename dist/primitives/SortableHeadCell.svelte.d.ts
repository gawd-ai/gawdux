import type { Component } from 'svelte';
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: Props & {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
declare const SortableHeadCell: $$__sveltets_2_IsomorphicComponent<{
    field: string;
    label: string;
    sortField: string;
    sortDirection?: "asc" | "desc";
    onSort: (field: string) => void;
    className?: string;
    icon?: Component | undefined;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type SortableHeadCell = InstanceType<typeof SortableHeadCell>;
export default SortableHeadCell;
