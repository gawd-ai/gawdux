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
declare const PageFeedback: $$__sveltets_2_IsomorphicComponent<{
    message?: string | null | undefined;
    title?: string;
    tone?: "error" | "success" | "info";
    dismissable?: boolean;
    compact?: boolean;
    className?: string;
}, {
    dismiss: CustomEvent<void>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type PageFeedback = InstanceType<typeof PageFeedback>;
export default PageFeedback;
