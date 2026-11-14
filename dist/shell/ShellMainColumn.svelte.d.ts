import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** The shell's header (ShellHeader). */
    header?: Snippet;
    children?: Snippet;
    /** A panel is the view: the column takes no key, press or reading. */
    covered?: boolean;
};
/**
 * The shell's main column: the header, then the page. While a panel is the
 * view at the compact width (`covered`: a chat panel open over the page),
 * the column is inert and hidden from assistive technology, so the focus
 * and a reader stay in the panel.
 *
 * The page is the host's: it draws its one frame (PageFrame) inside.
 */
declare const ShellMainColumn: import("svelte").Component<$$ComponentProps, {}, "">;
type ShellMainColumn = ReturnType<typeof ShellMainColumn>;
export default ShellMainColumn;
