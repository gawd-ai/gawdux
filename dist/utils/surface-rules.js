/**
 * The house surface rules as a source reads them, for the static guard each
 * library and each host runs over its own markup and styles.
 *
 * - No shadow inside the page. A surface that sits in the page (a card, a
 *   panel, a pane, a table's box, a tile, a drawer, a notice in the content)
 *   draws no shadow in light or dark. A shadow belongs only to what floats
 *   above the page and closes (a menu, a popover, a picker's list, a toast,
 *   the command palette), to the page's content surface and the command bar
 *   (one elevation, `--gawdux-surface-elevation`, drawn by tokens.css), and
 *   to a focus ring. A shadow is a `box-shadow` layer with a blur, or a
 *   Tailwind shadow utility; a layer with no blur (a ring, `0 0 0 2px`, or a
 *   hard line, `0 1px 0 0`) is an edge, as a border is, and is not one.
 *   `surfaceShadows` lists every shadow a source writes, so a guard holds
 *   each file to an allow-list of the floating ones it names.
 * - One inset on all four sides. The content inset of an inset host is one
 *   value, `--gawdux-page-inset`, owned by Gawdux's inset hosts
 *   (`.scroll-surface`, `.page-inset`, `EditablePageScaffold`'s body,
 *   `MasterDetailShell`'s frame, `TabFillPanel scroll`); `insetOverrides`
 *   lists every place a source reads or sets that knob or writes the frame's
 *   fill-height calc, so a guard holds them to the owners.
 */
/** A source with its comments removed, so prose about a shadow is not one. */
export function withoutComments(source) {
    return source
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:\\'"`])\/\/[^\n]*/g, '$1');
}
/**
 * Tailwind's shadow utilities as a class list writes them, with any variant
 * (`hover:shadow-md`, `dark:shadow-lg`, `!shadow-sm`, `shadow-[0_1px_2px]`,
 * `drop-shadow-sm`, the bare `shadow`), never `shadow-none`.
 */
const SHADOW_UTILITY = /(?<=^|[\s"'`{(,])(?:[\w@[\]&>:-]+:)?!?(?:drop-)?shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner|\[[^\]\s]+\]))?(?=$|[\s"'`};),])/gm;
/** A `box-shadow` declaration, its value up to the end of the declaration. */
const SHADOW_DECLARATION = /box-shadow\s*:\s*([^;}]*)/g;
const DROP_SHADOW_FILTER = /filter\s*:[^;}]*drop-shadow\(/g;
/** The value's layers, split on the commas outside any parentheses. */
function layers(value) {
    const out = [];
    let depth = 0;
    let current = '';
    for (const char of value) {
        if (char === '(')
            depth++;
        else if (char === ')')
            depth--;
        if (char === ',' && depth === 0) {
            out.push(current);
            current = '';
        }
        else
            current += char;
    }
    out.push(current);
    return out.map((layer) => layer.trim()).filter(Boolean);
}
/**
 * Whether a `box-shadow` value draws a shadow: a layer with a blur, or a
 * value the source cannot read (a custom property), never `none` or a ring
 * or a hard line (every layer's blur zero).
 */
function drawsShadow(value) {
    // A template's interpolation stands where a colour does (`${accent}`).
    const bare = value
        .replace(/!important/g, '')
        .replace(/\$\{[^}]*\}?/g, ' ')
        .trim();
    if (/^(none|0 0 #0000|initial|unset|inherit)$/.test(bare))
        return false;
    return layers(bare).some((layer) => {
        // A custom property stands for a colour after the lengths; a layer
        // that is a custom property alone is an elevation the source cannot
        // read, and is counted as a shadow.
        if (/^var\(/.test(layer))
            return true;
        const lengths = layer
            .replace(/var\((?:[^()]|\([^()]*\))*\)/g, ' ')
            .replace(/\b(?:rgba?|hsla?|oklch|color-mix)\([^)]*\)/g, ' ')
            .replace(/#[0-9a-f]{3,8}\b/gi, ' ')
            .replace(/\binset\b/g, ' ')
            .match(/-?\d*\.?\d+(?:px|rem|em)?/g);
        const blur = lengths?.[2];
        return blur !== undefined && parseFloat(blur) !== 0;
    });
}
/** Every shadow the source writes, as written, comments excluded. */
export function surfaceShadows(source) {
    const code = withoutComments(source);
    const found = [];
    for (const match of code.matchAll(SHADOW_UTILITY))
        found.push(match[0]);
    for (const match of code.matchAll(SHADOW_DECLARATION))
        if (drawsShadow(match[1]))
            found.push(`box-shadow: ${match[1].trim().replace(/\s+/g, ' ')}`);
    for (const match of code.matchAll(DROP_SHADOW_FILTER))
        found.push(match[0].trim());
    return found;
}
/** Flowbite components that draw a shadow of their own on an in-page surface. */
const SHADOWED_FLOWBITE = /import\s*\{[^}]*\b(Card)\b[^}]*\}\s*from\s*['"]flowbite-svelte['"]/g;
/** Every in-page Flowbite component the source imports that hard-codes a shadow. */
export function shadowedFlowbiteImports(source) {
    return [...withoutComments(source).matchAll(SHADOWED_FLOWBITE)].map((match) => match[1]);
}
/**
 * Every place the source reads or sets the content inset's knob, writes a
 * separate bottom inset, or writes the frame's fill-height calc.
 */
export function insetOverrides(source) {
    const code = withoutComments(source);
    return [
        ...code.matchAll(/--gawdux-page-inset(?:-bottom)?\b/g),
        ...code.matchAll(/(?:height\s*:\s*|h-\[)calc\(\s*100%\s*\+/g)
    ].map((match) => match[0]);
}
