/** A saved view as the rail sees it: an id, a name, and the query it restores. */
export interface SavedViewSummary {
    id: string;
    name: string;
    /** URL param name to value, defaults omitted, never the page number. */
    query: Record<string, string>;
}
export interface SavedViewMatch {
    /** The id of the view whose query equals the current one, or null. */
    activeId: string | null;
    /** True when the current query carries nothing beyond the defaults. */
    isDefault: boolean;
    /** True when the current query is worth saving: non-default and not already saved. */
    canSave: boolean;
}
/** Drop empty values and order the keys so two queries compare by content. */
export declare function normalizeQuery(query: Record<string, string | null | undefined> | null | undefined): Record<string, string>;
/** Key-order independent equality over normalized queries. */
export declare function sameQuery(a: Record<string, string | null | undefined> | null | undefined, b: Record<string, string | null | undefined> | null | undefined): boolean;
/** Match the current query against the saved views; the first exact match wins. */
export declare function savedViewMatch(current: Record<string, string | null | undefined> | null | undefined, views: readonly SavedViewSummary[]): SavedViewMatch;
