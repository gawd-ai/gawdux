/** Presentation descriptor for one currently applied list filter. */
export interface ActiveFilterDescriptor {
    /** Stable identity used for keyed rendering and removal. */
    id: string;
    /** Filter name, for example "Status". */
    label: string;
    /** Optional selected value, for example "Open". */
    value?: string;
    /** Accessible override for the chip's remove button. */
    removeLabel?: string;
}
/**
 * The order a sort key reads in: words A to Z, a date latest first, a number
 * (or a priority) highest first, a sequence of its own (a schedule's states,
 * a health from worst to best) first to last. A sequence's two orders mean
 * what only its host knows, so its key names them (`ListSortKey.words`).
 */
export type ListSortOrder = 'text' | 'date' | 'number' | 'sequence';
export type ListSortDirection = 'asc' | 'desc';
/**
 * The words of a sort key's two orders, as a reader says them: a health's
 * `{ asc: 'best first', desc: 'worst first', first: 'desc' }`. Each is what
 * follows the column's name ("Health: worst first").
 */
export interface ListSortWords {
    /** The ascending order (`direction: 'asc'`). */
    asc: string;
    /** The descending order (`direction: 'desc'`). */
    desc: string;
    /** The order offered first, the one a reader wants; the kind's own by default. */
    first?: ListSortDirection;
}
/** One column a register sorts by, as its head names it. */
export interface ListSortKey {
    /** The field the column's head sorts (`SortableHeadCell`'s `field`). */
    key: string;
    /** The column's name, as its head shows it. */
    label: string;
    /** How the column's values order; words by default. */
    order?: ListSortOrder;
    /**
     * The key's own words for its two orders, in place of its kind's. A
     * `sequence` key gives them: the kind's own ("first to last", "last to
     * first") name no order a reader knows (`listSortKeyFaults`).
     */
    words?: ListSortWords;
}
/**
 * A register's sort, which its column heads set above the compact width and
 * the query bar's phone sort sets at or below it: the same keys, the same
 * field and direction.
 */
export interface ListSort {
    keys: readonly ListSortKey[];
    field: string;
    direction: ListSortDirection;
    onsort: (field: string, direction: ListSortDirection) => void;
}
/** A sort key's two directions as the phone sort offers them, the one a reader wants first leading. */
export declare function listSortOptions(keys: readonly ListSortKey[]): {
    value: string;
    label: string;
    field: string;
    direction: ListSortDirection;
}[];
/** The words of one order of a key, as the phone sort says them ("worst first"), or null for a key not among them. */
export declare function listSortWords(keys: readonly ListSortKey[], field: string, direction: ListSortDirection): string | null;
/**
 * What is wrong with the words of a register's sort keys, for a host's test
 * to hold to none: a `sequence` key with no words (its two orders would read
 * "first to last" and "last to first", which name no order a reader knows),
 * a key whose words leave an order blank, and one whose two orders read the
 * same.
 */
export declare function listSortKeyFaults(keys: readonly ListSortKey[]): string[];
