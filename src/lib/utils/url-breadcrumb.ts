import type { Component } from 'svelte';
import type { AppBreadcrumbData, AppBreadcrumbItem } from '../primitives/page-chrome.js';

export type BreadcrumbCrumb = {
	label: string;
	href?: string;
	icon?: Component;
};

export type BreadcrumbBuilderOptions = {
	/** Map of first-segment string → icon component. Consumer apps own this taxonomy. */
	moduleIcons: Record<string, Component>;
	/** Top-level group folders that don't have a +page.svelte at their root —
	    linking to /<base>/<group> would 404. Used to suppress hrefs on the first
	    crumb when it points to one of these. Default: empty. */
	groupSegmentsWithoutPages?: ReadonlySet<string>;
	/** Icon used for the home/empty-path crumb. Default: first matching `home` or `dashboard` in moduleIcons. */
	homeIcon?: Component;
	/** Icon used for non-first crumbs that have no specific icon. Default: ChevronRightOutline supplied by caller. */
	separatorIcon?: Component;
	/** Label used when the path resolves to the home crumb (no segments). Default: 'Dashboard'. */
	homeLabel?: string;
	/** Path prefix that the builder strips before splitting. Default: 'app' (so `/app/foo` → ['foo']). */
	basePathSegment?: string;
};

export type BreadcrumbBuilder = {
	/** Read `appBreadcrumb` off page-load data; returns null if missing/invalid. */
	getFromPageData: (pageData: Record<string, unknown> | null | undefined) => AppBreadcrumbData | null;
	/** Build crumbs from an explicit `AppBreadcrumbData.items` array. */
	fromItems: (items: AppBreadcrumbItem[]) => BreadcrumbCrumb[];
	/** Build crumbs by parsing the URL path. */
	fromUrl: (pathname: string) => BreadcrumbCrumb[];
	/** Resolve the icon component for a given href's first segment. */
	iconForHref: (href: string | undefined) => Component | undefined;
};

export function createBreadcrumbBuilder(options: BreadcrumbBuilderOptions): BreadcrumbBuilder {
	const {
		moduleIcons,
		groupSegmentsWithoutPages = new Set<string>(),
		homeIcon,
		separatorIcon,
		homeLabel = 'Dashboard',
		basePathSegment = 'app'
	} = options;

	const resolvedHomeIcon = homeIcon ?? moduleIcons.home ?? moduleIcons.dashboard;

	function iconForHref(href: string | undefined): Component | undefined {
		const firstSegment = href
			?.split('/')
			.filter(Boolean)
			.find((segment) => segment !== basePathSegment);
		if (!firstSegment) return resolvedHomeIcon;
		return moduleIcons[firstSegment] ?? resolvedHomeIcon;
	}

	function getFromPageData(
		pageData: Record<string, unknown> | null | undefined
	): AppBreadcrumbData | null {
		if (!pageData) return null;
		const value = pageData['appBreadcrumb'];
		if (!value || typeof value !== 'object') return null;
		const candidate = value as Partial<AppBreadcrumbData>;
		if (!Array.isArray(candidate.items) || candidate.items.length === 0) return null;
		return candidate as AppBreadcrumbData;
	}

	function fromItems(items: AppBreadcrumbItem[]): BreadcrumbCrumb[] {
		return items.map((item, i) => {
			const keyedIcon = item.iconKey ? moduleIcons[item.iconKey] : undefined;
			const icon = keyedIcon ?? (i === 0 ? iconForHref(item.href) : separatorIcon);
			return {
				label: item.label,
				...(item.href ? { href: item.href } : {}),
				...(icon ? { icon } : {})
			};
		});
	}

	function fromUrl(pathname: string): BreadcrumbCrumb[] {
		const segs = pathname.split('/').filter((s) => s && s !== basePathSegment);
		if (segs.length === 0) {
			return [{ label: homeLabel, ...(resolvedHomeIcon ? { icon: resolvedHomeIcon } : {}) }];
		}
		return segs.map((seg, i) => {
			const isLast = i === segs.length - 1;
			const isOpaqueId = /^\d+$/.test(seg) || /^[0-9a-f]{8}-/.test(seg);
			const label = isOpaqueId
				? seg
				: decodeURIComponent(seg)
						.replace(/-/g, ' ')
						.replace(/\b\w/g, (c) => c.toUpperCase());
			const icon = i === 0 ? (moduleIcons[seg] ?? resolvedHomeIcon) : separatorIcon;
			const isGroupFolder = i === 0 && groupSegmentsWithoutPages.has(seg);
			return {
				label,
				...(icon ? { icon } : {}),
				...(isLast || isGroupFolder
					? {}
					: { href: '/' + [basePathSegment, ...segs.slice(0, i + 1)].filter(Boolean).join('/') })
			};
		});
	}

	return { getFromPageData, fromItems, fromUrl, iconForHref };
}
