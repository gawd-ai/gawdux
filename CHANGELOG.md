# Changelog

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
  — a capability flag *and* a callback — so a host that upgrades and wires
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
