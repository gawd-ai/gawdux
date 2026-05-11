/**
 * Staggered slide+fade transitions: the slot opens/closes and the content
 * fades on its own offset, so the two phases read distinctly. Without the
 * stagger the height growth/shrink visually swallows the opacity change.
 *
 * Usage:
 *   <div transition:slideFadeIn={{ duration: 180 }}>...</div>
 *   <div out:slideFadeOut>...</div>
 */
export declare function slideFadeIn(node: Element, params?: {
    duration?: number;
}): {
    duration: number;
    easing: (x: number) => number;
    css: (t: number) => string;
};
export declare function slideFadeOut(node: Element, params?: {
    duration?: number;
}): {
    duration: number;
    easing: (x: number) => number;
    css: (t: number) => string;
};
