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
			patch({ loading: true, error: null });
			try {
				const entries = await fetchFn(id);
				patch({ entries, loading: false });
			} catch {
				patch({ entries: [], error: 'Failed to load history', loading: false });
			}
		}
	};
}
