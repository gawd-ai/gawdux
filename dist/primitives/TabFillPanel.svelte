<script lang="ts">
	let className: string = '';
	export { className as class };
</script>

<!-- Tab content panel that fills the remaining viewport height inside a
     PageTabs. The interesting work is in tokens.css: `.page-tabs-shell:has(
     .tab-fill-panel)` propagates `flex flex-col flex-1 min-h-0` down through
     the shell + flowbite's Tabs root + its `[role="tabpanel"]`, so this
     element ends up inside a real height context. Slot children that use
     `height: 100%` (e.g. a Leaflet map) then resize cleanly when the tab nav
     wraps to two lines, with no JS / no ResizeObserver. -->
<div class="tab-fill-panel {className}">
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
</style>
