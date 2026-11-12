# Changelog

## 0.42.0 - plain everyday language

### Added

- `plainLanguageFaults` and `PLAIN_LANGUAGE_PHRASES` in `gawdux/utils` (the
  type `PlainLanguagePhrase`): the plain-language rule as a reader. Every
  string a person reads says what happens in ordinary words, as a helpful
  colleague would say it out loud to the person using the product: the
  common verb, one idea to a sentence, no idiom or metaphor, no spec
  register, no state said as motion. The reader lists every phrase of
  `PLAIN_LANGUAGE_PHRASES` (each with the everyday words said instead) that
  a source's readable strings use: in a component, its markup's text, the
  quoted values of `title`, `aria-label`, `placeholder`, `label` and
  `description`, and the strings of its scripts and expressions; in any
  other source, a copy module a guard chooses, its strings. A string counts
  only when it reads as words (two words or more), and a console line is
  never one. The phrases include "for good", "kept for the record", holds
  and holder, rung, "leaves force", "acts with", "names no", the word act as
  a noun, "stays in force", "the trail keeps", "goes into review", carries,
  governs, surface, "the house", "live patch", "admin grade", standing and a
  sentence opening "Failed to". It is a backstop: it keeps a phrase a plain
  rewrite removed from coming back, and does not prove the copy is plain.
  The library's house-surface-rules test holds every component and its copy
  module (`alert-ops/types.ts`) to none, shown failing on 0.41.0's admin
  cards.

### Changed

- The admin panels and the alert console say what they mean in plain words:
  `RoleMembersCard` reads Members and "No one has this Role yet.";
  `BotContextCard` reads "Context for this bot", "No configs for this bot
  yet." and "Full text"; `AiKnowledgePanel`'s removal question says the
  source's ingested content is removed from the knowledge base immediately;
  `AiSkillsPanel` says what granting, the settings, a stale reload, a saved
  connection, a missing knowledge base and the instruction pack do in whole
  sentences, and its connection error reads "Could not save the knowledge
  base connection."; `AiUsageReport`'s window is a period; `BotToolAccess`
  marks a tool that changes something "Makes changes"; the alert console's
  empty and stale lines name the selected environment and plane and say the
  data shown is the last that loaded.

## 0.41.0 - one page frame, one action pair

### Added

- `PageFrame`: the page's one frame. An app shell renders it once, in its
  main column, around the page and the command bar (`bar`: the registry's
  three zones, read as the frame renders, after the page, so a server render
  holds the bar the page fills). The frame owns the page's panel and its
  junction with the bar at every width (tokens.css "The page frame"): its
  inset from the column (`--gawdux-frame-gutter`, 8px, none at the compact
  width), one edge and one radius around the surface and the bar together,
  the page's one elevation (`--gawdux-surface-elevation`), and the seam. A
  drawn bar takes the surface's bottom corners, so the seam is one straight
  full-width edge with no gap and no band, the content's elevation falling
  on the bar's top edge (the bar's `::before`, the token cut to what lies
  below the seam), and on an open drawer's top edge while one rises out of
  the bar. A bar with nothing to hold is not drawn and the surface keeps its
  own bottom corners; a card nested in the content never meets the bar and
  keeps its own corners. The frame's `<main>` is the page's landmark; on
  paper the frame draws nothing and the bar is not printed.
- `.page-fill`: a Gawdux host that is the page's content (`PageTabs`' shell,
  `EditablePageScaffold`'s surface, `ListSurface`'s page list, a
  `TableContainer` that fills) takes the frame's height and shares it with
  its children, through any wrappers between it and the frame's surface.
  Layout only: it draws no surface, edge, corner or shadow.
- `PageCommandBarPair`: a decision's one action pair, Cancel and the act, as
  a drawer and edit mode draw it. One height, padding and type for both,
  whatever has focus; the act's own tone (`tone`); Cancel neutral (the house
  neutral outline, `data-tone="neutral"`), red only while cancelling would
  discard input the person entered (`discards`: a changed field, a typed
  reason or note; a password is not information) and neutral again once
  that input is cleared. A host passes the act and whether input would be
  lost and draws no Cancel of its own. `between` holds the decision's other
  acts; `inline` renders the pair in place for a host already in the bar's
  center zone.
- `createEditMode`'s `changed` (in the snapshot and on the API): a field has
  changed since `start`, measured against a copy of the record as it
  started, so changing a field back or clearing a field that was empty
  leaves nothing to discard. `editSnapshot` and `sameEditValue` let a form
  that is not an edit mode measure its input the same way.
- `EditModeProps.discards`: edit mode's Cancel is red while it would discard
  an edit (`createEditMode`'s `changed`), neutral otherwise.
- `ListSurface`'s `card` and `TableContainer`'s `card`: whether the list
  draws a card. A page's list never does (the frame draws its panel); a
  tab's or an embedded list does, unless it is its pane's whole content.
- Readers in `gawdux/utils`: `pageSurfacesOutsideFrame` (a retired page
  surface, a frame part or fill marker written by a source of its own, a
  command bar drawn by hand or a `<main>` of its own; a script's DOM query
  reads, it draws nothing), `elevationReads` (the rule of every read of the
  page's elevation token) and `handDrawnCancels` (a Cancel drawn in a drawer
  or the bar by hand, or coloured red). The library's house-surface-rules
  test holds its files to each: the elevation is read only by the frame and
  Tailwind's `.shadow-md` (the floating frames).

### Changed

- Every page renders in the frame: `PageTabs`, `EditablePageScaffold`'s
  `surface`, `ListSurface`'s page list and `TableContainer` draw no page
  surface of their own and fill the frame (`.page-fill`). `PageTabs`'
  content draws no bottom corners (`contentClass` default).
- `PageCommandBarConfirm` draws its Cancel and confirm as the pair, so a
  confirmation's Cancel is neutral. `PageActionBar`'s edit mode draws Cancel
  and Save as the pair, Save as draft between them.
- A command bar button draws its focus ring only on keyboard focus
  (`:focus-visible`), as a 2px outline that never changes its size, and no
  ring or shadow on pointer focus.
- `CommandDrawer` and `PageCommandBarConfirm` draw no edge of their own: the
  frame's panel draws the sides of the drawer and the bar, and the seam is
  the drawer's top edge.
- `TableContainer`'s `surface` is `fill`.

### Removed

- `.context-surface`, `.page-shell` and the two page layouts that paired a
  surface with the bar (the bar inside `<main>`, and the bar beside `<main>`
  in `.page-shell`), with their merge rules: the frame is the one layout. A
  page draws no `.context-surface` of its own.

## 0.40.0 - the bar holds the open tab's acts, History last, the pane header, the trail's icon on a phone, one count pill

### Added

- The page's open tab. `PAGE_TAB_CONTEXT`, `createPageTabHost`,
  `PageTabHost` (`open`, `claim`) and `PageTabClaim` (`report`, `release`):
  a tab strip claims the page's open tab and reports the tab that is open,
  the newest live claim's report being the open tab (a claim reporting none
  counting for nothing), and the command bar reads it. `EditablePageScaffold` publishes one for
  its page, keeping one a host above already publishes; a page outside a
  scaffold may publish its own. `PageTabs` reports its `openTab`.
- The bar holds the open tab's acts. `PageCommandBar`, `PageCommandBarCenter`
  and `PageCommandBarRight` take `tab` (`PageTabScope`: a tab's id or
  several): the acts show only while one of their tabs is open, so a tab with
  no act draws no bar; an act that names no tab is the page's, on every tab.
  `EditModeProps.tab` and `LifecycleAction.tab` scope the scaffold's edit bar
  and its acts the same way, and `EditablePageScaffold`'s `actionsTab` its
  `actions` slot. `showsOnTab` decides it. The registry's
  `register` and `update` take `present`: a registration of a tab that is not
  open stays live in its place and steps aside, the zone showing the newest
  present one, so a page's tabs register their acts side by side.
- A drawer out of the bar closes when the tab changes. `CommandDrawer` calls
  its `onclose`, once it is dismissible and not busy, and
  `PageCommandBarConfirm` cancels, when the page's open tab changes while it
  is open: its act left the bar with the tab.
