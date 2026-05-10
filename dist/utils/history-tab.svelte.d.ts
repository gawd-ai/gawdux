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
export declare function createHistoryTab<E>(fetchFn: HistoryFetcher<E>): HistoryTabApi<E>;
