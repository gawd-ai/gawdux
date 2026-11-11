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
export declare function withoutComments(source: string): string;
/** Every shadow the source writes, as written, comments excluded. */
export declare function surfaceShadows(source: string): string[];
/** Every in-page Flowbite component the source imports that hard-codes a shadow. */
export declare function shadowedFlowbiteImports(source: string): string[];
/**
 * Every place the source reads or sets the content inset's knob, writes a
 * separate bottom inset, or writes the frame's fill-height calc.
 */
export declare function insetOverrides(source: string): string[];
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
export declare function vanishingDarkEdges(source: string, file?: string): string[];
/**
 * Every icon the source sizes itself (`h-4 w-4` on an icon component or an
 * inline svg), where the house icon (`.gawdux-icon`) is the size.
 */
export declare function handSizedIcons(source: string): string[];
/**
 * Every rail row the source draws itself: a `RailRowButton` with no `title`,
 * or holding content of its own beyond its snippets (`meta`, `leading`,
 * `trailing`).
 */
export declare function handRolledRailRows(source: string): string[];
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
export declare function handSetCardPadding(source: string): string[];
/**
 * Every body cell of a register (a component drawing a `ListSurface` or a
 * `ListPageScaffold`) that names neither its column (`data-label`) nor its
 * place in the card (`data-card`), and spans no columns (an empty row).
 */
export declare function unlabelledRegisterCells(source: string): string[];
