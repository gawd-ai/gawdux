// The header's trail of an app shell. Pure: maps the address shown, the
// trail its page states and the place the side rail marks to a crumb list
// with icons, so the rail's mark and the trail's place are one answer.
import type { Component } from 'svelte';
import { ChevronRightOutline, HomeOutline } from 'flowbite-svelte-icons';
import type { AppBreadcrumbData } from '../primitives/page-chrome';
import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';
import type { RailPlace } from './rail-place';

/** A crumb of the header's trail (Breadcrumbs' own crumb). */
export type PageCrumb = BreadcrumbCrumb;

/** A crumb before its icon is given: the icon belongs to its place in the trail. */
export type CrumbText = Omit<PageCrumb, 'icon'>;

export interface AppTrailOptions {
	/**
	 * The host's icons, by the key a page states (`iconKey`), by a rail
	 * group's or item's id, and by an address's first segment.
	 */
	icons?: Readonly<Record<string, Component>>;
	/** The first crumb's icon when no key names one. A house, by default. */
	fallbackIcon?: Component;
	/** The icon before every later crumb. A chevron, by default. */
	separatorIcon?: Component;
	/** The crumb of the app's own address, its home. */
	home?: { label: string; icon?: Component };
	/**
	 * An address as the app's own routes name it: the host's prefix (a
	 * tenant's, a locale's) taken off. The identity, by default.
	 */
	appPath?: (pathname: string) => string;
	/** The inverse: the address a link carries for one of the app's own. */
	href?: (appPath: string) => string;
	/** The app's own root, above every page ("/app"). None, by default. */
	root?: string;
	/**
	 * First segments with no page of their own (a group's folder): a crumb
	 * for one is words, never a link that would not be found.
	 */
	unlinked?: Iterable<string>;
	/**
	 * Addresses the navigation files elsewhere than their path says: the
	 * crumbs of such an address and the key of its icon, null for any other.
	 * Navigation ownership is independent of the address family, so a page
	 * keeps its address when its place in the rail changes. `pathCrumbs`
	 * gives the address's own levels to add below a parent.
	 */
	filed?: (
		segments: string[],
		pathCrumbs: (segments: string[]) => CrumbText[]
	) => { crumbs: CrumbText[]; iconKey?: string } | null;
}

export interface AppTrail {
	/**
	 * The header's trail. A page whose address holds no item (it states a
	 * trail of no levels) names the place the rail marks and nothing below
	 * it: an unknown or refused address under a section names that section,
	 * whatever the address says after it, so a hidden item reads exactly as
	 * an unknown one. A page that states its trail has it; any other page
	 * names the rail's place and the address below it.
	 */
	buildAppTrail(input: {
		pathname: string;
		pageData: Record<string, unknown>;
		place: RailPlace | null;
	}): PageCrumb[];
	/**
	 * The trail of a page that states none of its own. Where the rail holds
	 * the address, the trail names the rail's place, its group and item, then
	 * the address's levels below the item. Elsewhere, the address's own
	 * levels.
	 */
	buildPageBreadcrumb(
		pathname: string,
		place?: RailPlace | null,
		options?: { withBelow?: boolean }
	): PageCrumb[];
	/** The trail a page states, with its icons. */
	buildExplicitBreadcrumb(items: AppBreadcrumbData['items']): PageCrumb[];
}

/**
 * The trail a page states, or null for a page that states none. A trail of
 * no levels is a page whose address holds no item (an address the app does
 * not know, an id no item the reader may open holds): its trail is the
 * rail's place alone (`buildAppTrail`).
 */
export function getAppBreadcrumb(pageData: Record<string, unknown>): AppBreadcrumbData | null {
	const value = pageData['appBreadcrumb'];
	if (!value || typeof value !== 'object') return null;
	const candidate = value as Partial<AppBreadcrumbData>;
	if (!Array.isArray(candidate.items)) return null;
	return candidate as AppBreadcrumbData;
}

/** A path segment as a crumb label: an id as it is, anything else in sentence
 *  case ("history-settings" reads "History settings"). */
export function segmentLabel(segment: string): string {
	if (/^\d+$/.test(segment) || /^[0-9a-f]{8}-/.test(segment)) return segment;
	let words = segment;
	try {
		words = decodeURIComponent(segment);
	} catch {
		// A segment that is not an encoding reads as it is written.
	}
	words = words.replace(/-/g, ' ');
	return words.charAt(0).toUpperCase() + words.slice(1);
}

