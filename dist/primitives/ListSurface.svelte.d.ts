import type { SurfaceFeedbackAction } from './PageFeedback.svelte';
import type { SurfaceNoticeTone } from './surface-feedback-context';
import type { ListPagination } from './list-pagination';
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
type $$__sveltets_2_PropsWithChildren<Props, Slots> = Props & (Slots extends {
    default: any;
} ? Props extends Record<string, never> ? any : {
    children?: any;
} : {});
declare const ListSurface: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    mode?: "page" | "tab" | "embedded";
    showFooter?: boolean;
    hasActions?: boolean | undefined;
    hasFooter?: boolean | undefined;
    className?: string;
    /** Declarative pagination — renders the pill in the bar's RIGHT zone.
            When provided, takes precedence over the legacy `footer` slot. */ pagination?: ListPagination | null;
    /** A failed action on the list (a restore, an archive, a refresh after
            one). The one feedback strip, inside the panel under the filter bar,
            dismissable; forward `on:dismiss` to clear it. Same shape as
            EditablePageScaffold. */ actionError?: string | null | undefined;
    /** Tone of the action line: a success line ("Updated 3 tests.") rides
            the same strip. Load failures are always errors. */ feedbackTone?: "error" | "success" | "info";
    /** The list itself could not be loaded. Same strip, not dismissable. */ loadError?: string | null | undefined;
    loadErrorAction?: SurfaceFeedbackAction | null;
    dismissableFeedback?: boolean;
    /** A standing condition of the list (a read-only scope). Same strip,
            not dismissable. */ notice?: string | null | undefined;
    noticeTone?: SurfaceNoticeTone;
}, {
    actions: {};
    footer: {};
    header: {};
    filters: {};
    default: {};
}>, {
    dismiss: CustomEvent<void>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    actions: {};
    footer: {};
    header: {};
    filters: {};
    default: {};
}, {}, string>;
type ListSurface = InstanceType<typeof ListSurface>;
export default ListSurface;
