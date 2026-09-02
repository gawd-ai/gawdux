type $$ComponentProps = {
    title?: string | null;
    message: string;
    /** Replaces the message, in the error tone, until the next attempt. */
    error?: string | null;
    /** null hides Cancel: a result the operator only acknowledges. */
    cancelLabel?: string | null;
    /** A value to hand over (an access code), shown selectable beside the message. */
    code?: string | null;
    confirmLabel: string;
    busyLabel?: string;
    confirmColor?: 'red' | 'green' | 'blue';
    busy?: boolean;
    disabled?: boolean;
    focusTarget?: HTMLElement | null;
    focusFallback?: () => HTMLElement | null;
    onconfirm: () => void;
    oncancel: () => void;
};
declare const PageCommandBarConfirm: import("svelte").Component<$$ComponentProps, {}, "">;
type PageCommandBarConfirm = ReturnType<typeof PageCommandBarConfirm>;
export default PageCommandBarConfirm;
