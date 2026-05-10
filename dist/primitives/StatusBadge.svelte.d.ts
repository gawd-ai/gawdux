export type StatusBadgeColor = 'green' | 'red' | 'dark' | 'blue' | 'yellow' | 'indigo' | 'purple';
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
    class?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type StatusBadge = InstanceType<typeof StatusBadge>;
export default StatusBadge;
