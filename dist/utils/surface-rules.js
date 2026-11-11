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
 *   `MasterDetailShell`'s frame, `TabFillPanel scroll`, and `FilterBar`, the
 *   toolbar at the top of a list's surface); `insetOverrides` lists every
 *   place a source reads or sets that knob or writes the frame's fill-height
 *   calc, so a guard holds them to the owners.
 * - Light and dark draw the same lines. A theme changes an edge's colour,
 *   never whether it is drawn: an edge (a border, a ring or the line
 *   between a list's rows) that a class list draws in light in a colour of
 *   its own is, in dark, neither transparent, nor of no width or style, nor
 *   the colour of the dark surface it is drawn on (the card surface, which
 *   the page's content surface draws too, unless the markup states another).
 *   `vanishingDarkEdges` lists every such edge, so a guard holds a source to
 *   none.
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
const VOID_ELEMENTS = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'source',
    'track',
    'wbr'
]);
/** The tags of a component's markup, in order; an expression's `>` is not a tag's end. */
function markupTags(markup) {
    const tags = [];
    let i = 0;
    while (i < markup.length) {
        const lt = markup.indexOf('<', i);
        if (lt < 0)
            break;
        if (markup.startsWith('<!--', lt)) {
            const end = markup.indexOf('-->', lt);
            i = end < 0 ? markup.length : end + 3;
            continue;
        }
        if (!/[A-Za-z/]/.test(markup[lt + 1] ?? '')) {
            i = lt + 1;
            continue;
        }
        let j = lt + 1;
        let depth = 0;
        let quote = null;
        for (; j < markup.length; j++) {
            const char = markup[j];
            if (quote) {
                if (char === quote)
                    quote = null;
                continue;
            }
            if (depth === 0 && (char === '"' || char === "'"))
                quote = char;
            else if (char === '{')
                depth++;
            else if (char === '}')
                depth--;
            else if (char === '>' && depth === 0)
                break;
        }
        const raw = markup.slice(lt, j + 1);
        const name = raw.match(/^<\/?([A-Za-z][\w:.-]*)/)?.[1];
        if (name)
            tags.push({
                name,
                raw,
                close: raw.startsWith('</'),
                selfClosing: raw.endsWith('/>') || VOID_ELEMENTS.has(name.toLowerCase()),
                at: lt
            });
        i = j + 1;
    }
    return tags;
}
/**
 * An edge utility and its theme: `border`, a side (`border-t`, `border-x`),
 * the line between a list's rows (`divide`, `divide-y`) or a ring (`ring`),
 * with its colour, its width (`border-0`, `ring-0`) or its style
 * (`border-none`), light or `dark:`.
 */
const EDGE_UTILITY = /(?<![\w:/[-])(dark:)?(border(?:-[trblxyse])?|divide(?:-[xy])?|ring)-((?:[a-z]+-\d{2,3}|white|black|transparent|current|inherit)(?:\/\d+)?|0|none)(?![\w/-])/g;
const DARK_BACKGROUND = /(?<![\w:/[-])dark:bg-([a-z]+-\d{2,3}|white|black)(?![\w/-])/;
/**
 * The dark card surface, `--gawdux-surface-card`. The page's content surface
 * draws it too (`.page-tabs-shell`, `.table-container`, a list's surface), so
 * it is the surface an element is drawn on wherever its own file states none:
 * `--gawdux-surface`, gray-900, is the shell's background around the content
 * surface, never the surface of a component in the page.
 */
const DARK_CARD_SURFACE = 'gray-800';
function edgeThemes(classList) {
    const light = new Map();
    const dark = new Map();
    for (const match of classList.matchAll(EDGE_UTILITY)) {
        const [, isDark, property, value] = match;
        const key = property.startsWith('divide') ? 'divide' : property;
        const themes = isDark ? dark : light;
        const theme = themes.get(key) ?? {};
        if (value === '0' || value === 'none')
            theme.none = true;
        else
            theme.colour = value.replace(/\/\d+$/, '');
        themes.set(key, theme);
    }
    return { light, dark };
}
/** Whether a light edge is drawn in a colour of its own, not the light surface's or none. */
function drawsInLight(theme) {
    return Boolean(theme?.colour && !theme.none && !/^(white|transparent|current|inherit)$/.test(theme.colour));
}
/**
 * Every edge the source draws in light and not in dark: transparent, of no
 * width or style, or the colour of the dark surface it is drawn on. A
 * component's markup is read element by element: an element's surface in
 * dark is its own `dark:bg-*`, else its nearest enclosing element's, a
 * Gawdux card (`CardContainer`, `.card-container`) being the card surface,
 * else the page's content surface, which in dark is the card surface too. A
 * border or a ring is drawn on the surface around its element; the line
 * between a list's rows on the list's own. Any other
 * source (a module's class strings, `file` not a `.svelte` file) is read for
 * the edges a theme removes.
 */
export function vanishingDarkEdges(source, file = 'Component.svelte') {
    // Comments blanked in place, so a line the guard names is the source's line.
    const code = source
        .replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
        .replace(/(^|[^:\\'"`])\/\/[^\n]*/g, (line, lead) => lead + ' '.repeat(line.length - lead.length));
    const found = [];
    const lineOf = (at) => code.slice(0, at).split('\n').length;
    const report = (key, dark, light, surface, at) => found.push(`${key}-${light.colour} is dark:${key}-${dark.none ? 'none' : dark.colour} on ${surface} (line ${lineOf(at)})`);
    if (!file.endsWith('.svelte')) {
        for (const match of code.matchAll(/(["'`])([^"'`\n]*?)\1/g)) {
            const { light, dark } = edgeThemes(match[2]);
            for (const [key, theme] of dark) {
                const lit = light.get(key) ?? (key.startsWith('border-') ? light.get('border') : undefined);
                if (!drawsInLight(lit))
                    continue;
                if (theme.none || theme.colour === 'transparent')
                    report(key, theme, lit, 'any surface', match.index);
            }
        }
        return found;
    }
    const blank = (text) => text.replace(/[^\n]/g, ' ');
    const markup = code
        .replace(/<script[\s\S]*?<\/script>/g, blank)
        .replace(/<style[\s\S]*?<\/style>/g, blank);
    const open = [];
    for (const tag of markupTags(markup)) {
        if (tag.close) {
            const at = open.map((entry) => entry.name).lastIndexOf(tag.name);
            if (at >= 0)
                open.length = at;
            continue;
        }
        let own = null;
        if (tag.name === 'CardContainer' || /\bcard-container\b/.test(tag.raw))
            own = DARK_CARD_SURFACE;
        const background = tag.raw.match(DARK_BACKGROUND)?.[1];
        if (background)
            own = background;
        const around = [...open].reverse().find((entry) => entry.surface)?.surface ?? DARK_CARD_SURFACE;
        const { light, dark } = edgeThemes(tag.raw);
        for (const [key, theme] of dark) {
            const lit = light.get(key) ?? (key.startsWith('border-') ? light.get('border') : undefined);
            if (!drawsInLight(lit))
                continue;
            const surface = key === 'divide' ? (own ?? around) : around;
            if (theme.none || theme.colour === 'transparent' || theme.colour === surface)
                report(key, theme, lit, surface, tag.at);
        }
        if (!tag.selfClosing)
            open.push({ name: tag.name, surface: own });
    }
    return found;
}