export function createAppTrail(options: AppTrailOptions = {}): AppTrail {
	const icons = options.icons ?? {};
	const fallbackIcon = options.fallbackIcon ?? HomeOutline;
	const separatorIcon = options.separatorIcon ?? ChevronRightOutline;
	const home = options.home ?? { label: 'Home' };
	const appPath = options.appPath ?? ((pathname: string) => pathname);
	const hrefOf = options.href ?? ((path: string) => path);
	const rootSegments = (options.root ?? '').split('/').filter(Boolean);
	const root = rootSegments.length ? '/' + rootSegments.join('/') : '';
	const unlinked = new Set(options.unlinked ?? []);

	/** The address's segments below the app's root. */
	function segmentsOf(pathname: string): string[] {
		const all = appPath(pathname).split('/').filter(Boolean);
		const underRoot = rootSegments.every((segment, i) => all[i] === segment);
		return underRoot ? all.slice(rootSegments.length) : all;
	}

	function iconForHref(href: string | undefined): Component {
		const first = href ? segmentsOf(href)[0] : undefined;
		return first ? (icons[first] ?? fallbackIcon) : fallbackIcon;
	}

	function pathCrumbs(segments: string[]): CrumbText[] {
		return segments.map((segment, i) => {
			const isLast = i === segments.length - 1;
			const isGroupFolder = i === 0 && unlinked.has(segment);
			return {
				label: segmentLabel(segment),
				...(isLast || isGroupFolder
					? {}
					: { href: hrefOf(root + '/' + segments.slice(0, i + 1).join('/')) })
			};
		});
	}

	// Breadcrumbs draws a crumb's icon in front of it, and after crumb 0 that
	// icon is the separator. So crumb 0 alone carries a section's icon and
	// every later crumb the separator; an iconKey on a later crumb is
	// ignored, or it would stand between two crumbs as if it were one.
	function withIcons(crumbs: CrumbText[], first: Component): PageCrumb[] {
		return crumbs.map((crumb, i) => ({ ...crumb, icon: i === 0 ? first : separatorIcon }));
	}

	function buildExplicitBreadcrumb(items: AppBreadcrumbData['items']): PageCrumb[] {
		return items.map((item, i) => ({
			label: item.label,
			...(item.href ? { href: item.href } : {}),
			icon:
				i === 0
					? ((item.iconKey ? icons[item.iconKey] : undefined) ?? iconForHref(item.href))
					: separatorIcon,
			...(item.namedByHeader && i === items.length - 1 ? { namedByHeader: true } : {})
		}));
	}

	/**
	 * The levels of the place the rail marks: its group, which has no page
	 * of its own, then its item, a link unless the page is the item itself.
	 * A page the rail holds but that states no trail of its own adds the
	 * address's levels below the item. A page the item holds by a scope lies
	 * outside the item's own address, so nothing of its address is below the
	 * item: it adds the scope, named by its last level, and the levels below
	 * the scope, each a link to its own address. A place that names no scope
	 * for such a page adds the address's own levels.
	 */
	function railPlaceCrumbs(place: RailPlace, pathname: string, withBelow: boolean): CrumbText[] {
		const page = appPath(pathname);
		const itemPath = appPath(place.item.href);
		const onItem = page === itemPath;
		const holds = (address: string) =>
			page === address || page.startsWith(address.replace(/\/+$/, '') + '/');
		const item: CrumbText = onItem
			? { label: place.item.label }
			: { label: place.item.label, href: place.item.href };
		const levels: CrumbText[] = [...(place.group ? [{ label: place.group.label }] : []), item];
		if (onItem || !withBelow) return levels;
		/** The levels of the page below `address`, linked under `href`. */
		const below = (address: string, href: string): CrumbText[] => {
			const segments = page.slice(address.length).split('/').filter(Boolean);
			return segments.map((segment, i) => ({
				label: segmentLabel(segment),
				...(i === segments.length - 1
					? {}
					: { href: href.replace(/\/+$/, '') + '/' + segments.slice(0, i + 1).join('/') })
			}));
		};
		if (holds(itemPath)) return [...levels, ...below(itemPath, place.item.href)];
		const scopePath = place.scope === undefined ? null : appPath(place.scope);
		if (place.scope !== undefined && scopePath !== null && holds(scopePath)) {
			const name = scopePath.split('/').filter(Boolean).at(-1);
			const under = below(scopePath, place.scope);
			return [
				...levels,
				...(name === undefined
					? []
					: [
							{
								label: segmentLabel(name),
								...(under.length > 0 ? { href: place.scope } : {})
							}
						]),
				...under
			];
		}
		return [...levels, ...pathCrumbs(segmentsOf(pathname))];
	}

	function placeIcon(place: RailPlace): Component {
		const key = place.group?.id ?? place.item.id;
		return icons[key] ?? iconForHref(place.item.href);
	}

	function addressBreadcrumb(pathname: string): PageCrumb[] {
		const segments = segmentsOf(pathname);
		if (segments.length === 0) return [{ label: home.label, icon: home.icon ?? fallbackIcon }];
		// Labels and links first, then a parent the navigation files the page
		// under, and the icons last: the section's icon belongs to whichever
		// crumb ends up first, and every other crumb carries the separator.
		const filed = options.filed?.(segments, pathCrumbs) ?? null;
		const crumbs = filed?.crumbs ?? pathCrumbs(segments);
		const key = filed ? filed.iconKey : segments[0];
		return withIcons(crumbs, (key ? icons[key] : undefined) ?? fallbackIcon);
	}

	function buildPageBreadcrumb(
		pathname: string,
		place: RailPlace | null = null,
		{ withBelow = true }: { withBelow?: boolean } = {}
	): PageCrumb[] {
		if (place) return withIcons(railPlaceCrumbs(place, pathname, withBelow), placeIcon(place));
		return addressBreadcrumb(pathname);
	}

	function buildAppTrail({
		pathname,
		pageData,
		place
	}: {
		pathname: string;
		pageData: Record<string, unknown>;
		place: RailPlace | null;
	}): PageCrumb[] {
		const stated = getAppBreadcrumb(pageData);
		if (stated?.items.length === 0) {
			return place
				? buildPageBreadcrumb(pathname, place, { withBelow: false })
				: addressBreadcrumb(pathname);
		}
		if (stated) return buildExplicitBreadcrumb(stated.items);
		return buildPageBreadcrumb(pathname, place);
	}

	return { buildAppTrail, buildPageBreadcrumb, buildExplicitBreadcrumb };
}
