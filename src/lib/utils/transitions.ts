/**
 * Staggered slide+fade transitions: the slot opens/closes and the content
 * fades on its own offset, so the two phases read distinctly. Without the
 * stagger the height growth/shrink visually swallows the opacity change.
 *
 * Usage:
 *   <div transition:slideFadeIn={{ duration: 180 }}>...</div>
 *   <div out:slideFadeOut>...</div>
 */

type SlideFadeProgress = (t: number) => { slideT: number; fadeT: number };

function finiteNumber(value: string | number, fallback = 0): number {
	const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function unitInterval(value: number): number {
	return Math.max(0, Math.min(1, finiteNumber(value)));
}

function transitionDuration(value: number | undefined, fallback: number): number {
	if (value === undefined) return fallback;
	return Math.max(0, finiteNumber(value, fallback));
}

function makeSlideFade(node: Element, getProgress: SlideFadeProgress, total: number) {
	const style = getComputedStyle(node);
	const opacity = finiteNumber(style.opacity, 1);
	const paddingTop = finiteNumber(style.paddingTop);
	const paddingBottom = finiteNumber(style.paddingBottom);
	const marginTop = finiteNumber(style.marginTop);
	const marginBottom = finiteNumber(style.marginBottom);
	const borderTopWidth = finiteNumber(style.borderTopWidth);
	const borderBottomWidth = finiteNumber(style.borderBottomWidth);
	const measuredHeight = Math.max(
		0,
		finiteNumber(node.getBoundingClientRect().height) -
			paddingTop -
			paddingBottom -
			borderTopWidth -
			borderBottomWidth
	);
	const height = Math.max(0, finiteNumber(style.height, measuredHeight));
	return {
		duration: Math.max(0, finiteNumber(total)),
		easing: (x: number) => x,
		css: (t: number) => {
			const progress = getProgress(unitInterval(t));
			const slideT = unitInterval(progress.slideT);
			const fadeT = unitInterval(progress.fadeT);
			return (
				`overflow: hidden;` +
				`opacity: ${fadeT * opacity};` +
				`height: ${slideT * height}px;` +
				`padding-top: ${slideT * paddingTop}px;` +
				`padding-bottom: ${slideT * paddingBottom}px;` +
				`margin-top: ${slideT * marginTop}px;` +
				`margin-bottom: ${slideT * marginBottom}px;` +
				`border-top-width: ${slideT * borderTopWidth}px;` +
				`border-bottom-width: ${slideT * borderBottomWidth}px;`
			);
		}
	};
}

export function slideFadeIn(node: Element, params: { duration?: number } = {}) {
	const dur = transitionDuration(params.duration, 180);
	if (dur === 0) {
		return makeSlideFade(node, (t) => ({ slideT: t, fadeT: t }), 0);
	}
	const fadeDelay = 80;
	const fadeDur = dur + 30;
	const total = Math.max(dur, fadeDelay + fadeDur);
	return makeSlideFade(
		node,
		(t) => {
			const elapsed = t * total;
			return {
				slideT: Math.min(1, elapsed / dur),
				fadeT: Math.max(0, Math.min(1, (elapsed - fadeDelay) / fadeDur))
			};
		},
		total
	);
}

export function slideFadeOut(node: Element, params: { duration?: number } = {}) {
	const dur = transitionDuration(params.duration, 180);
	if (dur === 0) {
		return makeSlideFade(node, (t) => ({ slideT: t, fadeT: t }), 0);
	}
	const slideDelay = 50;
	const total = dur + slideDelay;
	return makeSlideFade(
		node,
		(t) => {
			const elapsed = (1 - t) * total;
			return {
				slideT: elapsed < slideDelay ? 1 : Math.max(0, 1 - (elapsed - slideDelay) / dur),
				fadeT: Math.max(0, 1 - elapsed / dur)
			};
		},
		total
	);
}
