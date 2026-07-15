export interface NavigationFocusRestorer {
    /** Run a navigation and restore the element that owned focus once rendering settles. */
    navigate(navigation: () => Promise<unknown>): Promise<void>;
    /** Invalidate any pending restore without cancelling the underlying navigation. */
    cancel(): void;
}
/**
 * Preserve focus across URL-backed navigations that update data without replacing
 * the focused control. The latest navigation owns restoration; explicit user input
 * or a later focus change always wins.
 */
export declare function createNavigationFocusRestorer(): NavigationFocusRestorer;
