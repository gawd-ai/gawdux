<script lang="ts">
	let className: string = '';
	export { className as class };
	/** A fill tab whose content scrolls: the panel becomes the scroller,
	 *  spans its host's padding box and pads itself with the inset knobs
	 *  (`.tab-fill-scroll` in tokens.css). Without it the panel adds no
	 *  inset and does not scroll. */
	export let scroll = false;
</script>

<!-- Tab content panel that fills the remaining viewport height inside a
     PageTabs. The interesting work is in tokens.css: `.page-tabs-shell:has(
     .tab-fill-panel)` propagates `flex flex-col flex-1 min-h-0` down through
     the shell + flowbite's Tabs root + its `[role="tabpanel"]`, so this
     element ends up inside a real height context. Slot children that use
     `height: 100%` (e.g. a Leaflet map) then resize cleanly when the tab nav
     wraps to two lines, with no JS / no ResizeObserver. The panel never
     pads itself: the host (the tab panel) owns the inset. With `scroll` it
     is the tab's one scroller, and pads itself only because it then spans
     the host's padding box. -->
<div class="tab-fill-panel {className}" class:tab-fill-scroll={scroll}>
	<slot />
</div>

<style>
	.tab-fill-panel {
		display: flex;
		flex-direction: column;
		flex: 1 1 0%;
		min-height: 0;
		width: 100%;
	}
	/* Stretch instead of 100%: the scroller's negative inline margins make it
	   as wide as the host's padding box, which a 100% width would undo. */
	.tab-fill-scroll {
		width: auto;
	}
</style>
