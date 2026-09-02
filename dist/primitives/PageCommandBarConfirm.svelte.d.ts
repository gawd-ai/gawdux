type $$ComponentProps = {
    title?: string | null | undefined;
    message: string;
    /** Replaces the message, in the error tone, until the next attempt. */
    error?: string | null | undefined;
    /** `status` announces the message politely (a result to acknowledge). */
    live?: 'status' | null | undefined;
    /** Free-form tag for the decision (`data-kind`), for tests and styling hooks. */
    kind?: string | null | undefined;
    /** null hides Cancel: a result the operator only acknowledges. */
    cancelLabel?: string | null | undefined;
    /** A value to hand over (an access code), shown selectable beside the message. */
    code?: string | null | undefined;
    confirmLabel: string;
    busyLabel?: string | undefined;
    confirmColor?: 'red' | 'green' | 'blue' | undefined;
    busy?: boolean | undefined;
    disabled?: boolean | undefined;
    focusTarget?: HTMLElement | null | undefined;
    focusFallback?: (() => HTMLElement | null) | undefined;
    onconfirm: () => void;
    oncancel: () => void;
};
declare const PageCommandBarConfirm: import("svelte").Component<$$ComponentProps, {}, "">;
type PageCommandBarConfirm = ReturnType<typeof PageCommandBarConfirm>;
export default PageCommandBarConfirm;
