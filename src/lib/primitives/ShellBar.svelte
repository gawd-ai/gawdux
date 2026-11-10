<!--
	@component
	The phone shell's one bar along the bottom of the screen.

	At or below the shell's compact width (`SHELL_BAR_QUERY`, 1024px) it is one
	row fixed to the bottom of the screen, clear of the safe-area inset, every
	control in it a 44px target: first what occupies it (`children`: a chat
	rail's controls, in their order), then the host's own controls at its end
	(`end`: the notices, the theme, the account). A part of the occupant marked
	`data-shell-bar-group` gives its controls to the row; one marked
	`data-shell-bar-column` belongs to the occupant's column and is not drawn.
	The host leaves `--gawdux-shell-bar-space` under its page.

	Above the compact width the host's end is hidden, its header carrying those
	controls, and the element is either not drawn (`wide` "hidden", a bar of the
	host's own) or left to its occupant's layout (`wide` "column", a rail beside
	a panel).

	What it holds reads `inShellBar()` as true, so a menu at its end opens
	upward as a sheet above the bar (`.gawdux-shell-bar-sheet`), never a modal;
	while a sheet is open the bar stands above the page's floating layers.

	The layout is the Gawdux stylesheet's (tokens.css), so a host's own markup
	can carry it too.
-->
<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { SHELL_BAR_CONTEXT } from './shell-bar';

	let {
		wide = 'hidden',
		end,
		children,
		element = $bindable(),
		class: className = '',
		...rest
	}: Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
		/**
		 * Above the compact width: "hidden" draws nothing (a bar of the host's
		 * own); "column" leaves the element to its occupant's layout.
		 */
		wide?: 'hidden' | 'column';
		/** The host's controls, after the occupant's, at the compact width only. */
		end?: Snippet;
		/** The occupant's controls. */
		children?: Snippet;
		/** Bindable: the bar's element. */
		element?: HTMLDivElement;
		class?: string;
	} = $props();

	setContext(SHELL_BAR_CONTEXT, true);
</script>

<div bind:this={element} {...rest} class="gawdux-shell-bar {className}" data-shell-bar={wide}>
	{@render children?.()}
	{#if end}
		<div class="gawdux-shell-bar-end">{@render end()}</div>
	{/if}
</div>
