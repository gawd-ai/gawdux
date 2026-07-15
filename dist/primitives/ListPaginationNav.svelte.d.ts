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
declare const ListPaginationNav: $$__sveltets_2_IsomorphicComponent<{
    total?: number;
    currentPage?: number;
    totalPages?: number;
    /** Defaults to 50. Pages with a non-50 page size must pass explicitly.
            Deriving from total/totalPages doesn't work because the last page is
            partial: e.g. 423 items in 9 pages of 50 → ceil(423/9) = 47, wrong. */ pageSize?: number;
    onPage?: ((page: number) => void) | undefined;
    /** CSS selector for the page's scroll region. After navigation, the nav
            scrolls this container to top. Defaults to `.list-table-scroll` (the
            convention used by gawdux ListSurface and consumer list pages). Set to null
            to disable auto-scroll. */ scrollTargetSelector?: string | null;
    className?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type ListPaginationNav = InstanceType<typeof ListPaginationNav>;
export default ListPaginationNav;
