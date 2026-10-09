/** Keep a row's primary anchor for keyboard/native link behavior. This helper
 * makes the non-interactive remainder of the row follow the same destination. */
export type RowLinkIntent = 'current' | 'new-context';
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
