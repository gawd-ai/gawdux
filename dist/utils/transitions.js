/**
 * Staggered slide+fade transitions: the slot opens/closes and the content
 * fades on its own offset, so the two phases read distinctly. Without the
 * stagger the height growth/shrink visually swallows the opacity change.
 *
 * Usage:
 *   <div transition:slideFadeIn={{ duration: 180 }}>...</div>
 *   <div out:slideFadeOut>...</div>
 */
function makeSlideFade(node, getProgress, total) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const height = parseFloat(style.height);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    const marginTop = parseFloat(style.marginTop);
    const marginBottom = parseFloat(style.marginBottom);
    const borderTopWidth = parseFloat(style.borderTopWidth);
    const borderBottomWidth = parseFloat(style.borderBottomWidth);
    return {
        duration: total,
        easing: (x) => x,
        css: (t) => {
            const { slideT, fadeT } = getProgress(t);
            return (`overflow: hidden;` +
                `opacity: ${fadeT * opacity};` +
                `height: ${slideT * height}px;` +
                `padding-top: ${slideT * paddingTop}px;` +
                `padding-bottom: ${slideT * paddingBottom}px;` +
                `margin-top: ${slideT * marginTop}px;` +
                `margin-bottom: ${slideT * marginBottom}px;` +
                `border-top-width: ${slideT * borderTopWidth}px;` +
                `border-bottom-width: ${slideT * borderBottomWidth}px;`);
        }
    };
}
export function slideFadeIn(node, params = {}) {
    const dur = params.duration ?? 180;
    const fadeDelay = 80;
    const fadeDur = dur + 30;
    const total = Math.max(dur, fadeDelay + fadeDur);
    return makeSlideFade(node, (t) => {
        const elapsed = t * total;
        return {
            slideT: Math.min(1, elapsed / dur),
            fadeT: Math.max(0, Math.min(1, (elapsed - fadeDelay) / fadeDur))
        };
    }, total);
}
export function slideFadeOut(node, params = {}) {
    const dur = params.duration ?? 180;
    const slideDelay = 50;
    const total = dur + slideDelay;
    return makeSlideFade(node, (t) => {
        const elapsed = (1 - t) * total;
        return {
            slideT: elapsed < slideDelay ? 1 : Math.max(0, 1 - (elapsed - slideDelay) / dur),
            fadeT: Math.max(0, 1 - elapsed / dur)
        };
    }, total);
}
