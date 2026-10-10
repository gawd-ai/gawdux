# Changelog

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
  that class must use the knob instead. SIMS's Document Control page does:
  `.document-control-page :global(.max-w-6xl) { max-width: none; }`
  (`src/routes/t/[tenant]/app/documents/control/+page.svelte`) matches
  nothing after this release, and its three shells (TypesPanel, FoldersPanel,
  WorkflowsPanel) go back to a centred 72rem card. Replace that rule with
  `.document-control-page { --gawdux-panel-wide-max-width: none; }`, which
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
