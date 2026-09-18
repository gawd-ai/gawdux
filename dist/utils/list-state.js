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
import { goto } from '$app/navigation';
import { redirect } from '@sveltejs/kit';
import { createNavigationFocusRestorer } from './navigation-focus';
const listStateFocusRestorer = createNavigationFocusRestorer();
/**
 * Cookie/storage key scoped to a user so logging out + logging in as a
 * different user on the same browser doesn't carry the prior user's
 * filters across (real privacy issue: some filter values reveal what
 * the prior user was investigating). Same user across sessions keeps
 * their saved views.
 */
function scopedKey(userId, key) {
    return `ls.${userId ?? '_anon'}.${key}`;
}
/**
 * Project applied values into the page's URL query: one entry per field
 * whose value is set and differs from its default, keyed by the URL param
 * name. Ephemeral fields (the page number) never appear. The result is
 * what `persist` writes to the address bar and what a saved view stores.
 */
export function listStateQuery(values, config) {
    const query = {};
    for (const [name, field] of Object.entries(config.fields)) {
        if (field.ephemeral)
            continue;
        const val = values[name];
        if (val && val !== field.default)
            query[field.param] = val;
    }
    return query;
}
/**
 * Inverse of `listStateQuery`: resolve a query (a stored view or the URL's
 * search params) into a full set of applied values. Unknown keys are
 * ignored, missing keys take the field default, and an empty value reads
 * as the default. Ephemeral fields resolve the same way, so a URL's page
 * number still comes through while a stored view (which never carries one)
 * lands on the default.
 */
export function listStateValuesFrom(query, config) {
    const read = query instanceof URLSearchParams
        ? (param) => query.get(param)
        : (param) => Object.prototype.hasOwnProperty.call(query, param) ? query[param] : null;
    const values = {};
    for (const [name, field] of Object.entries(config.fields)) {
        const raw = read(field.param);
        values[name] = raw == null || raw === '' ? field.default : String(raw);
    }
    return values;
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
export function applySessionFilters(url, cookies, config, userId) {
    if (Array.from(url.searchParams.keys()).some((k) => Object.values(config.fields).some((f) => f.param === k)))
        return url;
    const raw = cookies.get(scopedKey(userId, config.key));
    if (!raw)
        return url;
    try {
        const session = JSON.parse(raw);
        const u = new URL(url);
        let hasNonDefault = false;
        for (const [name, field] of Object.entries(config.fields)) {
            const val = session[name];
            if (val && val !== field.default) {
                u.searchParams.set(field.param, val);
                hasNonDefault = true;
            }
        }
        if (!hasNonDefault)
            return url;
        throw redirect(303, u.pathname + u.search);
    }
    catch (e) {
        if (e && typeof e === 'object' && 'status' in e && 'location' in e)
            throw e;
        return url;
    }
}
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
export function initListState(page, config, userId) {
    const urlParams = page.url.searchParams;
    const hasUrlParams = Array.from(urlParams.keys()).some((k) => Object.values(config.fields).some((f) => f.param === k));
    const storageKey = `listState.${userId ?? '_anon'}.${config.key}`;
    // Try sessionStorage
    let session = null;
    if (!hasUrlParams) {
        try {
            const raw = sessionStorage.getItem(storageKey);
            if (raw)
                session = JSON.parse(raw);
        }
        catch {
            // SSR or storage unavailable
        }
    }
    // Resolve: URL -> session -> default
    let values;
    if (hasUrlParams) {
        values = listStateValuesFrom(urlParams, config);
    }
    else {
        values = {};
        for (const [name, field] of Object.entries(config.fields)) {
            if (session && name in session) {
                values[name] = session[name] ?? field.default;
            }
            else {
                values[name] = field.default;
            }
        }
    }
    function writeCookie(data) {
        try {
            document.cookie = `${scopedKey(userId, config.key)}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${30 * 86400}; SameSite=Lax`;
        }
        catch {
            // ignore
        }
    }
    function persist(current, pg) {
        // sessionStorage
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(current));
        }
        catch {
            // ignore
        }
        // Cookie for server-side access
        writeCookie(current);
        // URL params (omit defaults to keep URL clean)
        const u = new URL(pg.url);
        for (const [name, field] of Object.entries(config.fields)) {
            const val = current[name];
            if (val && val !== field.default) {
                u.searchParams.set(field.param, val);
            }
            else {
                u.searchParams.delete(field.param);
            }
        }
        void listStateFocusRestorer.navigate(() => goto(u.toString(), { replaceState: true, keepFocus: true, noScroll: true }));
    }
    // If values came from session (not URL) and differ from defaults,
    // sync the URL immediately so the address bar is always shareable.
    if (!hasUrlParams) {
        const hasNonDefault = Object.entries(config.fields).some(([name, field]) => values[name] !== field.default);
        if (hasNonDefault) {
            // Ensure cookie is in sync with session values
            writeCookie(values);
            // Use tick so the component finishes mounting first
            queueMicrotask(() => persist(values, page));
        }
    }
    return {
        values,
        persist,
        query: (current) => listStateQuery(current, config),
        fromQuery: (query) => listStateValuesFrom(query, config)
    };
}