- A count on a tab. `TabTitle` takes `count`: above zero, the house
  counted-icon pill on the tab's icon, the count read with its label
  ("Workflow (1)"). The pill is `.gawdux-icon-count` (tokens.css "A count on
  an icon"): 16px at the icon's top right, the accent or `data-tone="urgent"`
  red, its ring the page's surface or a card's (`data-surface="card"`).
- `PaneHeader`: the header of a pane that shows one item, reading icon,
  title, state, then the controls at every width. Above 1024px the state
  (the chip and its lock) stands 8px after the title, the title truncating
  first, the controls at the row's end; at or below it the row is 44px, the
  leading control and the icon each on a 44px column from the pane's edge
  (the columns of a tab strip that shows its icons alone), the state 8px
  after the icon's glyph, the controls 4px apart and 4px from the edge, and
  no title or subtitle (the trail's row names the item); a header with
  nothing to hold there is not drawn. It claims the page's status
  (`PAGE_STATUS_CONTEXT`), drawing the `status` it is given or the page's,
  so a tab strip under it draws none.
- Readers in `gawdux/utils`: `drawsTabs` and `untabbedBarActs` (a tabbed
  source's bar act that names no tab, a decision's own Cancel and confirm
  left), `tabsAfterHistory` (a tab drawn after History, a viewer's History
  before its Versions among them), `statusAmongControls` (a state chip among
  a pane header's controls) and `handDrawnIconCounts` (a count pill drawn by
  hand). The library's house-surface-rules test holds its files to each.

### Changed

- `Breadcrumbs`' row at the compact width leads with the section's icon, the
  line's first crumb's, at the house size before the page's name, inside its
  target.

## 0.39.0 - one question in a confirmation, one case for action labels, an item's acts in the command bar, the house icon on a tab strip's row, a phone sort on every sorted register

### Changed

- One question in a confirmation. `PageCommandBarConfirm` takes its
  `message` as optional and draws the line under the title only when there
  is one, describing the decision by it only then; `ConfirmationCommandRequest`'s
  `message` is optional. The title asks once, naming the act and the item;
  the line under it gives only what follows. A discard request carries its
  question as its `title` (`DiscardNavigationRequest.title`, required) and
  only what follows as its `message`; a discard guard names its question as
  its `title` (`DiscardGuardRegistration.message` is removed for `title`).
  `DiscardNavigationCommandSurface` draws the request's title, no longer a
  fixed "Discard unsaved changes?" over a second question. With several
  guards holding changes the title is "Discard the unsaved changes in …?";
  the saved and busy states read as a title and the line that follows.
  `AiKnowledgeUsage.discardMessage` is `discardTitle`, and the knowledge and
  skills panels' discard requests and their request types carry `title`.
- One case for action labels. An action's label is sentence case: the edit
  bar's default draft save reads "Save as draft".
- An item's acts sit in the command bar. `AiKnowledgePanel` draws no Delete
  knowledge base in its card and no in-place confirmation strip; it exports
  `deletion` (`shown`, `disabled`, `reason`, `open(focusTarget)`, `request`,
  `busy`, `error`, `confirm`, `cancel`), which the host draws as its command
  bar's last action and opens out of the bar with
  `ConfirmationCommandSurface` ("Delete “name”?", its sources and content
  removed as the line under it).
- The house icon on a tab strip's row. A tool after a tab strip
  (`.gawdux-tool-button`) draws its icon at `--gawdux-icon-size` whether its
  label shows or not, the size of the tabs' icons beside it; it drew 13px
  while labelled.
- A phone sort on every sorted register. `ListQueryBar` takes `sort`
  (`ListSort`: `keys`, `field`, `direction`, `onsort`) and offers it at or
  below the compact width, where a register's heads are hidden, as the house
  phone sort: "Sort by" and one choice per key and direction behind the
  filter button, or a Sort button when the bar has no other filters, 44px
  tall, the register's own order read as "Default order" until a key is
  chosen. Each key names its column and its order (`ListSortKey.order`:
  words "A to Z" and "Z to A", a date latest or earliest first, a number
  highest or lowest first, a sequence in its order or in reverse); the
  choices come from `listSortOptions`. The `mobileSort` snippet is removed:
  no host draws a phone sort of its own.

### Added

- Readers in `gawdux/utils` for the rules: `questioningConfirmations` (a
  line under a confirmation's title that is or opens with a question),
  `miscasedActionLabels` with `ACTION_LABEL_WORDS` (an action's label not in
  sentence case, its acronyms and a host's proper nouns kept),
  `itemActsInCards` (an act on a selected item drawn as a button in a card
  or a master-detail page's detail, a row's own act in a list left on its
  row) and `registersWithoutPhoneSort` (sortable heads whose query bar takes
  no sort, or a phone sort a host draws itself). The library's own
  house-surface-rules test holds its files to each, each shown failing on
  0.38.2.

## 0.38.2 - a register's card is headed by the row's name

### Fixed

- A register's card on a phone is headed by the row's name: the cell marked
  `data-card="title"` comes first in its card (`order: -1`), whatever its
  column, so a register whose first column is its status still reads its
  name first; 0.38.0 placed it where its column fell.

## 0.38.1 - a register with a scroller of its own is a register

### Fixed

- `unlabelledRegisterCells` reads a component that draws a list's scroller
  of its own (`.list-table-scroll`, whose table reads as cards at or below
  the compact width as a `ListSurface`'s does) as a register, as it reads one
  drawing a `ListSurface` or a `ListPageScaffold`; 0.38.0 read only the two
  components, so such a register's unlabelled cells went unread.

## 0.38.0 - one icon size, a rail row's own layout, one padding inside a card, no choice of one, a register on a phone

### Changed

- One icon size in a header. `--gawdux-icon-size` (20px) and `.gawdux-icon`
  are the house icon: a header's `IconButton` (`size="md"`) draws its icon
  and its glyph at it, `HeaderStatus` its lock, `TabTitle` a tab's icon (its
  20px box and the icon in it; the icon drew at 24px in the box), a tool
  showing its icon alone after a tab strip, and a host's pane header its
  item icon and leading control through the class. A row's `IconButton`
  (`size="sm"`) keeps its 16px icon. The class is unlayered, so it wins over
  the size an icon component sets itself.
- A rail row's layout is `RailRowButton`'s. It takes `title`, `meta` (a
  string, or a snippet for meta with marks of its own), `icon` (or `leading`
  for a mark that is no icon) and `trailing`, and lays them out: the icon on
  the title line in a box the house icon's size and the line's height, the
  trailing marks at the line's end, the meta line under it starting at the
  row's left edge and running its full width. `children` is removed; a
  caller draws no row of its own. `AiSkillsPanel`, `AiKnowledgePanel` and
  `BotRail` (its initials in the icon's box) move onto it.
- One padding inside a card. `--gawdux-card-padding` (16px, the page inset
  above the compact width) is the padding of `CardContainer`'s header sides
  and its body on all four sides, of `.card-header`'s sides and of
  `.card-content`, the class a host's own card takes; a card keeps it at
  every width (a card is a box nested in the content). The header's band
  keeps `--gawdux-card-header-py`. `--gawdux-card-header-px`,
  `--gawdux-card-body-px` and `--gawdux-card-body-py` and `CardContainer`'s
  narrow-width caps are removed. `PasswordWithRequirements`' rules panel, a
  box nested in a form, pads 12px at every width.
- A choice of one is not drawn. `SavedViewsRail` draws nothing with no saved
  view and the default query applied (its one pill, the default, is nothing
  to choose); it shows once there is a saved view or once the query is one a
  view could save, its save control at the track's end
  (`savedViewsRailShows`). `FilterBar` takes no room for an empty rail.
  `FilterPillRow`'s track is a fill with no edge of its own, so a selected
  pill in it is one line, never two.
- A register reads on a phone. At or below the compact width every table in
  a `ListSurface`'s scroller (`.list-table-scroll`), as well as one wrapped
  in `.responsive-card-table`, turns its rows into labelled cards: a cell's
  label is its `data-label`; `data-card="title"` heads the card across its
  width with no label, `data-card="wide"` spans it under its label,
  `data-card="end"` is the row's own control at the card's top right and
  `data-card="detail"` a row's opened detail; a truncated value wraps in its
  cell. `DataTable` labels each body cell with its column. The dense
  table's cell padding (`.list-table`) applies above the compact width only.
  The pattern carries no column words of its own (the `Actions` caption is
  removed; a host labels its actions cell).

### Added

- `handSizedIcons`, `handRolledRailRows`, `handSetCardPadding` and
  `unlabelledRegisterCells` (`gawdux/utils`): the surface rules' readers for
  an icon a source sizes itself, a rail row a caller draws itself, a
  bordered, rounded box padded at a card's size by hand (or a box inside a
  card padded so), and a register body cell that names neither its column
  nor its place in the card. `tests/house-surface-rules.test.ts` holds the
  library to none of each.

## 0.37.1 - every surface in the page is the card surface in dark

### Fixed

- `vanishingDarkEdges` reads an element whose file states no dark surface as
  drawn on the card surface, gray-800, which the page's content surface
  (`.page-tabs-shell`, `.table-container`, a list's surface) draws in dark as
  a card does; it read it as drawn on gray-900, `--gawdux-surface`, the
  shell's background around the content surface, and so missed every gray-800
  edge outside a card the same file draws. A ring (`ring-*`) is read as an
  edge, as a border is.
- Light and dark draw the same lines. The edges a light theme draws and the
  dark theme drew in gray-800 on the content surface are gray-700, the
  house's dark edge: `MasterDetailShell`'s card, `ListQueryBar`'s phone sort
  row and active filter row, `PasswordWithRequirements`' rules panel,
  `ApprovalsLedgerSignatures`, `BotRail`'s lanes, and `AlertDetailPanel`,
  `AlertGroupTable`, `ProviderHealthBar` and `SilenceTable`.

## 0.37.0 - a list's toolbar on the page inset, the same lines in light and dark

### Changed

- A list's toolbar has the page inset at its top. `FilterBar` (the saved
  views rail and the filter row, which `ListSurface` draws at the top of
  every list's surface) takes `--gawdux-page-inset` at its top and its
  sides, so its first control stands as far below the surface's top as in
  from its side (16px above the compact width, 8px at or below), for every
  register; 8px below it to the list. It was 8px at its top against 16px at
  its sides above the compact width. The compact width's own
  `padding-inline` for it is removed (the knob is 8px there).
- Light and dark draw the same lines. Where a card's rows were divided, or a
  box inside a card was edged, in a light colour and in dark in gray-800,
  the dark card surface's own colour, the dark edge is gray-700, the house's
  dark edge: `AiKnowledgePanel` (its lists, its boxes and its rows, whose
  dark hover edge is gray-600), `AiSkillsPanel`, `BotContextCard`,
  `BotToolAccess`, `MemberAccessCard`, `RoleMembersCard` and
  `SecurityActivityList`.

### Added

- `vanishingDarkEdges(source, file)` in `gawdux/utils`, the surface rules'
  reader for the rule a theme changes an edge's colour and never whether it
  is drawn: every edge a component's markup draws in light in a colour of
  its own and in dark transparent, of no width or style, or in the colour of
  the dark surface it is drawn on (an element's own `dark:bg-*`, else its
  nearest enclosing one's, a `CardContainer` or `.card-container` being the
  card surface, gray-800, else the page's, gray-900; a border on the surface
  around its element, the line between a list's rows on the list's own),
  and in a module's class strings the edges a theme removes.
  `tests/house-surface-rules.test.ts` holds the library's files to none.

## 0.36.0 - no shadow inside the page, one inset on all four sides, one drawer

### Changed

- No shadow inside the page. The page has one elevation,
  `--gawdux-surface-elevation` (light and dark): tokens.css draws it on the
  outermost content surface (`.context-surface` not nested in another) and
  on `.page-command-bar`, and `.shadow-md` reads it. A surface that sits in
  the page draws none: `.page-tabs-shell` and `.table-container` lose their
  `shadow-md`, as do `TableContainer`, `MasterDetailShell`'s card,
  `StatTile` (no hover shadow), `PageFeedback`'s card, `FilterPillRow`'s
  current pill, `ListQueryBar`'s Filters button, `RailRowButton`'s selected
  row, `ProviderHealthBar`, `BotIdentityHeader`'s avatar, a
  `.responsive-card-table` row, a labelled `.gawdux-tool-button` and an
  `.interactive-surface` under the pointer (its edge darkens instead).
- `CardContainer` draws its own house surface (`.card-container`: the card
  surface, the house edge and radius, the muted text, no shadow) in place of
  Flowbite's `Card`, whose frame hard-codes a shadow. An invalid card
  doubles its red edge with an outline.
- One inset on all four sides. `--gawdux-page-inset` is the content inset of
  every inset host on its four sides (`.scroll-surface`, `.page-inset`,
  `EditablePageScaffold`'s body, `MasterDetailShell`'s frame,
  `TabFillPanel scroll`), so a card in a panel stands as far above the
  command bar, or an open drawer's seam, as below the tab strip and in from
  the sides; 8px at or below the compact width. Inside a host the
  two-pane frame adds nothing (the card has no shadow to make room for); at
  the compact width it spans the host's padding box on every side, and the
  two-pane card is at least as tall as its frame, so a short list or detail
  still reaches the command bar's seam (or an open drawer's) with no band of
  the panel under it.
- `ConfirmationCommandSurface` has one presentation, the house drawer at the
  command bar (`CommandBarConfirmationPresentation`); `DiscardNavigationCommandSurface`
  is the same drawer (`PageCommandBarConfirm`, "Keep editing" and the
  destination's confirm). Neither draws chrome of its own.

### Added

- `EditablePageScaffold`'s `panes`: with `surface`, a surface that hosts
  panes, not content (a list beside a reader), whose body takes no inset, so
  a host never sets the inset's knob to zero.
- `gawdux/utils`: `surfaceShadows`, `shadowedFlowbiteImports`,
  `insetOverrides` and `withoutComments`, the house surface rules as a
  source reads them, for a static guard over a library's or a host's own
  files. `tests/house-surface-rules.test.ts` holds this library to them.

### Removed

- `--gawdux-page-inset-bottom` (the inset is one value) and
  `--gawdux-hover-shadow-rgb`.
- `CommandDrawer`'s `card` variant: a drawer is the house
  `.page-command-drawer`, with no rounded panel floating above the bar.
- The `presentation` prop of `ConfirmationCommandSurface` and of
  `DiscardNavigationCommandSurface` (`anchorBottom` too), and the
  `DiscardNavigationCommandPresentationProps` type.

## 0.35.0 - a tab is an icon and its label, a trail ends at the item's place

### Added

- `fitLabels`, with `labelsFit`: a row of controls each carrying an icon and
  a label (a tab strip, or a row holding a strip and the tools after it)
  shows its labels while they fit its own box and its icons alone when they
  do not. It reads, with the labels shown, the width the controls need
  against the width the row has, never the viewport's, and marks the row
  `data-labels="icons"` when they do not fit, again whenever the row or
  anything in it changes size, a control comes or goes, or a web font
  arrives. While the labels are hidden each control whose label hid carries
  it as its tooltip, unless it has a title of its own.
- tokens.css, "Icons alone while the labels do not fit": a hidden label
  (`.gawdux-control-label`) stays as words a screen reader reads; a tab
  shows its icon alone on a 44px target, its accent and underline marking
  the current one as before.
- `.gawdux-tool-button`, a tool after a tab strip: a labelled button while
  its row's labels fit, the house icon button at a header's size (32px, a
  44px target at or below the compact width, flat) once the row shows
  icons; pressed (`aria-pressed`, or `aria-expanded` for a panel it opens)
  it reads in the accent, the selected row's tint once it shows its icon.
- `.gawdux-tool-select`, a choice after a tab strip: its value whole while
  its row's labels fit, the host's short form of it
  (`.gawdux-tool-select-short`) on a flat control as tall as the icon
  buttons once the row shows icons, the choice laid over it, so a press
  opens it and a screen reader reads the full value.
- `namedByHeader` on `AppBreadcrumbItem` and `BreadcrumbCrumb`, carried by
  `createBreadcrumbBuilder().fromItems`: the last level is the item the
  page's own header names beside its status.

### Changed

- `PageTabs`' strip shows its tabs' labels while they fit and each tab's
  icon alone when they do not (`fitLabels`), and still scrolls within itself
  with its fade when even the icons do not fit.
- `TabTitle` marks its icon (`.gawdux-control-icon`, hidden from the screen
  reader) and its label (`.gawdux-control-label`) for the strip to hide; a
  tab with no icon carries no mark, so its label never hides. Written with
  runes.
- `Breadcrumbs` leaves a last level marked `namedByHeader` out of its line:
  above the compact width the trail ends at the item's place, every level a
  link and none marked as the current page, so the item's name shows once,
  in its header; at the compact width the page's row names it and opens the
  whole path, as before.

## 0.34.0 - a drawer and the bar read as one surface

### Added

- `--gawdux-command-surface`, the command bar's surface and the surface of a
  drawer that opens out of it (rgb(249 250 251) in light, rgb(28 37 51) in
  dark, the values the bar already drew): one value, so the two can never
  differ.

### Changed

- The command bar and `.page-command-drawer` (what `PageCommandBarConfirm`
  and the attached `CommandDrawer` render) take their surface from
  `--gawdux-command-surface` and their edge from `--gawdux-border`, the
  content surface's own edge colour, in place of a literal per theme. The
  seam, the bar's sides and the card's sides are one colour.

### Fixed

- A drawer opened at the bottom of a content surface (a pane's own decision,
  inside the card) no longer draws sides of its own: they stood 1px inside
  the card's, so the drawer's edges read as a second, brighter line that
  stopped where the bar began. The surface's sides continue into the bar's.
- At or below the compact width a drawer has no sides, as the content
  surface and the bar have none there: its seam is its one line.
- `.page-command-drawer` has no shadow of its own (`box-shadow: none`).

## 0.33.0 - the one rule for long values, flat header controls, the bar from its start

### Added

- `LongText` and `longTextRuns` (with `LongTextRun`): one rule for long
  values in a line of text. An identifier (a record label, a document
  number, a request's reference such as 4ab67d51-0ef, a range like "(A–Z)")
  and a moment never break inside themselves; a hash (32 or more hexadecimal
  characters) wraps inside its own box at any character; the words around
  them wrap between words. Each run is a span of its own
  (`.gawdux-long-text-whole`, `.gawdux-long-text-hash`), so only the
  wrapping changes, never a character: copying the line gives it as written.
- `--gawdux-header-control-hover-surface`, a header control's quiet fill
  under the pointer (gray-200 in light, gray-800 in dark).

### Changed

- A strip's message (`SurfaceFeedback`, and `PageFeedback` in its `band`
  layout) is drawn by `LongText`, so a reference in it never breaks at its
  hyphen on a phone. A card keeps breaking an unbroken token anywhere, so a
  provider's URL never widens it past its column.
- `UserMenu` is flat while closed, in light and dark: no surface, border or
  shadow of its own at rest, the header's surface showing through it, and
  the header's quiet fill under the pointer. Open, it lifts as before
  (border, shadow, the raised menu surface).
- `ShellBar` lays its occupant's controls from the bar's start, 4px from its
  edge and 4px apart, as the host's end keeps to its right end, in place of
  centring each in an equal share of the room before the end: an occupant
  of one or two controls (a chat toggle, a door) sits at the start.

## 0.32.0 - one sign that a strip scrolls, a status after its strip

### Added

- `scrollEdges` (and `scrollFadeOf`, `ScrollFade`): anything that scrolls
  sideways says so one way. The action marks a strip `data-scroll-fade` with
  the side or sides where more of it lies (`start`, `end`, `both`; no mark
  while it all shows) and keeps the mark as it scrolls, resizes or changes,
  and `.gawdux-scroll-fade` draws the fade as the strip's own mask,
  `--gawdux-scroll-fade-size` (1.5rem) wide, so nothing is laid over the strip
  and no label is covered. A tab strip keeps its bottom rule whole.
- `--gawdux-row-selected-surface` and `--gawdux-row-selected-text`, the
  house's selected row in light and dark (a blue tint and the accent's text).
- `IconButton` takes `size` (`sm`, 28px, the default; `md`, a header's, 32px
  and a 44px target at or below the compact width) and `children`, a glyph
  that is no icon (a channel's #), in place of `icon`. It stays flat in light
  and dark: no border and no shadow at rest.

### Changed

- `PageTabs` fades its strip where more tabs lie, and draws the page's
  status after the strip, never inside it: the strip ends where the status
  begins (`--gawdux-page-tabs-status-width`, measured), the status stands as
  tall as the strip with its bottom rule, so a strip that scrolls sideways
  scrolls beside the status and no tab's label is under it. The status is a
  `div` sibling of the strip carrying `data-page-status`, no longer the
  strip's last `li`.
- PageTabs' strip rests with its first tab whole: its inline padding is
  where a tab snaps (`scroll-padding-inline`), so a strip at rest shows no
  fade before its first tab.
- `FilterPillRow` fades its row where more pills lie (`scrollEdges`); the
  1px marks at its edges are removed. A wrapped row shows no fade.
- `Breadcrumbs`' path menu (and the fold menu) marks the current level with
  the house's selected row, focused or not, not by weight alone.

## 0.31.1 - a master and detail card edge to edge on a phone

### Fixed

- At or below the compact width `MasterDetailShell`'s card is the panel's
  content, not a box inside it: it spans its host edge to edge (inside an
  inset host, across the host's padding), with no border, radius or shadow,
  and its panes carry the level-one inset, so a list's search and rows sit
  8px from the screen's edge. Above the compact width nothing changes.

## 0.31.0 - more room on a phone

### Changed

- `Breadcrumbs` is one row at or below the compact width
  (`BREADCRUMB_COMPACT_QUERY`, `(max-width: 1024px)`): the current page's
  name is a button with a chevron, its name on one line and cut with an
  ellipsis, and the button opens the path below the header, every level from
  the top down as a link, the current page last and marked
  (`aria-current="page"`), each name whole and wrapping between words. The
  path is a menu (`role="menu"`, the house menu's look and keys: arrows,
  Home, End), never a modal; Escape or a press outside closes it and puts
  the focus back on the button, choosing a level or a new trail closes it.
  A trail of one level shows its name as plain text with no chevron. The
  two-line compact layout is removed.
- `BREADCRUMB_STACK_QUERY` is renamed `BREADCRUMB_COMPACT_QUERY`.
- `ShellBar` keeps the host's end at the bar's right end, its controls side
  by side and its last control the last in the bar, in the same place with
  or without an occupant; an occupant's controls share the room before it.
- A command bar with nothing to hold is not drawn (`.page-command-bar` with
  no zone content). The surface above it then keeps its own bottom edge; the
  stretch to the column's bottom holds either way.
- A tab strip is one row at every width (`.gawdux-tab-strip`, carried by
  `PageTabs`' strip): tabs that do not fit scroll sideways inside the strip,
  never wrapping onto a second row nor scrolling the page. A host's own strip
  carries the class to follow the same rule. The compact-only rule on
  `.page-tabs-list` is folded into it.

### Added

- Tight levels zero and one at or below the compact width, one rule in
  `tokens.css`: the outermost content surface, a page's tabs nested in it
  and the command bar run edge to edge (no side border, radius or shadow),
  and the panel's inset, the hosts directly inside it, the filter row and a
  responsive card table's grid sit at `--gawdux-compact-inset` (8px, new).
  `--gawdux-page-inset` takes that value there. Boxes nested in the content
  (a card, a field, a tile) keep their own padding.
- `UserMenuThemeRow`, the theme as one row of a user menu: a
  `menuitemcheckbox` with a moon icon, its label ("Dark mode" by default)
  and a switch showing the state, which turns the theme and leaves the menu
  open. `UserMenu` takes `theme` (`UserMenuTheme`: `cookieName`, `label`) to
  draw it before its extra rows, and its keys move over every row kind.
- `isDarkTheme`, `setColorTheme`, `toggleColorTheme`, `watchColorTheme` and
  `COLOR_THEME_STORAGE_KEY` in `gawdux/utils`, the one place the theme is set
  and kept, shared by `DarkModeToggle` and `UserMenuThemeRow`.

## 0.30.2 - the next page's status, though its tabs mounted first

### Fixed

- `PageTabs` draws the page's status after a navigation. A navigation mounts
  the next page's tabs while the previous page's are still there, so the
  previous strip held the status and the next drew none, even once the
  previous page had gone. A claim now waits: the first live claim draws the
  status, and a later one draws it once every claim before it is released.
  The strip also follows the status as the host's state changes, which a
  page whose status arrives after its tabs mounted needs.

### Changed

- `PageStatusHost.claim()` returns a `PageStatusClaim`: `status`, a store of
  the status this header draws (the host's while the claim is first, else
  null), and `release()`. It no longer returns null when another header
  holds the status.

## 0.30.1 - the count no taller than a line of words

### Fixed

- `PageCommandBarProgress` stands 16px, words, gap and track together: the
  words 11px on a 12px line, a 1px gap and a 3px track. A bar whose status
  zone wraps onto its own row on a narrow screen is no taller with the count
  than with one line of status words.

## 0.30.0 - one count in the command bar: the words above, a track below

### Added

- `PageCommandBarProgress`, a determinate count for a command bar's status
  zone: the words small and on one line, above a thin track as wide as they
  are, the pair inside the bar's height at every width. The group is as wide
  as its words and never wider than its zone, where the words yield with an
  ellipsis and keep the whole in their tooltip. The track is the progress bar
  of assistive technology (`role="progressbar"`, its value the count, its
  value text the words, its name `name` or the words), and is drawn only when
  there is a count: a total above zero. Words without a count read alone. A
  value outside the count is held to it.

## 0.29.0 - the phone shell: one bar at the bottom, a two-line trail, a status shown once

### Added

- `ShellBar`, the phone shell's one bar along the bottom of the screen. At or
  below the shell's compact width (`SHELL_BAR_QUERY`, 1024px) it is one row
  fixed to the bottom, clear of the safe-area inset, every control in it a
  44px target: an occupant's controls first (a chat rail, in its order), then
  the host's at its end (`end`: the notices, the theme, the account), so a
  phone has one bar, never two stacked. Above the compact width the host's end
  is hidden and the element is not drawn (`wide` "hidden") or left to its
  occupant's layout (`wide` "column"). An occupant marks the parts that give
  their controls to the row `data-shell-bar-group` and a part of its column
  alone `data-shell-bar-column`. The bar's height and the inset below it are
  `--gawdux-shell-bar-space` (`SHELL_BAR_SPACE_VAR`), which a host leaves under
  its page. What it holds reads `inShellBar()` as true; a menu there opens
  upward as `.gawdux-shell-bar-sheet`, above the bar inside the screen's
  gutter, never a modal, and while one is open the bar stands above the
  page's floating layers. The layout is the stylesheet's (tokens.css).
- `PAGE_STATUS_CONTEXT`, `createPageStatusHost` and `PageStatusHost`: a host
  states the page's status once, and the page's own header draws it.
  `PageTabs` claims it and draws it at the end of its tab strip
  (`data-page-status`), in sight at the strip's end where the tabs scroll; a
  second set of tabs inside the first draws nothing.
- `BREADCRUMB_STACK_QUERY` and `breadcrumbWords`.
- `UserMenu` in a `ShellBar` is the avatar alone and opens its body upward as
  the bar's sheet.

### Changed

- `Breadcrumbs` reads on two lines at or below the compact width (`layout`
  "adaptive", the default): the current page on a line of its own, whole,
  wrapping between its words and never inside one (an identifier such as
  CC-0003 never breaks; a separator stays with the word before it), and
  the path above it on a smaller muted line, which folds its middle crumbs
  into the … menu, then shows the first crumb as its icon, then folds it, then
  cuts the page's parent, every crumb reachable. Above it the trail keeps one
  line; `layout` "line" keeps one line at every width.
- The page command bar centres its commands on a phone as it does above the
  compact width, and centres every row they wrap onto.
- `ListQueryBar` on a phone keeps the filter button at the end of the pill
  row: the search takes a line of its own and the pills scroll beside the
  button, instead of the button standing alone on a third line.

### Removed

- `Breadcrumbs`' `trailing` and the plan's `trailingHidden`, and
  `BreadcrumbOverflowMeasure.trailing`: the trail carries no status, the
  page's own header does (`PAGE_STATUS_CONTEXT`).

## 0.28.1 - an empty state says what is so

### Changed

- `AiKnowledgePanel`'s empty rail reads "No knowledge bases yet." and no
  longer names the button that makes the first one.
- `AiSkillsPanel`'s detail with no skill chosen reads "No skill selected.", as
  a host's other detail panes do, instead of telling the person to pick one
  from the list beside it.

## 0.28.0 - the command bar wraps on a narrow screen, crumbs keep the leaf, one separator rule

### Changed

- The page command bar below the compact width stacks its zones and wraps
  each one in the house order instead of panning: a zone's controls flow onto
  a second line, a button and a link keep their words on one line, and a
  status chip in the left or right zone reads whole, never truncated.
- `Breadcrumbs` keeps the leaf's title readable on a narrow screen: the
  middle crumbs fold first, then the first crumb shows its icon alone, then it
  folds, then the trailing status yields its room (`plan.trailingHidden`,
  kept in the layout and hidden), and only then is the leaf cut.
- `ApprovalsLedger` keeps each separator with the part before it: a row never
  wraps just before " · ", so a line never starts with "· 2026-11-07 ...".

### Added

- `LEDGER_PART_SEPARATOR`, the separator the ledger joins a row's parts with
  (a no-break space, then the middle dot and a space).
- `MASTER_DETAIL_COMPACT_QUERY` and `masterDetailCompact()`, the width at
  which `MasterDetailShell` shows its list or its detail alone, so a host
  opens on the list there instead of selecting a first row the reader does
  not see.

## 0.27.0 - an execution report in the house style, with nothing to sign or complete

### Changed

- `ValidationRunReport` reads an execution's results as Passed, Failed and
  Not run, each in one colour of the tokens (`--gawdux-text-success`,
  `--gawdux-text-error`, `--gawdux-text-muted`), and counts the three. A
  failed case opens. The host heads the report (protocol, version, where and
  when) and passes the words that replace observations and captures it
  withholds as `heldNotice`; the component no longer words them itself. Each
  capture names its SHA-256 beside its link, and the execution's identity
  names its content SHA-256.
- `ValidationExecutionView` is the execution's id, its content SHA-256,
  whether evidence is withheld, its cases and its requirement coverage.
  `ValidationCaseView` and `ValidationStepView` carry a result each.

### Added

- `resultWord` and `resultCounts`, the words and the counts the report reads.

### Removed

- `ValidationRunReport` loses `onmanual`, the manual observation block, the
  "Awaiting completion" count and the status pill: an execution is read, not
  completed or signed here.
- `ManualObservationForm` and `SignatureHistory`, with `ManualObservationInput`
  and `SignatureHistoryEntry`, leave `gawdux/validation`.

## 0.26.13 - a signatures table never breaks a moment inside itself

### Fixed

- `ApprovalsLedgerSignatures` keeps each moment whole: the "Signed at" cell
  draws the moment as a run that never wraps (`data-signature-at`). Before,
  the cells wrapped the moment at its spaces, so on a narrow page
  "2026-11-07 08:42:07 EST" read over two to four lines.
- Five columns and a whole moment need about 26rem. Below 32rem of its own
  width (`container-type: inline-size` on the table's frame,
  `data-signatures-frame`) the table reads as one block per signature, each
  fact beside its column's name (`data-label` on every cell), a reason not
  given left out (`data-empty`). From 32rem it is the table it was. It still
  keeps no scroller of its own, so it reads inside the one scroller of the
  page that holds it, and an address still breaks anywhere.

## 0.26.12 - a ledger row wraps between its parts, never inside its moment

### Fixed

- `ApprovalsLedger` draws each row's parts as runs of their own: the role,
  the signer, the meaning, the moment, "Also signed ..." and the note. The
  moment never wraps inside itself, and the row wraps between its parts. A
  row drawn as one string broke inside its stamp on a narrow page, reading
  "Approved · 2026-11-07" over "07:40:02 EST". Each run carries
  `data-ledger-part` with its kind; the row's words are unchanged.

### Added

- `ledgerRowParts(row, stamp)`, exported from `gawdux/primitives` with
  `LedgerRowPart` and `LedgerRowPartKind`: a row's parts in order, a part
  the row does not carry left out. `ledgerRowText` joins the same parts with
  " · ", so a surface that draws the row and one that writes it as text say
  the same words.

## 0.26.11 - one row-click guard, and a control that redraws itself keeps its click

### Fixed

- `rowLinkIntent`, `activateRowLink` and `DataTable`'s row click leave a click
  whose target has left the document to the control that removed it. A real
  click runs the page's microtasks between one listener and the next, so a
  control that redraws itself on click (a disclosure chevron that swaps its
  icon on open) has removed the click's target by the time the click reaches
  the row. The row read the click as its own and undid what the control did:
  a row navigated, or closed again what its chevron had just opened.

### Changed

- `isRowClickTarget` is the one row-click guard, and `rowLinkIntent` asks it.
  It lives in `utils/row-link` and `gawdux/primitives` exports the same
  function. It now leaves to the control every control the row link leaves
  (`[role="link"]`, `[role="checkbox"]`, `[role="switch"]`,
  `[role="combobox"]`, `[role="menuitem"]`, `[role="tab"]`, editable content
  and `data-row-interactive`, beside the native controls it read), and reads
  a text-node target by the element that holds it, where it took any
  text-node target as the row's.

## 0.26.10 - a yield that holds across a breakpoint, one tooltip for the account card

### Fixed

- `createRoomYield` reads a control's full width from its probe, the element
  marked `data-room-full` in its box, at the viewport the row has now. A
  control that is its avatar below a breakpoint of its own measured 44px as
  its full width there, and a yield taken below the breakpoint gave the
  control back for a frame as the window widened past it. Without a probe the
  full width is still the last one the box had while the control did not
  yield.
- `planRoomYield` never yields a control already as narrow as it yields: it
  gives the sibling nothing, and the next control yields in its place. Below
  `compactBelow` the account menu took the host's `compact` whenever the trail
  overflowed, though nothing about its width changed.
- `UserMenu` names the person in the closed card's tooltip at every size, not
  only when the host compacts it: the avatar below `compactBelow` named no one
  while the same avatar compacted by the host did.

### Added

- `UserMenu` carries its full-size probe (`data-room-full`): the closed
  trigger at full size between the two width knobs, the avatar below
  `compactBelow`, never the host's `compact`; its words come from attributes,
  so it adds no text to the page.

## 0.26.9 - controls that give the header trail their room

### Added

- `Breadcrumbs` reports the room it needs: `room` (bindable) carries, once
  the trail is measured, `available` (its box's width), `whole` (every crumb
  in full with the chip) and `page` (the current page whole with the chip,
  the crumbs on the way folded and the first as its icon). The needs come
  from the measures alone, never from the room, and a new trail keeps the
  last report until it is measured. `breadcrumbNeed` is the same arithmetic,
  pure, and `BreadcrumbNeed` and `BreadcrumbRoom` are exported from
  `gawdux/primitives`.
- `createRoomYield` (`gawdux/utils`): header controls that give their room to
  a sibling that needs it, an account menu showing its avatar alone so the
  trail reads whole. A control yields when the sibling needs more than the
  room it would have with every control at full size, in the order given,
  each only when the ones before it are not enough, and comes back as soon as
  the sibling fits without it. The room at full size is the same whichever
  controls yield, so the row never oscillates. `planRoomYield` and
  `roomAtFullSize` are the rule, pure.
- `UserMenu` takes `compact`: the closed menu is the avatar alone at every
  width, as below `compactBelow`, and opens the same panel growing to the
  left. The name stays the trigger's accessible name; the closed card names
  the person in its tooltip, on the card rather than the trigger, so the
  trigger gains no description. A `presentation` receives `compact`.

## 0.26.8 - a … button that keeps the focus both ways, an Escape the menu takes

### Fixed

- `Breadcrumbs`: the `…` button keeps the focus when the trail widens. It
  already did when the trail narrowed, but a wider trail brings the first
  level the button stood for back as a crumb, and the focus went to that
  crumb's link while the button, one level to the right, closed a menu the
  pointer had opened. The button now keeps the focus wherever it moves, its
  menu open or closed as it was; only the trail unfolding whole hands the
  focus to the crumb of the first level it stood for.
- `createDisclosureController`: the Escape that closes the disclosure is
  taken (`preventDefault`). A page handler bound after it that reads
  `defaultPrevented` (a dock that closes on Escape) closed too, when a menu
  the pointer opened was closed by an Escape pressed with the focus outside
  it. A closed disclosure takes no Escape, and a composing or already
  handled Escape is left as before.

## 0.26.7 - a current page that stays readable, a focus that follows its level

### Fixed

- `Breadcrumbs`: the current page keeps a readable minimum. In a narrow box
  (a pane beside an open dock) the plan cut the page and the layout squeezed
  it to a few pixels, so the trail showed the first crumb's icon and the `…`
  button alone. The page now ellipsizes only down to its own width up to
  64px (`BREADCRUMB_LEAF_MIN_PX`, four or five characters), held by a CSS
  `min-width` on its crumb, its chip added. A last step follows: the first
  crumb folds into the menu too, the `…` button stands first with no
  separator before it, and the trail reads "… › Pack…" with its chip. The
  menu then lists the first crumb. The first crumb folds only when that
  narrows the trail, and a page no wider than the minimum is never cut. Past
  the narrowest the trail can go, the page holds its minimum and the trail's
  box clips the end.
- `Breadcrumbs`: the focus follows its level when the trail re-plans. A
  focused menu row whose level comes back to the trail (the trail unfolding
  closes the menu) lost the focus to the page's body; it now lands on that
  level's crumb, its link or, without one, the current page, and the menu
  closes behind it. A focused crumb that folds hands the focus to the `…`
  button, and the button keeps it when it moves.

## 0.26.6 - one trail, a menu that stays closed, a signatures table that wraps

### Fixed

- `Breadcrumbs`: the trail unfolding closes its menu. Before, the menu only
  hid while the trail fitted, so it came back open, its listeners bound again,
  the next time the trail folded, with no press on the `…` button.
- `ApprovalsLedgerSignatures` keeps no scroller of its own: the table is no
  longer wrapped in `overflow-x-auto`. On a narrow page its cells wrap, the
  moment at its spaces (no `whitespace-nowrap`) and the signer's address
  anywhere (`[overflow-wrap:anywhere]`), so it reads inside the one scroller
  of the page or document that holds it.

### Removed

- `BreadcrumbTrail`, the slot adapter over `Breadcrumbs`, and its `afterLast`
  slot. Use `Breadcrumbs` with the chip in its `trailing` snippet (the 0.26.4
  migration).
- `EditablePageScaffold`'s `breadcrumb` slot. It was never shown (it rendered
  inside a hidden box), so a page that filled it mounted a second, invisible
  trail beside the header's. The app header draws the page's trail; drop the
  slot's content.

## 0.26.5 - a pane header's state with an optional lock

### Added

- `HeaderStatus` (`gawdux/primitives`): a pane header's state. It takes
  `color` (`StatusBadgeColor`) and `label`, the host's word, and always shows
  them as a `StatusBadge` in the header's density (`px-1.5 py-0 text-[10px]`,
  the chip a header wears beside its title); `className` merges further chip
  classes over it.
  - `lockReason` (a string, or `null`/`undefined`): set, a small lock follows
    the chip, `role="img"`, the reason its tooltip and its accessible name.
    The lock carries no word of its own: the chip names the state, the
    tooltip says why the viewer cannot edit. Empty or blank, no lock.
  - The lock is quiet, `text-gray-500` (`dark:text-gray-400`), the header's
    secondary text, so the chip's colour stays the one signal.

## 0.26.4 - a breadcrumb trail that folds its middle instead of clipping

### Added

- `Breadcrumbs` (`gawdux/primitives`): an app header's trail on one line that
  never wraps and never clips a crumb. It takes `items`
  (`BreadcrumbCrumb[]`, the last is the current page), `trailing` (a snippet
  beside the current page: a status chip), `label` (the landmark's name,
  "Breadcrumb"), `moreLabel` (the `…` button's name and tooltip, "Show the
  hidden levels") and `className`.
  - Every crumb shows in full while the trail fits. When it does not, the
    trail gives way in this order, each step only when the one before is not
    enough:
    1. the crumbs between the first and the current page fold into one `…`
       button, from the inside out: the crumb nearest the middle first, then
       its neighbours outward, the root side first on a tie, so the folded
       crumbs are always one run and the current page's parent folds last;
    2. the first crumb shows as its icon alone (when it has one), still a
       link, its name in a tooltip and for a screen reader;
    3. the current page ellipsizes, the very last resort, its full name in a
       tooltip.
  - `trailing` never gives way, and the trail spaces it from the page's words
    (0.5rem).
  - The `…` button takes the separator of the first crumb it folds and opens a
    small menu under it, not a dialog, listing in order every level the trail
    does not name: the first crumb when it shows as its icon, the folded
    crumbs, the current page when it is cut (`aria-current="page"`). A level
    with an `href` is a link; one without is a row of words the arrows pass
    over. The menu is the house dropdown: UserMenu's surface, border, shadow
    and 32px rows, one highlighted row, the ring for the keyboard only. It is
    `position: fixed` under the button and follows it on a scroll or a
    resize, so a clipping box around the trail never cuts it.
  - Keyboard: the WAI-ARIA menu button pattern. Enter, Space or ArrowDown
    opens on the first link, ArrowUp on the last; the arrows wrap, Home and
    End jump, Escape closes and returns the focus to the button, Tab closes
    and moves on. A press outside, the focus leaving the trail, a chosen row
    and a new trail close it.
  - Measuring: a hidden copy of the trail is measured once per trail and
    again when its size changes (a web font arriving). A `ResizeObserver` on
    the trail's box re-plans on every resize, a sidebar or a dock opening,
    from those widths alone: a resize reads no layout. Until it is measured
    (a server render, no `ResizeObserver`) the trail shows whole. The root
    grows into its row (`flex: 1 1 0%; min-width: 0`), so its width never
    depends on what it shows.
  - The crumbs keep the token classes (`.breadcrumb-title`,
    `.breadcrumb-section-icon`, `.breadcrumb-chevron`, `.breadcrumb-label`)
    and look as they did.

### Changed

- `BreadcrumbTrail` renders `Breadcrumbs`: a consumer written with slots gets
  the folding trail and its menu, the `afterLast` slot riding as `trailing`.
  Its props (`items`, `className`, `h-12` by default) are unchanged; new code
  uses `Breadcrumbs`.
  - The trail no longer renders flowbite-svelte's `Breadcrumb` and
    `BreadcrumbItem`. The first crumb's icon sits inside its link, a
    separator carries `aria-hidden="true"`, a later crumb without an icon is
    separated by a chevron instead of nothing, and the `afterLast` content is
    centred on the crumb instead of lifted by `-translate-y-[3px]`.
  - Host rules that reached into the old trail (`> ol > li:last-child`,
    min-width floors on the crumbs, `flex-shrink` ratios, a `display: none`
    on the crumbs on the way, an ellipsis on `.breadcrumb-title`) fight the
    plan and should go: the trail owns its one line.

### Migration

- `<BreadcrumbTrail {items} className="…">` with
  `<svelte:fragment slot="afterLast">` becomes
  `<Breadcrumbs {items} className="…" trailing={…}>`, the chip in a snippet.
  Drop a left margin on the chip and any `overflow: hidden` on the trail's
  box or its wrapper.

### Known limits

- A box narrower than the first crumb's icon, the `…` button and the trailing
  chip together cuts the chip at the box's edge (the trail clips at its box,
  `overflow-x: clip`, rather than running under the controls beside it).
- An ellipsized current page can leave up to a character's width before the
  chip, where the ellipsis replaced a whole character.
- The menu opens below the button, aligned to its left edge; it does not flip
  above it near the bottom of the viewport.

## 0.26.3 - a command bar whose actions centre on their own line

### Fixed

- `.page-command-bar` switches layout at one boundary. The wide row applied
  from `(min-width: 1025px)` and the stacked grid to `(max-width: 1024px)`,
  so a zoomed browser between the two (1024.5px wide) matched neither and
  drew the old `1fr auto 1fr` grid. The wide row is now
  `not all and (max-width: 1024px)`: every width the stacked query does not
  match.
- A bar whose zones fit on one line draws exactly the row it drew before:
  same height, actions at the middle, words and buttons at the same place,
  measured in Chromium and Firefox. A bar whose words outgrow their share
  but still fit beside the actions keeps its row too, the actions moving
  along it as before.
- When the zones cannot share one line:
  - The words take a line of their own above the actions. The row runs right
    to left and wraps upward (`flex-flow: row-reverse wrap-reverse`, with
    the right zone ordered first and the left zone last), so the left zone is
    the first to leave, and the zones still read left, center, right across
    one row and top to bottom in document order once wrapped. With all three
    zones filled, the actions and the right zone share the line under the
    words when they fit together.
  - The actions sit centred on their line. They used to start at its left
    edge, because the side zone beside them took all the free space. Each
    side zone now grows by half a share (`flex: 0.5 1 0`): in a row that
    fits the two halves make the whole free space, and a zone alone beside
    the actions takes half of it, leaving the other half on the far side of
    them. The 1rem between zones moved from the column gap into the center's
    inline padding, so the space on either side of the actions is the same
    whichever is next to them.
  - Buttons wrap as whole buttons, each line centred; a label never wraps
    inside its button (`white-space: nowrap`, `flex-shrink: 0` on zone
    buttons and links). In a narrow pane they used to squeeze until each
    label broke over two or three lines.
  - Words wider than the whole bar wrap within it as text. A side zone's
    floor is `min-width: fit-content` (its words or the bar's width,
    whichever is less) instead of `max-content`, which ran past the bar's
    right edge. Inside a side zone `.truncate` wraps rather than ending in
    an ellipsis.
- An empty center zone is hidden unless both side zones are filled, so a
  bar with only words keeps one line when they wrap.
- Below the boundary the stacked grid is unchanged, and an attached
  `.page-command-drawer` still fuses with the bar.

### Known limits

- With all three zones filled in a pane too narrow for the actions to share
  a line with either side zone, the actions sit alone on their line, off the
  middle by half its free space. When only the words fit beside them, they
  share the words' line toward its right end, as before.
- A right zone whose text outgrows its share in a row that otherwise fits
  still moves the actions off the middle, as in 0.26.1.

## 0.26.2 - the host words a failed history load

### Added

- `createHistoryTab` takes an optional second argument, `HistoryTabOptions`
  (exported from `gawdux/utils`), with `errorMessage(error, fallback)`: the
  same port the admin panels take. It receives the fetcher's rejection exactly
  as thrown, so a kind and a request reference the host's error carries reach
  it, and the default sentence ("The history could not be loaded."), and what
  it returns becomes `error`. A host can now lead with the calm sentence and
  follow it with its troubleshooting handle instead of showing a fixed line
  nobody can trace.
  - Blank words, or a formatter that throws, leave the default sentence: a
    failed load never reads as no failure, and the tab never stays loading.
  - Entries keep their rules: undefined after a failed first load, the last
    good list after a failed refresh of the same record.
  - A host that passes nothing sees the sentence it saw before.

## 0.26.1 - a command bar that wraps instead of clipping; sortable headers that wrap

### Fixed

- `.page-command-bar` above 1024px of viewport is a wrapping flex row instead
  of the `1fr auto 1fr` grid. The grid let the left zone's track shrink to
  nothing, so in a narrow pane (a 774px bar beside an open side panel) the
  left zone's state words clipped to a single letter and an ellipsis whenever
  the center's actions took most of the width. Now:
  - A bar whose left and right zones each fit their equal share of the free
    space draws exactly the row it drew before: same height, center at the
    middle, every zone and control at the same place.
  - A side zone never shrinks below its content (`min-width: max-content`).
    When its words outgrow their share but the three zones still fit on one
    line, the center moves along the row, off the middle, and nothing clips.
    A right zone whose text used to wrap inside its track now keeps it on
    one line.
  - When the three cannot share one line, the row wraps (`row-gap` 0.5rem)
    and the bar grows by a line: a center that does not fit starts the next
    line at its left edge; a right zone that does not fit fills its own line
    and keeps its content at the right.
  - A side zone whose content is wider than the whole bar overflows the bar's
    edge rather than ending in an ellipsis.
  - At 1024px and below the stacked grid is unchanged, and an attached
    `.page-command-drawer` still fuses with the bar.

### Added

- `SortableHeadCell` takes `wrap`, as `HeadCell` does: `whitespace-normal`
  instead of `whitespace-nowrap` on the `th`, so a long label takes a second
  line. False by default, which renders the markup it rendered before.

## 0.26.0 - decisions fused with the bar, a feedback outlet, and an approvals ledger

- `CommandDrawer`'s `attached` variant (the default) renders the house
  `.page-command-drawer` from `tokens.css` instead of its own Tailwind chrome
  and upward shadow, so the bar loses its top edge and fuses with every
  attached drawer the way it does with `PageCommandBarConfirm`. The drawer is
  centred; a form body sets `text-left` on itself, and titles, messages and
  errors use `.page-command-drawer-title`, `-message` and `-error`. The `card`
  variant is unchanged. Consumers whose attached bodies relied on left
  alignment or on the old background should check them.
- `SurfaceFeedbackOutlet` (`gawdux/primitives`) renders an
  `EditablePageScaffold`'s feedback strip inside a host-built panel that is not
  `PageTabs`. It claims `SURFACE_FEEDBACK_CONTEXT` as `PageTabs` does, renders
  `SurfaceFeedback` where it is mounted, and releases the claim while its
  `active` prop (default true) is false. The first claim wins; a second outlet
  renders nothing, as does an outlet outside a scaffold.
- `ApprovalsLedger` and `ApprovalsLedgerSignatures` (`gawdux/primitives`), with
  `ledgerRowText` and the types `LedgerView`, `LedgerRow`, `LedgerRowState` and
  `LedgerSignature`. Data in, words out: the host composes each row's words,
  the integrity sentence and the "approved with" link, and pairs rows with
  signatures; the ledger draws one line per role and a disclosure of every
  signature, each moment through `formatAuditDateTimeText` at the `timeZone`
  it is given, named. Rows carry `data-ledger-row`, `data-step` and
  `data-state`; the table's `integrity={false}` drops its Integrity column.
- `@types/node` is a development dependency, so `npm run check` type-checks the
  public package test that drives the compiler and resolver.

## 0.25.0 - reusable host lifecycle and presentation adapters

- Shared disclosure and focus-scope controllers preserve outside/Escape behavior,
  nested background custody, cleanup and focus restoration through explicit ports.
  Account and discard surfaces support host presentation without copied lifecycle.
- UTC day-series, explicit-zone date parts and ordered saved-view settlement are
  public utilities. Host time zones, thresholds, credit conversions, scope and
  transport remain explicit policy.
- Usage bars accept optional formatters, legends, native titles and geometry
  tokens while keeping existing defaults. Password adornments remain above input
  backgrounds within their own stacking context.

## 0.24.0 - optional usage-report presentation

- `AiUsageReport` accepts optional summary, activity and row-value snippets so
  hosts can retain their presentation and authorized disclosure without another
  report renderer. Shared breakdown iteration and share calculations remain
  authoritative; optional content, grid and row spacing preserve host geometry.
- Without presentation hooks, the existing labels, numbers, daily activity,
  notes, window intents and layout defaults are unchanged. An independent host
  fixture uses the real public `gawdux/admin` entry point.

## 0.23.0 - notice-only persistent feedback

- Persistent conditions may opt into notices without consuming floating overlay
  capacity. Explicit reveal, revision guards, deduplication and resolution retain
  their original behavior. Existing optional persistence namespaces let hosts
  retain their previously stored hidden-condition state without another engine.

## 0.22.0 - capability-driven Knowledge administration

- Added `AiKnowledgePanel` and opaque-ID model/action contracts to `gawdux/admin`.
  Shared interaction covers working copies, inline confirmations, pending writes,
  abortable resource search and upload selection. Hosts retain source eligibility,
  disclosure, limits, routes, storage, errors and optional usage/history policy.
- Successful responses settle locally before a focused host refresh. A refresh of
  the same selection preserves unsaved input, and stale search results cannot
  replace the active picker. No revision protocol or ingestion engine is inferred.
- The neutral fixture consumes the packaged public entry with string identifiers;
  build the package before running its DOM contract tests.

## 0.21.0 - capability-driven Skills administration

- Added `AiSkillsPanel` and its typed host model/action contracts to `gawdux/admin`.
  The panel shares selection, drafts, captured revisions, stale reload, dependency
  confirmation, binding rollback and preview presentation. Hosts retain routes,
  authorization, persistence, history and preview policy. Knowledge identifiers
  remain opaque strings or numbers; an absent model hides the capability.
- The neutral host fixture consumes the packaged public entry point with uncast
  string identifiers. Build the package before running its DOM contract tests.

## 0.20.0 - composable bot configuration fields

- Added `BotConfigContentFields` and `BotConfigAssignments` (`gawdux/admin`)
  for hosts that retain their own cards and working-copy lifecycle. Bindable
  values, validation messages, editor sizing and optional presentation snippets
  do not own persistence, revision checks or commands. `BotConfigFields`
  delegates to these leaves while retaining its existing API and defaults.
- Neutralized the related administration fixtures without changing their
  behavioral assertions.

## 0.19.0 - shared row background navigation

- `activateRowLink` and `rowLinkIntent` (`gawdux/utils`) share background row
  navigation. Native anchors and nested controls keep their behavior; modified
  and middle clicks open a separate browsing context, selected text and cancelled
  events do not navigate. The host keeps its router and row destinations.
- Removed a leftover merge-marker line from this history.

## 0.18.0 - a column header carries the icon of its meaning

### Added

- `HeadCell` (`gawdux/primitives`): the labelled, non-sortable header of a
  hand-built table. Props `label` (required), `icon`, `align` (left, center,
  right), `wrap` and `className`; it renders flowbite's `TableHeadCell` with
  `whitespace-nowrap` and, with an icon, the one header shape. Without an
  icon it is the `th` a plain `<TableHeadCell class="whitespace-nowrap">`
  renders. `wrap` lets a long label take a second line instead
  (`whitespace-normal`), for a wide table whose headers wrapped before it
  adopted `HeadCell`. An empty or screen-reader-only header stays a
  `TableHeadCell`.
- Four head-icon knobs in the `:root` density block of `styles/tokens.css`,
  at the geometry that shipped: `--gawdux-table-head-icon-size` (1rem),
  `--gawdux-table-head-icon-gap` (0.5rem), `--gawdux-table-head-icon-color`
  (`currentColor`, the header's own ink) and
  `--gawdux-table-head-icon-display` (`block`; `none` drops the icons).
- `headIcons` on `AuditHistoryTable`, `SecurityActivityList` and
  `AlertOpsConsole` (passed to `AlertGroupTable` and `SilenceTable`, which
  take it too): an optional map from a header's key to its icon, `{}` by
  default. Its key types are exported: `AuditHistoryHeadKey`,
  `SecurityActivityHeadKey`, `AlertOpsHeadKey`, with the `*HeadIcons` maps.
  Screen-reader-only and Actions headers have no key.
- `aria-sort` (`ascending` or `descending`) on the `SortableHeadCell` that
  is the active sort, and on no other. Invisible; screen readers now hear the
  sort.

### Changed

- A header icon renders through one shape in `DataTable` (plain and sortable
  columns alike) and `SortableHeadCell`:
  `span.table-head-label > svg.table-head-icon + span`, the icon always
  `aria-hidden`. Before, `DataTable`'s plain header wrote
  `span.inline-flex.gap-2` and `SortableHeadCell` a bare icon without
  `aria-hidden`. No visual change at the default knobs: 16px, 8px from the
  label, in the header's colour, before the label and the sort arrow.
- `DataTable`'s plain header is a `HeadCell`.

### Fixed

- A plain header with an icon no longer grows its row. The label box is
  `vertical-align: top`: an inline-flex box whose first item is an svg has no
  text baseline, so on the baseline it hung below the header's line (3px in
  a text-xs head with a 14px icon, 4px with 0.17.0's 16px `DataTable` icon).
  A sortable header, a flex row, was never affected.

### Notes

- A header without an icon renders as in 0.17.0, byte for byte (the tests
  compare `SortableHeadCell` against a copy of its 0.17.0 source).
- The `.table-head-label` and `.table-head-icon` rules are unlayered: they
  must outrank the `w-5 h-5` flowbite-svelte-icons puts on every icon. A
  consumer that imports `tokens.css` into a cascade layer loses that
  precedence; the icon then falls back to its `h-4 w-4` utility.
- The library carries no column vocabulary. A product decides which header
  carries which icon.
- The header tests render a stand-in icon shaped like flowbite-svelte-icons
  2.0.x (`tests/fixtures/BareIcon.svelte`): it names itself and sets no
  `aria-hidden` of its own. 2.3's icons set `aria-hidden` themselves after
  their props, so a test rendering one passed whether or not the header
  hid its icon; with the stand-in, a header that drops `aria-hidden` fails
  seven suites. Under 2.0.x (`^2.0.0` allows it) the header's own attribute
  is what keeps "shield outline" out of the column's accessible name.

## 0.17.0 - one content inset, owned once by the panel that hosts it

### Added

- Content inset knobs in the `:root` density block of `styles/tokens.css`,
  at the geometry that shipped: `--gawdux-page-inset` (1rem, the top and
  sides of every inset host) and `--gawdux-page-inset-bottom` (0.25rem, above
  the command bar). `.scroll-surface` (PageTabs' panel) and
  `EditablePageScaffold`'s body read them.
- `--gawdux-panel-wide-max-width` (72rem): the wide content column, read by
  `.panel-col-wide` and `MasterDetailShell`'s card. `none` lets both fill
  their panel.
- `.master-detail-card`: `MasterDetailShell`'s card, the one stable name to
  reach it by. It reads `--gawdux-panel-wide-max-width` from `tokens.css`,
  so the cap exists whether or not a consumer's Tailwind scans gawdux.
- `.page-inset`: a product's own surface becomes an inset host with the same
  padding.
- `TabFillPanel scroll`: a fill tab whose content scrolls. The panel is the
  one scroller, spans its host's padding box and pads itself with the knobs,
  so its scrollbar sits at the panel's edge and a hovered tile's shadow has
  the whole inset to draw in. It replaces an inner `overflow-y-auto` wrapper.

### Changed

- `MasterDetailShell` pads only where no host encloses it. Inside a
  `.scroll-surface`, an `EditablePageScaffold` body, a `.page-inset` surface
  or a `TabFillPanel scroll`, its frame adds no inset: the card sits on the
  host's inset. The frame clips (it scrolls below a 48rem container and
  clips above), so there it reaches 0.25rem past the card (never more than
  the host's own inset) and pads that back, and the card's shadow is drawn
  whole. In a bare, unpadded panel it keeps its own inset (the
  `master-detail-inset` class, read from the knobs).
- `MasterDetailShell`'s card drops `max-w-6xl` for `master-detail-card`, and
  the frame's height moves from `h-full` into `master-detail-inset`.
- `EditablePageScaffold`'s body pads around a two-pane shell instead of
  dropping its padding for it.
- `.panel-col-wide` reads `--gawdux-panel-wide-max-width`.

### Fixed

- `AlertOpsConsole`'s Alerts and Silences tab bodies drop `p-3`. Inside
  PageTabs' panel they were a second inset: their content sat 28 px from the
  tab row and the panel's sides instead of 16, and the bottom was padded
  twice. A test now holds every gawdux tab body to the panel's inset.

### Notes

- The default bottom inset is unchanged (0.25rem): a product that redeclares
  no knob keeps its geometry.
- A consumer that hosts a `MasterDetailShell` in a padded host (PageTabs'
  default panel, any `.scroll-surface`) loses the second inset: 32 / 32 / 8
  becomes 16 / 16 / 4. One that hosts it in a bare, unpadded surface keeps
  the shell's own inset. A surface of its own that should count as a host
  takes the `page-inset` class.
- Below a 48rem container width a shell inside a host scrolls in its frame,
  whose scrollbar sits 0.25rem outside the card instead of at the panel's
  edge.
- Inside a host the shell's frame reaches 0.25rem past the shell's own box.
  Keep a gap of at least 0.25rem (`space-y-*`, `gap-*`) between a hosted
  shell and anything beside it, or let the shell be its host's only content,
  as every current consumer does.
- The card no longer carries `max-w-6xl`. A consumer that lifted the cap by
  that class must use the knob instead. For example,
  `.wide-panel-host :global(.max-w-6xl) { max-width: none; }` matches
  nothing after this release, and its nested shells go back to a centred
  72rem card. Replace that rule with
  `.wide-panel-host { --gawdux-panel-wide-max-width: none; }`, which
  the shells' cards inherit.

## 0.16.0 - the account menu for every app shell; the command bar never keeps a dead page's buttons

### Added

- `UserMenu` (`gawdux/components` and the root) with the `UserMenuItem` and
  `UserMenuProps` types: the account menu of an app shell's top bar, one
  component in place of a hand-written menu per product.
  - The trigger is two lines, the name (strong) and the email (muted), beside
    a 28px avatar (initials derived from the name, or `initials`, or
    `avatarSrc`). It is identical open and closed, colours included: opening
    never moves or recolours the avatar or the text, only the chevron turns.
    The email is left out when it repeats the name. The card lifts (border,
    shadow, the raised menu surface) on hover and while open, so a click never
    changes it.
  - The card is as wide as the trigger's content, between
    `--gawdux-user-menu-min-width` (208px) and `--gawdux-user-menu-width`
    (272px); the open body never widens it. The root reserves the 44px height,
    so the toolbar never reflows.
  - The tenant is the open menu's first line, on the text column with no icon
    and no hover (a statement, not a row), the `access` chips right after it
    and an optional `accessLabel` caption before them. It describes the menu
    (`aria-describedby`), so a person who opens into the rows hears the tenant
    and the access. It is never a third trigger line.
  - Left-aligned rows with icons on one grid (`items` as data, `extraItems` as
    a snippet), sign-out last: a POST form (`signOutAction`, `signOutEnhance`)
    or a handler (`onsignout`), red on its icon and its word only. One
    highlighted row: the row under the pointer takes the focus, so a hovered
    row and a focused row are the same row, and the focus ring shows for the
    keyboard only.
  - One divider: full width, one quiet token (`--gawdux-menu-divider`),
    between the trigger, the tenant, the rows, sign-out and the footer.
  - The footer is the product mark (`mark`, a 16px box in the 28px leading
    column) and `{product} {version}` on one centre line in a 32px row,
    `versionTitle` as its tooltip; `footer` replaces it.
  - The panel takes its natural height (no max-height constant to outgrow).
    The closed body is `inert`.
  - WAI-ARIA menu button keyboard: Enter, Space and the arrows open into the
    rows, the arrows wrap, Home and End, Escape returns the focus to the
    trigger (only when the focus was the menu's or nobody's), Tab closes and
    moves on. `aria-controls` names the `role="menu"` element.
  - It closes on an outside press, when the focus leaves it, on a history
    navigation (popstate) and, for a pointer-opened menu, 150ms after the
    pointer leaves. `open` is bindable, so a host closes it on its own
    navigations.
  - `compactBelow` (768, 1024 or 0): the avatar alone below that width. Open,
    the trigger row is mirrored so the avatar stays where it was while the
    panel grows to its left, and the panel stops at the 16px gutter on the
    left edge (measured, not assumed), however narrow the phone.
  - Styled with scoped CSS over tokens, never Tailwind utilities, so it renders
    even where a host's Tailwind does not scan this package.
- Tokens, light and dark: `--gawdux-menu-surface` (white / gray-800: the open
  menu is lighter than a dark page, where a shadow does not show),
  `--gawdux-menu-item-hover` (gray-100 / gray-700), `--gawdux-menu-divider`
  (gray-100 / gray-700), `--gawdux-text-danger` (red-600 / red-400),
  `--gawdux-chip-surface` (gray-100 / gray-700), `--gawdux-avatar-surface`
  and `--gawdux-avatar-text` (blue-600 and white in both); and the knobs
  `--gawdux-user-menu-min-width` (208px) and `--gawdux-user-menu-width`
  (272px).

### Fixed

- `PageCommandBar`, `PageCommandBarCenter` and `PageCommandBarRight` release
  their registration from a teardown that exists from the moment they
  register (`$effect.pre`), instead of `onDestroy`. A registrant destroyed in
  the flush that created it (an earlier effect closed its block) never ran its
  deferred effects, so its registration stayed live and its dead buttons came
  back to the bar whenever it was the newest: a decision opened and closed in
  one flush left its Cancel and Confirm on every later page.
  `PageCommandBarConfirm` and every surface built on these inherit the fix.
- An unframed `DataTable` (`framed={false}`, inside a card) drew its head
  and row separators in the text colour: the separator rule covered
  `.table-container` only, so flowbite's borders fell back to currentColor.
  The rule now covers `.data-table` as well.

### Hosts

- Render each zone as `{@render zone?.()}`, never
  `{#if zone}{@render zone()}{/if}`. After server rendering, Svelte hydrates
  the `{#if}` branch with the snippet's first node as its start; a swap to
  another snippet removes that node, and when the zone later empties the
  branch removes nothing, so the current buttons stay in the bar beside every
  later page's until a full reload. The registry's header says why.

## 0.15.0 - shared AI + Bots and Role blocks, the alert console's house states

### Added

- `gawdux/admin`, AI + Bots blocks shared by every product's Admin section
  (taken from the better of the two products' versions):
  - `AiUsageReport`: Turns and Tokens as stat tiles (plus the host's own
    tiles), the per-day bars in a card whose header offers the windows
    (`windows`, `onwindow`), and one card per breakdown with each row's
    turns, tokens and share of the window. `metric` picks what the bars
    count, `tokenUnit` what the product calls a token ("credits"), and a
    quiet window says so instead of drawing zeroes. Never money: a host that
    must show an amount puts it in a row's `note`.
  - `AiUsageBars`: the per-day bars, one keyboard-readable meter per day
    with the exact value in a tooltip; no canvas, no chart library, both
    themes.
  - `BotRail`: the bots as a master-detail rail (avatar, name, role, one
    on/off dot), with optional search and lanes; `botInitials`.
  - `BotIdentityHeader`: the selected bot's avatar, name, role and state
    pills, and what it does.
  - `BotConfigView`: one config read (name, state, the bots it applies to,
    the instructions as written), the read side of an Edit mode whose edit
    side is `BotConfigFields`.
  - `BotContextCard`: the composed block a bot reads, its size against the
    budget, its parts when the host has them (the block then behind a
    disclosure), a version, a host status line, and a go-to `link`.
- `RoleMembersCard` (`gawdux/admin`): who holds a Role, with a quiet trash
  icon per person that raises `onremove` for the host to confirm, and a
  picker that hands the chosen person to `onadd`. Read-only when the Role is
  platform-managed (`editable` false).
- Types: `AiUsageTotals`, `AiUsageDay`, `AiUsageBreakdown`,
  `AiUsageBreakdownRow`, `AiUsageTile`, `BotRailItem`, `BotContextPart`,
  `BotConfigSummary`, `RoleMemberItem`.

### Changed

- `MemberAccessCard`: taking a Role away is a quiet trash icon on the Role's
  row ("Remove from <Role>", copy key `removeFrom`), confirmed by the host,
  instead of a worded button.

- `AlertOpsConsole`: the Alerts and Silences tabs carry icons (`BellOutline`,
  `VolumeMuteOutline`) beside their labels.
- `AlertOpsConsole`: the denied and unavailable states are the house
  `CollectionEmptyState` (a lock, an exclamation) inside a `TableContainer`, so
  they fill the page surface and weld to the command bar like every list
  surface, instead of small bordered panels. The provider's error words follow
  the unavailable message. Test ids and the unavailable `role="alert"` stay.
- `AlertOpsConsole`: with `healthBar={false}` the unavailable state offers no
  Retry: the host that carries status and Refresh on its bar asks again from
  there. With the strip on, Retry stays and calls `onrefresh`.

### Fixed

- A `ReadonlyField` value that is one long token (an email, a MAC, a hash)
  wraps inside its column instead of running into the next one
  (`.readonly-value` takes `overflow-wrap: anywhere`).

## 0.14.2 - DataTable's link in the package

### Fixed

- 0.14.1 shipped `DataTable`'s `link` in the source but not in `dist`: the
  package was built before that change. Rebuilt; no other difference.

## 0.14.1 - the go-to icon, icon buttons

A drill-down is an arrow icon at the top right of what it leads from, never a
text link with an arrow under the content.

### Added

- `SectionLink` (`gawdux/primitives`): the go-to-section affordance, one arrow
  icon with no words. Its `label` names the destination ("Open Network") and is
  the accessible name and the tooltip. A link with `href`, a button with
  `onclick`, nothing with neither.
- `CardContainer` and `DataTable` `link` (`{ label, href?, onclick? }`): the
  go-to icon at the right end of the card header, after the header slot or
  snippet.
- `IconButton` (`gawdux/primitives`): an icon action named by its `label`
  (accessible name and tooltip). `tone="danger"` is grey at rest and red only
  on hover and focus, for a Remove that should not shout from every row.

### Changed

- `StatTile`'s drill-down (`href` or `onclick`) is the go-to icon at the right
  of the label row, after `aside`, instead of the small "View details →" text
  under the content. `actionLabel` keeps its meaning and becomes the tooltip
  and accessible name; consumers need no change.

## 0.14.0 - density knobs, stat tiles, data table, icon label

Nothing changes its look by default: every knob defaults to the geometry that
shipped before it, verified as identical computed styles in a browser (tables,
card header and body, tabs at rest, light and dark, desktop and narrow widths).
The two visible changes are the fixes listed under Fixed.

### Added

- Density knobs in `styles/tokens.css`, redeclared by a product after the
  `@import` (light and dark share them):
  - `--gawdux-table-cell-px` (`px-6`), `--gawdux-table-cell-py` (`py-4`),
    `--gawdux-table-head-py` (`py-3`), `--gawdux-table-row-height` (`auto`,
    a minimum): the padding of flowbite's default table cells inside a
    `TableContainer`, `ListSurface` or `DataTable`. Only a cell still carrying
    the default utility is routed; a cell that sets its own padding (`py-2`,
    `pl-3`, `md:py-2`, `!px-2`) keeps it, and the rules carry no specificity,
    so any consumer rule on a cell still wins.
  - `--gawdux-card-header-px`/`-py` and `--gawdux-card-body-px`/`-py`
    (`px-6 py-3` each): `CardContainer` and the `.card-header` class. The
    narrow-layout caps (1rem at 1024px, 0.75rem at 640px) remain ceilings, so a
    tighter knob stays tighter there too.
  - `--gawdux-tile-padding` (`p-3`), `--gawdux-tile-padding-nested` (`p-2.5`),
    `--gawdux-tile-gap` (`gap-3`), `--gawdux-tile-min-width` (`9rem`): the new
    stat tiles.

  A compact table, for example (40px rows, 48px with a second line):

  ```css
  @import "gawdux/styles/tokens.css";
  :root {
    --gawdux-table-cell-py: 0.3125rem;
    --gawdux-table-row-height: 2.5rem;
  }
  ```

- Tab colour tokens: `--gawdux-tab-text`, `--gawdux-tab-text-hover`,
  `--gawdux-tab-text-active`, `--gawdux-tab-indicator` (light and dark).
- `StatTile` and `StatTileStrip` (`gawdux/primitives`): the KPI tile of a
  detail overview, lifted from a consuming product's hero tiles. A tile takes
  `label`, `value`, `meta`, an optional `icon`, a state `tone` (`neutral`,
  `ok`, `warn`, `bad`, `info`) with an optional `dot`/`pulse`, a `nested`
  variant for tiles inside a card, and a drill-down that is a small text
  button (`onclick`) or link (`href`) worded by `actionLabel`, never the whole
  tile. `aside` and `children` snippets carry a label-row stamp and a custom
  body. The strip is an auto-fit grid: tiles share the row and wrap onto
  further rows, never clipped and never scrolled sideways. `statTileToneClass`
  exposes the tints.
- `DataTable` (`gawdux/primitives`): `TableContainer` + flowbite `Table` with
  headers from `columns` (`key`, `label`, `sort`, `align`, `class`,
  `headClass`, `cellClass`, `icon`; a `sort` column becomes a
  `SortableHeadCell` when the host passes `onSort`), body cells from a `cell`
  snippet (or a whole `row` snippet), `EmptyStateRow` when there are no rows,
  optional `onRowClick` (a click on a control in the row stays the
  control's), an optional card-header `title`, and `framed={false}` for a
  table inside a card. Sorting stays the host's.
- `IconLabel` (`gawdux/primitives`): an icon and a word, aligned; the shape
  of a cue. `size` matches the icon to the text, `iconClass`/`labelClass`
  carry the host's colours, `truncate` clips a long word.
- `StatusBadge`: an optional `icon` (with `iconClass`) before the word, and an
  `orange` colour for a severity between red and yellow. Without an icon the
  badge renders the same class string as before.
- `SortableHeadCell`: `align` (`left` by default) for numeric and centred
  columns. `TableContainer`: `surface` (`true` by default); `false` keeps the
  frame but not the page-surface role, for a table inside other content.

### Fixed

- Tabs: a hovered tab no longer looks like the active one. Hover changes the
  text colour only (a stronger neutral, not the accent) and no longer grows
  the underline; the active tab keeps its accent colour and underline while
  another tab is hovered, where before it dimmed. The active look is
  unchanged.
- `AppSidebar`: a long group label ends in an ellipsis instead of running
  under its chevron. On the expanded rail the group button keeps the
  chevron's column clear (2.25rem of right padding); the collapsed rail is
  unchanged.

## 0.13.1 - retained changelog cleanup

- Remove a historical diff3 marker from the packaged changelog. Runtime APIs,
  components and styles are unchanged from 0.13.0.

## 0.13.0 - optional command bar confirmation

### Added

- `CommandBarConfirmationPresentation` (`gawdux/primitives`) renders the host's
  existing confirmation state in a command bar. `ConfirmationCommandSurface`
  keeps its existing drawer by default and permits explicit host presentation.
- Hosts retain authorization, confirmation execution and persistence. This
  presentation option does not approve an operation or change existing hosts.

## 0.12.0 - audit history table

### Added

- `AuditHistoryTable` (`gawdux/admin`): an audit history that fits its
  container. Fixed column shares, the comment clamped to two lines, the user
  and record truncated; a row opens its full entry beneath it (facts, the
  whole comment, every changed field with old and new values). Below 720px
  of container width the rows become stacked cards. Rows arrive labelled as
  `AuditHistoryRow`; time is formatted through `formatTime`.

## 0.11.1 - one scroller in the master-detail shell

### Fixed

- `MasterDetailShell`: the rail and detail scroll panes are positioned, so an
  absolutely positioned child (flowbite's `Toggle` checkbox) no longer
  stretches the document and makes the whole page scroll as well as the pane.

## 0.11.0 - bot administration blocks

### Added

- `BotToolAccess` (`gawdux/admin`): the tools one bot may use, grouped by area.
  A switch is an intent the host confirms; without `canEdit` and `ontoggle`
  the list is read-only. Writing tools carry a badge (`changesLabel`).
- `BotConfigFields` (`gawdux/admin`): the fields of one tenant-written bot
  config for the host's own form, with fixed field names (`name`, `body`,
  `enabled`, `botIds`) and a bindable `draft`.

## 0.10.0 - admin blocks

### Added

- `gawdux/admin` subpath: shared tenant-administration blocks. Presentation
  only; hosts load, authorize and perform every mutation.
- `MemberAccessCard`: the Roles a member holds and what they allow, grouped by
  area. Add and remove are intents, rendered only when the host grants
  `canEdit` and supplies the handler; a platform-managed Role is never
  removable. `capabilityNote` replaces the list for a grade that holds
  everything. Copy is overridable through `copy`.
- `SecurityActivityList`: sign-in and account events as a card, newest first,
  with a host-supplied `formatTime`.

## 0.9.0 - saved views rail and list-state query projection

### Added

- `SavedViewsRail`: one pill row for a list surface, `[All] [view] ... [Save view]`.
  Selecting a pill applies its query, the trailing pill becomes an inline name
  field while the current query is unsaved (Enter saves, Escape cancels and
  stays local), and the pressed saved pill carries an immediate delete. It is
  presentation only: `onSave` and `onDelete` return promises the host settles.
- `savedViewMatch`, `sameQuery` and `normalizeQuery` (primitives): decide which
  saved view matches an applied query and whether it is worth saving.
- `listStateQuery` and `listStateValuesFrom` (utils), plus `ListStateField.ephemeral`
  and the bound `query`/`fromQuery` on the `initListState` result: project applied
  list state into its URL query (defaults and ephemeral fields omitted) and back.
  `initListState` and `applySessionFilters` accept a string user id.
- The `rail` slot on `FilterBar`, `ListSurface` and `ListPageScaffold`, rendered as
  its own `.filter-bar-rail` block before the filter row, in page and tab mode.
  Parents that forward the slot pass `hasRail`, as with `hasActions`.
- `FilterPillRow`: `selected` accepts `null`, `onRemove`/`removeLabel` put a remove
  control on the pressed pill, `trailing` renders after the last pill, `disabled`,
  and the exported `filterPillClass` recipe.

### Changed

- `initListState` resolves an empty URL value (`?q=`) to the field default instead
  of the empty string.

## 0.8.1 — filter pills that fit a narrow column

### Added

- `FilterPillRow` takes an opt-in `wrap`. The row flows onto further lines
  instead of scrolling sideways, and its overflow affordances are suppressed
  because there is nothing left to scroll to. Off by default, so every existing
  surface keeps the single scrolling line it was designed with.

  The scroller is right for a full-width register and wrong for a narrow
  master-detail rail: a filter set wider than its column is technically
  reachable and practically invisible, because half of it sits behind a
  horizontal gesture nobody thinks to make, and filters are the first thing a
  reader of that rail needs. Measured on a consumer: 502px of pills in a 271px
  rail.

## 0.8.0 — 2026-09-08

- Add the `gawdux/validation` subpath with execution reports, requirement coverage, signature history and a revision-bound manual observation form.
- Preserve failed checks, pending manual work and withdrawn or unverifiable historical signatures as distinct states. Evidence disclosure and writes remain host policy; unsafe capture URLs render as text.
- Existing component contracts are unchanged. Verified with 245 component/contract tests, type checks, package/publint and desktop/mobile reference-app inspection.

## 0.7.1 — focus restoration after command dismissal

### Fixed

- `PageCommandBarConfirm` retains its focus target and fallback while mounted.
  A host can now clear its request on cancel, acknowledgement, or external
  dismissal without a deferred callback reading removed state. Focus returns
  to the invoking control, or its fallback when that control is gone.
- Acknowledgement handling reads its mode before calling the host, which may
  synchronously remove the command. Public props and appearance are unchanged.

## 0.7.0 — shared feedback and command-bar decisions

### Added

- `PageCommandBarConfirm` places the question in a drawer and its actions in
  the command bar. It supports pending/error states, single dispatch, retry,
  acknowledgement-only results, selectable codes, and focus restoration.
- `SurfaceFeedback` and its public context/types give page scaffolds one
  strip for load errors, action feedback, and standing notices. `PageTabs`
  can own that strip inside its panel. `PageFeedback` gains a `band` layout;
  its standalone `card` layout remains the default.
- `AlertOpsConsole.healthBar` lets a host render provider status elsewhere;
  the existing health strip remains enabled by default.

### Changed — consumer migration

- `ListQueryBar` removes `resultCount`, `resultNoun`, `resultNounPlural`, and
  `resultSummary`. Remove those props and use the range/count already shown
  by `ListPaginationNav` or the scaffold's `pagination` contract. A list
  without pagination can render its own summary outside the query bar.
- `EditablePageScaffold` removes `actionErrorTitle`. Pass the complete message
  through `actionError`; the integrated strip does not render a separate title.
  List scaffolds now also accept `actionError`, `loadError`, and `feedbackTone`.
- Page surfaces share a 1rem top/side inset and 0.25rem bottom inset. Search
  and command controls use the existing 2.25rem height and medium radius;
  form inputs receive a visible focus treatment. Hosts with local spacing or
  control overrides should review those overrides when upgrading.
- PDF actions open in a new tab. Command drawers meet their bar with a flat
  edge. These are intentional interaction/layout changes in this minor release.

### Fixed

- Command-bar snippets register immediately, avoiding an empty frame when
  page actions change. The previous page's actions return when a confirmation closes.
- List tables use the panel's scroller so sticky headers remain attached.
  Selecting a different detail resets that pane's scroll position.
- Breadcrumb labels expose a tooltip only when clipped and keep trailing
  status content separate from the label.
- Edited drafts preserve native objects such as `Date` instead of proxying
  their internal slots. The regression tests now respect partial draft types.
- A failed history refresh retains the same record's last-good entries;
  switching records clears them so a failed load cannot show another record's history.
- The dependency lock updates `nanoid` to 3.3.18.

### Release verification

- Built from the 28 source commits after v0.6.2 through `42f6c3b`, plus the
  release fixes and regression coverage described above. Tracked `dist/` is
  regenerated from this release's source with `npm run package`, including
  compiled plain CSS and TypeScript declarations.
- Consumer imports and peer ranges remain unchanged. This release is not
  source-compatible with the removed props listed above.

## 0.6.2 — compact feedback stops swallowing the message

### Fixed

- **`PageFeedback`** — `compact` no longer clamps the message to a single line.

  It was applying `white-space: nowrap` + `text-overflow: ellipsis` on top of
  the tighter spacing. Fine for "Saved."; wrong for the case the component
  exists to serve. Measured in a consuming product: every call site passed
  `compact`, so every error surface truncated — including a mail-delivery
  failure whose whole value was the provider's reason, cut off exactly where
  the reason began. An operator who cannot read the error cannot act on it,
  and truncation makes a diagnosed failure look like an undiagnosed one.

  Long messages now wrap, with `overflow-wrap: anywhere` so the unbroken
  tokens provider errors carry (URLs, message ids) cannot widen the card past
  its column. `compact` keeps its spacing, which is what consumers actually
  reach for it for.

  **Visual note for consumers:** a card carrying a long message is now taller
  than one line. If you relied on compact feedback being exactly one line
  high, check the layout around it.

## 0.6.1 — the sidebar rail's width owns group open-state

### Fixed

- **`AppSidebar`** — a collapsed rail no longer leaves the active group open,
  and expanding the rail now opens the group holding the current page.

  The open-state seeding introduced in 0.5.2 ran exactly once, when the
  dropdown key set was first built, and never read `sidebarOpen`. Two defects
  followed, and both are visible to end users:

  A host that resolves its collapsed state in `onMount` — the `storageKey`
  path, where `sidebarOpen` is still nominally `true` at script init — seeded
  the active group open and then collapsed around it. The collapsed CSS fades
  sub-item labels to `opacity: 0`, so the leftover open group reads as
  unexplained blank space in the rail rather than as an open group. Hosts that
  pass `initialOpen` (the cookie pattern) never opened that window, which is
  why this reproduced in one product and not the other.

  And since the key set never changed afterwards, expanding the rail re-seeded
  nothing: the active group stayed shut exactly when there was finally room to
  show it.

  `toggleSidebar` already called `resetDropdowns()` on the way down, so
  collapsing _via the toggle_ always looked right — the bug hid behind the
  path most people exercise.

  Open-state now follows the rail width: collapsing closes every group,
  expanding opens the group holding the current page, and navigating into a
  section opens that section's group (a closed group renders no sub-items at
  all, so otherwise the active item has no element to highlight). Opening is
  additive — only collapsing closes a group the user opened by hand.

  **For consumers already working around this:** a host-side controller that
  forces the active group open with DOM clicks is now redundant. If it guards
  on the wrapper's `.open` class it will go inert by itself and needs no
  coordinated change; remove it when convenient. An unguarded one would now
  toggle the group _shut_, so check that guard before taking this bump.

  No API change: no new props, no changed signatures. `defaultOpen` still wins
  over the active page in both directions.

## 0.6.0 — the command drawer becomes a primitive

### Added

- **`CommandDrawer`** — the strip that opens against the bottom command bar.

  Five components across this library and two consuming products carried a
  byte-identical copy of the same drawer: the same class string, the same
  `data-workflow-role="command-drawer"` marker, the same Escape handler, the
  same focus-in / restore-out dance, and the same narrow-viewport height cap.
  Only the BODY ever differed, so the body is the snippet and everything else
  now lives here.

  Two variants, because both had already shipped and neither is wrong:
  `attached` (top border, shadow cast upward — a lip on the bar) and `card`
  (rounded, `shadow-sm` — a panel floating just above it). Confirmations are
  cards; input drawers are attached.

  **The layout contract is the part that is easy to get wrong.** This renders
  an ordinary `shrink-0` element wherever you put it — it is NOT portaled and
  does not position itself. It looks welded to the bar because the app shell
  puts `.page-command-bar` last inside a flex `<main>` with `margin-top: auto`.
  Render it inside a scrolling container and it will scroll away from the bar
  it belongs to; fix the shell rather than reaching for a portal.

  `open` is the consumer's to write and is never written here. A local write to
  a one-way prop is reverted by the parent's next render, and the symptom is a
  drawer that opens and then cannot be dismissed — silently, with no console
  error. That cost a consuming app a full session before this was extracted,
  so it is pinned by a test.

### Changed

- `ConfirmationCommandSurface` is rebuilt on `CommandDrawer` (~40 lines lighter)
  with **no visual or behavioural change** — `variant="card"` preserves its
  exact look, and its existing tests pass untouched. Its focus RESTORE stays
  local on purpose: the drawer restores to whatever had focus when it opened,
  while a confirmation restores to the request's own `focusTarget` /
  `focusFallback`, and those differ whenever a request is raised
  programmatically rather than by a click.

  Attributes now spread onto the drawer's `<section>`, because a consumer's own
  marker (`data-confirmation-command`) must land on the SAME element as the
  aria wiring — a test caught them drifting onto different nodes during the
  extraction.

## 0.5.4 — the declarative pagination path can show page numbers too

### Fixed

- `ListSurface` (and therefore `ListPageScaffold`) now forwards
  **`showPageNumbers`** from the declarative `pagination` object to
  `ListPaginationNav`, and `ExactListPagination` gained the field.

  0.5.3 added the prop to the nav so consumers would stop losing direct
  page-jump when they adopted it — but only on the IMPERATIVE path. The
  declarative path could not express it, which left the two paths silently
  unequal in the one direction that matters: a page moving a hand-wired
  `<ListPaginationNav showPageNumbers />` onto `ListPageScaffold`'s
  `pagination` prop would lose its numbered buttons, with no type error and
  nothing in the diff to suggest a capability had gone. Found while surveying
  exactly that migration in a consumer.

  Default stays `false`, so every existing declarative consumer renders what
  it renders today; both directions are pinned by tests, and the forwarding
  was mutation-checked (removing it fails the new case and only that case).
  Cursor pagination has no page numbers to offer, so the field lives on
  `ExactListPagination` rather than the union.

## 0.5.3 — ListPaginationNav can show page numbers

### Added

- `ListPaginationNav` gains **`showPageNumbers`** (default `false`), which
  renders numbered page buttons between the range readout and Next.

  This exists because the component could not be adopted without a capability
  regression. It shipped prev/range/next only, while consumers were already
  rendering numbered pagination — so migrating to it _removed_ direct
  page-jump. Rather than ask those pages to accept less, the numbers move up
  here behind an opt-in. Default off means every current consumer renders
  exactly what it renders today.

  Applies to `mode="exact"` only; a cursor pager has no page numbers to offer.
  The active button carries `aria-current="page"`, and ellipses are
  `aria-hidden` rather than being announced as content.

- `buildPageWindow(current, total)` is exported alongside it, so a consumer
  that wants its own markup can still share the windowing rule: all pages up
  to seven, then first / ellipsis / current ± 1 / ellipsis / last. It clamps
  an out-of-range `current` instead of returning a window where nothing is
  selected.

  This is not a new algorithm — it is the one consumers already shipped, and a
  test re-implements the original and asserts agreement across every
  `(current, total)` pair up to 60, so the move upstream cannot have quietly
  changed the window.

## 0.5.2 — AppSidebar knows where you are

### Fixed

- Top-level sidebar items now highlight by **longest-prefix match with a `/`
  boundary** (the `resolveActiveItemHref` rule the library already shipped
  but never used here), instead of exact match. A detail page keeps its
  parent item lit — `/products/123` stays on `/products` — while
  `/products` never lights up on `/products-archive`. One resolution per
  config means a root item and a group sub-item can never both claim the
  highlight. A consumer had been papering over this with an injected CSS
  controller; this is that fix, upstreamed.
- The dropdown group **holding the current page opens on first paint**.
  Open state is seeded once, when the group set builds — a later navigation
  never reopens a group the user closed, and an explicit
  `defaultOpen: false` still wins over the active page.

  **Not a breaking change** — items and groups a host configured explicitly
  keep behaving as configured; only the closed-on-your-own-page default and
  the dropped-highlight-on-detail-pages defect change. Both behaviours are
  pinned by tests that fail against the previous implementation
  (mutation-verified).

## 0.5.1 — TabTitle icons are optional

### Fixed

- `TabTitle` no longer requires `icon`, and omits the icon box entirely when
  none is given. It previously rendered the `w-5 h-5` wrapper unconditionally,
  so a tab set that carries no icons was indented by the width of an icon that
  was never there — a layout defect that type-checks clean and reads as
  deliberate padding.

  Mixed sets still align: the box is fixed-width and never sizes to its
  content, so tabs that do have icons line their labels up with each other.

  **Not a breaking change** — `icon` narrows from required to optional, so
  every existing call site keeps compiling and renders identically. The
  omission is pinned by a test rather than left to convention.

## 0.5.0 — alert-ops silence mutation (opt-in)

### Added

- `gawdux/alert-ops` gains silence **mutation affordances that do not exist
  unless a host asks for them twice**. Every control is behind a double gate
  — a capability flag _and_ a callback — so a host that upgrades and wires
  nothing keeps byte-for-byte the 0.4.0 read-only surface. The read-only
  default is a pinned test, not a convention.
  - `SilenceTable` — `canMutate` + `onexpire`, adding an actions column with
    a per-row Expire control. `AlertOpsSilence` rows that are already expired
    render a disabled control with an explanatory title; expirability is
    allow-listed (`active`/`pending`), never inferred from an unknown state.
  - `AlertDetailPanel` — `canSilence` + `onsilence`, adding a "Silence this
    alert" affordance that emits the selected alert's identity.
  - `AlertOpsConsole` — forwards both gates and the mutation state through to
    the surfaces that render them; owns none of it.
  - `canExpireAlertOpsSilence(state)` — the exported allow-list predicate.
  - `AlertOpsMutationState` / `AlertOpsMutationPhase`
    (`idle | pending | failed`) — prop-driven, like every other console
    state. The components run no request, keep no optimistic copy, and own no
    mutation state machine: they emit intent, the host confirms it through
    the ADR-029 confirmation surface, performs the call, and feeds the
    outcome back down.

### Changed

- `AlertOpsCopy` gains seven keys (`silenceColumnActions`, `expireSilence`,
  `expireSilenceAccessibleLabel`, `expireDisabledExpired`, `silenceAlert`,
  `mutationPending`, `mutationFailed`). Hosts that pass copy **overrides**
  (the documented path) are unaffected; a host constructing a complete
  `AlertOpsCopy` literal must add the new keys.

## 0.4.0 — alert operations

### Added

- New `gawdux/alert-ops` subpath: reusable Alert Operations console surface
  (presentation + UI contract only; hosts own transport, auth, tenancy and
  the provider adapter).
  - `AlertOpsConsole` — ProviderHealthBar + Alerts tab (FilterRail +
    AlertGroupTable/AlertDetailPanel in a MasterDetailShell) + read-only
    Silences tab behind PageTabs. Data down, events up; `filters` and
    `selectedFingerprint` bindable. Seven explicit prop-driven states:
    loading, empty, no-results, unavailable (retry), stale (banner over
    last-good data), partial (per-section banners), denied.
  - `AlertGroupTable` — group headers; row-click list rule (click/Enter/
    Space, aria-selected); severity StatusBadge mapping; responsive
    card-table with td[data-label].
  - `AlertDetailPanel` — labels/annotations as escaped text (never
    {@html}); correlation identity; validated links: safe → target=_blank
    rel="noopener noreferrer", unsafe → inert span without href.
  - `SilenceTable` — strictly read-only (zero controls); regex-marked
    matchers, window, creator, comment.
  - `ProviderHealthBar` — status pill, environment/plane labels, relative
    last-refresh (injectable now), explicit Refresh.
  - `FilterRail` — environment/plane selects, state + severity toggles,
    service input, text search; emits AlertOpsFilters; fully labelled and
    keyboard reachable.
  - `createAlertOpsPoller` — interval fetch, exponential backoff to a cap
    (reset on success), document-hidden pause, manual refresh(), stop().
  - UI contract types + `AlertOpsCopy` — every user-facing string
    overridable via props with English defaults ({placeholder} templates).

## 0.3.0 — lift wave

### Added

- primitives: `ConfirmationCommandSurface` + `confirmation-command` types —
  command-surface confirmation (title/message/labels/tone, single-dispatch
  until the host settles, focus discipline, Escape-cancel).
- primitives: `DiscardNavigationCommandSurface`; utils:
  `DiscardNavigationController`, `DISCARD_NAVIGATION_CONTEXT`,
  `useGuardedGoto`, `navigationTargets` — discard-on-navigate guard with
  goto/popstate/leave approvals, hosted actions, busy-gating, auto-continue.
- primitives: `createPageCommandBarRegistry` — order-independent command-bar
  registry (fixes the stale-zone "active id wins" bug class).
- utils: message center — `MessageCenter`, `createMessageCenter`,
  `DEFAULT_MESSAGE_LIFETIMES_MS`, visibility/persistence sources,
  `APP_MESSAGE_CENTER_CONTEXT`/`getAppMessageCenter`: tones,
  transient/condition kinds, tone-scoped lifetimes, id+revision dedup,
  pause-reason timers.
- primitives: `MessageHost` — overlay host for the message center (hover/
  focus/suspend timer pauses, compact-viewport bounding).
- primitives: `CollectionEmptyState` — empty vs no-results states with
  optional icon and action.
- primitives: `DeferredLoadingIndicator` + `DEFERRED_LOADING_DELAY_MS` —
  300 ms grace before showing a spinner.
- primitives: `PasswordWithRequirements` + `PasswordRequirementRule` —
  live-checked requirements panel; rules injected by the consumer.
- primitives: `CurrencyCell` — identical copies existed in both consumers;
  lifted once.
- primitives: `CommandPalette` + `CommandPaletteItem` — Ctrl/Cmd+K palette;
  static `items` plus debounced async `search` source, both injected.
- styles/tokens.css: dense-table→card responsive pattern
  (`.responsive-card-table`, `.responsive-list-page`,
  `.responsive-detail-page`, `.mobile-sort`, `.row-link`, generic
  `td[data-label]::before` label hook), `.panel-col`/`.panel-col-wide`
  content columns, touch-input anti-zoom rules. Light + dark complete;
  colors flow through `--gawdux-*` tokens.

### Changed (additive)

- `PageTabs`: new `below` slot — persistent content inside the panel chrome
  below the tab strip, across tab switches.
- `EmptyStateRow`: new `hint` prop — second muted line under the text.

### Deprecated

- `ConfirmModal` — new surfaces confirm in the bottom command bar
  (`ConfirmationCommandSurface`/`DiscardNavigationCommandSurface`); removal
  only when consumers reach zero uses.
