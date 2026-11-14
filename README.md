# gawdux

A shared Svelte 5 UI component library for building dense, operator-grade application shells. It provides the app sidebar and navigation chrome, list/table primitives (query bar, pagination, filter pills, master-detail shell), page scaffolds and command bars, form fields, and a design-token stylesheet — the reusable surface layer several apps build on, independent of any one product.

## Installation

```bash
npm install gawdux
```

Peer dependencies: `svelte@^5`, `@sveltejs/kit@^2`, `flowbite-svelte`, `flowbite-svelte-icons`.

## Public Imports

```svelte
<script lang="ts">
  import { AppSidebar, SidebarDropdownGroup } from 'gawdux/components';
  import { ListSurface, ListQueryBar, MasterDetailShell, PageCommandBar } from 'gawdux/primitives';
</script>
```

```typescript
import type { SidebarModule } from 'gawdux/types';
import { /* helpers */ } from 'gawdux/utils';
```

```css
@import 'gawdux/styles/tokens.css';
```

Supported package subpaths:

- `gawdux` (root) / `gawdux/components` / `gawdux/primitives`
- `gawdux/admin`
- `gawdux/alert-ops`
- `gawdux/validation`
- `gawdux/types`
- `gawdux/utils`
- `gawdux/styles/tokens.css`

## What's Inside

