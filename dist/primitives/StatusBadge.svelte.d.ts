export type StatusBadgeColor = 'green' | 'red' | 'orange' | 'dark' | 'blue' | 'yellow' | 'indigo' | 'purple';
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
declare const StatusBadge: $$__sveltets_2_IsomorphicComponent<{
    color: StatusBadgeColor;
    label: string;
    rounded?: boolean;
    /** Optional icon before the word. Decorative: the word carries the meaning. */ icon?: Component | null;
    /** Extra classes for the icon (size, colour); merged over the defaults. */ iconClass?: string;
    class?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type StatusBadge = InstanceType<typeof StatusBadge>;
export default StatusBadge;
