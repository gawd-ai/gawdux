import { ChevronRightOutline, HomeOutline } from 'flowbite-svelte-icons';
/**
 * The trail a page states, or null for a page that states none. A trail of
 * no levels is a page whose address holds no item (an address the app does
 * not know, an id no item the reader may open holds): its trail is the
 * rail's place alone (`buildAppTrail`).
 */
export function getAppBreadcrumb(pageData) {
    const value = pageData['appBreadcrumb'];
    if (!value || typeof value !== 'object')
        return null;
    const candidate = value;
    if (!Array.isArray(candidate.items))
        return null;
    return candidate;
}
/** A path segment as a crumb label: an id as it is, anything else in sentence
 *  case ("history-settings" reads "History settings"). */
export function segmentLabel(segment) {
    if (/^\d+$/.test(segment) || /^[0-9a-f]{8}-/.test(segment))
        return segment;
    let words = segment;
    try {
        words = decodeURIComponent(segment);
    }
    catch {
        // A segment that is not an encoding reads as it is written.
    }
    words = words.replace(/-/g, ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
}
export function createAppTrail(options = {}) {
    const icons = options.icons ?? {};
    const fallbackIcon = options.fallbackIcon ?? HomeOutline;
    const separatorIcon = options.separatorIcon ?? ChevronRightOutline;
    const home = options.home ?? { label: 'Home' };
    const appPath = options.appPath ?? ((pathname) => pathname);
    const hrefOf = options.href ?? ((path) => path);
    const rootSegments = (options.root ?? '').split('/').filter(Boolean);
    const root = rootSegments.length ? '/' + rootSegments.join('/') : '';
    const unlinked = new Set(options.unlinked ?? []);
    /** The address's segments below the app's root. */
    function segmentsOf(pathname) {
        const all = appPath(pathname).split('/').filter(Boolean);
        const underRoot = rootSegments.every((segment, i) => all[i] === segment);
        return underRoot ? all.slice(rootSegments.length) : all;
    }
    function iconForHref(href) {
        const first = href ? segmentsOf(href)[0] : undefined;
        return first ? (icons[first] ?? fallbackIcon) : fallbackIcon;
    }
    function pathCrumbs(segments) {
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
    function withIcons(crumbs, first) {
        return crumbs.map((crumb, i) => ({ ...crumb, icon: i === 0 ? first : separatorIcon }));
    }
    function buildExplicitBreadcrumb(items) {
        return items.map((item, i) => ({
            label: item.label,
            ...(item.href ? { href: item.href } : {}),
            icon: i === 0
                ? ((item.iconKey ? icons[item.iconKey] : undefined) ?? iconForHref(item.href))
                : separatorIcon,
            ...(item.namedByHeader && i === items.length - 1 ? { namedByHeader: true } : {})
        }));
    }
    /**
     * The levels of the place the rail marks: its group, which has no page
     * of its own, then its item, a link unless the page is the item itself.
     * A page the rail holds but that states no trail of its own adds the
     * address's levels below the item.
     */
    function railPlaceCrumbs(place, pathname, withBelow) {
        const page = appPath(pathname);
        const itemPath = appPath(place.item.href);
        const onItem = page === itemPath;
        const below = onItem || !withBelow ? [] : page.slice(itemPath.length).split('/').filter(Boolean);
        const item = onItem
            ? { label: place.item.label }
            : { label: place.item.label, href: place.item.href };
        const levels = [...(place.group ? [{ label: place.group.label }] : []), item];
        below.forEach((segment, i) => {
            const isLast = i === below.length - 1;
            levels.push({
                label: segmentLabel(segment),
                ...(isLast ? {} : { href: place.item.href + '/' + below.slice(0, i + 1).join('/') })
            });
        });
        return levels;
    }
    function placeIcon(place) {
        const key = place.group?.id ?? place.item.id;
        return icons[key] ?? iconForHref(place.item.href);
    }
    function addressBreadcrumb(pathname) {
        const segments = segmentsOf(pathname);
        if (segments.length === 0)
            return [{ label: home.label, icon: home.icon ?? fallbackIcon }];
        // Labels and links first, then a parent the navigation files the page
        // under, and the icons last: the section's icon belongs to whichever
        // crumb ends up first, and every other crumb carries the separator.
        const filed = options.filed?.(segments, pathCrumbs) ?? null;
        const crumbs = filed?.crumbs ?? pathCrumbs(segments);
        const key = filed ? filed.iconKey : segments[0];
        return withIcons(crumbs, (key ? icons[key] : undefined) ?? fallbackIcon);
    }
    function buildPageBreadcrumb(pathname, place = null, { withBelow = true } = {}) {
        if (place)
            return withIcons(railPlaceCrumbs(place, pathname, withBelow), placeIcon(place));
        return addressBreadcrumb(pathname);
    }
    function buildAppTrail({ pathname, pageData, place }) {
        const stated = getAppBreadcrumb(pageData);
        if (stated?.items.length === 0) {
            return place
                ? buildPageBreadcrumb(pathname, place, { withBelow: false })
                : addressBreadcrumb(pathname);
        }
        if (stated)
            return buildExplicitBreadcrumb(stated.items);
        return buildPageBreadcrumb(pathname, place);
    }
    return { buildAppTrail, buildPageBreadcrumb, buildExplicitBreadcrumb };
}
