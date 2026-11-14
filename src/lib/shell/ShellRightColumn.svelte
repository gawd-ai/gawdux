<!--
	@component
	The shell's right column: a cap level with the header, then what the
	column holds (a chat panel beside its rail). The host draws it only when
	it holds something for this reader on this page (`rightColumnHolds`);
	without it the main column reaches the right edge and the header carries
	the theme toggle the cap would hold.

	The cap is as wide as the open panel plus the 48px rail: a spacer the
	panel's width (0 while it is closed), holding what the host reads beside
	the theme (`capStart`: a meter), then the theme toggle over the rail.

	At or below the compact width the column takes no width: its rail is the
	phone shell's one bar along the bottom (ShellBar), the cap is not drawn
	(the account menu in the bar holds the theme and the meter), and an open
	panel is the view. The frame then says so to assistive technology
	(`viewLabel`: a dialog with that name).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import DarkModeToggle from '../primitives/DarkModeToggle.svelte';

	let {
		panelOpen = false,
		panelWidth = 0,
		resizing = false,
		themeCookieName,
		themeLabel = 'Toggle dark mode',
		capStart,
		viewLabel,
		children
	}: {
		/** The column's panel is open: the cap spans it. */
		panelOpen?: boolean;
		/** The open panel's width, in px. */
		panelWidth?: number;
		/** The panel is being resized: the cap follows without a transition. */
		resizing?: boolean;
		/** The theme toggle's cookie; left out, the cap holds no toggle. */
		themeCookieName?: string;
		themeLabel?: string;
		/** A reading in the cap, beside the theme (a meter). */
		capStart?: Snippet;
		/**
		 * The panel's name while it is the view at the compact width: the
		 * frame is then a dialog with this name. Left out, it is a plain box.
		 */
		viewLabel?: string;
		/** What the column holds. */
		children?: Snippet;
	} = $props();
</script>

<div class="gawdux-shell-right-column" data-shell-right-column>
	<div class="gawdux-shell-right-cap" data-shell-right-cap>
		<div
			class="spacer"
			data-shell-right-cap-spacer
			style:width="{panelOpen ? panelWidth : 0}px"
			style:transition={resizing ? 'none' : undefined}
		>
			{#if capStart}
				<div class="cap-start">{@render capStart()}</div>
			{/if}
		</div>
		{#if themeCookieName}
			<div class="theme" data-theme-toggle>
				<DarkModeToggle
					cookieName={themeCookieName}
					class="gawdux-shell-header-control"
					ariaLabel={themeLabel}
				/>
			</div>
		{/if}
	</div>

	<div
		class="gawdux-shell-right-frame"
		class:open={panelOpen}
		data-shell-right-frame
		role={viewLabel ? 'dialog' : undefined}
		aria-modal={viewLabel ? true : undefined}
		aria-label={viewLabel}
	>
		{@render children?.()}
	</div>
</div>

<style>
	.gawdux-shell-right-column {
		position: relative;
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		flex-direction: column;
		padding-bottom: 0.5rem;
	}
	.gawdux-shell-right-cap {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: flex-end;
		height: 3.5rem;
	}
	.spacer {
		display: flex;
		align-items: center;
		overflow: hidden;
		transition: width 200ms ease-in-out;
	}
	.cap-start {
		display: flex;
		align-items: center;
		padding-left: 0.75rem;
	}
	.theme {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 3rem;
	}
	.theme :global(.gawdux-shell-header-control) {
		border-radius: 0.5rem;
		color: var(--gawdux-text-muted);
		transition: background-color 150ms ease-out;
	}
	.theme :global(.gawdux-shell-header-control:hover) {
		background-color: var(--gawdux-header-control-hover-surface);
	}
	.gawdux-shell-right-frame {
		flex: 1 1 0%;
		min-height: 0;
		margin-top: 1px;
		overflow: hidden;
		border-top-left-radius: 0.5rem;
		border-bottom-left-radius: 0.5rem;
	}

	/* The rail is the bar along the bottom: the column takes no width, the
	   cap is not drawn, and what the frame holds lays itself out as the view. */
	@media (max-width: 1024px) {
		.gawdux-shell-right-column {
			width: 0;
			padding-bottom: 0;
		}
		.gawdux-shell-right-cap {
			display: none;
		}
		.gawdux-shell-right-frame {
			overflow: visible;
		}
	}

	@media print {
		.gawdux-shell-right-column {
			display: none;
		}
	}
</style>
