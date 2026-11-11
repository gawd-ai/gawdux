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
 * - One icon size in a header. An icon a control shows in a header (a pane
 *   header's item icon and leading control, its icon buttons, the lock
 *   beside its status) is the house icon (`.gawdux-icon`,
 *   `--gawdux-icon-size`); `handSizedIcons` lists every icon a source sizes
 *   itself, so a guard holds a header's files to none.
 * - A rail row is Gawdux's. `RailRowButton` owns the row's layout (the icon
 *   on the title line, the meta line under it at the row's edge); a host
 *   passes its title, meta, icon and trailing marks and draws no row of its
 *   own. `handRolledRailRows` lists every row a source draws itself.
 * - One padding inside a card. A card's text stands one padding in from
 *   its edge (`--gawdux-card-padding`, CardContainer, `.card-header`,
 *   `.card-content`); a host sets no card padding of its own, and a box
 *   nested in a card adds only its own row padding, never a second indent
 *   of the card's size. `handSetCardPadding` lists every bordered, rounded
 *   box a source pads at the card's size or more.
 * - A register reads on a phone. Every register's table turns its rows into
 *   labelled cards at or below the compact width (tokens.css "A register on
 *   a phone"); each body cell names its column (`data-label`) or its place
 *   in the card (`data-card`). `unlabelledRegisterCells` lists every body
 *   cell of a register that does neither.
 */

/** A source with its comments removed, so prose about a shadow is not one. */
export function withoutComments(source: string): string {
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
const SHADOW_UTILITY =
	/(?<=^|[\s"'`{(,])(?:[\w@[\]&>:-]+:)?!?(?:drop-)?shadow(?:-(?:2xs|xs|sm|md|lg|xl|2xl|inner|\[[^\]\s]+\]))?(?=$|[\s"'`};),])/gm;

/** A `box-shadow` declaration, its value up to the end of the declaration. */
const SHADOW_DECLARATION = /box-shadow\s*:\s*([^;}]*)/g;
const DROP_SHADOW_FILTER = /filter\s*:[^;}]*drop-shadow\(/g;

/** The value's layers, split on the commas outside any parentheses. */
function layers(value: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let current = '';
	for (const char of value) {
		if (char === '(') depth++;
		else if (char === ')') depth--;
		if (char === ',' && depth === 0) {
			out.push(current);
			current = '';
		} else current += char;
	}
	out.push(current);
	return out.map((layer) => layer.trim()).filter(Boolean);
}

/**
 * Whether a `box-shadow` value draws a shadow: a layer with a blur, or a
 * value the source cannot read (a custom property), never `none` or a ring
 * or a hard line (every layer's blur zero).
 */
function drawsShadow(value: string): boolean {
	// A template's interpolation stands where a colour does (`${accent}`).
	const bare = value
		.replace(/!important/g, '')
		.replace(/\$\{[^}]*\}?/g, ' ')
		.trim();
	if (/^(none|0 0 #0000|initial|unset|inherit)$/.test(bare)) return false;
	return layers(bare).some((layer) => {
		// A custom property stands for a colour after the lengths; a layer
		// that is a custom property alone is an elevation the source cannot
		// read, and is counted as a shadow.
		if (/^var\(/.test(layer)) return true;
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
export function surfaceShadows(source: string): string[] {
	const code = withoutComments(source);
	const found: string[] = [];
	for (const match of code.matchAll(SHADOW_UTILITY)) found.push(match[0]);
	for (const match of code.matchAll(SHADOW_DECLARATION))
		if (drawsShadow(match[1]!)) found.push(`box-shadow: ${match[1]!.trim().replace(/\s+/g, ' ')}`);
	for (const match of code.matchAll(DROP_SHADOW_FILTER)) found.push(match[0].trim());
	return found;
}

/** Flowbite components that draw a shadow of their own on an in-page surface. */
const SHADOWED_FLOWBITE = /import\s*\{[^}]*\b(Card)\b[^}]*\}\s*from\s*['"]flowbite-svelte['"]/g;

/** Every in-page Flowbite component the source imports that hard-codes a shadow. */
export function shadowedFlowbiteImports(source: string): string[] {
	return [...withoutComments(source).matchAll(SHADOWED_FLOWBITE)].map((match) => match[1]!);
}

/**
 * Every place the source reads or sets the content inset's knob, writes a
 * separate bottom inset, or writes the frame's fill-height calc.
 */
export function insetOverrides(source: string): string[] {
	const code = withoutComments(source);
	return [
		...code.matchAll(/--gawdux-page-inset(?:-bottom)?\b/g),
		...code.matchAll(/(?:height\s*:\s*|h-\[)calc\(\s*100%\s*\+/g)
	].map((match) => match[0]);
}

/** A markup tag as the source writes it, braces and quotes read through. */
interface Tag {
	name: string;
	raw: string;
	close: boolean;
	selfClosing: boolean;
	at: number;
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
function markupTags(markup: string): Tag[] {
	const tags: Tag[] = [];
	let i = 0;
	while (i < markup.length) {
		const lt = markup.indexOf('<', i);
		if (lt < 0) break;
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
		let quote: string | null = null;
		for (; j < markup.length; j++) {
			const char = markup[j]!;
			if (quote) {
				if (char === quote) quote = null;
				continue;
			}
			if (depth === 0 && (char === '"' || char === "'")) quote = char;
			else if (char === '{') depth++;
			else if (char === '}') depth--;
			else if (char === '>' && depth === 0) break;
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
const EDGE_UTILITY =
	/(?<![\w:/[-])(dark:)?(border(?:-[trblxyse])?|divide(?:-[xy])?|ring)-((?:[a-z]+-\d{2,3}|white|black|transparent|current|inherit)(?:\/\d+)?|0|none)(?![\w/-])/g;
const DARK_BACKGROUND = /(?<![\w:/[-])dark:bg-([a-z]+-\d{2,3}|white|black)(?![\w/-])/;

/**
 * The dark card surface, `--gawdux-surface-card`. The page's content surface
 * draws it too (`.page-tabs-shell`, `.table-container`, a list's surface), so
 * it is the surface an element is drawn on wherever its own file states none:
 * `--gawdux-surface`, gray-900, is the shell's background around the content
 * surface, never the surface of a component in the page.
 */
const DARK_CARD_SURFACE = 'gray-800';

type EdgeKey = string;

/** An edge's colour, width and style as one theme of a class list writes them. */
interface EdgeTheme {
	colour?: string;
	none?: boolean;
}

function edgeThemes(classList: string): { light: Map<EdgeKey, EdgeTheme>; dark: Map<EdgeKey, EdgeTheme> } {
	const light = new Map<EdgeKey, EdgeTheme>();
	const dark = new Map<EdgeKey, EdgeTheme>();
	for (const match of classList.matchAll(EDGE_UTILITY)) {
		const [, isDark, property, value] = match;
		const key = property!.startsWith('divide') ? 'divide' : property!;
		const themes = isDark ? dark : light;
		const theme = themes.get(key) ?? {};
		if (value === '0' || value === 'none') theme.none = true;
		else theme.colour = value!.replace(/\/\d+$/, '');
		themes.set(key, theme);
	}
	return { light, dark };
}

/** Whether a light edge is drawn in a colour of its own, not the light surface's or none. */
function drawsInLight(theme: EdgeTheme | undefined): boolean {
	return Boolean(
		theme?.colour && !theme.none && !/^(white|transparent|current|inherit)$/.test(theme.colour)
	);
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
export function vanishingDarkEdges(source: string, file = 'Component.svelte'): string[] {
	// Comments blanked in place, so a line the guard names is the source's line.
	const code = source
		.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
		.replace(/(^|[^:\\'"`])\/\/[^\n]*/g, (line, lead: string) => lead + ' '.repeat(line.length - lead.length));
	const found: string[] = [];
	const lineOf = (at: number) => code.slice(0, at).split('\n').length;
	const report = (key: EdgeKey, dark: EdgeTheme, light: EdgeTheme, surface: string, at: number) =>
		found.push(
			`${key}-${light.colour} is dark:${key}-${dark.none ? 'none' : dark.colour} on ${surface} (line ${lineOf(at)})`
		);
	if (!file.endsWith('.svelte')) {
		for (const match of code.matchAll(/(["'`])([^"'`\n]*?)\1/g)) {
			const { light, dark } = edgeThemes(match[2]!);
			for (const [key, theme] of dark) {
				const lit = light.get(key) ?? (key.startsWith('border-') ? light.get('border') : undefined);
				if (!drawsInLight(lit)) continue;
				if (theme.none || theme.colour === 'transparent')
					report(key, theme, lit!, 'any surface', match.index!);
			}
		}
		return found;
	}
	const blank = (text: string) => text.replace(/[^\n]/g, ' ');
	const markup = code
		.replace(/<script[\s\S]*?<\/script>/g, blank)
		.replace(/<style[\s\S]*?<\/style>/g, blank);
	const open: { name: string; surface: string | null }[] = [];
	for (const tag of markupTags(markup)) {
		if (tag.close) {
			const at = open.map((entry) => entry.name).lastIndexOf(tag.name);
			if (at >= 0) open.length = at;
			continue;
		}
		let own: string | null = null;
		if (tag.name === 'CardContainer' || /\bcard-container\b/.test(tag.raw)) own = DARK_CARD_SURFACE;
		const background = tag.raw.match(DARK_BACKGROUND)?.[1];
		if (background) own = background;
		const around = [...open].reverse().find((entry) => entry.surface)?.surface ?? DARK_CARD_SURFACE;
		const { light, dark } = edgeThemes(tag.raw);
		for (const [key, theme] of dark) {
			const lit = light.get(key) ?? (key.startsWith('border-') ? light.get('border') : undefined);
			if (!drawsInLight(lit)) continue;
			const surface = key === 'divide' ? (own ?? around) : around;
			if (theme.none || theme.colour === 'transparent' || theme.colour === surface)
				report(key, theme, lit!, surface, tag.at);
		}
		if (!tag.selfClosing) open.push({ name: tag.name, surface: own });
	}
	return found;
}

/** A source's markup, its script and style blanked in place so lines keep their numbers. */
function markupOf(source: string): string {
	const blank = (text: string) => text.replace(/[^\n]/g, ' ');
	return source
		.replace(/<!--[\s\S]*?-->/g, blank)
		.replace(/<script[\s\S]*?<\/script>/g, blank)
		.replace(/<style[\s\S]*?<\/style>/g, blank);
}

function lineAt(text: string, at: number): number {
	return text.slice(0, at).split('\n').length;
}

/** An icon component (flowbite's `*Outline`, `*Solid`, a host's `Icon`) or an inline svg. */
const ICON_TAG = /^(?:[A-Z]\w*(?:Outline|Solid)|[A-Z]\w*Icon|Icon|svg)$/;
/** A size utility as a class list writes it: `h-4`, `w-3.5`, `size-5`, `h-[18px]`, with any variant. */
const SIZE_UTILITY = /(?<![\w:/[-])(?:[\w@[\]-]+:)*!?(?:h|w|size)-(?:\d+(?:\.\d+)?|\[[^\]\s]+\])(?![\w./-])/g;

/**
 * Every icon the source sizes itself (`h-4 w-4` on an icon component or an
 * inline svg), where the house icon (`.gawdux-icon`) is the size.
 */
export function handSizedIcons(source: string): string[] {
	const markup = markupOf(source);
	const found: string[] = [];
	for (const tag of markupTags(markup)) {
		if (tag.close || !ICON_TAG.test(tag.name)) continue;
		const classText = tag.raw.match(/\bclass=(?:"([^"]*)"|\{([\s\S]*)\})/);
		if (!classText) continue;
		const sizes = [...(classText[1] ?? classText[2] ?? '').matchAll(SIZE_UTILITY)].map((m) => m[0]);
		if (sizes.length > 0) found.push(`${tag.name} ${sizes.join(' ')} (line ${lineAt(markup, tag.at)})`);
	}
	return found;
}

/**
 * Every rail row the source draws itself: a `RailRowButton` with no `title`,
 * or holding content of its own beyond its snippets (`meta`, `leading`,
 * `trailing`).
 */
export function handRolledRailRows(source: string): string[] {
	const markup = markupOf(source);
	const found: string[] = [];
	const tags = markupTags(markup);
	tags.forEach((tag, index) => {
		if (tag.close || tag.name !== 'RailRowButton') return;
		const line = lineAt(markup, tag.at);
		if (!/\stitle=/.test(tag.raw)) found.push(`RailRowButton with no title (line ${line})`);
		if (tag.selfClosing) return;
		let depth = 0;
		let end = -1;
		for (const next of tags.slice(index + 1)) {
			if (next.name !== 'RailRowButton') continue;
			if (!next.close) depth++;
			else if (depth === 0) {
				end = next.at;
				break;
			} else depth--;
		}
		if (end < 0) return;
		const inner = markup
			.slice(tag.at + tag.raw.length, end)
			.replace(/\{#snippet\s+(?:meta|leading|trailing)\s*\([^)]*\)\s*\}[\s\S]*?\{\/snippet\}/g, '')
			.trim();
		if (inner) found.push(`RailRowButton drawing its own row (line ${line})`);
	});
	return found;
}

const CARD_HOSTS = new Set([
	'div',
	'section',
	'article',
	'aside',
	'li',
	'ul',
	'ol',
	'form',
	'fieldset',
	'header',
	'footer',
	'details',
	'dl',
	'nav',
	'figure',
	'label'
]);
const ROUNDED = /(?<![\w:/[-])rounded(?:-(?:md|lg|xl|2xl|3xl))?(?![\w/-])/;
const BOX_EDGE = /(?<![\w:/[-])border(?:-[0-9])?(?![\w/-])/;
const CARD_PAD = /(?<![\w/[-])(?:(?:sm|md|lg|xl|2xl|min-\[[^\]]+\]|max-\[[^\]]+\]):)?(?:p|px)-(?:[4-9]|1[0-2])(?![\w./-])/g;

/**
 * Every bordered, rounded box the source pads at a card's size or more
 * (`p-4` to `p-12`, `px-4` to `px-12`, with a width's variant), and every
 * box inside a card (CardContainer, `.card-container`, or such a box) that
 * pads itself at that size: a card takes the card padding from Gawdux
 * (CardContainer, `.card-header`, `.card-content`), and a box nested in a
 * card adds only its own row padding, never a second indent of the card's
 * size. Read element by element, each class string of a tag (a ternary's
 * branches) on its own.
 */
export function handSetCardPadding(source: string): string[] {
	const markup = markupOf(source);
	const found: string[] = [];
	const open: { name: string; card: boolean }[] = [];
	for (const tag of markupTags(markup)) {
		if (tag.close) {
			const at = open.map((entry) => entry.name).lastIndexOf(tag.name);
			if (at >= 0) open.length = at;
			continue;
		}
		const attr = tag.raw.match(/\bclass(?:Name)?=(?:"([^"]*)"|\{([\s\S]*)\})/);
		const lists = !attr
			? []
			: attr[1] !== undefined
				? [attr[1]]
				: [...(attr[2] ?? '').matchAll(/(["'`])([\s\S]*?)\1/g)].map((m) => m[2]!);
		const whole = lists.join(' ');
		const boxed = ROUNDED.test(whole) && BOX_EDGE.test(whole);
		const card = tag.name === 'CardContainer' || /\bcard-container\b/.test(whole) || boxed;
		const inCard = open.some((entry) => entry.card);
		if (CARD_HOSTS.has(tag.name) && (boxed || inCard)) {
			for (const list of [...lists, whole]) {
				const pads = [...list.matchAll(CARD_PAD)].map((m) => m[0]);
				if (pads.length > 0) {
					found.push(
						`${tag.name} ${pads.join(' ')}${boxed ? '' : ' inside a card'} (line ${lineAt(markup, tag.at)})`
					);
					break;
				}
			}
		}
		if (!tag.selfClosing) open.push({ name: tag.name, card });
	}
	return found;
}

/**
 * Every body cell of a register (a component drawing a `ListSurface`, a
 * `ListPageScaffold` or a list's scroller of its own, `.list-table-scroll`)
 * that names neither its column (`data-label`) nor its place in the card
 * (`data-card`), and spans no columns (an empty row).
 */
export function unlabelledRegisterCells(source: string): string[] {
	const markup = markupOf(source);
	if (!/<(?:ListSurface|ListPageScaffold)\b|\blist-table-scroll\b/.test(markup)) return [];
	const found: string[] = [];
	for (const tag of markupTags(markup)) {
		if (tag.close || (tag.name !== 'TableBodyCell' && tag.name !== 'td')) continue;
		if (/\s(?:data-label|data-card|colspan)\b/.test(tag.raw)) continue;
		found.push(`${tag.name} (line ${lineAt(markup, tag.at)})`);
	}
	return found;
}
