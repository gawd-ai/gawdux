/**
 * Live-injected stylesheet that highlights the active sidebar sub-item
 * (and, when the sidebar is collapsed, the parent section icon) by matching
 * `[href]` to the current activeUrl. We use a dynamic style element rather
 * than a class toggle because the gawdux dropdown sub-items don't expose an
 * `active` prop, and the collapsed flyout is portaled to body on hover and
 * wouldn't be reachable from a normal Svelte reactive at mount.
 *
 * The parent-icon highlight (collapsed mode) is keyed off a
 * `data-active-group` attribute the consumer (or a future helper) stamps
 * onto the wrapper — using `:has(ul …)` instead would fail in collapsed
 * mode because gawdux force-closes every dropdown on collapse and the
 * `<ul>` (and its anchors) leave the DOM.
 */
export type ActiveSubitemPalette = {
    /** Light-mode active background (e.g. blue-50). */
    lightBg: string;
    /** Light-mode active text (e.g. blue-700). */
    lightFg: string;
    /** Light-mode hover-on-active background (e.g. blue-100). */
    lightHoverBg: string;
    /** Light-mode 4px tab + border (e.g. blue-200). */
    lightAccent: string;
    /** Light-mode top-level active text (e.g. blue-600). */
    lightTopFg: string;
    /** Dark-mode active background (e.g. blue-950). */
    darkBg: string;
    /** Dark-mode active text (e.g. blue-300). */
    darkFg: string;
    /** Dark-mode hover-on-active background (e.g. blue-900). */
    darkHoverBg: string;
    /** Dark-mode 4px tab + border (e.g. blue-900). */
    darkAccent: string;
    /** Dark-mode top-level active text (e.g. blue-400). */
    darkTopFg: string;
};
export declare const DEFAULT_PALETTE: ActiveSubitemPalette;
export type ActiveSubitemStylesheetOptions = {
    /** Optional element id for the injected <style>. */
    id?: string;
    /** Color palette. Defaults to gawdux blue. */
    palette?: Partial<ActiveSubitemPalette>;
};
export type ActiveSubitemStylesheetController = {
    /** Update the active URL (rewrites the stylesheet). Pass null/empty to clear. */
    setActiveUrl: (url: string | null | undefined) => void;
    /** Tear down the style element. */
    destroy: () => void;
};
export declare function createActiveSubitemStylesheet(options?: ActiveSubitemStylesheetOptions): ActiveSubitemStylesheetController;
