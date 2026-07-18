import type { Component, Snippet } from 'svelte';
export type PageFeedbackTone = 'error' | 'success' | 'warning' | 'info' | 'pending';
export type PageFeedbackRole = 'alert' | 'status' | null;
export type PageFeedbackLive = 'assertive' | 'polite' | 'off' | null;
export interface PageFeedbackProps {
    /** Plain-text feedback. Rich `children` content takes precedence when provided. */
    message?: string | null;
    title?: string | null;
    tone?: PageFeedbackTone;
    dismissable?: boolean;
    compact?: boolean;
    className?: string;
    children?: Snippet;
    icon?: Component<{
        class?: string;
    }>;
    actionLabel?: string | null;
    actionHref?: string | null;
    actionPending?: boolean;
    actionPendingLabel?: string;
    dismissLabel?: string;
    onaction?: () => void;
    /** Svelte 5 callback form. The legacy `dismiss` component event is also emitted. */
    ondismiss?: () => void;
    /** `undefined` selects a tone-appropriate default; `null` omits the role. */
    role?: PageFeedbackRole;
    /** `undefined` follows the resolved role; `null` omits `aria-live`. */
    ariaLive?: PageFeedbackLive;
    ariaAtomic?: boolean;
}
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
declare const PageFeedback: $$__sveltets_2_IsomorphicComponent<PageFeedbackProps, {
    dismiss: CustomEvent<void>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}, {}, "">;
type PageFeedback = InstanceType<typeof PageFeedback>;
export default PageFeedback;
