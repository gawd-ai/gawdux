import { writable, get } from 'svelte/store';
export function createHistoryTab(fetchFn) {
    const store = writable({
        entries: undefined,
        loading: false,
        error: null
    });
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
            patch({ loading: true, error: null });
            try {
                const entries = await fetchFn(id);
                patch({ entries, loading: false });
            }
            catch {
                patch({ entries: [], error: 'Failed to load history', loading: false });
            }
        }
    };
}
