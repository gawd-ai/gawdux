export interface CompactViewport {
    /** Whether the screen is at or below the compact width. False until watched. */
    readonly compact: boolean;
    /**
     * Start following the screen; returns the stop. Call it when the shell
     * mounts (`onMount(() => viewport.watch())`).
     */
    watch(target?: Pick<Window, 'matchMedia'>): () => void;
}
/**
 * The shell's compact switch: one reading of `SHELL_BAR_QUERY` (at or below
 * 1024px) for everything in a shell that changes with it in script (a panel
 * that folds, a toast host that shows one message, a page made inert under
 * a panel). What changes in layout alone reads the same width in CSS.
 */
export declare function createCompactViewport(query?: string): CompactViewport;
