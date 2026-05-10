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
 */
import { type Page } from '@sveltejs/kit';
export interface ListStateField {
    /** URL param name (e.g. "q", "status") */
    param: string;
    /** Default value — omitted from URL when current === default */
    default: string;
}
export interface ListStateConfig {
    /** sessionStorage key, should be unique per list page (e.g. "admin.users") */
    key: string;
    /** Field definitions: record of logical name → { param, default } */
    fields: Record<string, ListStateField>;
}
export interface ListState<T extends Record<string, string>> {
    /** The resolved initial values (use to seed your reactive vars) */
    values: T;
    /** Call after applying filters or changing sort — persists to URL + session + cookie */
    persist: (current: T, page: Page) => void;
}
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
}, config: ListStateConfig, userId?: number | null): URL;
/**
 * Resolve initial list state and return a persist function.
 *
 * Usage in a Svelte component:
 * ```ts
 * const { values, persist } = initListState($page, {
 *   key: 'admin.users',
 *   fields: {
 *     search: { param: 'q', default: '' },
 *     status: { param: 'status', default: 'active' },
 *   }
 * });
 * let searchTerm = values.search;
 * let statusFilter = values.status;
 * ```
 */
export declare function initListState<K extends string>(page: Page, config: ListStateConfig & {
    fields: Record<K, ListStateField>;
}, userId?: number | null): ListState<Record<K, string>>;
