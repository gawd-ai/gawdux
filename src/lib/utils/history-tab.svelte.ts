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

export interface HistoryTabOptions {
	/**
	 * The host's words for a failed load: the same `(error, fallback)` port the
	 * admin panels take as `errorMessage`. It receives the fetcher's rejection
	 * exactly as thrown, so a kind and a request reference the host's error
	 * carries reach it, and the tab's default sentence, so the host can lead
	 * with it and add its troubleshooting handle. What it returns is `error`.
	 * Blank words, or a formatter that throws, leave the default sentence: a
	 * failed load never reads as no failure, and the tab never stays loading.
	 */
	errorMessage?: (error: unknown, fallback: string) => string;
}

const LOAD_FAILED = 'The history could not be loaded.';

function failureText(error: unknown, options: HistoryTabOptions): string {
	if (!options.errorMessage) return LOAD_FAILED;
	try {
		const words = options.errorMessage(error, LOAD_FAILED);
		return typeof words === 'string' && words.trim() ? words : LOAD_FAILED;
	} catch {
		return LOAD_FAILED;
	}
}

export function createHistoryTab<E>(
	fetchFn: HistoryFetcher<E>,
	options: HistoryTabOptions = {}
): HistoryTabApi<E> {
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
			} catch (error) {
				// Entries stay as they were: undefined on a first load (so the tab
				// shows the failure alone, not an empty history), the previous
				// list on a refresh.
				patch({ error: failureText(error, options), loading: false });
			}
		}
	};
}
