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
export declare function createBreadcrumbBuilder(options: BreadcrumbBuilderOptions): BreadcrumbBuilder;
