/**
 * The place a page lies in, as the side rail names it: the rail's item the
 * address falls under and the group holding it. One resolution for both the
 * rail's mark and the trail's place (`buildAppTrail`), so the two never name
 * different places. An item holds its own address and every address below
 * it, the longest on a slash boundary winning, except the app's home: every
 * page lies under its address, so it holds its own address alone, and a page
 * no other item holds lies in no place of the rail's.
 */
export type RailPlace = {
    /** The group holding the item; null for an item at the rail's root. */
    group: {
        id: string;
        label: string;
    } | null;
    item: {
        id: string;
        label: string;
        href: string;
    };
    /**
     * The scope the item holds the page by, when the page lies outside the
     * item's own address: the trail names it under the item.
     */
    scope?: string;
};
type RailItem = {
    id?: string;
    label?: string;
    href?: string;
};
/** The part of a sidebar's config the resolution reads. */
export type RailConfig = {
    groups?: ReadonlyArray<{
        id?: string;
        label?: string;
        items: ReadonlyArray<RailItem>;
    }>;
    rootItems?: ReadonlyArray<RailItem>;
};
export interface RailPlaceOptions {
    /**
     * Per item address, the addresses it holds beyond its own: an item whose
     * page opens addresses that do not lie under its own.
     */
    scopes?: Readonly<Record<string, readonly string[]>>;
    /**
     * The app's home among the rail's items: its address, or a test of an
     * item's address. Every page lies under the home's address, so it holds
     * its own address alone. Left out, the rail has no home and every item
     * holds what lies below it: a host whose rail has a home names it, or a
     * page no item holds would be marked as the home.
     */
    home?: string | ((href: string) => boolean) | null;
}
/** The rail's place of `activeUrl`, null for a page no item holds. */
export declare function resolveRailPlace(activeUrl: string, config: RailConfig | null | undefined, options?: RailPlaceOptions): RailPlace | null;
/** The address of the item the rail marks, null when it marks none. */
export declare function resolveActiveSidebarItemHref(activeUrl: string, config: RailConfig | null | undefined, options?: RailPlaceOptions): string | null;
/**
 * The URL the sidebar is told it is on: the item the host resolved, so the
 * sidebar's highlight and the host's are one answer by construction, never
 * two resolvers that happen to agree. A page no item holds tells it nothing,
 * so the sidebar marks no item: told the page's own path, it would mark the
 * home, whose address lies above every page.
 */
export declare function sidebarActiveUrl(_activeUrl: string, activeItemHref: string | null): string;
/** A person's name as the shell shows it: the name, else the email, else `fallback`. */
export declare function displayNameFor(user: {
    name?: string | null;
    email?: string | null;
} | null | undefined, fallback?: string): string;
/** The first letters of the first and the last word of a name. */
export declare function initialsForDisplayName(displayName: string): string;
/**
 * Whether the shell's right column holds anything for this reader on this
 * page: each fact is one thing it would hold (a chat dock, a help door, an
 * open panel). Without any of them the column takes no width, the main
 * column reaches the right edge, and the header carries the theme toggle the
 * column's cap would hold.
 */
export declare function rightColumnHolds(facts: Readonly<Record<string, boolean>>): boolean;
export {};
