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
export function scrollFadeOf(box: {
	scrollLeft: number;
	scrollWidth: number;
	clientWidth: number;
}): ScrollFade {
	const range = box.scrollWidth - box.clientWidth;
	if (range <= 1) return null;
	// A right-to-left strip reads its offset from its right edge, negative.
	const offset = Math.abs(box.scrollLeft);
	const before = offset > 1;
	const after = offset < range - 1;
	if (before && after) return 'both';
	if (before) return 'start';
	if (after) return 'end';
	return null;
}

/**
 * Marks `node` with the fade its scroll position calls for and keeps the mark
 * as it scrolls, resizes, or gains and loses content.
 */
export function scrollEdges(node: HTMLElement): { destroy(): void } {
	node.classList.add('gawdux-scroll-fade');
	const update = () => {
		const fade = scrollFadeOf(node);
		if (fade) node.dataset['scrollFade'] = fade;
		else delete node.dataset['scrollFade'];
	};
	const sized = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
	const observeChildren = () => {
		if (!sized) return;
		sized.disconnect();
		sized.observe(node);
		for (const child of Array.from(node.children)) sized.observe(child);
	};
	const changed =
		typeof MutationObserver === 'undefined'
			? null
			: new MutationObserver(() => {
					observeChildren();
					update();
				});
	node.addEventListener('scroll', update, { passive: true });
	observeChildren();
	changed?.observe(node, { childList: true });
	update();
	return {
		destroy() {
			node.removeEventListener('scroll', update);
			sized?.disconnect();
			changed?.disconnect();
			node.classList.remove('gawdux-scroll-fade');
			delete node.dataset['scrollFade'];
		}
	};
}
