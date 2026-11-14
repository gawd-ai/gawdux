/** A panel that folds when the screen turns compact (a chat panel beside the page). */
export interface CompactFoldPanel {
    isOpen(): boolean;
    setOpen(open: boolean): void;
}
export interface CompactFold {
    /** Tell the fold the screen's state; it acts only when the state changes. */
    sync(compact: boolean): void;
}
/**
 * At the compact width an open side panel is the whole view and would cover
 * the page a person was on. Crossing into compact folds the panel and
 * remembers to open it again when the screen grows back, so the wide-screen
 * preference is never lost. Only the crossing drives it: a panel opened or
 * closed by hand while compact is left as the person set it, and a panel
 * closed by hand before the screen grows back opens again only if the
 * crossing was what closed it.
 */
export declare function createCompactFold(panel: CompactFoldPanel): CompactFold;
