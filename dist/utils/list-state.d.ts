/**
 * Persisted list-page state (filters + sort).
 *
 * Resolution order on page load:
 *   1. URL search params  – shared links reproduce the exact view
 *   2. Cookie / session   – server reads cookie so first load is correct
 *   3. defaults           – first visit
 *
 * On every apply / sort change the state is written to the URL
 * (replaceState, keeps Back button clean), sessionStorage, and a cookie
 * so the server load can read saved filters without a second round-trip.
 *
 * The same field registry also projects the applied state into a plain
 * `{ param: value }` query (defaults and ephemeral fields omitted) and
 * back. That projection is what a saved view stores: the page's own URL
 * query, portable across the registry, unknown keys ignored on read.
 */
import { type Page } from '@sveltejs/kit';
export interface ListStateField {
    /** URL param name (e.g. "q", "status") */
    param: string;
    /** Default value; omitted from the URL when current === default */
    default: string;
    /**
     * Persisted like any other field (URL, session, cookie) but excluded from
     * the query projection. The page number is the canonical case: a saved
     * view restores filters and sort, never a page offset.
     */
    ephemeral?: boolean;
}
export interface ListStateConfig {
    /** sessionStorage key, should be unique per list page (e.g. "admin.users") */
    key: string;
    /** Field definitions: record of logical name to { param, default } */
    fields: Record<string, ListStateField>;
}
/** A list page's applied query: URL param name to value, defaults omitted. */
export type ListStateQuery = Record<string, string>;
export interface ListState<T extends Record<string, string>> {
    /** The resolved initial values (use to seed your reactive vars) */
    values: T;
    /** Call after applying filters or changing sort; persists to URL + session + cookie */
    persist: (current: T, page: Page) => void;
    /** Project applied values into the page's URL query (see `listStateQuery`). */
    query: (current: T) => ListStateQuery;
    /** Resolve a query back into applied values (see `listStateValuesFrom`). */
    fromQuery: (query: ListStateQuery | URLSearchParams) => T;
}
/** The user key a list state is scoped under; a string or numeric id. */
export type ListStateUserId = string | number | null | undefined;
/**
 * Project applied values into the page's URL query: one entry per field
 * whose value is set and differs from its default, keyed by the URL param
 * name. Ephemeral fields (the page number) never appear. The result is
 * what `persist` writes to the address bar and what a saved view stores.
 */
export declare function listStateQuery<K extends string>(values: Record<K, string>, config: ListStateConfig & {
    fields: Record<K, ListStateField>;
}): ListStateQuery;
/**
 * Inverse of `listStateQuery`: resolve a query (a stored view or the URL's
 * search params) into a full set of applied values. Unknown keys are
 * ignored, missing keys take the field default, and an empty value reads
 * as the default. Ephemeral fields resolve the same way, so a URL's page
 * number still comes through while a stored view (which never carries one)
 * lands on the default.
 */
export declare function listStateValuesFrom<K extends string>(query: ListStateQuery | URLSearchParams, config: ListStateConfig & {
    fields: Record<K, ListStateField>;
}): Record<K, string>;
/**
 * Server-side helper: if the URL has no list-state params, apply saved
 * filters from the cookie via a 303 redirect so the URL is the single
 * source of truth for what the user sees. Without the redirect, the
 * server would query with cookie filters but the client UI would init
 * from URL+defaults, leaving the dropdown chrome and the result set out
 * of sync (and breaking shareable links). Returns the URL unchanged when
 * no redirect is needed.
 */
export declare function applySessionFilters(url: URL, cookies: {
    get(name: string): string | undefined;
}, config: ListStateConfig, userId?: ListStateUserId): URL;
/**
 * Resolve initial list state and return persist and projection functions.
 *
 * Usage in a Svelte component:
 * ```ts
 * const { values, persist, query, fromQuery } = initListState($page, {
 *   key: 'admin.users',
 *   fields: {
 *     search: { param: 'q', default: '' },
 *     status: { param: 'status', default: 'active' },
 *     page: { param: 'page', default: '1', ephemeral: true },
 *   }
 * }, $page.data.user?.id);
 * let searchTerm = values.search;
 * let statusFilter = values.status;
 * ```
 */
export declare function initListState<K extends string>(page: Page, config: ListStateConfig & {
    fields: Record<K, ListStateField>;
}, userId?: ListStateUserId): ListState<Record<K, string>>;
