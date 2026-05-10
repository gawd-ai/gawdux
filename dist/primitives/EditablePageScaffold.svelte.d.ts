import type { EditModeProps, LifecycleAction, LifecycleKindRenderers } from './PageActionBar.svelte';
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
declare const EditablePageScaffold: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    actionError?: string | null | undefined;
    actionErrorTitle?: string;
    feedbackTone?: "error" | "success" | "info";
    dismissableFeedback?: boolean;
    editMode?: EditModeProps | null;
    lifecycle?: LifecycleAction[];
    kindRenderers?: LifecycleKindRenderers;
    /** When true, wraps slot content in `.context-surface .page-tabs-shell`
            so single-panel pages (create / edit forms) get the same white shell
            + bar-merge as PageTabs / ListSurface pages. Detail pages that
            already render their own `<PageTabs>` (which carries the wrapper)
            should leave this false. */ surface?: boolean;
}, {
    breadcrumb: {};
    actions: {};
    default: {};
}>, {
    dismiss: CustomEvent<void>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    breadcrumb: {};
    actions: {};
    default: {};
}, {}, string>;
type EditablePageScaffold = InstanceType<typeof EditablePageScaffold>;
export default EditablePageScaffold;
