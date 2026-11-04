/** Keep a row's primary anchor for keyboard/native link behavior. This helper
 * makes the non-interactive remainder of the row follow the same destination. */
export type RowLinkIntent = 'current' | 'new-context';
/** The row-click guard: whether a click inside a row is the row's own. A
 * click on a control inside the row, or inside one, is that control's. So is
 * a click whose target has left the document: a real click runs the page's
 * microtasks between one listener and the next, so a control that redraws
 * itself on click (a disclosure chevron that swaps its icon) has removed the
 * click's target by the time the click reaches the row, and read as the
 * row's, the row would undo what the control did. */
export declare function isRowClickTarget(event: Event): boolean;
/** No navigation for controls, selected text, cancelled events or secondary clicks. */
export declare function rowLinkIntent(event: MouseEvent): RowLinkIntent | null;
export interface RowLinkNavigation {
    /** The host router; not selected for modified or middle clicks. */
    navigate(href: string): unknown;
    /** Optional browser adapter, useful for hosts with an explicit window policy. */
    open?(href: string): unknown;
}
/** Handles only row background clicks. Nested anchors retain their native behavior. */
export declare function activateRowLink(event: MouseEvent, href: string, ports: RowLinkNavigation): unknown;
