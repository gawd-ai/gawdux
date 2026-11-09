/**
 * The width below which `MasterDetailShell` is one pane at a time: the rail,
 * or the detail it opened, with Back between them.
 */
export const MASTER_DETAIL_COMPACT_QUERY = '(max-width: 48rem)';

/**
 * True while the shell shows one pane at a time. A host that selects its
 * first row for the reader (a convenience beside the rail) asks this first:
 * at a compact width a pane opens on its list, and a detail opens only when
 * the reader picks a row or creates one.
 */
export function masterDetailCompact(): boolean {
	return (
		typeof window !== 'undefined' &&
		typeof window.matchMedia === 'function' &&
		window.matchMedia(MASTER_DETAIL_COMPACT_QUERY).matches
	);
}
