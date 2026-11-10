type $$ComponentProps = {
    text: string;
};
/**
 * A line of text drawn by the one rule for long values (`longTextRuns`): an
 * identifier and a moment never break inside themselves, a hash wraps inside
 * its own box at any character, the words around them wrap between words.
 * Each run is a span of its own (`.gawdux-long-text-whole`,
 * `.gawdux-long-text-hash`, tokens.css), so the line wraps between them and
 * copying it gives the text as written.
 */
declare const LongText: import("svelte").Component<$$ComponentProps, {}, "">;
type LongText = ReturnType<typeof LongText>;
export default LongText;
