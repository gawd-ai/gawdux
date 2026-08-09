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
export function buildPageWindow(current, total) {
    if (!Number.isFinite(total) || total < 1)
        return [];
    // Clamp rather than trust: an out-of-range current page would otherwise
    // produce a window with no active entry, which renders as a nav where no
    // button looks selected.
    const page = Math.max(1, Math.min(Math.trunc(current) || 1, total));
    if (total <= 7)
        return Array.from({ length: total }, (_, i) => i + 1);
    const items = [1];
    if (page > 3)
        items.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++)
        items.push(i);
    if (page < total - 2)
        items.push('ellipsis');
    items.push(total);
    return items;
}
