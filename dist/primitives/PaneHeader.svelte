<!--
	@component
	The header of a pane that shows one item (a document, a record, a run, a
	form): one row that reads, at every width, in one order: the item's icon,
	its name, its state, then the controls.

	Above the compact width (1024px) the row is 60px: the leading control (a
	folder tree's toggle, where the page has one), the item's icon, the title
	with its state 8px after it (the chip and the lock as one group, which
	never truncates: the title truncates first), the subtitle under the title,
	and the controls (the channel, Close) at the row's end.

	At or below the compact width the trail's row names the item, so the row
	holds no title and no subtitle: at its start the leading control and the
	item's icon, each on a 44px column from the pane's edge, the columns of a
	tab strip under it that shows its icons alone, so the icons line up; the
	state 8px after the icon's glyph; at its end the controls, 44px targets
	4px apart and 4px from the pane's edge, the columns of the tools at the
	end of a tab strip's row. Nothing else is in the row. A header with
	nothing to hold there (no leading control, no state, no control) is not
	drawn, and the pane opens on its content.

	The state shows once. A pane header claims the page's status
	(PAGE_STATUS_CONTEXT), so a tab strip under it draws none; it draws the
	`status` it is given, else the page's.
-->
<script lang="ts">
	import { getContext, onDestroy, type Component, type Snippet } from 'svelte';
	import { readable } from 'svelte/store';
	import { PAGE_STATUS_CONTEXT, type PageStatusHost } from './page-chrome';

	let {
		title,
		subtitle = null,
		subtitleContent,
		icon = null,
		leading,
		status,
		actions,
		className = ''
	}: {
		/** The item's name; the trail's row names it at the compact width. */
		title: string;
		/** One line under the title, its description; null draws none. */
		subtitle?: string | null | undefined;
		/** A subtitle of the host's own markup, in place of `subtitle`. */
		subtitleContent?: Snippet | undefined;
		/** The item's icon, from the house set, drawn at the house size. */
		icon?: Component | null | undefined;
		/** Before the icon: a folder tree's toggle, a 44px target at the compact width. */
		leading?: Snippet | undefined;
		/** The item's state: the chip and its lock (HeaderStatus). */
		status?: Snippet | undefined;
		/** At the row's end: the item's icon buttons (the channel, Close). */
		actions?: Snippet | undefined;
		className?: string;
	} = $props();

	const statusHost = getContext<PageStatusHost | undefined>(PAGE_STATUS_CONTEXT);
	const claim = statusHost?.claim() ?? null;
	const pageStatus = claim?.status ?? readable<Snippet | null>(null);
	onDestroy(() => claim?.release());

	const shownStatus = $derived(status ?? $pageStatus ?? null);
	const bare = $derived(!leading && !actions && !shownStatus);
</script>

<div
	class="gawdux-pane-header {className}"
	class:gawdux-pane-header--bare={bare}
	data-pane-header
	data-pane-bare={bare ? '' : undefined}
>
	{#if leading}
		<div class="gawdux-pane-header-leading" data-pane-leading>{@render leading()}</div>
	{/if}
	{#if icon}
		{@const Icon = icon}
		<span class="gawdux-pane-header-icon" data-pane-icon
			><Icon class="gawdux-icon" aria-hidden="true" /></span
		>
	{/if}
	<div class="gawdux-pane-header-name">
		<div class="gawdux-pane-header-line">
			<p class="gawdux-pane-header-title" data-pane-title>{title}</p>
			{#if shownStatus}
				<span class="gawdux-pane-header-status" data-pane-status>{@render shownStatus()}</span>
			{/if}
		</div>
		{#if subtitleContent}
			<div class="gawdux-pane-header-subtitle" data-pane-subtitle>{@render subtitleContent()}</div>
		{:else if subtitle}
			<p class="gawdux-pane-header-subtitle" title={subtitle} data-pane-subtitle>{subtitle}</p>
		{/if}
	</div>
	{#if actions}
		<div class="gawdux-pane-header-actions" data-pane-actions>{@render actions()}</div>
	{/if}
</div>

<style>
	.gawdux-pane-header {
		position: relative;
		z-index: 30;
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.5rem;
		height: 60px;
		padding: 0 0.75rem;
		overflow: visible;
		border-bottom: 1px solid rgb(229 231 235 / 0.6); /* gray-200/60 */
		background-color: rgb(255 255 255 / 0.85);
		backdrop-filter: blur(12px);
	}
	:global(.dark) .gawdux-pane-header {
		border-bottom-color: rgb(55 65 81 / 0.7); /* gray-700/70 */
		background-color: rgb(17 24 39 / 0.8); /* gray-900/80 */
	}
	.gawdux-pane-header-leading,
	.gawdux-pane-header-actions {
		display: flex;
		flex-shrink: 0;
		align-items: center;
	}
	.gawdux-pane-header-actions {
		position: relative;
		z-index: 40;
		gap: 0.25rem;
		margin-left: auto;
	}
	/* The item's icon, flat as every header control is: no tile, border or
	   shadow of its own, the house icon in the accent. */
	.gawdux-pane-header-icon {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		color: rgb(59 130 246); /* blue-500 */
	}
	:global(.dark) .gawdux-pane-header-icon {
		color: rgb(147 197 253); /* blue-300 */
	}
	.gawdux-pane-header-name {
		display: flex;
		flex: 1 1 0%;
		flex-direction: column;
		justify-content: center;
		min-width: 0;
	}
	/* The title, then its state 8px after it: the title truncates first, the
	   state keeps its word. */
	.gawdux-pane-header-line {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}
	.gawdux-pane-header-title {
		flex: 0 1 auto;
		min-width: 0;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.25;
		color: rgb(17 24 39); /* gray-900 */
	}
	:global(.dark) .gawdux-pane-header-title {
		color: rgb(255 255 255);
	}
	.gawdux-pane-header-status {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
	}
	.gawdux-pane-header-subtitle {
		min-width: 0;
		margin: 0.125rem 0 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 11px;
		line-height: 1.25;
		color: rgb(107 114 128); /* gray-500 */
	}
	:global(.dark) .gawdux-pane-header-subtitle {
		color: rgb(156 163 175); /* gray-400 */
	}

	/* At the compact width: one 44px row on the pane's columns. The leading
	   control and the icon each take a 44px column from the pane's edge, the
	   state stands 8px after the icon's glyph (the glyph is centred in its
	   column), the controls stand 4px apart and 4px from the pane's edge. */
	@media (max-width: 1024px) {
		.gawdux-pane-header {
			gap: 0;
			height: 2.75rem;
			padding: 0 0.25rem 0 0;
		}
		.gawdux-pane-header--bare {
			display: none;
		}
		.gawdux-pane-header-icon {
			width: 2.75rem;
			height: 2.75rem;
		}
		.gawdux-pane-header-icon + .gawdux-pane-header-name {
			margin-inline-start: calc((var(--gawdux-icon-size, 1.25rem) - 2.75rem) / 2 + 0.5rem);
		}
		.gawdux-pane-header-title,
		.gawdux-pane-header-subtitle {
			display: none;
		}
	}
</style>
