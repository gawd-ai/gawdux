import type { Component, Snippet } from 'svelte';
import type { PageTabScope } from './page-chrome';
type $$ComponentProps = {
    /** The act's label. */
    label: string;
    /** The act's label while it runs. */
    busyLabel?: string | undefined;
    /** The act's own tone: red for a destructive act, green for a save. */
    tone?: 'blue' | 'green' | 'red' | undefined;
    busy?: boolean | undefined;
    /** The act cannot run yet (a required field is empty). */
    disabled?: boolean | undefined;
    onact: () => void;
    /** Null hides Cancel: a result the person only acknowledges. */
    cancelLabel?: string | null | undefined;
    /** Cancelling would discard input the person entered: Cancel is red. */
    discards?: boolean | undefined;
    /** Defaults to `busy`: nothing is cancelled mid-write. */
    cancelDisabled?: boolean | undefined;
    oncancel: () => void;
    /** Other acts of the decision, drawn between Cancel and the act. */
    between?: Snippet | undefined;
    actIcon?: Component<{
        class?: string;
    }> | undefined;
    cancelIcon?: Component<{
        class?: string;
    }> | undefined;
    describedBy?: string | undefined;
    /** Ties the act to the decision that focuses it (`data-confirm-for`). */
    confirmFor?: string | undefined;
    /** A host's own markers on the act or on Cancel (test hooks). */
    actAttributes?: Record<string, string | boolean | undefined> | undefined;
    cancelAttributes?: Record<string, string | boolean | undefined> | undefined;
    tab?: PageTabScope;
    inline?: boolean | undefined;
};
declare const PageCommandBarPair: Component<$$ComponentProps, {}, "">;
type PageCommandBarPair = ReturnType<typeof PageCommandBarPair>;
export default PageCommandBarPair;
