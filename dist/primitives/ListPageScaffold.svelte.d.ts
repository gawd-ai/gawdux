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
declare const ListPageScaffold: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    showFooter?: boolean;
    /** Declarative pagination — when provided, the scaffold renders the
            pill into the bar's RIGHT zone. Pages no longer wire up `slot="footer"`
            individually. Pass `null` (or omit) to hide pagination entirely. */ pagination?: {
        total: number;
        currentPage: number;
        totalPages: number;
        pageSize?: number;
        onPage: (page: number) => void;
    } | null;
}, {
    actions: {};
    filters: {};
    default: {};
    footer: {};
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    actions: {};
    filters: {};
    default: {};
    footer: {};
}, {}, string>;
type ListPageScaffold = InstanceType<typeof ListPageScaffold>;
export default ListPageScaffold;
