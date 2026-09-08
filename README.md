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
- `gawdux/alert-ops`
- `gawdux/validation`
- `gawdux/types`
- `gawdux/utils`
- `gawdux/styles/tokens.css`

## What's Inside

- **components** — `AppSidebar`, `SidebarDropdownGroup`, `SidebarFlyout`: the collapsible app navigation shell.
- **primitives** — list and page building blocks: `ListSurface`, `ListQueryBar`, `ListPaginationNav`, `FilterBar`/`FilterPillRow`, `MasterDetailShell`, `ListPageScaffold`/`EditablePageScaffold`, `PageCommandBar`, `PageTabs`, `FormField`, `ReadonlyField`, `CardContainer`, and more.
- **styles/tokens.css** — the shared design tokens (color, spacing, density) that give host applications a common visual language.

## Host Contract

gawdux is presentation and interaction only. The host application owns routing, data, and business logic, and passes model objects (nav modules, list rows, page state) into these components. Where a component's behavior is owned by the host — sidebar label animation, list selection, command-bar actions — the source comments say so generically; gawdux is not tied to any particular product.

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
