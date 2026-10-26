import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';
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
/**
 * Breadcrumbs for a consumer written with slots: the same one-line trail,
 * folding and menu, with the `afterLast` slot riding beside the current page
 * as Breadcrumbs' `trailing`. New code uses Breadcrumbs and its snippet.
 */
declare const BreadcrumbTrail: $$__sveltets_2_IsomorphicComponent<{
    items?: BreadcrumbCrumb[];
    className?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    afterLast: {};
}, {}, string>;
type BreadcrumbTrail = InstanceType<typeof BreadcrumbTrail>;
export default BreadcrumbTrail;
