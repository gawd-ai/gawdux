<!--
	@component
	The app shell's frame: the side rail, the main column and the right
	column side by side, filling the screen and never scrolling as a whole.

	At or below the compact width (`SHELL_BAR_QUERY`, 1024px) it is the phone
	shell. The side rail is not drawn; the header's menu button opens it as
	the navigation drawer (`drawer`, drawn while `navigationOpen`). The phone
	shell's one bar runs along the bottom: the right column's rail when the
	column holds something (`rightColumn`, which then carries the host's
	controls at the bar's end itself), the shell's own bar otherwise
	(`barEnd`: ShellBarEnd), so the account is at the bar's right end with
	chat on or off. The shell leaves the bar's room under the page, and the
	safe-area insets at its sides.

	`compact` (bindable) is the shell's one reading of the compact width in
	script. A drawer left open closes when the screen grows past it, so
	nothing stays inert behind a drawer that is no longer drawn.

	The parts are the host's: ShellSidebar, ShellNavigationDrawer,
	ShellMainColumn with ShellHeader, ShellRightColumn. A part left out is
	not drawn.
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import ShellBar from '../primitives/ShellBar.svelte';
	import { createCompactViewport } from './compact-viewport.svelte';

	let {
		sidebar,
		drawer,
		children,
		rightColumn,
		barEnd,
		navigationOpen = $bindable(false),
		compact = $bindable(false),
		class: className = '',
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
		/** The side rail above the compact width (ShellSidebar). */
		sidebar?: Snippet;
		/** The navigation drawer (ShellNavigationDrawer), drawn while open. */
		drawer?: Snippet<[{ close: () => void }]>;
		/** The main column (ShellMainColumn). */
		children?: Snippet;
		/**
		 * The right column (ShellRightColumn), when it holds something for
		 * this reader on this page. Its rail is the phone shell's bar.
		 */
		rightColumn?: Snippet | null;
		/**
		 * The host's controls at the bar's end (ShellBarEnd). Drawn in the
		 * shell's own bar when there is no right column; a right column's
		 * rail carries them itself.
		 */
		barEnd?: Snippet;
		/** Bindable: the navigation drawer is open. */
		navigationOpen?: boolean;
		/** Bindable: the screen is at or below the compact width. */
		compact?: boolean;
		class?: string;
	} = $props();

	const viewport = createCompactViewport();
	onMount(() => viewport.watch());
	$effect(() => {
		compact = viewport.compact;
	});
	// The drawer is the compact width's alone.
	let wasCompact = false;
	$effect(() => {
		const now = viewport.compact;
		if (wasCompact && !now) navigationOpen = false;
		wasCompact = now;
	});

	const hasBar = $derived(Boolean(rightColumn || barEnd));
	function close() {
		navigationOpen = false;
	}
</script>

<div {...rest} class="gawdux-app-shell {className}" class:has-bar={hasBar} data-app-shell>
	{#if sidebar}
		<div class="rail" data-shell-rail>{@render sidebar()}</div>
	{/if}

	{#if navigationOpen && drawer}
		{@render drawer({ close })}
	{/if}

	<div class="main" data-shell-main>{@render children?.()}</div>

	{#if rightColumn}
		{@render rightColumn()}
	{:else if barEnd}
		<ShellBar wide="hidden" end={barEnd} />
	{/if}
</div>

<style>
	.gawdux-app-shell {
		box-sizing: border-box;
		display: flex;
		height: 100vh;
		height: 100dvh;
		/* No descendant laying out past the screen's height can make the
		   window scroll. Fixed layers are not clipped. */
		overflow: hidden;
		background-color: var(--gawdux-shell-surface, rgb(243 244 246));
	}
	:global(.dark) .gawdux-app-shell {
		background-color: var(--gawdux-shell-surface, rgb(3 7 18));
	}
	.rail {
		display: flex;
		flex-shrink: 0;
		min-height: 0;
	}
	.main {
		position: relative;
		display: flex;
		flex: 1 1 0%;
		min-width: 0;
	}

	@media (max-width: 1024px) {
		.rail {
			display: none;
		}
		.gawdux-app-shell {
			padding-bottom: env(safe-area-inset-bottom, 0px);
			padding-left: env(safe-area-inset-left, 0px);
			padding-right: env(safe-area-inset-right, 0px);
		}
		/* The bar's room under the page and its command bar. */
		.gawdux-app-shell.has-bar {
			padding-bottom: var(
				--gawdux-shell-bar-space,
				calc(48px + env(safe-area-inset-bottom, 0px))
			);
		}
	}

	/* A printout is the page: the shell grows to its content and the rail
	   is left out. */
	@media print {
		.gawdux-app-shell {
			display: block;
			height: auto;
			min-height: 0;
			overflow: visible;
			padding: 0;
		}
		.rail {
			display: none;
		}
	}
</style>
