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
export type LongTextRun = {
    kind: 'text' | 'whole' | 'hash';
    text: string;
};
/** The line read into runs of the rule's kinds, in order; empty for an empty line. */
export declare function longTextRuns(text: string): LongTextRun[];
