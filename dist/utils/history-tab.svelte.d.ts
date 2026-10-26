import { type Readable } from 'svelte/store';
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
export declare function createHistoryTab<E>(fetchFn: HistoryFetcher<E>, options?: HistoryTabOptions): HistoryTabApi<E>;
