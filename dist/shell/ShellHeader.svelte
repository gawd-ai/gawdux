<!--
	@component
	An app shell's header: the menu button (at the compact width), the trail,
	then above the compact width the host's controls at its end: a switcher,
	the account, the notices and, when the shell has no right column to hold
	it, the theme toggle.

	At or below the compact width (`SHELL_BAR_QUERY`, 1024px) the header is
	one row 48px tall: the menu button, a 44px target tight to the screen's
	edge with no padding or gap around it, and the current page's name beside
	it, which opens its path (Breadcrumbs). The controls at its end are not
	drawn there: they are at the right end of the phone shell's bar along the
	bottom (ShellBarEnd), and the theme is a row of the account menu.

	Above it the trail is one line that grows into the room the controls
	leave, and the controls yield their room to it (`createRoomYield`): when
	the whole trail does not fit beside them at full size, the account shows
	its avatar alone, and the switcher too when that is not enough. Each
	control's snippet is told `compact` and renders itself so; its full width
	is read from its probe (`data-room-full`), so a yield never undoes itself.

	The header draws no account and no switcher of its own: `account`,
	`switcher` and `notices` are the host's, and a slot left empty draws
	nothing. The strip is transparent over the shell's background, and every
	control in it is flat.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { BarsOutline } from 'flowbite-svelte-icons';
	import Breadcrumbs from '../primitives/Breadcrumbs.svelte';
	import DarkModeToggle from '../primitives/DarkModeToggle.svelte';
	import type { BreadcrumbRoom } from '../primitives/breadcrumb-overflow';
	import { createRoomYield } from '../utils/room-yield.svelte';
	import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';

	let {
		trail,
		onOpenNavigation,
		account,
		switcher,
		notices,
		themeCookieName,
		openNavigationLabel = 'Open navigation',
		themeLabel = 'Toggle dark mode',
		compactWidth = 44
	}: {
		/** The trail, first level first; the last is the current page. */
		trail: BreadcrumbCrumb[];
		/** The menu button's press: the host opens its navigation drawer. */
		onOpenNavigation: () => void;
		/**
		 * The account menu above the compact width. `compact` is true while
		 * the trail needs its room: the menu shows its avatar alone.
		 */
		account?: Snippet<[{ compact: boolean }]>;
		/**
		 * A switcher before the account (a tenant's, a site's). It yields its
		 * room after the account has.
		 */
		switcher?: Snippet<[{ compact: boolean }]>;
		/** The notices, after the account. */
		notices?: Snippet;
		/**
		 * The theme toggle at the header's end, for a shell with no right
		 * column to hold it: the cookie the host's server reads to draw the
		 * first paint in the theme. Left out, no toggle is drawn.
		 */
		themeCookieName?: string;
		openNavigationLabel?: string;
		themeLabel?: string;
		/** A control's width while it yields, until it is measured. */
		compactWidth?: number;
	} = $props();

	let trailRoom = $state<BreadcrumbRoom | null>(null);
	let accountBox = $state<HTMLElement>();
	let switcherBox = $state<HTMLElement>();
	const headerRoom = createRoomYield({
		sibling: () => (trailRoom ? { available: trailRoom.available, need: trailRoom.whole } : null),
		controls: () => [accountBox, switcherBox],
		get compactWidth() {
			return compactWidth;
		}
	});
</script>

<div class="gawdux-shell-header" data-shell-header>
	<button
		type="button"
		class="gawdux-shell-menu-button"
		data-shell-menu-button
		onclick={onOpenNavigation}
		aria-label={openNavigationLabel}
		title={openNavigationLabel}
	>
		<BarsOutline class="gawdux-shell-menu-icon" />
	</button>

	<Breadcrumbs items={trail} className="gawdux-shell-header-trail" bind:room={trailRoom} />

	{#if account || switcher || notices || themeCookieName}
		<div class="gawdux-shell-header-end" data-shell-header-end>
			{#if switcher}
				<div class="gawdux-shell-header-box" data-shell-header-switcher bind:this={switcherBox}>
					{@render switcher({ compact: headerRoom.yields(1) })}
				</div>
			{/if}
			{#if account}
				<div class="gawdux-shell-header-box" data-shell-header-account bind:this={accountBox}>
					{@render account({ compact: headerRoom.yields(0) })}
				</div>
			{/if}
			{@render notices?.()}
			{#if themeCookieName}
				<div class="gawdux-shell-header-box" data-theme-toggle>
					<DarkModeToggle
						cookieName={themeCookieName}
						class="gawdux-shell-header-control"
						ariaLabel={themeLabel}
					/>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.gawdux-shell-header {
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		height: 3.5rem;
		padding-left: 1rem;
		padding-right: 0.5rem;
	}
	.gawdux-shell-header :global(.gawdux-shell-header-trail) {
		height: 3.5rem;
	}
	.gawdux-shell-header-end {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.5rem;
	}
	.gawdux-shell-header-box {
		display: flex;
		flex-shrink: 0;
		align-items: center;
	}
	/* The menu button is the compact width's alone. */
	.gawdux-shell-menu-button {
		display: none;
		box-sizing: border-box;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		border: 0;
		border-radius: 0.5rem;
		background-color: transparent;
		color: var(--gawdux-text-muted);
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			color 150ms ease-out;
	}
	.gawdux-shell-menu-button:hover {
		background-color: var(--gawdux-header-control-hover-surface);
		color: var(--gawdux-text-primary);
	}
	.gawdux-shell-menu-button:focus {
		outline: none;
	}
	.gawdux-shell-menu-button:focus-visible {
		box-shadow: 0 0 0 2px var(--gawdux-focus-ring);
	}
	.gawdux-shell-menu-button :global(.gawdux-shell-menu-icon) {
		width: 1.5rem;
		height: 1.5rem;
	}
	/* Every header control is flat: the header's quiet fill under the
	   pointer, never a surface or a shadow of its own. */
	.gawdux-shell-header :global(.gawdux-shell-header-control) {
		border-radius: 0.5rem;
		color: var(--gawdux-text-muted);
		transition: background-color 150ms ease-out;
	}
	.gawdux-shell-header :global(.gawdux-shell-header-control:hover) {
		background-color: var(--gawdux-header-control-hover-surface);
	}

	/* One row 48px tall: the menu button tight to the screen's edge, the
	   page's name beside it, the controls in the bar along the bottom. */
	@media (max-width: 1024px) {
		.gawdux-shell-header {
			gap: 0;
			height: 3rem;
			padding-left: 0;
		}
		.gawdux-shell-header :global(.gawdux-shell-header-trail) {
			height: 2.75rem;
		}
		.gawdux-shell-menu-button {
			display: flex;
		}
		.gawdux-shell-header-end {
			display: none;
		}
	}

	@media print {
		.gawdux-shell-header {
			display: none;
		}
	}
</style>
