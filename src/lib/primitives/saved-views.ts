// Saved views: pure helpers that decide which named view, if any, matches a
// list page's applied query. The host owns storage and the form contract;
// gawdux owns the match and the rail that presents it.

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
export function normalizeQuery(
	query: Record<string, string | null | undefined> | null | undefined
): Record<string, string> {
	const out: Record<string, string> = {};
	if (!query) return out;
	for (const key of Object.keys(query).sort()) {
		const value = query[key];
		if (value == null) continue;
		const text = String(value);
		if (text === '') continue;
		out[key] = text;
	}
	return out;
}

/** Key-order independent equality over normalized queries. */
export function sameQuery(
	a: Record<string, string | null | undefined> | null | undefined,
	b: Record<string, string | null | undefined> | null | undefined
): boolean {
	const left = normalizeQuery(a);
	const right = normalizeQuery(b);
	const keys = Object.keys(left);
	if (keys.length !== Object.keys(right).length) return false;
	return keys.every((key) => right[key] === left[key]);
}

/** Match the current query against the saved views; the first exact match wins. */
export function savedViewMatch(
	current: Record<string, string | null | undefined> | null | undefined,
	views: readonly SavedViewSummary[]
): SavedViewMatch {
	const query = normalizeQuery(current);
	const isDefault = Object.keys(query).length === 0;
	const active = views.find((view) => sameQuery(query, view.query));
	const activeId = active ? active.id : null;
	return { activeId, isDefault, canSave: !isDefault && activeId === null };
}
