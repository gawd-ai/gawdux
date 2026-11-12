<!--
	PageFrame: the page's one frame.

	The app shell renders it once, in its main column, around the page and
	the command bar: every page's content stands in the frame's surface and
	the bar closes it. The frame owns the page's panel and its junction with
	the bar at every width (tokens.css, "The page frame"):

	- its inset from the column (--gawdux-frame-gutter, none at the compact
	  width);
	- one edge and one radius around the surface and the bar together, and
	  the page's one elevation (--gawdux-surface-elevation);
	- the seam: a drawn bar takes the surface's bottom corners, so the seam is
	  one straight full-width edge with no gap and no band, and the content's
	  elevation falls on the bar's top edge (on an open drawer's, while one
	  rises out of the bar);
	- a bar with nothing to hold is not drawn, and the surface keeps its own
	  bottom corners.

	A page draws no surface, panel, edge, corner or seam of its own: its
	content is the frame's content. A Gawdux host that fills the page (PageTabs,
	EditablePageScaffold's surface, ListSurface's page list) takes the frame's
	height through `.page-fill`; anything else scrolls inside the frame's
	surface, under which the bar stays.

	The bar's three zones are the host's registry of what pages put in it
	(PAGE_COMMAND_BAR_CONTEXT): `bar` is read as the frame renders, after the
	page, so a server render holds the bar the page fills. Each zone renders
	as `{@render zone?.()}` (see page-command-bar-registry).

	Anything else lands on the <main>: a host's landmark name or test marker.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		bar = null,
		children,
		...rest
	}: {
		/** What the page puts in the bar, zone by zone. Null: no bar is drawn. */
		bar?: { left: Snippet | null; center: Snippet | null; right: Snippet | null } | null;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

<main {...rest} class="page-frame" data-page-frame>
	<div class="page-frame-panel">
		<div class="page-frame-surface" data-page-frame-surface>
			{@render children?.()}
		</div>
		<div class="page-command-bar" data-page-frame-bar>
			<div class="cmd-bar-zone cmd-bar-left">{@render bar?.left?.()}</div>
			<div class="cmd-bar-zone cmd-bar-center">{@render bar?.center?.()}</div>
			<div class="cmd-bar-zone cmd-bar-right">{@render bar?.right?.()}</div>
		</div>
	</div>
</main>
