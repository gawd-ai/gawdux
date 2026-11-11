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
 * (or a priority) highest first, a sequence of its own (a schedule's states)
 * in its order first.
 */
export type ListSortOrder = 'text' | 'date' | 'number' | 'sequence';

/** One column a register sorts by, as its head names it. */
export interface ListSortKey {
	/** The field the column's head sorts (`SortableHeadCell`'s `field`). */
	key: string;
	/** The column's name, as its head shows it. */
	label: string;
	/** How the column's values order; words by default. */
	order?: ListSortOrder;
}

export type ListSortDirection = 'asc' | 'desc';

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

const ORDER_WORDS: Record<ListSortOrder, [[ListSortDirection, string], [ListSortDirection, string]]> = {
	text: [
		['asc', 'A to Z'],
		['desc', 'Z to A']
	],
	date: [
		['desc', 'latest first'],
		['asc', 'earliest first']
	],
	number: [
		['desc', 'highest first'],
		['asc', 'lowest first']
	],
	sequence: [
		['asc', 'in order'],
		['desc', 'in reverse order']
	]
};

/** A sort key's two directions as the phone sort offers them, the one a reader wants first leading. */
export function listSortOptions(
	keys: readonly ListSortKey[]
): { value: string; label: string; field: string; direction: ListSortDirection }[] {
	return keys.flatMap(({ key, label, order = 'text' }) =>
		ORDER_WORDS[order].map(([direction, words]) => ({
			value: `${key}:${direction}`,
			label: `${label}: ${words}`,
			field: key,
			direction
		}))
	);
}
