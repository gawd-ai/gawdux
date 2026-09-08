import { writable, get, type Readable } from 'svelte/store';

export type HistoryFetcher<E> = (id: string | number) => Promise<E[]>;

export interface HistoryTabSnapshot<E> {
	entries: E[] | undefined;
	loading: boolean;
	error: string | null;
}

export interface HistoryTabApi<E> extends Readable<HistoryTabSnapshot<E>> {
	entries: E[] | undefined;
	loading: boolean;
	error: string | null;
	load(id: string | number | null | undefined, canView: boolean): Promise<void>;
}

export function createHistoryTab<E>(fetchFn: HistoryFetcher<E>): HistoryTabApi<E> {
	const store = writable<HistoryTabSnapshot<E>>({
		entries: undefined,
		loading: false,
		error: null
	});
	let recordId: string | number | null = null;

	function patch(updates: Partial<HistoryTabSnapshot<E>>) {
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

		async load(id: string | number | null | undefined, canView: boolean) {
			const snap = get(store);
			if (snap.loading || !canView || id == null || id === '') return;
			// Keep last-good entries only for a refresh of the same record.
			// A different record must never inherit the preceding one's history.
			patch({ loading: true, error: null, ...(recordId !== id ? { entries: undefined } : {}) });
			recordId = id;
			try {
				const entries = await fetchFn(id);
				patch({ entries, loading: false });
			} catch {
				// Entries stay as they were: undefined on a first load (so the tab
				// shows the failure alone, not an empty history), the previous
				// list on a refresh.
				patch({ error: 'The history could not be loaded.', loading: false });
			}
		}
	};
}
