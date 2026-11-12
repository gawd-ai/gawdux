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
 * Every body cell of a register (a component drawing a `ListSurface`, a
 * `ListPageScaffold` or a list's scroller of its own, `.list-table-scroll`)
 * that names neither its column (`data-label`) nor its place in the card
 * (`data-card`), and spans no columns (an empty row).
 */
export declare function unlabelledRegisterCells(source: string): string[];
/**
 * Every confirmation whose line under its title asks a question. A
 * confirmation (a request or a tag carrying `confirmLabel`, or a discard
 * guard) asks once, in its title, naming the act and the item; the line under
 * it (`message`, or a host's `confirm`) gives only what follows, or is
 * absent.
 */
export declare function questioningConfirmations(source: string, file?: string): string[];
/**
 * The acronyms and initialisms an action's label keeps in capitals. A host
 * passes its own proper nouns (a product's name, the System) beside them.
 */
export declare const ACTION_LABEL_WORDS: readonly string[];
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
export declare function miscasedActionLabels(source: string, options?: {
    file?: string;
    words?: readonly string[];
}): string[];
/**
 * Every act on a selected item (delete, archive, retire and the like) drawn
 * as a button inside a card or a master-detail page's detail, where it is a
 * command bar action. A row's own act inside a list (a button inside an
 * `{#each}` block) stays on its row and is not one.
 */
export declare function itemActsInCards(source: string): string[];
/**
 * Every register that sorts by its column heads and offers no house phone
 * sort: a component drawing `SortableHeadCell` whose `ListQueryBar` takes no
 * `sort`, or that draws no `ListQueryBar` (its query bar is another file's,
 * which a guard then reads), and every phone sort a host draws itself (a
 * `mobileSort` snippet).
 */
export declare function registersWithoutPhoneSort(source: string): string[];
/** Whether a source draws a tab strip: `PageTabs`, a `TabItem`, or a viewer's extra tabs. */
export declare function drawsTabs(source: string): boolean;
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
export declare function untabbedBarActs(source: string): string[];
/**
 * Every tab drawn after History: History is the last tab on every page that
 * has one. Reads a strip's `TabTitle`s in source order, and a viewer's extra
 * tab named History (a `viewerTab(…)` call or an object with an `id`) that the
 * viewer would draw before its Versions tab, having no `afterVersions`,
 * unless the viewer draws no Versions (`showHistoryTab={false}`).
 */
export declare function tabsAfterHistory(source: string): string[];
/**
 * Every state chip drawn among a pane header's controls: the item's state
 * reads beside its title (`PaneHeader`'s `status`), never in the `actions`
 * at the row's end. Lists a `HeaderStatus`, a host's `*HeaderStatus` or a
 * `StatusBadge` inside an `actions` snippet or slot.
 */
export declare function statusAmongControls(source: string): string[];
/**
 * Every count pill a source draws on an icon by hand: a fully rounded box at
 * least 16px wide, filled in a tone and placed at the icon's top corner, the
 * house counted-icon pill's shape, where `.gawdux-icon-count` is the one
 * pill. A mark at the icon's foot (a room's kind) is no count.
 */
export declare function handDrawnIconCounts(source: string): string[];
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
export declare function pageSurfacesOutsideFrame(source: string): string[];
/**
 * The selector of every rule that reads the page's elevation token
 * (`var(--gawdux-surface-elevation)`), in order, or `markup` for a read in a
 * class list or a style attribute. Declaring the token is not reading it.
 */
export declare function elevationReads(source: string): string[];
/**
 * Every Cancel a source draws for a decision itself: an element carrying
 * the pair's Cancel marker (`data-action-cancel`), a button labelled Cancel
 * inside a `PageCommandBarCenter` or a `CommandDrawer`, and a button labelled
 * Cancel coloured red anywhere. A decision's Cancel is PageCommandBarPair's,
 * neutral, and red only while cancelling would discard input (`discards`).
 */
export declare function handDrawnCancels(source: string): string[];
