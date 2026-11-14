/** Each kind's own words, the order a reader wants first leading. */
const ORDER_WORDS = {
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
        ['asc', 'first to last'],
        ['desc', 'last to first']
    ]
};
/** A key's two orders with their words, the one offered first leading: its own words, else its kind's. */
function orderWords(key) {
    const kind = ORDER_WORDS[key.order ?? 'text'];
    const own = key.words;
    if (!own)
        return kind;
    const first = own.first ?? kind[0][0];
    const second = first === 'asc' ? 'desc' : 'asc';
    return [first, second].map((direction, index) => [
        direction,
        // A blank word falls back to the kind's, so no choice reads "Health: ".
        own[direction]?.trim() || kind.find(([of]) => of === direction)?.[1] || kind[index][1]
    ]);
}
/** A sort key's two directions as the phone sort offers them, the one a reader wants first leading. */
export function listSortOptions(keys) {
    return keys.flatMap((key) => orderWords(key).map(([direction, words]) => ({
        value: `${key.key}:${direction}`,
        label: `${key.label}: ${words}`,
        field: key.key,
        direction
    })));
}
/** The words of one order of a key, as the phone sort says them ("worst first"), or null for a key not among them. */
export function listSortWords(keys, field, direction) {
    const key = keys.find((entry) => entry.key === field);
    return key ? (orderWords(key).find(([of]) => of === direction)?.[1] ?? null) : null;
}
/**
 * What is wrong with the words of a register's sort keys, for a host's test
 * to hold to none: a `sequence` key with no words (its two orders would read
 * "first to last" and "last to first", which name no order a reader knows),
 * a key whose words leave an order blank, and one whose two orders read the
 * same.
 */
export function listSortKeyFaults(keys) {
    const found = [];
    for (const { key, label, order = 'text', words } of keys) {
        const name = `sort key "${key}" (${label})`;
        if (!words) {
            if (order === 'sequence')
                found.push(`${name} orders as a sequence and names neither order: give it words, for example { asc: 'best first', desc: 'worst first' }`);
            continue;
        }
        const asc = words.asc?.trim() ?? '';
        const desc = words.desc?.trim() ?? '';
        if (!asc)
            found.push(`${name} has no word for its ascending order`);
        if (!desc)
            found.push(`${name} has no word for its descending order`);
        if (asc && asc.toLowerCase() === desc.toLowerCase())
            found.push(`${name} reads the same in both orders: "${asc}"`);
    }
    return found;
}
