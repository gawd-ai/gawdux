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
        ['asc', 'in order'],
        ['desc', 'in reverse order']
    ]
};
/** A sort key's two directions as the phone sort offers them, the one a reader wants first leading. */
export function listSortOptions(keys) {
    return keys.flatMap(({ key, label, order = 'text' }) => ORDER_WORDS[order].map(([direction, words]) => ({
        value: `${key}:${direction}`,
        label: `${label}: ${words}`,
        field: key,
        direction
    })));
}
