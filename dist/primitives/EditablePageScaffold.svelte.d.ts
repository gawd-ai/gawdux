import type { EditModeProps, LifecycleAction, LifecycleKindRenderers } from './PageActionBar.svelte';
import type { SurfaceFeedbackAction } from './PageFeedback.svelte';
import { type SurfaceNoticeTone } from './surface-feedback-context';
import { type PageTabScope } from './page-chrome';
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
    /** A failed action on this page. Rendered as the one feedback strip
            inside the panel; forward `on:dismiss` to clear it. */ actionError?: string | null | undefined;
    feedbackTone?: "error" | "success" | "info";
    dismissableFeedback?: boolean;
    /** The page, or a panel in it, could not be loaded. Same strip, not
            dismissable; `loadErrorAction` is the way back (a list). */ loadError?: string | null | undefined;
    loadErrorAction?: SurfaceFeedbackAction | null;
    /** A standing condition of the record (archived, awaiting a password
            reset). Same strip, not dismissable, never an error tone. */ notice?: string | null | undefined;
    noticeTone?: SurfaceNoticeTone;
    editMode?: EditModeProps | null;
    lifecycle?: LifecycleAction[];
    kindRenderers?: LifecycleKindRenderers;
    /** The tab, or tabs, whose acts the `actions` slot holds (PAGE_TAB_CONTEXT):
            shown only while one of them is open. None: the page's, on every tab. */ actionsTab?: PageTabScope;
    /** When true, the scaffold draws the page's content in the frame
            (PageFrame) itself: the feedback strip, then the body, an inset host
            that fills the frame (.page-fill), for single-panel pages (create /
            edit forms). Detail pages that render their own `<PageTabs>` leave
            this false. Either way the frame draws the panel. */ surface?: boolean;
    /** With `surface`: the surface hosts panes, not content (a list beside a
            reader), so its body takes no inset and the panes run to the panel's
            edges, as a two-pane card's do. The inset stays the one value the
            knob gives every other inset host; nothing sets it to zero. */ panes?: boolean;
    className?: string;
}, {
    actions: {};
    default: {};
}>, {
    dismiss: CustomEvent<void>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    actions: {};
    default: {};
}, {}, string>;
type EditablePageScaffold = InstanceType<typeof EditablePageScaffold>;
export default EditablePageScaffold;
