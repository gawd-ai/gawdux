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
declare const ListSurface: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    mode?: "page" | "tab" | "embedded";
    showFooter?: boolean;
    hasActions?: boolean | undefined;
    hasFooter?: boolean | undefined;
    className?: string;
    /** Declarative pagination — renders the pill in the bar's RIGHT zone.
            When provided, takes precedence over the legacy `footer` slot. */ pagination?: {
        total: number;
        currentPage: number;
        totalPages: number;
        pageSize?: number;
        onPage: (page: number) => void;
    } | null;
}, {
    actions: {};
    footer: {};
    header: {};
    filters: {};
    default: {};
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    actions: {};
    footer: {};
    header: {};
    filters: {};
    default: {};
}, {}, string>;
type ListSurface = InstanceType<typeof ListSurface>;
export default ListSurface;
