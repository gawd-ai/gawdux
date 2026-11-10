/**
 * Anything that scrolls sideways says so, one way: the edge where more of it
 * lies fades out. `scrollEdges` reads a strip's scroll position against its
 * width and its content's, and marks the strip `data-scroll-fade` with the
 * side or sides where more lies (`start`, `end` or `both`), no mark while it
 * all shows; `.gawdux-scroll-fade` (tokens.css) draws the fade as the strip's
 * own mask, so nothing is drawn over the strip and no label is covered. The
 * same rule serves a tab strip, a row of filter pills and a drawing that
 * scrolls in its box.
 */
/** Where more of a strip lies beyond what it shows: before, after, both, or nowhere. */
export type ScrollFade = 'start' | 'end' | 'both' | null;
/** The fade a strip shows at its scroll position, a pixel's slack either side. */
export declare function scrollFadeOf(box: {
    scrollLeft: number;
    scrollWidth: number;
    clientWidth: number;
}): ScrollFade;
/**
 * Marks `node` with the fade its scroll position calls for and keeps the mark
 * as it scrolls, resizes, or gains and loses content.
 */
export declare function scrollEdges(node: HTMLElement): {
    destroy(): void;
};
