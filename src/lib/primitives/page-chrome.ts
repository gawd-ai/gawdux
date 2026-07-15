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
	status?: string | null;
};

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
