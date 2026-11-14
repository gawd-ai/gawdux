import { type Snippet } from 'svelte';
type $$ComponentProps = {
    open: boolean;
    /** The drawer's heading: "Sign: QA review". */
    title: string;
    /** `signatureStatement({ step, subject, meaning })`, or the host's own sentence. */
    statement: string;
    /** What the signature does beyond itself: it completes the record, it approves the document. */
    consequence?: string | null;
    signer: {
        name: string;
        email: string;
    };
    confirmLabel: string;
    busyLabel?: string;
    /** Red for a withdrawal. */
    tone?: 'blue' | 'red';
    reasonLabel?: string;
    /**
     * The reason's least length, 10 by default, stated before the button
     * would refuse. 1 makes the reason required with no stated length; 0
     * makes it optional, "(optional)" in its label.
     */
    reasonMin?: number;
    /** A write in flight: the drawer holds still, Escape and Cancel included. */
    busy?: boolean;
    /**
     * A result the page could not confirm (its answer was lost): only the
     * confirm is held. The drawer stays closable, so the signer closes it
     * and checks before signing again.
     */
    confirmDisabled?: boolean;
    error?: string | null;
    /** The host's refusal kind for `error` (`password_incorrect` marks the field). */
    errorReason?: string | null;
    /**
     * A field the signature carries, part of what is signed, drawn before
     * the password and the reason in the drawer's one column: a later
     * approval's revision.
     */
    fields?: Snippet | undefined;
    onclose: () => void;
    onconfirm: (input: {
        password: string;
        reason: string;
    }) => void;
};
declare const SignatureCommandSurface: import("svelte").Component<$$ComponentProps, {}, "">;
type SignatureCommandSurface = ReturnType<typeof SignatureCommandSurface>;
export default SignatureCommandSurface;
