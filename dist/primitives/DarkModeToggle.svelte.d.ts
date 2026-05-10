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
declare const DarkModeToggle: $$__sveltets_2_IsomorphicComponent<{
    /**
         * Sun/moon toggle that flips the `dark` class on <html>.
         *
         * Persistence: writes `localStorage['color-theme']` (the de-facto
         * Flowbite key) AND a cookie under whatever name the consumer
         * passes via `cookieName`. The cookie path is hardcoded to `/` and
         * lifetime to one year.
         *
         * The component intentionally does NOTHING on mount — it only
         * mutates on user click. The initial dark class must be resolved
         * by the consumer's app shell (typically an inline script in the
         * HTML template that reads cookie → localStorage → OS preference)
         * to avoid a wrong-color → right-color flash on hydration.
         *
         * The consumer's server-side cookie reader (e.g. SvelteKit
         * +layout.server.ts) is responsible for reading the same
         * `cookieName` to inject the right class on first paint.
         */ cookieName: string;
    ariaLabel?: string;
    class?: string;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type DarkModeToggle = InstanceType<typeof DarkModeToggle>;
export default DarkModeToggle;
