/**
 * A page's heading as the shell shows it after an in-place change: the
 * trail's leaf (`label`, the page's name) and the page's status, which the
 * page's own header draws (PAGE_STATUS_CONTEXT, PageTabs at the end of its
 * tab strip), never the trail. Keyed by the page's path, so a heading set on
 * one page never shows on another.
 */
export declare const APP_PAGE_HEADING_CONTEXT: unique symbol;
export interface AppPageHeadingController {
    set(pathname: string, status: string, label?: string): void;
    clear(pathname: string): void;
}
export interface AppPageHeading {
    /** What a page sets and clears; the host puts it in APP_PAGE_HEADING_CONTEXT. */
    readonly controller: AppPageHeadingController;
    /** The name a page set for `pathname`, undefined when it set none. */
    label(pathname: string): string | undefined;
    /** The status of `pathname`: what the page set, else what its load stated. */
    status(pathname: string, stated?: string | null): string | null;
    /** `items` with the last one renamed to what the page set for `pathname`. */
    trail<T extends {
        label: string;
    }>(pathname: string, items: T[]): T[];
}
/**
 * The shell's side of the page heading: it holds what a page set, hands the
 * page its controller and answers the trail and the status for the address
 * shown.
 */
export declare function createAppPageHeading(): AppPageHeading;
