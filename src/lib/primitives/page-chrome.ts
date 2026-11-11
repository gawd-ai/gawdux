import type { Snippet } from 'svelte';
import { derived, toStore, writable, type Readable } from 'svelte/store';

export type AppBreadcrumbItem = {
	label: string;
	href?: string;
	/** Free-form key — consumer apps map this to an icon component in their layout.
	    Kept as a plain string so each app can define its own taxonomy
	    (e.g. one consumer uses 'analysis'/'stability'/'transactions'; another uses its own). */
	iconKey?: string;
	/**
	 * The last level only: the page's own header names this item beside its
	 * status, so above the compact width the trail ends at the item's place;
	 * at the compact width the trail's current page names it.
	 */
	namedByHeader?: boolean;
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
	/**
	 * `present` false: the registration is live but holds nothing now (the
	 * acts of a tab that is not open), and the zone shows the newest present
	 * registration instead. Default true.
	 */
	register(
		zone: PageCommandBarZone,
		snippet: Snippet | null | undefined,
		present?: boolean
	): symbol;
	update(id: symbol, snippet: Snippet | null | undefined, present?: boolean): void;
	clear(id: symbol): void;
};

export const EMPTY_PAGE_COMMAND_BAR_SLOTS: PageCommandBarSlots = {
	left: null,
	center: null,
	right: null
};

export const PAGE_COMMAND_BAR_CONTEXT = Symbol('page-command-bar');

/**
 * The page's open tab, for the command bar to hold that tab's acts. The tab
 * strip claims it and reports which tab is open (`PageTabs` through its
 * `openTab`, a document viewer through its own tabs); a bar registration (`PageCommandBar`,
 * `PageCommandBarCenter`, `PageCommandBarRight`) or an edit bar action
 * (`EditModeProps.tab`, `LifecycleAction.tab`) that names its tab shows only
 * while that tab is open, so a tab with no act draws no bar; and a drawer out
 * of the bar (`CommandDrawer`, `PageCommandBarConfirm`) closes when the open
 * tab changes, its act having left the bar. `EditablePageScaffold` publishes
 * one for the page; a page outside a scaffold may publish its own.
 */
export type PageTabHost = {
	/** The open tab's id, or null until a tab strip reports one. */
	readonly open: Readable<string | null>;
	/**
	 * A tab strip's claim on the page's open tab. The open tab is the newest
	 * live claim's report (a claim reporting null counts for nothing), so a
	 * strip that replaces another, mounting before the other goes, keeps its
	 * report, and a strip nested in a tab that reports nothing leaves the
	 * page's alone.
	 */
	claim(): PageTabClaim;
};

/** One tab strip's claim on the page's open tab. */
export type PageTabClaim = {
	/** The tab now open in this strip; null reports none. */
	report(tab: string | null): void;
	/** The strip goes: its report goes with it. */
	release(): void;
};

export const PAGE_TAB_CONTEXT = Symbol('page-tab');

/** A page's open tab, reported by its tab strips. */
export function createPageTabHost(): PageTabHost {
	const claims = writable<{ id: symbol; tab: string | null }[]>([]);
	const open = derived(claims, (held) => {
		for (let i = held.length - 1; i >= 0; i--) if (held[i]!.tab !== null) return held[i]!.tab;
		return null;
	});
	return {
		open,
		claim() {
			const id = Symbol('page-tab-claim');
			claims.update((held) => [...held, { id, tab: null }]);
			return {
				report(tab) {
					claims.update((held) => held.map((claim) => (claim.id === id ? { id, tab } : claim)));
				},
				release() {
					claims.update((held) => held.filter((claim) => claim.id !== id));
				}
			};
		}
	};
}

/**
 * The tabs a bar action belongs to: one tab's id, or several. An action that
 * names none belongs to the page, on every tab.
 */
export type PageTabScope = string | readonly string[] | null | undefined;

/**
 * Whether an action of `scope` shows while `open` is the page's open tab:
 * always when it names no tab; while one of its tabs is open when it does,
 * never before a tab strip has reported (`open` null).
 */
export function showsOnTab(scope: PageTabScope, open: string | null): boolean {
	if (scope == null) return true;
	if (open === null) return false;
	return typeof scope === 'string' ? scope === open : scope.includes(open);
}
