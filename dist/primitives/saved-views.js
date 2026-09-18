// Saved views: pure helpers that decide which named view, if any, matches a
// list page's applied query. The host owns storage and the form contract;
// gawdux owns the match and the rail that presents it.
/** Drop empty values and order the keys so two queries compare by content. */
export function normalizeQuery(query) {
    const out = {};
    if (!query)
        return out;
    for (const key of Object.keys(query).sort()) {
        const value = query[key];
        if (value == null)
            continue;
        const text = String(value);
        if (text === '')
            continue;
        out[key] = text;
    }
    return out;
}
/** Key-order independent equality over normalized queries. */
export function sameQuery(a, b) {
    const left = normalizeQuery(a);
    const right = normalizeQuery(b);
    const keys = Object.keys(left);
    if (keys.length !== Object.keys(right).length)
        return false;
    return keys.every((key) => right[key] === left[key]);
}
/** Match the current query against the saved views; the first exact match wins. */
export function savedViewMatch(current, views) {
    const query = normalizeQuery(current);
    const isDefault = Object.keys(query).length === 0;
    const active = views.find((view) => sameQuery(query, view.query));
    const activeId = active ? active.id : null;
    return { activeId, isDefault, canSave: !isDefault && activeId === null };
}
