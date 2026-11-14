import type { ListSort } from './list-query';
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
type $$__sveltets_2_PropsWithChildren<Props, Slots> = Props & (Slots extends {
    default: any;
} ? Props extends Record<string, never> ? any : {
    children?: any;
} : {});
declare const FilterBar: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    className?: string;
    /** Set by a parent that forwards the `rail` slot (a forwarded fragment
            makes `$$slots.rail` true even when the host left it empty). */ hasRail?: boolean | undefined;
    /** The register's sort, which its column heads set above the compact
            width. At or below it, where the heads are hidden and the rows read
            as cards, the bar draws it under the filter row as the house phone
            sort: "Sort by", one choice per key and direction, each order worded.
            Choosing one sets the sort at once, as a head's click does. */ sort?: ListSort | undefined;
}, {
    rail: {};
    default: {};
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    rail: {};
    default: {};
}, {}, string>;
type FilterBar = InstanceType<typeof FilterBar>;
export default FilterBar;
