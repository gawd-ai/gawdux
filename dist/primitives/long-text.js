const MOMENT = String.raw `\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})? [A-Z][A-Za-z+\-0-9]{1,5}`;
const HASH = String.raw `[0-9a-fA-F]{32,}`;
// A word that holds a hyphen, a dash or a slash, where a browser may break.
const JOINED = String.raw `[^\s,;]*[A-Za-z0-9)\]][\-‐‑–—/][^\s,;]*[A-Za-z0-9)\]]`;
const RUN = new RegExp(`(${MOMENT})|(?<![0-9a-zA-Z])(${HASH})(?![0-9a-zA-Z])|(${JOINED})`, 'g');
/** The line read into runs of the rule's kinds, in order; empty for an empty line. */
export function longTextRuns(text) {
    const runs = [];
    let at = 0;
    const push = (kind, value) => {
        if (!value)
            return;
        const last = runs.at(-1);
        if (kind === 'text' && last?.kind === 'text')
            last.text += value;
        else
            runs.push({ kind, text: value });
    };
    for (const match of text.matchAll(RUN)) {
        const index = match.index ?? 0;
        push('text', text.slice(at, index));
        push(match[2] ? 'hash' : 'whole', match[0]);
        at = index + match[0].length;
    }
    push('text', text.slice(at));
    return runs;
}
