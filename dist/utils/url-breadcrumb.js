export function createBreadcrumbBuilder(options) {
    const { moduleIcons, groupSegmentsWithoutPages = new Set(), homeIcon, separatorIcon, homeLabel = 'Dashboard', basePathSegment = 'app' } = options;
    const resolvedHomeIcon = homeIcon ?? moduleIcons.home ?? moduleIcons.dashboard;
    function iconForHref(href) {
        const firstSegment = href
            ?.split('/')
            .filter(Boolean)
            .find((segment) => segment !== basePathSegment);
        if (!firstSegment)
            return resolvedHomeIcon;
        return moduleIcons[firstSegment] ?? resolvedHomeIcon;
    }
    function getFromPageData(pageData) {
        if (!pageData)
            return null;
        const value = pageData['appBreadcrumb'];
        if (!value || typeof value !== 'object')
            return null;
        const candidate = value;
        if (!Array.isArray(candidate.items) || candidate.items.length === 0)
            return null;
        return candidate;
    }
    function fromItems(items) {
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
    function fromUrl(pathname) {
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
