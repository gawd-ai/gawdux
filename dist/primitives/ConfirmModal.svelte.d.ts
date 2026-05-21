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
declare const ConfirmModal: $$__sveltets_2_IsomorphicComponent<{
    open?: boolean;
    primaryColor?: "red" | "green" | "blue";
    className?: string;
}, {
    confirm: CustomEvent<any>;
    cancel: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    icon: {};
    title: {};
    description: {};
    primary: {};
    cancel: {};
}, {}, string>;
type ConfirmModal = InstanceType<typeof ConfirmModal>;
export default ConfirmModal;
