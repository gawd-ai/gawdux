import type { Snippet } from 'svelte';
import { derived, toStore, writable, type Readable } from 'svelte/store';

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
 * strip; the first live claim draws it, so it shows once, never in the trail.
 */
export type PageStatusHost = {
	/** What to draw: the host's status chip, or null for a page without one. */
	readonly status: Snippet | null;
	/**
	 * Claims the status for one header. The first live claim draws it; a later
	 * one waits and draws it once every claim before it is released, so the
	 * next page's header, which mounts while the previous page's is still
	 * there, draws its status when the previous page goes.
	 */
	claim(): PageStatusClaim;
};

/** One header's claim on the page's status. */
export type PageStatusClaim = {
	/** The status this header draws, live: the host's while this claim is the first, else null. */
	readonly status: Readable<Snippet | null>;
	/** Gives the status to the next claim. */
	release(): void;
};

export const PAGE_STATUS_CONTEXT = Symbol('page-status');

/** A host's page status, read live from `read`, drawn by the first live claim. */
export function createPageStatusHost(read: () => Snippet | null): PageStatusHost {
	const claims = writable<symbol[]>([]);
	// A store of the live read, so a header written in either Svelte mode
	// follows the status as the host's state changes.
	const current = toStore(read);
	return {
		get status() {
			return read();
		},
		claim() {
			const mine = Symbol('page-status-claim');
			claims.update((held) => [...held, mine]);
			return {
				status: derived([claims, current], ([held, status]) => (held[0] === mine ? status : null)),
				release: () => claims.update((held) => held.filter((claim) => claim !== mine))
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
