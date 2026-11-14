import type { Component } from 'svelte';
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
    home?: {
        label: string;
        icon?: Component;
    };
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
    filed?: (segments: string[], pathCrumbs: (segments: string[]) => CrumbText[]) => {
        crumbs: CrumbText[];
        iconKey?: string;
    } | null;
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
    buildPageBreadcrumb(pathname: string, place?: RailPlace | null, options?: {
        withBelow?: boolean;
    }): PageCrumb[];
    /** The trail a page states, with its icons. */
    buildExplicitBreadcrumb(items: AppBreadcrumbData['items']): PageCrumb[];
}
/**
 * The trail a page states, or null for a page that states none. A trail of
 * no levels is a page whose address holds no item (an address the app does
 * not know, an id no item the reader may open holds): its trail is the
 * rail's place alone (`buildAppTrail`).
 */
export declare function getAppBreadcrumb(pageData: Record<string, unknown>): AppBreadcrumbData | null;
/** A path segment as a crumb label: an id as it is, anything else in sentence
 *  case ("history-settings" reads "History settings"). */
export declare function segmentLabel(segment: string): string;
export declare function createAppTrail(options?: AppTrailOptions): AppTrail;
