<!--
	@component
	The shell's main column: the header, then the page. While a panel is the
	view at the compact width (`covered`: a chat panel open over the page),
	the column is inert and hidden from assistive technology, so the focus
	and a reader stay in the panel.

	The page is the host's: it draws its one frame (PageFrame) inside.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		header,
		children,
		covered = false
	}: {
		/** The shell's header (ShellHeader). */
		header?: Snippet;
		children?: Snippet;
		/** A panel is the view: the column takes no key, press or reading. */
		covered?: boolean;
	} = $props();
</script>

<div
	class="gawdux-shell-main-column"
	data-shell-main-column
	inert={covered}
	aria-hidden={covered || undefined}
>
	{@render header?.()}
	<div class="page">
		{@render children?.()}
	</div>
</div>

<style>
	.gawdux-shell-main-column {
		display: flex;
		flex: 1 1 0%;
		flex-direction: column;
		min-width: 0;
	}
	.page {
		display: flex;
		flex: 1 1 0%;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}
	@media print {
		.gawdux-shell-main-column,
		.page {
			max-height: none;
			overflow: visible;
		}
	}
</style>