- **components**: `AppSidebar`, `SidebarDropdownGroup`, `SidebarFlyout`: the collapsible app navigation shell; `UserMenu`: the top bar's account menu.
- **primitives**: list and page building blocks: `Breadcrumbs` (the header's trail on one line, folding its middle into a menu), `ListSurface`, `ListQueryBar`, `ListPaginationNav`, `FilterBar` (a list's toolbar; its `sort` is the house phone sort, which `ListSurface` and `ListPageScaffold` pass on)/`FilterPillRow`, `SavedViewsRail` (drawn only with a saved view to choose or a query to save), `MasterDetailShell` (its rail rows `RailRowButton`: the icon on the title line, the meta line under it at the row's edge), `ListPageScaffold`/`EditablePageScaffold`, `PageCommandBar`, `PageCommandBarZones` (the bar's three zones as state an app shell holds, for `PageFrame`), `PageTabs` (its status after its strip, never over a tab; each tab an icon and its label from `TabTitle`, the icons alone while the labels do not fit the strip's box), `fitLabels` (a row of labelled controls, a tab strip or a strip with its tools, shows its labels while they fit its own box and its icons alone when they do not, a tool then the house icon button and a choice its short value), `scrollEdges` (anything that scrolls sideways fades at the edge where more of it lies, one way: a tab strip, a row of filter pills, a drawing in its box), `FormField`, `ReadonlyField`, `CardContainer`, and more.
- **detail and table primitives**: `StatTile`/`StatTileStrip` (a detail overview's KPI tiles: label, value, meta, icon, a state tone, a go-to icon drill-down; the strip wraps and never clips), `SectionLink` (the go-to-section arrow, no words, at the top right of a card header or tile; `CardContainer` takes it as `link`), `IconButton` (the house's icon action, flat in light and dark, named by its tooltip; `danger` turns red only on hover; `size="md"` in a header, a 44px target on a phone; a glyph as its children), `DataTable` (a `TableContainer` with column definitions, `SortableHeadCell` headers, cells from a snippet, each labelled with its column, and the house empty row; every register's table reads as labelled cards on a phone, tokens.css "A register on a phone"), `IconLabel` (an icon and a word, the shape of a cue), `StatusBadge` (a coloured word, optionally with an icon), `HeaderStatus` (a pane header's state: the status chip, always, and a lock beside it while the viewer cannot edit, the reason in its tooltip), `TableContainer`, `SortableHeadCell`, `HeadCell` (the labelled, non-sortable header of a hand-built table, with an optional column icon), `EmptyStateRow`, `CollectionEmptyState`.
- **alert-ops**: `AlertOpsConsole`, the Alert Operations surface (alert groups, detail, silences), transport-agnostic. Its tabs carry icons; its denied and unavailable states are the house `CollectionEmptyState` on the page surface, and with `healthBar={false}` the host's bar carries status and Refresh, so the unavailable state offers no Retry of its own.
- **admin** (`gawdux/admin`): tenant-administration blocks, presentation only (the host loads, authorizes and performs every change): `MemberAccessCard`, `SecurityActivityList`, `AuditHistoryTable`, `RoleMembersCard` (who holds a Role: a quiet trash icon raises the removal for the host to confirm, a picker adds), and the AI + Bots blocks: `AiUsageReport` (totals as tiles, `AiUsageBars` per day, one share-bar card per breakdown; turns and tokens, never money), `BotRail` (bots with avatar, role and one state, for every tab that picks a bot first), `BotIdentityHeader`, `BotConfigView` (a config read, the other half of `BotConfigFields`' edit), `BotContextCard` (the composed block a bot reads, by parts), `BotToolAccess`.
- **styles/tokens.css**: the shared design tokens (color, spacing, density) that give host applications a common visual language.

## Row navigation

Keep a real anchor in a row for keyboard navigation and native link controls.
Use `activateRowLink` from `gawdux/utils` on both `click` and `auxclick` to make
the rest of the row follow that destination:

```svelte
<tr
  onclick={(event) => activateRowLink(event, href, { navigate })}
  onauxclick={(event) => activateRowLink(event, href, { navigate })}
>
  <td><a {href}>Item</a></td>
  <td>Other row content</td>
</tr>
```

`navigate` is the host router. Modified and middle clicks open a separate browsing
context with `noopener`, or use the host's optional `open` adapter. Nested links,
controls and editable content are untouched; selected text, cancelled events,
Alt-click and secondary clicks do not navigate. Mark custom interactive regions
with `data-row-interactive`. `rowLinkIntent` exposes the decision without effects.

A row that answers a click of its own (a disclosure row that opens its detail
beneath it) asks `isRowClickTarget` from `gawdux/primitives`, the guard
`rowLinkIntent` and `DataTable` ask: a click on a control, or inside one, is
the control's, and so is a click whose target the control removed on the way
(a chevron that swaps its icon on open), so the row never undoes what the
control did.

## Density

Table cells, cards and stat tiles take their padding from `--gawdux-*` knobs
in `styles/tokens.css`. The defaults are the geometry these surfaces always
had; a product changes density by redeclaring knobs after the import, never
by overriding component classes:

```css
@import 'gawdux/styles/tokens.css';
:root {
	--gawdux-table-cell-py: 0.3125rem; /* default py-4 */
	--gawdux-table-row-height: 2.5rem; /* default auto; a minimum */
	--gawdux-card-padding: 0.75rem; /* default p-4 */
}
```

| Knob | Default | Drives |
| --- | --- | --- |
| `--gawdux-table-cell-px` | `px-6` | body and head cells, inline |
| `--gawdux-table-cell-py` | `py-4` | body cells, block |
| `--gawdux-table-head-py` | `py-3` | head cells, block |
| `--gawdux-table-row-height` | `auto` | minimum body row height |
| `--gawdux-card-padding` | `p-4` (1rem) | one padding inside a card at every width: `CardContainer`'s header sides and body, `.card-header`'s sides, `.card-content` |
| `--gawdux-card-header-py` | `py-3` | the card header's band, above and below its title |
| `--gawdux-icon-size` | `1.25rem` (`.gawdux-icon`) | the house icon: a header's icon button, glyph and lock, a pane's item icon, a tab's icon, a rail row's icon |
| `--gawdux-tile-padding` / `-nested` | `p-3` / `p-2.5` | `StatTile` |
| `--gawdux-tile-gap` / `--gawdux-tile-min-width` | `gap-3` / `9rem` | `StatTileStrip` |
| `--gawdux-page-inset` | `p-4` (1rem) | the content inset of every host, one value on all four sides |
| `--gawdux-panel-wide-max-width` | `max-w-6xl` (72rem) | `.panel-col-wide`, `MasterDetailShell`'s card |
| `--gawdux-table-head-icon-size` | `1rem` (`h-4 w-4`) | a column header's icon, square |
| `--gawdux-table-head-icon-gap` | `0.5rem` (`gap-2`) | between a header's icon and its label |
| `--gawdux-table-head-icon-color` | `currentColor` | the icon's colour: the header's own ink |
| `--gawdux-table-head-icon-display` | `block` | `none` drops the icons (under a media query, say) |

The table knobs apply to flowbite cells inside a `TableContainer`,
`ListSurface` or `DataTable` that still carry flowbite's default padding; a
cell that sets its own padding keeps it.

### Column header icons

A column header may carry an icon before its label, and every header path
draws it in one shape: `span.table-head-label > svg.table-head-icon + span`.
A `DataTable` column takes `icon`, a `SortableHeadCell` takes `icon` (and
`wrap`), and a hand-built table's labelled, non-sortable header is a
`HeadCell` (`label`, `icon`, `align`, `className`, and `wrap` for a long label
in a wide table, which is one line otherwise); an empty or screen-reader-only
header stays a plain `TableHeadCell`. The blocks that write their own
headers (`AuditHistoryTable`, `SecurityActivityList`, `AlertOpsConsole` with
`AlertGroupTable` and `SilenceTable`) take an optional `headIcons` map keyed
by their columns, empty by default.

The icon is always `aria-hidden` (the label carries the meaning) and never
shows the sort: on a sortable header the order is icon, label, arrow, and the
active column is told by the arrow and `aria-sort`. The four head-icon knobs
size, space, colour and show it. Its rule in `tokens.css` is unlayered, so it
outranks the icon's own size utility (`w-5 h-5`) and holds when a
consumer's Tailwind does not scan gawdux; importing `tokens.css` into a
cascade layer gives the utility the win back.

The library ships the mechanism, never the meanings: which column carries
which icon is the product's vocabulary. A product that passes no icon
renders the headers it rendered before. For a smaller icon that disappears
on phones:

```css
:root {
	--gawdux-table-head-icon-size: 0.875rem; /* default 1rem */
	--gawdux-table-head-icon-gap: 0.375rem; /* default 0.5rem */
}
@media (width < 48rem) {
	:root {
		--gawdux-table-head-icon-display: none; /* default block */
	}
}
```

### Content inset

A tab's content sits one inset from its panel's edges, and only the box that
hosts the content sets it. The hosts are `.scroll-surface` (PageTabs' panel),
`EditablePageScaffold`'s body, and any surface of a product's own that carries
the `page-inset` class. Nothing inside a host pads itself toward the host's
edges: a tab body opens on a plain `space-y-3` div, `MasterDetailShell` adds
no inset inside a host (its own inset is the fallback for a shell in a bare,
unpadded panel), and `TabFillPanel` adds none. The inset is one value on all
four sides, so a card in a panel stands as far above the command bar (or an
open drawer's seam) as below the tab strip and in from the sides. The shell's
card is `.master-detail-card`, capped by `--gawdux-panel-wide-max-width` like
`.panel-col-wide`. A fill tab whose content
scrolls is `<TabFillPanel scroll>`: the panel becomes the one scroller, spans
its host's padding box and pads itself with the same knob, so the scrollbar
sits at the panel's edge. A list's toolbar (`FilterBar`, which `ListSurface`
draws at the top of every list's surface: the saved views rail and the filter
row) takes the knob at its top and its sides, so its first control stands as
far below the surface's top as in from its side.

For two-pane cards that fill the panel:

```css
:root {
	--gawdux-panel-wide-max-width: none; /* default 72rem */
}
```

### No shadow inside the page

The page has one elevation, `--gawdux-surface-elevation`: the outermost
content surface (the page's panel on the shell's background) and the command
bar fused with it draw it, and tokens.css draws it for them. A surface that
sits in the page draws no shadow, in light or dark: a card (`CardContainer`,
on its own house surface, `.card-container`), a panel, a pane, a table's box
(`TableContainer`), a tile (`StatTile`), the two-pane card
(`MasterDetailShell`), a drawer, a notice (`PageFeedback`), a selected rail
row or pill. A shadow belongs only to what floats above the page and closes
(a menu, a popover, a picker's list, a toast, the command palette) and to a
focus ring.

`gawdux/utils` carries the rules' reader for a static guard:
`surfaceShadows(source)` lists every shadow a source writes (a Tailwind
shadow utility with any variant, a `box-shadow` that draws one, a
`drop-shadow` filter), comments excluded; `shadowedFlowbiteImports(source)`
lists an in-page Flowbite component that hard-codes a shadow (Card); and
`insetOverrides(source)` lists every read of the inset knob and every
fill-height calc. A host's suite holds its files to an allow-list of the
floating ones; this library's own does (`tests/house-surface-rules.test.ts`).

### Light and dark draw the same lines

A theme changes an edge's colour, never whether it is drawn. An edge a class
list draws in light in a colour of its own (a border, a ring, the line
between a list's rows) is drawn in dark too: never transparent, of no width
or style, or the colour of the dark surface it sits on, the house's dark edge
being gray-700 (`--gawdux-border`). In dark a card and the page's content
surface (`.page-tabs-shell`, `.table-container`, a list's surface) both draw
`--gawdux-surface-card`, gray-800; `--gawdux-surface`, gray-900, is the
shell's background around them. `vanishingDarkEdges(source, file)` lists
every edge a component's markup draws in light and not in dark, reading each
element's dark surface where the markup names it (an element's own
`dark:bg-*` or its nearest enclosing one's), else the card surface, and in a
module's class strings the edges a theme removes; a guard holds its files to
none.

## Account menu

`UserMenu` (`gawdux/components`) is the account menu of an app shell's top bar:
a card showing the avatar, the name and the email on two lines, which expands
in place over the page into the tenant and the access chips, the account's
rows, sign-out and the product's version.

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import { afterNavigate } from '$app/navigation';
  import { UsersOutline } from 'flowbite-svelte-icons';
  import { UserMenu, type UserMenuItem } from 'gawdux/components';

  let { user, tenant, grade } = $props();
  const items: UserMenuItem[] = [{ label: 'Members', href: '/app/members', icon: UsersOutline }];
  let open = $state(false);
  afterNavigate(() => (open = false));
</script>

<UserMenu
  bind:open
  name={user.name}
  email={user.email}
  tenant={tenant.name}
  access={[grade]}
  {items}
  signOutAction="/signout"
  signOutEnhance={enhance}
  product="Product"
  version="v1.4 · 212"
  versionTitle="Built from abc1234"
>
  {#snippet mark()}<img src="/mark.svg" alt="" width="16" height="16" />{/snippet}
</UserMenu>
```

- **Trigger**: always the avatar (initials derived from the first and last word
  of `name`, or `initials`, or `avatarSrc`), the name and the email (left out
  when it repeats the name). Nothing in it depends on the open state, colours
  included, so opening never moves or recolours it; only the chevron turns. The
  card lifts on hover and while open.
- **Context**: the tenant is the open menu's first line, on the text column,
  with the `access` chips right after it and `accessLabel` as an optional
  caption before them ("Roles"). It is not a row (no icon, no hover), and it
  describes the menu for a screen reader. It is never a trigger line.
- **Rows**: `items` are links (`href`) or buttons (`onclick`) with an optional
  16px `icon`. `extraItems` renders custom rows after them; each must carry
  `role="menuitem"`, `tabindex="-1"` and the class `gawdux-user-menu-item`.
  Sign-out is the last row: a POST form to `signOutAction` (with
  `signOutEnhance` applied, e.g. a SvelteKit `enhance`), or `onsignout`, or
  absent when neither is given. It is red on its icon and its word only. The
  row under the pointer takes the focus, so one row is highlighted at a time;
  the focus ring shows for the keyboard only.
- **Footer**: `{product} {version}` in one text run, `versionTitle` as the
  tooltip, `mark` in a 16px box in the leading column; `footer` replaces the
  content inside the same 32px row. No footer when none of these is given.
- **Keyboard**: the WAI-ARIA menu button pattern. Enter, Space or ArrowDown
  opens on the first row, ArrowUp on the last; the arrows wrap, Home and End
  jump, Escape closes and returns the focus to the trigger (never from a
  control the person moved to), Tab closes and moves on. The closed body is
  `inert`.
- **Closing**: click toggles; an outside press, the focus leaving the menu and
  a history navigation (popstate) close it; leaving a menu the pointer opened
  closes it after 150ms unless the pointer comes back. Bind `open` and set it
  false on the host's own navigations (`afterNavigate`), as above.
- **Geometry**: the root reserves the 44px height, so the toolbar never
  reflows, and is as wide as the trigger's content between
  `--gawdux-user-menu-min-width` (208px) and `--gawdux-user-menu-width`
  (272px); the open body never widens it. The panel grows to its natural
  height above the page (z-index 60). Below `compactBelow` (768 by default:
  below 768px; 1024: at or below 1024px, the compact width of
  `SHELL_BAR_QUERY`, 1024 itself included; or 0 for never) the closed menu
  is the avatar alone; open, the avatar
  stays put, the panel grows to its left and stops at the 16px gutter.
  `compact` gives the same avatar at every width, for a header whose trail
  needs the room (see [Giving the trail room](#giving-the-trail-room)); the
  menu carries the full-size probe (`data-room-full`) that header reads. The
  name stays the trigger's accessible name, and the closed card names the
  person in its tooltip at every size, the avatar alone whatever made it the
  avatar and a name the full card cuts; the tooltip is the card's, not the
  trigger's, so it adds no description, and it goes while the panel is open.
  A `presentation` receives `compact` too.
- **Styling** is scoped CSS over the tokens (`--gawdux-surface`,
  `--gawdux-menu-surface`, `--gawdux-border`, `--gawdux-menu-divider`,
  `--gawdux-menu-item-hover`, `--gawdux-chip-surface`, `--gawdux-avatar-surface`,
  `--gawdux-avatar-text`, `--gawdux-text-danger`, ...), never Tailwind
  utilities, so it renders styled even where the host's Tailwind does not scan
  this package.

## Breadcrumbs

`Breadcrumbs` (`gawdux/primitives`) is an app header's trail: one line that
never wraps and never clips a crumb.

```svelte
<script lang="ts">
  import { Breadcrumbs, StatusBadge } from 'gawdux/primitives';
  import type { BreadcrumbCrumb } from 'gawdux/utils';

  let { crumbs, status }: { crumbs: BreadcrumbCrumb[]; status: string | null } = $props();
</script>

<Breadcrumbs items={crumbs} className="h-14" trailing={status ? chip : undefined} />

{#snippet chip()}<StatusBadge color="green" label={status ?? ''} />{/snippet}
```

- **Items**: `{ label, href?, icon? }`, first crumb first; the last is the
  current page (`aria-current="page"`). The first crumb's `icon` stands in
  front of its words; on every later crumb `icon` is the separator before it,
  a chevron when it has none.
- **A level the page's header names**: a last level marked `namedByHeader`
  is the item a page's own header names beside its status. Above the compact
  width the line leaves it out and ends at the item's place, every level a
  link and none marked as the current page; at the compact width the page's
  row names it and opens the whole path.
- **Giving way**: every crumb shows in full while the trail fits. When it does
  not, each step comes only when the one before is not enough:
  1. the crumbs between the first and the current page fold into one `…`
     button, from the inside out (the crumb nearest the middle first, the
     root side first on a tie), so the current page's parent folds last;
  2. the first crumb shows as its icon alone, still a link, its name in a
     tooltip;
  3. the current page ellipsizes, its full name in a tooltip, down to its
     readable minimum: its own width, separator included, up to 64px
     (`BREADCRUMB_LEAF_MIN_PX`, four or five characters), never below it;
  4. the first crumb folds into the `…` button too, which then stands first
     with no separator before it: the trail reads "… › Pack…".

  `trailing` (a status chip) rides beside the current page and never gives
  way. Past the narrowest the trail can go, the page holds its minimum and
  the trail's box clips the end.
- **Menu**: the `…` button opens a small menu under it, not a dialog, listing
  in order every level the trail does not name: the first crumb when it shows
  as its icon or is folded, the folded crumbs, the current page when it is
  cut. A level with an `href` is a link; one without is words the arrows pass
  over. It is `position: fixed`, so a clipping box around the trail never
  cuts it.
- **Keyboard**: the WAI-ARIA menu button pattern. Enter, Space or ArrowDown
  opens on the first link, ArrowUp on the last; the arrows wrap, Home and End
  jump, Escape closes and returns the focus to the button, Tab closes and
  moves on. A press outside, the focus leaving and a new trail close it. An
  Escape from anywhere closes a menu the pointer opened and is taken
  (`preventDefault`), so a page handler that reads `defaultPrevented` (a
  dock closing on Escape) leaves it alone.
- **Focus on a re-plan**: the focus follows its level. A focused menu row
  whose level comes back to the trail (the trail unfolding closes the menu)
  hands the focus to that level's crumb, its link or, without one, the
  current page; a focused crumb that folds hands it to the `…` button. The
  button keeps the focus wherever it moves, the trail narrowing or widening,
  its menu open or closed as it was; only the trail unfolding whole hands it
  on, to the crumb of the first level the button stood for.
- **Measuring**: a hidden copy of the trail is measured once per trail and
  again when its size changes (a web font arriving); a `ResizeObserver` on the
  trail's box re-plans on every resize (a sidebar or a dock opening) from those
  widths, without reading the layout. Unmeasured (server render, no
  `ResizeObserver`) the trail shows whole. The root grows into its row
  (`flex: 1 1 0%; min-width: 0`): give it the room, not a width of its own,
  and add no rules of your own to its crumbs.
- **The room it needs**: `room` (bindable) reports, once the trail is
  measured, `available`, the width its box has, and two widths it needs:
  `whole`, every crumb in full with the chip, and `page`, the current page
  whole with the chip, the crumbs on the way folded and the first as its icon
  (from that width up the page is never cut). The needs come from the
  measures alone, never from the room, so a host that gives the trail room
  decides again without undoing itself. `breadcrumbNeed` is the same
  arithmetic, pure. A new trail keeps the last report until it is measured.
- **Words**: `label` names the landmark ("Breadcrumb"), `moreLabel` the `…`
  button ("Show the hidden levels").
- **Styling**: the crumbs keep the token classes `.breadcrumb-title`,
  `.breadcrumb-section-icon` and `.breadcrumb-chevron`; the layout and the
  menu (UserMenu's surface and rows) are scoped CSS over the `--gawdux-*`
  tokens.

## Giving the trail room

`createRoomYield` (`gawdux/utils`) lets header controls give their room to a
sibling that needs it: the account menu shows its avatar alone so the trail
beside it reads whole.

```svelte
<script lang="ts">
  import { UserMenu } from 'gawdux/components';
  import { Breadcrumbs, type BreadcrumbRoom } from 'gawdux/primitives';
  import { createRoomYield } from 'gawdux/utils';

  let { crumbs, user } = $props();
  let trail = $state<BreadcrumbRoom | null>(null);
  let account = $state<HTMLElement>();
  const room = createRoomYield({
    sibling: () => (trail ? { available: trail.available, need: trail.whole } : null),
    controls: () => [account]
  });
</script>

<header class="flex items-center gap-2">
  <Breadcrumbs items={crumbs} bind:room={trail} />
  <div bind:this={account}>
    <UserMenu name={user.name} compact={room.yields(0)} />
  </div>
</header>
```

- **The rule**: a control yields when the sibling needs more than the room it
  would have with every control at full size; the controls yield in the order
  given (`controls`), each only when the ones before it are not enough, and
  each comes back as soon as the sibling fits without it. A control already
  as narrow as it yields (an avatar by a narrow viewport's own rule) gives
  nothing and never yields; the next one yields in its place. `planRoomYield`
  is the rule, pure: the need rounds up and the room down, as the trail plans
  its own fit, and a sibling that needs nothing takes no room.
- **Stable**: the room at full size is the sibling's box now plus what each
  yielding control gave it, from each control's full width at the viewport
  the row has now. It is the same whether a control yields or not, so a yield
  never undoes itself and the row never oscillates, a breakpoint crossed
  included. The decision never reads how the trail fits after a control
  yielded.
- **Full width**: a control's full width is read from the element marked
  `data-room-full` inside its box, in every state: an invisible probe laid out
  at the control's full size whatever it shows (`position: absolute`,
  `visibility: hidden`, the control's full-size width rules). A control whose
  full width changes with the viewport needs one, or a yield taken below its
  breakpoint would read its avatar as its full size above it. `UserMenu`
  carries its own; a `presentation`, or a control of the host's, renders one
  beside its spacer. Without a probe the full width is the last one the box
  had while the control did not yield, right for a control with no breakpoint
  of its own.
- **When it decides**: whenever the sibling reports, so on every resize of
  the row (a sidebar collapsing, a dock opening) and on a new trail. Every
  change in the row reaches the trail's box, which takes the room the
  controls leave. Until the trail is measured the controls stay at full size,
  so a server render and its hydration agree.
- **Ports**: `sibling` gives the room and the need (the host picks `whole` or
  `page`); `controls` gives the boxes that hold the controls, a missing one
  taking no part; `compactWidth` (44 by default) is a control's width while it
  yields, until it has yielded once and been measured. Read `yields(index)` in
  the markup that renders the controls.

## HeaderStatus

`HeaderStatus` (`gawdux/primitives`) is a pane header's state: the status chip,
always shown, and a small lock beside it while the viewer cannot edit.

```svelte
<HeaderStatus color="yellow" label="In approval" lockReason={canEdit ? null : reason} />
```

- **Chip**: a `StatusBadge` in the header's density (`px-1.5 py-0
  text-[10px]`); `color` and `label` are the host's vocabulary, the same words
  and colours its lists use. `className` merges further chip classes.
- **Lock**: drawn only while `lockReason` holds words. It carries none of its
  own: the reason is its tooltip and its accessible name (`role="img"`), and
  it is the header's quiet secondary grey, so the chip's colour stays the one
  signal.

## Host Contract

gawdux is presentation and interaction only. The host application owns routing, data, and business logic, and passes model objects (nav modules, list rows, page state) into these components. Where a component's behavior is owned by the host — sidebar label animation, list selection, command-bar actions — the source comments say so generically; gawdux is not tied to any particular product.

### Confirmation presentation

`ConfirmationCommandSurface` has one presentation, the house drawer at the
command bar (`CommandBarConfirmationPresentation`, `PageCommandBarConfirm`):

```svelte
<script lang="ts">
  import { ConfirmationCommandSurface } from 'gawdux/primitives';
  let { request, busy, error, confirm, cancel } = $props();
</script>

<ConfirmationCommandSurface {request} {busy} {error} onconfirm={confirm} oncancel={cancel} />
```

The question stays at the content edge in the house `.page-command-drawer`
while Cancel/Confirm take the bar's center registration. Existing page actions
return when the request closes. Without a bar context the buttons render
beside the question. The surface blocks busy interaction, prevents duplicate
dispatch, allows retry after a settled attempt and restores the request's
invoking control or fallback. Request ids define distinct decisions and
remount the presentation; hosts must give a new decision a new id.
`DiscardNavigationCommandSurface` is the same drawer, worded for unsaved
changes ("Keep editing", the destination's confirm), and `CommandDrawer` is
the house drawer for a decision that takes words or fields. None has chrome
of its own or a shadow. The surface supplies guarded callbacks; the host still
owns the action, authorization and outcome. `ConfirmationCommandRequest`,
`createPageCommandBarRegistry` and `PageCommandBarZones` are shared exports,
not host-local copies.

### The command bar's zones

An app shell holds the bar's three zones as one `PageCommandBarZones`, made
once in its persistent layout: it publishes the instance's `context` as
`PAGE_COMMAND_BAR_CONTEXT`, where pages register what they put in the bar,
and hands the instance to `PageFrame`, which renders each zone. Read the
zones in runes mode: a legacy-mode template does not track state on a class
instance.

```svelte
<script lang="ts">
  import { setContext } from 'svelte';
  import { PAGE_COMMAND_BAR_CONTEXT, PageCommandBarZones, PageFrame } from 'gawdux/primitives';
  let { children } = $props();
  const bar = new PageCommandBarZones();
  setContext(PAGE_COMMAND_BAR_CONTEXT, bar.context);
</script>

<PageFrame {bar}>{@render children()}</PageFrame>
```

### A register's phone sort

At or below the compact width a register's rows read as cards and its
column heads are hidden. The list's toolbar then offers the register's sort:
"Sort by", one choice per key and direction, each order worded (A to Z,
latest first). Give `ListPageScaffold` (or `ListSurface`, or `FilterBar`
itself) the same sort its heads set, as a `ListSort`:

```svelte
<ListPageScaffold {pagination} sort={{ keys, field, direction, onsort }}>
```

A choice writes the sort at once, as a head's click does, through `onsort`;
it is not staged with the filters. The control stands under the filter row
and is not drawn above the compact width; a list in a tab with no filters
and no rail draws its toolbar for the sort only at the compact width.
`ListQueryBar`'s `sort` is the same sort in a query bar.
`registersWithoutPhoneSort` (`gawdux/utils`) accepts either, and lists a
register that sorts by its heads with neither, or with both.

## Development Workflow

### Knowledge administration

`AiKnowledgePanel` from `gawdux/admin` takes a loaded model and complete host
actions. It retains the existing master-detail geometry, explicit name/description
draft, inline removal confirmations, pending-write navigation block, abortable
resource search and text-upload selection. A same-selection refresh preserves
unsaved input; only a new source projection supersedes locally settled source rows.
Resource results are ordered by the host, and stale or aborted requests cannot
replace the current picker.

The host supplies limits, supported upload types and validation, source eligibility,
status/version/last-good captions, disclosure, API effects and error messages.
The panel does not fetch, authorize, invent a revision protocol or run ingestion.
Full knowledge-base row subtypes survive mutation callbacks; knowledge, source and
resource IDs keep their supplied string or number identity. Apply successful source
responses locally before requesting the host's focused refresh.

Bind `editorDirty` and `editorBusy` to the existing host navigation guard; delegate
its command-bar create action to the component's `openCreate()`. Route approval
and discard decisions remain host-owned. Used-by links are already-authorized
native href intents, preserving modified and middle-click navigation. A null usage
capability renders no pretend connections, and an optional history snippet renders
only host-authorized history. A null model renders no panel or substitute storage.

### Skills administration

`AiSkillsPanel` from `gawdux/admin` takes one loaded `AiSkillsPanelModel` and
one complete `AiSkillsPanelActions` adapter. It preserves the skill rail/detail
layout, search, inline dependent-revoke confirmation, parameter working copy,
captured revision, stale reload, optimistic knowledge connections and host-rendered
preview. Blank required fields are setup hints, not additional rejection rules.

The host supplies navigation/discard decisions, API calls, error classification,
the authoritative grant result and the same preview renderer used by its runtime.
Its settings/binding adapters own any focused refresh; a refresh must not turn an
already successful mutation into a failed save. A same-selection refresh never
silently replaces the working draft or its captured revision.

Bind `settingsDirty` and `editorBusy` into the host's existing navigation guard.
Navigation approval and route formatting stay in the host. An optional `history`
snippet renders already-authorized host history, and `guideId` is host-supplied.
Knowledge IDs retain their supplied string or number identity. Only explicitly
live tools are called live; an unavailable tool may carry a host `statusLabel`.
A null model renders no pretend capability. Hosts without skills/knowledge storage
should hide the optional entry rather than fabricate an empty registry.

A host that vendors gawdux as a local `file:` dependency resolves it either to `../<gawdux>/src/lib/...` through Vite dev aliases for HMR, or to `dist` for build/package verification.

```bash
npm run check     # svelte-check
npm run test      # vitest
npm run package   # build dist/ for consumers
```

Rebuild the package (`npm run package`) before a consumer's build depends on a source change. Routine source/type changes are picked up through the host's Vite/HMR loop without a rebuild; reinstall in the host only when `dependencies` or the `exports` map change.

## Releases

Releases use an annotated `v<version>` Git tag. The tagged commit includes
the version in `package.json` and `package-lock.json`, consumer migration
notes in `CHANGELOG.md`, and regenerated `dist/` files. A Git tag is separate
from publishing to the npm registry.

After `npm ci`, run `npm run check`, `npm test`, and `npm run package`.
Inspect `npm pack --dry-run` to confirm the package includes its declared
entry points and excludes tests. Repeating `npm run package` should leave
the tracked distribution unchanged. Commit those reviewed files, create
the annotated tag, and push the commit and tag together.

Consumers moving from 0.6.x to 0.7.0 should read the removed-prop migrations
and layout notes in [CHANGELOG.md](CHANGELOG.md).

## License

MIT (see [LICENSE](LICENSE)).

## Validation presentation

`gawdux/validation` exports `ValidationRunReport`, `SignatureCommandSurface`
with `signatureStatement`, and `ManualObservationCommandSurface`. Hosts pass
authorized view models and own all writes, credential checks, review policy
and evidence links.

- `ValidationRunReport` reads an execution: its cases with their results,
  each step with what was observed and its captures, the requirements each
  case covers and the execution's identity. Optionally, a manual case's
  recorded observation (`ValidationCaseView.manual`: what was observed, by
  whom, when) follows its steps, withheld with them; and a case the host lets
  the reader complete (`canComplete`) offers "Record manual observation" when
  the host passes `onmanual`. A report with neither reads as it did without
  them.
- `ManualObservationCommandSurface` is the drawer that action opens: what
  was observed and an explicit Pass or Fail, Cancel and Save observation in
  the command bar. It hands the case, the revision the reader saw, the
  observation and the result to `oncomplete`, holds still while the promise
  runs and shows a refusal inside the drawer.
- `SignatureCommandSurface` is the sign drawer: the statement
  (`signatureStatement({ step, subject, meaning })`), what follows from the
  signature, the signer, the password each time, a reason, a `fields` slot
  for what the signature carries, Cancel and the confirm in the command bar.
  It hands the password and the reason to `onconfirm`; the host's signature
  service checks the password and records the signature, and a refused
  password (`errorReason` "password_incorrect") marks the field.

A runnable synthetic protocol preview is provided by the platform reference app.
The components do not infer permission from a displayed status or sign a record.
