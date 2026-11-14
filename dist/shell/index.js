// gawdux/shell: the app shell kit. The frame, the header row, the side rail
// and its drawer, the right column, the bar's end and the account card, with
// the one resolution of the rail's place and the header's trail.
export { default as AppShell } from './AppShell.svelte';
export { default as ShellHeader } from './ShellHeader.svelte';
export { default as ShellSidebar } from './ShellSidebar.svelte';
export { default as ShellNavigationDrawer } from './ShellNavigationDrawer.svelte';
export { default as ShellMainColumn } from './ShellMainColumn.svelte';
export { default as ShellRightColumn } from './ShellRightColumn.svelte';
export { default as ShellBarEnd } from './ShellBarEnd.svelte';
export { default as AccountCard } from './AccountCard.svelte';
export { default as PlaceDoor } from './PlaceDoor.svelte';
export { resolveRailPlace, resolveActiveSidebarItemHref, sidebarActiveUrl, displayNameFor, initialsForDisplayName, rightColumnHolds } from './rail-place';
export { createAppTrail, getAppBreadcrumb, segmentLabel } from './app-trail';
export { APP_PAGE_HEADING_CONTEXT, createAppPageHeading } from './page-heading.svelte';
export { createCompactViewport } from './compact-viewport.svelte';
export { createCompactFold } from './compact-fold';
