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
 * - One question in a confirmation. A confirmation's title asks once, naming
 *   the act and the item; the line under it gives only what follows, or is
 *   absent. `questioningConfirmations` lists every line under a title that is
 *   or opens with a question.
 * - One case for action labels. An action's label is sentence case, its
 *   acronyms, the host's proper nouns and an item's own name kept as they
 *   are. `miscasedActionLabels` lists every action label that is not.
 * - An item's acts sit in the command bar. An act on the selected item
 *   (delete, archive, retire) is a command bar action, never a button in its
 *   card; a row's own act in a list stays on its row. `itemActsInCards` lists
 *   every such button in a card or a master-detail page's detail.
 * - A phone sort on every sorted register. A register that sorts by its
 *   column heads gives its query bar the sort (`ListQueryBar`'s `sort`), the
 *   house phone sort at or below the compact width, where the heads are
 *   hidden. `registersWithoutPhoneSort` lists every register that does not,
 *   and every phone sort a host draws itself.
 * - The bar holds the open tab's acts. On a tabbed page every act in the
 *   command bar names its tab (`PageCommandBarCenter`'s `tab`, a scaffold
 *   act's `tab`), so it shows only while its tab is open and a tab with no
 *   act draws no bar. `untabbedBarActs` lists every act that names none.
 * - History is the last tab. `tabsAfterHistory` lists every tab drawn after
 *   History, a viewer's Versions among them.
 * - The state beside the title. A pane header draws its item's state 8px
 *   after its title (`PaneHeader`'s `status`), never among its controls;
 *   `statusAmongControls` lists every chip drawn among them.
 * - One count pill. What waits on the reader shows as Gawdux's counted-icon
 *   pill (`.gawdux-icon-count`) on the icon of its place (a tab, the bell, a
 *   chat view); `handDrawnIconCounts` lists every pill drawn by hand.
 * - One page frame. `PageFrame`, rendered once by the app shell, owns the
 *   page's panel and its seam with the command bar; a page's content stands
 *   in it and draws no page-level surface, panel or seam of its own.
 *   `pageSurfacesOutsideFrame` lists every retired page-surface convention
 *   (`.context-surface`, `.page-shell`), every frame part or fill marker a
 *   source writes itself (`page-frame*`, `page-fill`), every command bar a
 *   source draws by hand and every `<main>` of its own; `elevationReads`
 *   lists the rule of every read of the page's elevation token, so a guard
 *   holds it to the frame and the floating frames.
 * - One action pair in a drawer. A decision's Cancel and its act are
 *   `PageCommandBarPair`'s: one size for both, Cancel neutral and red only
 *   while cancelling would discard input. `handDrawnCancels` lists every
 *   Cancel a source draws in a drawer or the bar itself, and every Cancel it
 *   colours red.
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

/** What stands in a literal for a value it interpolates (an item's name, a count). */
const VALUE = '⁣';

/** A string literal of a source's code, its interpolations read as `VALUE`. */
interface CodeString {
	start: number;
	end: number;
	text: string;
}

interface CodeScan {
	code: string;
	strings: CodeString[];
	/** Each bracket's opening position to its closing one. */
	close: Map<number, number>;
}

/**
 * A source's code with everything else blanked in place: a module's whole
 * text, or a component's scripts and the expressions of its markup (a
 * block's keyword blanked, so `{/if}` reads as no regular expression).
 */
function codeView(source: string, file: string): string {
	if (!file.endsWith('.svelte')) return source;
	const out = source.replace(/[^\n]/g, ' ').split('');
	const keep = (from: number, to: number) => {
		for (let k = from; k < to; k++) out[k] = source[k]!;
	};
	const scripts = [...source.matchAll(/(<script\b[^>]*>)([\s\S]*?)<\/script>/g)];
	for (const match of scripts) keep(match.index! + match[1]!.length, match.index! + match[1]!.length + match[2]!.length);
	const markup = markupOf(source).replace(/<style[\s\S]*?<\/style>/g, (text) => text.replace(/[^\n]/g, ' '));
	let i = 0;
	while (i < markup.length) {
		const at = markup.indexOf('{', i);
		if (at < 0) break;
		let depth = 0;
		let quote: string | null = null;
		let j = at;
		for (; j < markup.length; j++) {
			const char = markup[j]!;
			if (quote) {
				if (char === '\\') j++;
				else if (char === quote) quote = null;
				continue;
			}
			if (char === '"' || char === "'" || char === '`') quote = char;
			else if (char === '{') depth++;
			else if (char === '}' && --depth === 0) break;
		}
		keep(at, j + 1);
		const block = markup.slice(at + 1).match(/^\s*([#:/@][a-z]+(?:\s+if\b)?)/);
		if (block) {
			const from = at + 1 + markup.slice(at + 1).indexOf(block[1]!);
			if (block[1]!.startsWith('/')) for (let k = at + 1; k < j; k++) out[k] = ' ';
			else for (let k = from; k < from + block[1]!.length; k++) out[k] = ' ';
		}
		i = j + 1;
	}
	return out.join('');
}

/** The string literals and bracket pairs of a code view, comments and regular expressions read through. */
function scanCode(code: string): CodeScan {
	const strings: CodeString[] = [];
	const close = new Map<number, number>();
	const readString = (at: number): number => {
		const quote = code[at]!;
		let j = at + 1;
		let text = '';
		while (j < code.length && code[j] !== quote) {
			if (quote !== '`' && code[j] === '\n') break;
			if (code[j] === '\\') {
				text += code[j + 1] ?? '';
				j += 2;
				continue;
			}
			if (quote === '`' && code[j] === '$' && code[j + 1] === '{') {
				j = scan(j + 2, true) + 1;
				text += VALUE;
				continue;
			}
			text += code[j];
			j++;
		}
		strings.push({ start: at, end: j + 1, text });
		return j + 1;
	};
	const readRegex = (at: number): number => {
		let j = at + 1;
		let inClass = false;
		for (; j < code.length && code[j] !== '\n'; j++) {
			const char = code[j];
			if (char === '\\') j++;
			else if (char === '[') inClass = true;
			else if (char === ']') inClass = false;
			else if (char === '/' && !inClass) return j + 1;
		}
		return j;
	};
	function scan(from: number, untilBrace: boolean): number {
		const opens: number[] = [];
		let prev = '';
		let j = from;
		while (j < code.length) {
			const char = code[j]!;
			if (char === '"' || char === "'" || char === '`') {
				j = readString(j);
				prev = 'a';
				continue;
			}
			if (char === '/' && code[j + 1] === '/') {
				const end = code.indexOf('\n', j);
				j = end < 0 ? code.length : end;
				continue;
			}
			if (char === '/' && code[j + 1] === '*') {
				const end = code.indexOf('*/', j + 2);
				j = end < 0 ? code.length : end + 2;
				continue;
			}
			if (char === '/' && (prev === '' || /[(,=:[!&|?{};]/.test(prev))) {
				j = readRegex(j);
				prev = 'a';
				continue;
			}
			if (char === '{' || char === '(' || char === '[') opens.push(j);
			else if (char === '}' || char === ')' || char === ']') {
				if (opens.length === 0) {
					if (untilBrace && char === '}') return j;
				} else close.set(opens.pop()!, j);
			}
			if (!/\s/.test(char)) prev = char;
			j++;
		}
		return j;
	}
	scan(0, false);
	strings.sort((a, b) => a.start - b.start);
	return { code, strings, close };
}

interface CodeProperty {
	key: string;
	at: number;
	valueStart: number;
	valueEnd: number;
}

/** An object literal's own properties (`key: value`, a shorthand `key` with no value), spreads left out. */
function objectProperties(scan: CodeScan, open: number): CodeProperty[] {
	const { code, close } = scan;
	const end = close.get(open) ?? code.length;
	const stringAt = new Map(scan.strings.map((token) => [token.start, token]));
	const properties: CodeProperty[] = [];
	let expectKey = true;
	let current: CodeProperty | null = null;
	let j = open + 1;
	while (j < end) {
		const char = code[j]!;
		if (/\s/.test(char)) {
			j++;
			continue;
		}
		if (expectKey) {
			expectKey = false;
			const ident = code.slice(j).match(/^([A-Za-z_$][\w$]*)\s*:(?!:)/);
			const shorthand = code.slice(j).match(/^([A-Za-z_$][\w$]*)\s*(?=[,}])/);
			const quoted = stringAt.get(j);
			if (shorthand) {
				current = null;
				properties.push({ key: shorthand[1]!, at: j, valueStart: j, valueEnd: j });
				j += shorthand[0].length;
				continue;
			}
			if (ident) {
				current = { key: ident[1]!, at: j, valueStart: j + ident[0].length, valueEnd: end };
				properties.push(current);
				j += ident[0].length;
				continue;
			}
			if (quoted && /^\s*:(?!:)/.test(code.slice(quoted.end))) {
				const colon = code.indexOf(':', quoted.end);
				current = { key: quoted.text, at: j, valueStart: colon + 1, valueEnd: end };
				properties.push(current);
				j = colon + 1;
				continue;
			}
			current = null;
		}
		const token = stringAt.get(j);
		if (token) {
			j = token.end;
			continue;
		}
		if (close.has(j)) {
			j = close.get(j)! + 1;
			continue;
		}
		if (char === ',') {
			if (current) current.valueEnd = j;
			current = null;
			expectKey = true;
		}
		j++;
	}
	return properties;
}

/** The string literals in a range of the code, those inside an interpolation included. */
function literalsIn(scan: CodeScan, from: number, to: number): CodeString[] {
	return scan.strings.filter((token) => token.start >= from && token.end <= to);
}

/** Every object literal of the code, as its properties. */
function codeObjects(scan: CodeScan): CodeProperty[][] {
	return [...scan.close.keys()]
		.filter((open) => scan.code[open] === '{')
		.map((open) => objectProperties(scan, open))
		.filter((properties) => properties.length > 0);
}

/** An attribute's value in a tag as its literals: a quoted value, or the strings of a braced one. */
function attributeLiterals(tag: Tag, name: string, scan: CodeScan): CodeString[] {
	const match = tag.raw.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|\\{)`));
	if (!match) return [];
	const at = tag.at + match.index! + match[0].length;
	if (match[1] !== undefined || match[2] !== undefined) {
		const text = match[1] ?? match[2]!;
		return [{ start: at - text.length - 1, end: at, text: text.replace(/\{[^}]*\}/g, VALUE) }];
	}
	const open = at - 1;
	return literalsIn(scan, open, (scan.close.get(open) ?? open) + 1);
}

/** Whether a line opens with a question: its first sentence ends in a question mark. */
function opensWithQuestion(text: string): boolean {
	const first = text.trim().match(/^[\s\S]*?([.?!])(?=\s|$)/);
	return first?.[1] === '?';
}

/**
 * Every confirmation whose line under its title asks a question. A
 * confirmation (a request or a tag carrying `confirmLabel`, or a discard
 * guard) asks once, in its title, naming the act and the item; the line under
 * it (`message`, or a host's `confirm`) gives only what follows, or is
 * absent.
 */
export function questioningConfirmations(source: string, file = 'Component.svelte'): string[] {
	const scan = scanCode(codeView(source, file));
	const found: string[] = [];
	const report = (token: CodeString) =>
		found.push(`"${token.text.replaceAll(VALUE, '…')}" (line ${lineAt(scan.code, token.start)})`);
	for (const properties of codeObjects(scan)) {
		if (!properties.some((property) => property.key === 'confirmLabel' || property.key === 'isDirty'))
			continue;
		for (const property of properties) {
			if (!['message', 'confirm', 'confirmMessage'].includes(property.key)) continue;
			for (const token of literalsIn(scan, property.valueStart, property.valueEnd))
				if (opensWithQuestion(token.text)) report(token);
		}
	}
	if (file.endsWith('.svelte'))
		for (const tag of markupTags(markupOf(source))) {
			if (tag.close || !/\sconfirmLabel=/.test(tag.raw)) continue;
			for (const token of attributeLiterals(tag, 'message', scan))
				if (opensWithQuestion(token.text)) report(token);
		}
	return found;
}

/**
 * The acronyms and initialisms an action's label keeps in capitals. A host
 * passes its own proper nouns (a product's name, the System) beside them.
 */
export const ACTION_LABEL_WORDS: readonly string[] = [
	'A4',
	'AI',
	'API',
	'CC',
	'COA',
	'CSV',
	'DM',
	'HTML',
	'I',
	'ID',
	'IQ',
	'JSON',
	'MFA',
	'OK',
	'OQ',
	'PDF',
	'PNG',
	'PQ',
	'QA',
	'QC',
	'SMS',
	'SOP',
	'SSO',
	'SVG',
	'TOTP',
	'URL',
	'UTC',
	'XML'
];

/** The keys and attributes that name an action's words wherever they stand. */
const ACTION_LABEL_KEYS = new Set([
	'confirmLabel',
	'busyLabel',
	'saveLabel',
	'saveAsDraftLabel',
	'restoreLabel',
	'submitLabel',
	'actionLabel',
	'cancelLabel',
	'retryLabel'
]);
/** The keys that make an object with a `label` an action. */
const ACTION_KEYS = new Set([
	'onClick',
	'onclick',
	'onSelect',
	'onselect',
	'execute',
	'actionId',
	'perform',
	'handler',
	'run'
]);
/** A command bar action's kinds (`LifecycleAction`). */
const LIFECYCLE_KINDS = new Set(['add', 'view', 'pdf', 'archive', 'status', 'custom']);
/** The elements whose words are an action's label. */
const ACTION_ELEMENTS = new Set(['Button', 'button', 'DropdownItem']);
/** The components whose `label` is an action's label. */
const ACTION_LABEL_COMPONENTS = new Set(['IconButton']);

/** The words of a label not in sentence case: a first word in lower case, a later one capitalised. */
function caseFaults(text: string, allowed: ReadonlySet<string>): string[] {
	// A single word in lower case is a key, a class or a token, never a label.
	// A glyph's letters (`x²`, `B`) are no words: a label holds a word of two letters.
	if (/^[a-z][\w-]*$/.test(text.trim()) || !/\p{L}{2}/u.test(text)) return [];
	const bare = text.replace(/“[^”]*”|‘[^’]*’|"[^"]*"/g, VALUE);
	const faults: string[] = [];
	let sentenceStart = true;
	for (const word of bare.split(/[\s/]+/)) {
		if (!word) continue;
		const ends = /[.:!?·|]$/.test(word) || /^[·|–—-]$/.test(word);
		// A word holding a value (an item's name, `v${version}`) is the value's.
		if (word.includes(VALUE)) {
			sentenceStart = ends;
			continue;
		}
		const core = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
		if (!core) {
			sentenceStart = ends || sentenceStart;
			continue;
		}
		const keeps = allowed.has(core) || allowed.has(core.replace(/s$/, ''));
		if (sentenceStart) {
			if (/^\p{Ll}/u.test(core) && !keeps) faults.push(core);
		} else if (/^\p{Lu}/u.test(core) && !keeps) faults.push(core);
		sentenceStart = ends;
	}
	return faults;
}

/** A Svelte element's words: its text and its expressions' strings, a block's branches each a label of its own. */
function elementLabels(markup: string, from: number, to: number, scan: CodeScan): string[] {
	const inner = markup.slice(from, to);
	const labels: string[] = [];
	let text = '';
	let i = 0;
	const flush = () => {
		if (text.trim()) labels.push(text.trim());
		text = '';
	};
	while (i < inner.length) {
		const char = inner[i]!;
		if (char === '<') {
			let end = i + 1;
			let depth = 0;
			let quote: string | null = null;
			for (; end < inner.length; end++) {
				const next = inner[end]!;
				if (quote) {
					if (next === quote) quote = null;
				} else if (depth === 0 && (next === '"' || next === "'")) quote = next;
				else if (next === '{') depth++;
				else if (next === '}') depth--;
				else if (next === '>' && depth === 0) break;
			}
			text += ' ';
			i = end + 1;
			continue;
		}
		if (char === '{') {
			const open = from + i;
			const closeAt = scan.close.get(open);
			const end = closeAt === undefined ? inner.length : closeAt - from + 1;
			const body = inner.slice(i + 1, end - 1);
			if (/^\s*[#:/@]/.test(markup.slice(open + 1, open + 4)) || /^\s*$/.test(body)) {
				flush();
			} else text += VALUE;
			for (const token of literalsIn(scan, open, from + end)) labels.push(token.text);
			i = end;
			continue;
		}
		text += char;
		i++;
	}
	flush();
	return labels.filter((label) => label.replaceAll(VALUE, '').trim());
}

/**
 * Every action's label not in sentence case. An action's label (a command
 * bar action, a confirmation's confirm, a button, a menu item, a prompt's or
 * an agent's action) capitalises its first word and writes the rest in lower
 * case, but for acronyms and initialisms (`ACTION_LABEL_WORDS`), the host's
 * proper nouns (`words`) and an item's own name (an interpolated value or a
 * quoted one). Read in a component's markup (a `Button`'s, a `button`'s and a
 * `DropdownItem`'s words, an `IconButton`'s `label`, a `confirmLabel`) and in
 * its code (an object with a `label` and a handler or a command bar kind, a
 * `confirmLabel` or another action's label key).
 */
export function miscasedActionLabels(
	source: string,
	options: { file?: string; words?: readonly string[] } = {}
): string[] {
	const file = options.file ?? 'Component.svelte';
	const allowed = new Set([...ACTION_LABEL_WORDS, ...(options.words ?? [])]);
	const scan = scanCode(codeView(source, file));
	const found = new Set<string>();
	const check = (text: string, at: number) => {
		const faults = caseFaults(text, allowed);
		if (faults.length > 0)
			found.add(`"${text.replaceAll(VALUE, '…').trim()}" (${faults.join(', ')}, line ${lineAt(scan.code, at)})`);
	};
	for (const properties of codeObjects(scan)) {
		const keys = new Set(properties.map((property) => property.key));
		const kind = properties.find((property) => property.key === 'kind');
		const kindValue = kind ? literalsIn(scan, kind.valueStart, kind.valueEnd)[0]?.text : undefined;
		const isAction = [...ACTION_KEYS].some((key) => keys.has(key)) || (kindValue !== undefined && LIFECYCLE_KINDS.has(kindValue));
		for (const property of properties) {
			if (!ACTION_LABEL_KEYS.has(property.key) && !(property.key === 'label' && isAction)) continue;
			for (const token of literalsIn(scan, property.valueStart, property.valueEnd)) check(token.text, token.start);
		}
	}
	if (file.endsWith('.svelte')) {
		const markup = markupOf(source);
		const tags = markupTags(markup);
		tags.forEach((tag, index) => {
			if (tag.close) return;
			for (const name of ACTION_LABEL_KEYS)
				for (const token of attributeLiterals(tag, name, scan)) check(token.text, token.start);
			if (ACTION_LABEL_COMPONENTS.has(tag.name))
				for (const token of attributeLiterals(tag, 'label', scan)) check(token.text, token.start);
			if (!ACTION_ELEMENTS.has(tag.name) || tag.selfClosing) return;
			let depth = 0;
			const end = tags.slice(index + 1).find((next) => {
				if (next.name !== tag.name) return false;
				if (!next.close) {
					if (!next.selfClosing) depth++;
					return false;
				}
				return depth-- === 0;
			});
			if (!end) return;
			for (const label of elementLabels(markup, tag.at + tag.raw.length, end.at, scan)) check(label, tag.at);
		});
	}
	return [...found];
}

/** The verbs of an act on a selected item. */
const ITEM_ACTS = /^(?:Delete|Archive|Retire|Restore|Unarchive|Unretire|Deactivate)\b/;

/**
 * Every act on a selected item (delete, archive, retire and the like) drawn
 * as a button inside a card or a master-detail page's detail, where it is a
 * command bar action. A row's own act inside a list (a button inside an
 * `{#each}` block) stays on its row and is not one.
 */
export function itemActsInCards(source: string): string[] {
	const markup = markupOf(source);
	const scan = scanCode(codeView(source, 'Component.svelte'));
	const ranges = (openRe: RegExp, closeRe: RegExp) => {
		const out: [number, number][] = [];
		const stack: number[] = [];
		const marks = [
			...[...markup.matchAll(openRe)].map((m) => ({ at: m.index!, open: true })),
			...[...markup.matchAll(closeRe)].map((m) => ({ at: m.index!, open: false }))
		].sort((a, b) => a.at - b.at);
		for (const mark of marks) {
			if (mark.open) stack.push(mark.at);
			else if (stack.length) out.push([stack.pop()!, mark.at]);
		}
		return out;
	};
	const eachRanges = ranges(/\{#each\b/g, /\{\/each\}/g);
	const detailRanges = ranges(/\{#snippet\s/g, /\{\/snippet\}/g).filter(([from]) =>
		/^\{#snippet\s+detail\b/.test(markup.slice(from, from + 24))
	);
	const inside = (at: number, list: [number, number][]) => list.some(([from, to]) => at > from && at < to);
	const found: string[] = [];
	const tags = markupTags(markup);
	const open: { name: string; card: boolean }[] = [];
	tags.forEach((tag, index) => {
		if (tag.close) {
			const at = open.map((entry) => entry.name).lastIndexOf(tag.name);
			if (at >= 0) open.length = at;
			return;
		}
		const card =
			tag.name === 'CardContainer' || /\bclass=(?:"[^"]*|\{[^}]*)\bcard-(?:content|container)\b/.test(tag.raw);
		const inCard = card || open.some((entry) => entry.card) || inside(tag.at, detailRanges);
		if (ACTION_ELEMENTS.has(tag.name) && !tag.selfClosing && inCard && !inside(tag.at, eachRanges)) {
			let depth = 0;
			const end = tags.slice(index + 1).find((next) => {
				if (next.name !== tag.name) return false;
				if (!next.close) {
					if (!next.selfClosing) depth++;
					return false;
				}
				return depth-- === 0;
			});
			const labels = end ? elementLabels(markup, tag.at + tag.raw.length, end.at, scan) : [];
			const act = labels.find((label) => ITEM_ACTS.test(label.trim()));
			if (act) found.push(`${tag.name} "${act.replaceAll(VALUE, '…').trim()}" (line ${lineAt(markup, tag.at)})`);
		}
		if (!tag.selfClosing) open.push({ name: tag.name, card });
	});
	return found;
}

/**
 * Every register that sorts by its column heads and offers no house phone
 * sort: a component drawing `SortableHeadCell` whose `ListQueryBar` takes no
 * `sort`, or that draws no `ListQueryBar` (its query bar is another file's,
 * which a guard then reads), and every phone sort a host draws itself (a
 * `mobileSort` snippet).
 */
export function registersWithoutPhoneSort(source: string): string[] {
	const markup = markupOf(source);
	const found: string[] = [];
	for (const match of markup.matchAll(/\{#snippet\s+mobileSort\b/g))
		found.push(`a phone sort of its own (line ${lineAt(markup, match.index!)})`);
	if (!/<SortableHeadCell\b/.test(markup)) return found;
	const bars = markupTags(markup).filter((tag) => !tag.close && tag.name === 'ListQueryBar');
	if (bars.length === 0) found.push('sortable heads with no query bar of its own');
	for (const bar of bars)
		if (!/\ssort=|\s\{sort\}/.test(bar.raw)) found.push(`a ListQueryBar with no sort (line ${lineAt(markup, bar.at)})`);
	return found;
}

/** The command bar's zone registrations, whose acts a tab names. */
const BAR_ZONES = new Set(['PageCommandBar', 'PageCommandBarCenter', 'PageCommandBarRight']);

/** The text inside an attribute's braces (`name={…}`), or null. */
function attributeExpression(raw: string, name: string): string | null {
	const start = raw.search(new RegExp(`\\s${name}=\\{`));
	if (start < 0) return null;
	const open = raw.indexOf('{', start);
	let depth = 0;
	let quote: string | null = null;
	for (let i = open; i < raw.length; i++) {
		const char = raw[i]!;
		if (quote) {
			if (char === '\\') i++;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === '"' || char === "'" || char === '`') quote = char;
		else if (char === '{' || char === '[' || char === '(') depth++;
		else if (char === '}' || char === ']' || char === ')') {
			depth--;
			if (depth === 0) return raw.slice(open + 1, i);
		}
	}
	return null;
}

/** The objects written at the top level of an array literal's text (`[{…}, {…}]`). */
function arrayObjects(text: string): string[] {
	const out: string[] = [];
	const body = text.trim();
	if (!body.startsWith('[')) return out;
	let depth = 0;
	let quote: string | null = null;
	let from = -1;
	for (let i = 0; i < body.length; i++) {
		const char = body[i]!;
		if (quote) {
			if (char === '\\') i++;
			else if (char === quote) quote = null;
			continue;
		}
		if (char === '"' || char === "'" || char === '`') quote = char;
		else if (char === '{' || char === '[' || char === '(') {
			depth++;
			if (char === '{' && depth === 2) from = i;
		} else if (char === '}' || char === ']' || char === ')') {
			if (char === '}' && depth === 2 && from >= 0) {
				out.push(body.slice(from, i + 1));
				from = -1;
			}
			depth--;
		}
	}
	return out;
}

/** Whether a source draws a tab strip: `PageTabs`, a `TabItem`, or a viewer's extra tabs. */
export function drawsTabs(source: string): boolean {
	const markup = markupOf(source);
	return /<(?:PageTabs|TabItem)\b/.test(markup) || /\sextraTabs=|\s\{extraTabs\}/.test(markup);
}

/**
 * Every act a source puts in the command bar without naming its tab: a bar
 * zone registration (`PageCommandBar`, `PageCommandBarCenter`,
 * `PageCommandBarRight`) with no `tab`, and an `EditablePageScaffold`'s
 * `editMode` or `lifecycle` act with no `tab`, or its `actions` slot with no
 * `actionsTab`. A decision's own Cancel and
 * confirm (a registration holding a `data-action-confirm` button) are not
 * acts of a tab: they hold the bar while their drawer is open, and the drawer
 * closes when the tab changes. A guard reads it over a tabbed page's files,
 * so the bar holds the open tab's acts.
 */
export function untabbedBarActs(source: string): string[] {
	const markup = markupOf(source);
	const tags = markupTags(markup);
	const found: string[] = [];
	/** What an element holds, to its matching closing tag; nothing when it closes itself. */
	const bodyOf = (tag: Tag, index: number) => {
		if (tag.selfClosing) return '';
		let depth = 0;
		const end = tags.slice(index + 1).find((next) => {
			if (next.name !== tag.name) return false;
			if (!next.close) {
				if (!next.selfClosing) depth++;
				return false;
			}
			return depth-- === 0;
		});
		return end ? markup.slice(tag.at + tag.raw.length, end.at) : '';
	};
	tags.forEach((tag, index) => {
		if (tag.close) return;
		const line = lineAt(markup, tag.at);
		if (BAR_ZONES.has(tag.name)) {
			if (/\stab=|\s\{tab\}/.test(tag.raw)) return;
			if (/\sdata-action-confirm\b/.test(bodyOf(tag, index))) return;
			found.push(`${tag.name} with no tab (line ${line})`);
			return;
		}
		if (tag.name !== 'EditablePageScaffold') return;
		// Its own actions slot: a scaffold that holds none (a load error's) has no act.
		if (
			/\sslot="actions"/.test(bodyOf(tag, index)) &&
			!/\sactionsTab=|\s\{actionsTab\}/.test(tag.raw)
		)
			found.push(`the scaffold's actions with no tab (line ${line})`);
		const edit = attributeExpression(tag.raw, 'editMode');
		if (edit !== null && /^\s*\{/.test(edit) && !/\btab\s*:/.test(edit))
			found.push(`an edit mode with no tab (line ${line})`);
		const lifecycle = attributeExpression(tag.raw, 'lifecycle');
		if (lifecycle === null) return;
		for (const act of arrayObjects(lifecycle)) {
			if (/\btab\s*:/.test(act)) continue;
			const label = act.match(/\blabel\s*:\s*(['"`])((?:(?!\1).)*)\1/)?.[2];
			const kind = act.match(/\bkind\s*:\s*['"](\w+)['"]/)?.[1] ?? 'act';
			found.push(`a lifecycle ${kind}${label ? ` "${label}"` : ''} with no tab (line ${line})`);
		}
	});
	return found;
}

/**
 * Every tab drawn after History: History is the last tab on every page that
 * has one. Reads a strip's `TabTitle`s in source order, and a viewer's extra
 * tab named History (a `viewerTab(…)` call or an object with an `id`) that the
 * viewer would draw before its Versions tab, having no `afterVersions`,
 * unless the viewer draws no Versions (`showHistoryTab={false}`).
 */
export function tabsAfterHistory(source: string): string[] {
	const markup = markupOf(source);
	const found: string[] = [];
	const titles = markupTags(markup).filter((tag) => !tag.close && tag.name === 'TabTitle');
	const labelOf = (tag: Tag) =>
		tag.raw.match(/\slabel="([^"]*)"/)?.[1] ??
		tag.raw.match(/\slabel=\{([^}]*)\}/)?.[1]?.trim() ??
		'';
	const history = titles.findIndex((tag) => labelOf(tag) === 'History');
	if (history >= 0)
		for (const tag of titles.slice(history + 1))
			found.push(`${labelOf(tag) || 'a tab'} after History (line ${lineAt(markup, tag.at)})`);
	if (!/\sextraTabs=|\s\{extraTabs\}/.test(markup) || /\sshowHistoryTab=\{false\}/.test(markup))
		return found;
	const code = withoutComments(
		source.match(/<script(?![^>]*context="module")[^>]*>([\s\S]*?)<\/script>/)?.[1] ?? ''
	);
	for (const match of code.matchAll(/(['"`])History\1/g)) {
		// The tab's own definition: the call or object the label sits in.
		let depth = 0;
		let open = -1;
		for (let i = match.index! - 1; i >= 0; i--) {
			const char = code[i]!;
			if (char === ')' || char === '}' || char === ']') depth++;
			else if (char === '(' || char === '{' || char === '[') {
				if (depth === 0) {
					open = i;
					break;
				}
				depth--;
			}
		}
		if (open < 0) continue;
		const closer = code[open] === '(' ? ')' : code[open] === '{' ? '}' : ']';
		depth = 0;
		let close = -1;
		for (let i = open; i < code.length; i++) {
			const char = code[i]!;
			if (char === '(' || char === '{' || char === '[') depth++;
			else if (char === ')' || char === '}' || char === ']') {
				depth--;
				if (depth === 0) {
					if (char === closer) close = i;
					break;
				}
			}
		}
		const lead = code.slice(Math.max(0, open - 12), open);
		const definition = code.slice(open, close < 0 ? code.length : close + 1);
		const isTab =
			(code[open] === '(' && /viewerTab\s*$/.test(lead)) ||
			(code[open] === '{' && /\bid\s*:/.test(definition));
		if (!isTab || /\bafterVersions\b/.test(definition)) continue;
		found.push("History drawn before the viewer's Versions tab (no afterVersions)");
	}
	return found;
}

/**
 * Every state chip drawn among a pane header's controls: the item's state
 * reads beside its title (`PaneHeader`'s `status`), never in the `actions`
 * at the row's end. Lists a `HeaderStatus`, a host's `*HeaderStatus` or a
 * `StatusBadge` inside an `actions` snippet or slot.
 */
export function statusAmongControls(source: string): string[] {
	const markup = markupOf(source);
	const ranges: [number, number][] = [];
	const collect = (open: RegExp, close: string) => {
		for (const match of markup.matchAll(open)) {
			const end = markup.indexOf(close, match.index!);
			ranges.push([match.index!, end < 0 ? markup.length : end]);
		}
	};
	collect(/\{#snippet\s+actions\s*\(/g, '{/snippet}');
	collect(/<svelte:fragment\s+slot="actions"/g, '</svelte:fragment>');
	const found: string[] = [];
	for (const tag of markupTags(markup)) {
		if (tag.close || !/(?:^|\w)HeaderStatus$|^StatusBadge$/.test(tag.name)) continue;
		if (ranges.some(([from, to]) => tag.at > from && tag.at < to))
			found.push(`${tag.name} among the header's controls (line ${lineAt(markup, tag.at)})`);
	}
	return found;
}

/**
 * Every count pill a source draws on an icon by hand: a fully rounded box at
 * least 16px wide, filled in a tone and placed at the icon's top corner, the
 * house counted-icon pill's shape, where `.gawdux-icon-count` is the one
 * pill. A mark at the icon's foot (a room's kind) is no count.
 */
export function handDrawnIconCounts(source: string): string[] {
	const markup = markupOf(source);
	const found: string[] = [];
	for (const tag of markupTags(markup)) {
		if (tag.close) continue;
		const classes = tag.raw.match(/\sclass=(?:"([^"]*)"|\{`([^`]*)`\})/);
		const list = classes?.[1] ?? classes?.[2] ?? '';
		if (
			/(?<![\w:-])absolute(?![\w-])/.test(list) &&
			/(?<![\w:])-top-/.test(list) &&
			/(?<![\w:-])rounded-full(?![\w-])/.test(list) &&
			/(?<![\w:-])min-w-(?:4|\[16px\])(?![\w-])/.test(list) &&
			/(?<![\w:-])bg-(?:blue|red)-\d{3}/.test(list)
		)
			found.push(`a count pill of its own (line ${lineAt(markup, tag.at)})`);
	}
	return found;
}


/** A source with its comments blanked out, lines kept where they were. */
function blankComments(source: string): string {
	const blank = (text: string) => text.replace(/[^\n]/g, ' ');
	return source
		.replace(/<!--[\s\S]*?-->/g, blank)
		.replace(/\/\*[\s\S]*?\*\//g, blank)
		.replace(/(^|[^:\\'"`])(\/\/[^\n]*)/g, (_, lead: string, rest: string) => lead + blank(rest));
}

/** Whether the offset sits in a string a script hands a DOM query
 *  (`querySelector`, `querySelectorAll`, `closest`, `matches`), the call
 *  read back over the string's opening quote. */
function inDomQuery(code: string, at: number): boolean {
	const lineStart = code.lastIndexOf('\n', at) + 1;
	const before = code.slice(lineStart, at);
	const quote = Math.max(before.lastIndexOf("'"), before.lastIndexOf('"'), before.lastIndexOf('`'));
	if (quote < 0) return false;
	const lead = code.slice(Math.max(0, lineStart + quote - 200), lineStart + quote).trimEnd();
	return /(?:querySelector(?:All)?|closest|matches)(?:<[^>()]*>)?\(\s*(?:\[\s*)?$/.test(lead);
}

/** Where a class list names `token`: a class attribute or directive, a CSS
 *  selector, or a string of class names in a script (never a symbol's or a
 *  key's name). */
function classTokenAt(code: string, token: string): number[] {
	const name = token.replace(/-/g, '\\-');
	const found = new Set<number>();
	const word = new RegExp(`(?<![\\w-])${name}(?![\\w-])`, 'g');
	// A CSS selector: the token after a dot, never in a script's DOM query
	// (`querySelector('.page-command-bar button')` finds the bar; it draws
	// nothing).
	for (const match of code.matchAll(new RegExp(`\\.${name}(?![\\w-])`, 'g'))) {
		if (!inDomQuery(code, match.index!)) found.add(match.index! + 1);
	}
	// A class: directive.
	for (const match of code.matchAll(new RegExp(`\\bclass:${name}(?![\\w-])`, 'g'))) found.add(match.index! + 6);
	// A class attribute, its value read through braces and quotes.
	for (const match of code.matchAll(/\bclass=("[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\})/g)) {
		for (const inner of match[1]!.matchAll(word)) found.add(match.index! + 6 + inner.index!);
	}
	// A string of class names in a script: every word a class name.
	for (const match of code.matchAll(/(['"`])((?:(?!\1)[^\n\\])*)\1/g)) {
		const text = match[2]!;
		if (!/^[\w\s:![\]/.-]*$/.test(text)) continue;
		if (/Symbol\(\s*$/.test(code.slice(Math.max(0, match.index! - 12), match.index!))) continue;
		if (!word.test(text)) continue;
		word.lastIndex = 0;
		if (inDomQuery(code, match.index! + 1)) continue;
		for (const inner of text.matchAll(word)) found.add(match.index! + 1 + inner.index!);
	}
	return [...found].sort((a, b) => a - b);
}

/**
 * Every page-level surface a source draws outside the page frame: the
 * retired conventions (`context-surface`, `page-shell`), a frame part or the
 * fill marker written by a source of its own (`page-frame`,
 * `page-frame-panel`, `page-frame-surface`, `page-fill`), a command bar drawn
 * by hand (`page-command-bar`, `cmd-bar-zone`) and a `<main>` element: the
 * page's main landmark is the frame's. A stylesheet that names a retired
 * class is listed too. A guard allows the frame's owners (PageFrame, the
 * stylesheet that draws it, the Gawdux hosts that fill it) and holds every
 * other source to none.
 */
export function pageSurfacesOutsideFrame(source: string): string[] {
	const code = blankComments(source);
	const found: { at: number; text: string }[] = [];
	for (const token of [
		'context-surface',
		'page-shell',
		'page-frame',
		'page-frame-panel',
		'page-frame-surface',
		'page-fill',
		'page-command-bar',
		'cmd-bar-zone'
	]) {
		for (const at of classTokenAt(code, token)) found.push({ at, text: `${token} (line ${lineAt(code, at)})` });
	}
	const markup = markupOf(code);
	for (const tag of markupTags(markup)) {
		if (!tag.close && tag.name === 'main')
			found.push({ at: tag.at, text: `<main> (line ${lineAt(markup, tag.at)})` });
	}
	return found.sort((a, b) => a.at - b.at).map((entry) => entry.text);
}

/**
 * The selector of every rule that reads the page's elevation token
 * (`var(--gawdux-surface-elevation)`), in order, or `markup` for a read in a
 * class list or a style attribute. Declaring the token is not reading it.
 */
export function elevationReads(source: string): string[] {
	const code = withoutComments(source);
	const found: string[] = [];
	for (const match of code.matchAll(/var\(\s*--gawdux-surface-elevation\s*[,)]/g)) {
		const at = match.index!;
		const open = code.lastIndexOf('{', at);
		const close = code.lastIndexOf('}', at);
		const semi = code.lastIndexOf(';', open);
		if (open < 0 || open < close) {
			found.push('markup');
			continue;
		}
		const start = Math.max(code.lastIndexOf('}', open), code.lastIndexOf('{', open - 1), semi) + 1;
		const selector = code.slice(start, open).replace(/\s+/g, ' ').trim();
		found.push(/^[.:#\w[\]*>~+\s(),='"-]+$/.test(selector) && !/class=/.test(selector) ? selector : 'markup');
	}
	return found;
}

/**
 * Every Cancel a source draws for a decision itself: an element carrying
 * the pair's Cancel marker (`data-action-cancel`), a button labelled Cancel
 * inside a `PageCommandBarCenter` or a `CommandDrawer`, and a button labelled
 * Cancel coloured red anywhere. A decision's Cancel is PageCommandBarPair's,
 * neutral, and red only while cancelling would discard input (`discards`).
 */
export function handDrawnCancels(source: string): string[] {
	const markup = markupOf(source);
	const tags = markupTags(markup);
	const found: string[] = [];
	const ranges: [number, number][] = [];
	tags.forEach((tag, index) => {
		if (tag.close || tag.selfClosing) return;
		if (tag.name !== 'PageCommandBarCenter' && tag.name !== 'CommandDrawer') return;
		let depth = 0;
		for (const next of tags.slice(index + 1)) {
			if (next.name !== tag.name) continue;
			if (!next.close && !next.selfClosing) depth++;
			else if (next.close && depth === 0) {
				ranges.push([tag.at, next.at]);
				return;
			} else if (next.close) depth--;
		}
		ranges.push([tag.at, markup.length]);
	});
	tags.forEach((tag, index) => {
		if (tag.close) return;
		const line = lineAt(markup, tag.at);
		if (/\sdata-action-cancel(?=[\s=>/])/.test(tag.raw)) {
			found.push(`${tag.name} data-action-cancel (line ${line})`);
			return;
		}
		if (!/^(?:Button|button)$/.test(tag.name) || tag.selfClosing) return;
		const end = tags.slice(index + 1).find((next) => next.close && next.name === tag.name);
		if (!end) return;
		const label = markup
			.slice(tag.at + tag.raw.length, end.at)
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		if (!/^(?:Cancel|\{[^}]*cancel[^}]*\})$/i.test(label)) return;
		if (ranges.some(([from, to]) => tag.at > from && tag.at < to))
			found.push(`${tag.name} Cancel drawn in a drawer or the bar (line ${line})`);
		else if (/\scolor=(?:"red"|'red'|\{['"]red['"]\})/.test(tag.raw))
			found.push(`${tag.name} Cancel coloured red (line ${line})`);
	});
	return found;
}
