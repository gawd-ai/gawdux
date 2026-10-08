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
- **primitives**: list and page building blocks: `ListSurface`, `ListQueryBar`, `ListPaginationNav`, `FilterBar`/`FilterPillRow`, `SavedViewsRail`, `MasterDetailShell`, `ListPageScaffold`/`EditablePageScaffold`, `PageCommandBar`, `PageTabs`, `FormField`, `ReadonlyField`, `CardContainer`, and more.
- **detail and table primitives**: `StatTile`/`StatTileStrip` (a detail overview's KPI tiles: label, value, meta, icon, a state tone, a go-to icon drill-down; the strip wraps and never clips), `SectionLink` (the go-to-section arrow, no words, at the top right of a card header or tile; `CardContainer` takes it as `link`), `IconButton` (an icon action named by its tooltip; `danger` turns red only on hover), `DataTable` (a `TableContainer` with column definitions, `SortableHeadCell` headers, cells from a snippet and the house empty row), `IconLabel` (an icon and a word, the shape of a cue), `StatusBadge` (a coloured word, optionally with an icon), `TableContainer`, `SortableHeadCell`, `EmptyStateRow`, `CollectionEmptyState`.
- **alert-ops**: `AlertOpsConsole`, the Alert Operations surface (alert groups, detail, silences), transport-agnostic. Its tabs carry icons; its denied and unavailable states are the house `CollectionEmptyState` on the page surface, and with `healthBar={false}` the host's bar carries status and Refresh, so the unavailable state offers no Retry of its own.
- **admin** (`gawdux/admin`): tenant-administration blocks, presentation only (the host loads, authorizes and performs every change): `MemberAccessCard`, `SecurityActivityList`, `AuditHistoryTable`, `RoleMembersCard` (who holds a Role: a quiet trash icon raises the removal for the host to confirm, a picker adds), and the AI + Bots blocks: `AiUsageReport` (totals as tiles, `AiUsageBars` per day, one share-bar card per breakdown; turns and tokens, never money), `BotRail` (bots with avatar, role and one state, for every tab that picks a bot first), `BotIdentityHeader`, `BotConfigView` (a config read, the other half of `BotConfigFields`' edit), `BotContextCard` (the composed block a bot reads, by parts), `BotToolAccess`.
- **styles/tokens.css**: the shared design tokens (color, spacing, density) that give host applications a common visual language.

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
	--gawdux-card-body-py: 0.5rem; /* default py-3 */
}
```

| Knob | Default | Drives |
| --- | --- | --- |
| `--gawdux-table-cell-px` | `px-6` | body and head cells, inline |
| `--gawdux-table-cell-py` | `py-4` | body cells, block |
| `--gawdux-table-head-py` | `py-3` | head cells, block |
| `--gawdux-table-row-height` | `auto` | minimum body row height |
| `--gawdux-card-header-px` / `-py` | `px-6` / `py-3` | `CardContainer` header, `.card-header` |
| `--gawdux-card-body-px` / `-py` | `px-6` / `py-3` | `CardContainer` body |
| `--gawdux-tile-padding` / `-nested` | `p-3` / `p-2.5` | `StatTile` |
| `--gawdux-tile-gap` / `--gawdux-tile-min-width` | `gap-3` / `9rem` | `StatTileStrip` |

The table knobs apply to flowbite cells inside a `TableContainer`,
`ListSurface` or `DataTable` that still carry flowbite's default padding; a
cell that sets its own padding keeps it.

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
  height above the page (z-index 60). Below `compactBelow` (768 by default,
  1024, or 0 for never) the closed menu is the avatar alone; open, the avatar
  stays put, the panel grows to its left and stops at the 16px gutter.
- **Styling** is scoped CSS over the tokens (`--gawdux-surface`,
  `--gawdux-menu-surface`, `--gawdux-border`, `--gawdux-menu-divider`,
  `--gawdux-menu-item-hover`, `--gawdux-chip-surface`, `--gawdux-avatar-surface`,
  `--gawdux-avatar-text`, `--gawdux-text-danger`, ...), never Tailwind
  utilities, so it renders styled even where the host's Tailwind does not scan
  this package.

## Host Contract

gawdux is presentation and interaction only. The host application owns routing, data, and business logic, and passes model objects (nav modules, list rows, page state) into these components. Where a component's behavior is owned by the host — sidebar label animation, list selection, command-bar actions — the source comments say so generically; gawdux is not tied to any particular product.

### Confirmation presentation

`ConfirmationCommandSurface` retains its existing drawer when `presentation` is
omitted. Hosts that already use a persistent page command bar can opt into the
same request/busy/error contract with `CommandBarConfirmationPresentation`:

```svelte
<script lang="ts">
  import { ConfirmationCommandSurface, CommandBarConfirmationPresentation } from 'gawdux/primitives';
  let { request, busy, error, confirm, cancel } = $props();
</script>

<ConfirmationCommandSurface
  {request} {busy} {error}
  presentation={CommandBarConfirmationPresentation}
  onconfirm={confirm} oncancel={cancel}
/>
```

The opt-in presentation uses `PageCommandBarConfirm`: the question stays at the
content edge while Cancel/Confirm take the bar's center registration. Existing
page actions return when the request closes. Without a bar context the buttons
render beside the question. Both presentations block busy interaction, prevent
duplicate dispatch, allow retry after a settled attempt and restore the request's
invoking control or fallback. Request ids define distinct decisions and remount
an injected presentation; hosts must give a new decision a new id.

Custom presentations accept `ConfirmationCommandPresentationProps` and own
markup, keyboard interaction and focus. The surface supplies guarded callbacks;
the host still owns the action, authorization and outcome. `ConfirmationCommandRequest`
and `createPageCommandBarRegistry` are shared exports, not host-local copies.

## Development Workflow

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

`gawdux/validation` exports `ValidationRunReport`, `SignatureHistory`, and
`ManualObservationForm`. Hosts pass authorized view models and own all writes,
credential checks, review policy and evidence links. The form requires an explicit
pass/fail result, sends the retained revision with the observation and prevents
concurrent submissions. Historical signature verification can be unavailable; the
history component distinguishes that from verified or failed content.

A runnable synthetic protocol preview is provided by the platform reference app.
The components do not infer permission from a displayed status or sign a record.
