import type { Component } from 'svelte';
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
declare const TabTitle: $$__sveltets_2_IsomorphicComponent<{
    /**
         * Optional. A tab set that carries no icons is a legitimate design, and
         * reserving the 20×20 box for one anyway pushes every label out by
         * `w-5` plus the flex gap — a visible indent around nothing. Rendering the
         * wrapper only when there is something to put in it lets an icon-less tab
         * set sit flush, while a mixed set still aligns its labels, because every
         * icon that does exist occupies the same fixed box.
         */ icon?: Component | null;
    label: string;
    className?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type TabTitle = InstanceType<typeof TabTitle>;
export default TabTitle;
