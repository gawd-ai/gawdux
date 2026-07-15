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
- `gawdux/types`
- `gawdux/utils`
- `gawdux/styles/tokens.css`

## What's Inside

- **components** — `AppSidebar`, `SidebarDropdownGroup`, `SidebarFlyout`: the collapsible app navigation shell.
- **primitives** — list and page building blocks: `ListSurface`, `ListQueryBar`, `ListPaginationNav`, `FilterBar`/`FilterPillRow`, `MasterDetailShell`, `ListPageScaffold`/`EditablePageScaffold`, `PageCommandBar`, `PageTabs`, `FormField`, `ReadonlyField`, `CardContainer`, and more.
- **styles/tokens.css** — the shared design tokens (color, spacing, density) that give consuming apps a common visual language.

## Host Contract

gawdux is presentation and interaction only. The consuming app owns routing, data, and business logic, and passes model objects (nav modules, list rows, page state) into these components. Where a component's behavior is owned by the host — sidebar label animation, list selection, command-bar actions — the source comments refer to "the consuming app" generically; gawdux is not tied to any particular product.

## Development Workflow

A host that vendors gawdux as a local `file:` dependency resolves it either to `../<gawdux>/src/lib/...` through Vite dev aliases for HMR, or to `dist` for build/package verification.

```bash
npm run check     # svelte-check
npm run test      # vitest
npm run package   # build dist/ for consumers
```

Rebuild the package (`npm run package`) before a consumer's build depends on a source change. Routine source/type changes are picked up through the host's Vite/HMR loop without a rebuild; reinstall in the host only when `dependencies` or the `exports` map change.

## License

MIT (see [LICENSE](LICENSE)).
