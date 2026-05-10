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
declare const ResizableSplitter: $$__sveltets_2_IsomorphicComponent<{
    /** Bound: current width of the LEFT side in pixels. Updates live during drag. */ width: number;
    minWidth?: number;
    maxWidth?: number;
    /** Optional localStorage key. When set, the splitter persists `width` on release. */ storageKey?: string | null;
    /** Pixel step for keyboard arrow adjustments. */ keyboardStep?: number;
}, {
    change: CustomEvent<{
        width: number;
    }>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type ResizableSplitter = InstanceType<typeof ResizableSplitter>;
export default ResizableSplitter;
