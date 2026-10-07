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
declare const TableContainer: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    className?: string;
    /**
         * The container is the page's content surface (`.context-surface`): it
         * welds to the command bar and fills the height the shell gives it. Pass
         * false for a table that sits inside other content (a card, a tab body, a
         * grid cell), where it should keep its natural size and must not turn its
         * parent into a flex column.
         */ surface?: boolean;
}, {
    default: {};
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}, {}, string>;
type TableContainer = InstanceType<typeof TableContainer>;
export default TableContainer;
