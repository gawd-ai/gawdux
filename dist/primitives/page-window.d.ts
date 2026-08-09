/**
 * Windowed page list for numbered pagination.
 *
 * `ListPaginationNav` shipped with prev/range/next only. Consumers that
 * already rendered numbered page buttons could not adopt it without losing
 * direct page-jump — a capability regression — so the numbers move up here
 * behind an opt-in instead.
 *
 * The windowing is deliberately the same shape those consumers already used:
 * first page, an ellipsis when the current page has pulled away from the
 * start, the current page and its immediate neighbours, an ellipsis before
 * the end, and the last page. Up to 7 pages are shown in full, because at
 * that size a window costs more than it saves.
 */
export type PageWindowItem = number | 'ellipsis';
export declare function buildPageWindow(current: number, total: number): PageWindowItem[];
