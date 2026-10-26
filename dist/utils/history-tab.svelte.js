import { writable, get } from 'svelte/store';
const LOAD_FAILED = 'The history could not be loaded.';
function failureText(error, options) {
    if (!options.errorMessage)
        return LOAD_FAILED;
    try {
        const words = options.errorMessage(error, LOAD_FAILED);
        return typeof words === 'string' && words.trim() ? words : LOAD_FAILED;
    }
    catch {
        return LOAD_FAILED;
    }
}
export function createHistoryTab(fetchFn, options = {}) {
    const store = writable({
        entries: undefined,
        loading: false,
        error: null
    });
    let recordId = null;
    function patch(updates) {
        store.update((s) => ({ ...s, ...updates }));
    }
    return {
        subscribe: store.subscribe,
        get entries() {
            return get(store).entries;
        },
        get loading() {
            return get(store).loading;
        },
        get error() {
            return get(store).error;
        },
        async load(id, canView) {
            const snap = get(store);
            if (snap.loading || !canView || id == null || id === '')
                return;
            // Keep last-good entries only for a refresh of the same record.
            // A different record must never inherit the preceding one's history.
            patch({ loading: true, error: null, ...(recordId !== id ? { entries: undefined } : {}) });
            recordId = id;
            try {
                const entries = await fetchFn(id);
                patch({ entries, loading: false });
            }
            catch (error) {
                // Entries stay as they were: undefined on a first load (so the tab
                // shows the failure alone, not an empty history), the previous
                // list on a refresh.
                patch({ error: failureText(error, options), loading: false });
            }
        }
    };
}
