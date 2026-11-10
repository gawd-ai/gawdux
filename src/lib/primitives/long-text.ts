/**
 * One rule for long values in a line of text:
 *
 * - `whole`: an identifier (a record label like QMS-VSR-0001, a document
 *   number, a request's reference like 4ab67d51-0ef, a range like "(A–Z)")
 *   or a moment ("2026-11-07 21:55:42 EST") never breaks inside itself: a
 *   browser would otherwise break it after a hyphen or a dash, or between the
 *   day and the time.
 * - `hash`: a hash (32 or more hexadecimal characters: a SHA-256, a source
 *   revision) wraps inside its own box at any character and never runs past
 *   the screen's edge.
 * - `text`: the words around them, which wrap between words.
 *
 * `LongText` draws each run as a span of its own, so the line wraps between
 * them and no character is changed: copying the line gives the text as
 * written.
 */
export type LongTextRun = { kind: 'text' | 'whole' | 'hash'; text: string };

const MOMENT = String.raw`\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})? [A-Z][A-Za-z+\-0-9]{1,5}`;
const HASH = String.raw`[0-9a-fA-F]{32,}`;
// A word that holds a hyphen, a dash or a slash, where a browser may break.
const JOINED = String.raw`[^\s,;]*[A-Za-z0-9)\]][\-‐‑–—/][^\s,;]*[A-Za-z0-9)\]]`;
const RUN = new RegExp(`(${MOMENT})|(?<![0-9a-zA-Z])(${HASH})(?![0-9a-zA-Z])|(${JOINED})`, 'g');

/** The line read into runs of the rule's kinds, in order; empty for an empty line. */
export function longTextRuns(text: string): LongTextRun[] {
	const runs: LongTextRun[] = [];
	let at = 0;
	const push = (kind: LongTextRun['kind'], value: string) => {
		if (!value) return;
		const last = runs.at(-1);
		if (kind === 'text' && last?.kind === 'text') last.text += value;
		else runs.push({ kind, text: value });
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
