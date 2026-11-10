import type { Snippet } from 'svelte';

export type AppBreadcrumbItem = {
	label: string;
	href?: string;
	/** Free-form key — consumer apps map this to an icon component in their layout.
	    Kept as a plain string so each app can define its own taxonomy
	    (e.g. one consumer uses 'analysis'/'stability'/'transactions'; another uses its own). */
	iconKey?: string;
};

export type AppBreadcrumbData = {
	items: AppBreadcrumbItem[];
	/**
	 * The page's state, stated with its trail. The trail never draws it: the
	 * page's own header does (`PAGE_STATUS_CONTEXT`), so a status shows once.
	 */
	status?: string | null;
};

/**
 * The page's status as its host states it, for the page's own header to draw.
 * A page whose tabs head its panel (PageTabs) draws it at the end of its tab
 * strip; the first header to claim it draws it, so it shows once, never in
 * the trail.
 */
export type PageStatusHost = {
	/** What to draw: the host's status chip, or null for a page without one. */
	readonly status: Snippet | null;
	/** Claims the status for one header: a release, or null when another holds it. */
	claim(): (() => void) | null;
};

export const PAGE_STATUS_CONTEXT = Symbol('page-status');

/** A host's page status, read live from `read`, drawn by the first header that claims it. */
export function createPageStatusHost(read: () => Snippet | null): PageStatusHost {
	let holder: symbol | null = null;
	return {
		get status() {
			return read();
		},
		claim() {
			if (holder) return null;
			const mine = Symbol('page-status-claim');
			holder = mine;
			return () => {
				if (holder === mine) holder = null;
			};
		}
	};
}

export type PageCommandBarZone = 'left' | 'center' | 'right';

export type PageCommandBarSlots = {
	left: Snippet | null;
	center: Snippet | null;
	right: Snippet | null;
};

export type PageCommandBarContext = {
	register(zone: PageCommandBarZone, snippet: Snippet | null | undefined): symbol;
	update(id: symbol, snippet: Snippet | null | undefined): void;
	clear(id: symbol): void;
};

export const EMPTY_PAGE_COMMAND_BAR_SLOTS: PageCommandBarSlots = {
	left: null,
	center: null,
	right: null
};

export const PAGE_COMMAND_BAR_CONTEXT = Symbol('page-command-bar');
