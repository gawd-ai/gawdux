import type { Component, Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
type $$ComponentProps = {
    selected?: boolean;
    /** The row's name, on the title line. */
    title: string;
    /** The line under the title: a string, or a snippet for meta with marks of its own. */
    meta?: string | Snippet;
    /** The row's icon, on the title line at the house icon size. */
    icon?: Component;
    /** A mark that is no icon (a bot's initials), in the icon's box. */
    leading?: Snippet;
    /** At the title line's end: a badge, a count, a state dot. */
    trailing?: Snippet;
    class?: string;
} & Omit<HTMLButtonAttributes, 'title' | 'children'>;
declare const RailRowButton: Component<$$ComponentProps, {}, "">;
type RailRowButton = ReturnType<typeof RailRowButton>;
export default RailRowButton;
