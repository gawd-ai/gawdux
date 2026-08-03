# Changelog

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
