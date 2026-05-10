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
declare const CardContainer: $$__sveltets_2_IsomorphicComponent<{
    title: string;
    invalid?: boolean;
    className?: string;
    contentClass?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    content: {};
}, {}, string>;
type CardContainer = InstanceType<typeof CardContainer>;
export default CardContainer;
