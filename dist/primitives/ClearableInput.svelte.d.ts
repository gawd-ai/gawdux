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
declare const ClearableInput: $$__sveltets_2_IsomorphicComponent<{
    value?: string;
    id?: string;
    placeholder?: string;
    className?: string;
}, {
    blur: FocusEvent;
    input: CustomEvent<void>;
    focus: CustomEvent<void>;
    clear: CustomEvent<void>;
    submit: CustomEvent<void>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type ClearableInput = InstanceType<typeof ClearableInput>;
export default ClearableInput;
