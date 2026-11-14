<!--
	@component
	The side rail's chrome around AppSidebar: the home link with the host's
	brand at its head, and the collapse button at its foot. As the navigation
	drawer's content (`drawer`) the head is one 56px row, the brand and a
	Close button (a 44px target), and there is no collapse button.

	The brand is the host's (`brand`: its mark and its name): the kit names no
	product. It is told `collapsed`, so a name can fade as the rail narrows,
	and `drawer`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ChevronDoubleLeftOutline, CloseOutline } from 'flowbite-svelte-icons';
	import AppSidebar from '../components/AppSidebar.svelte';
	import type { AppSidebarProps } from '../types/sidebar.types';

	let {
		config,
		activeUrl,
		initialOpen,
		homeHref,
		homeLabel = 'Home',
		brand,
		ontoggle,
		drawer = false,
		onclose,
		closeLabel = 'Close navigation',
		expandLabel = 'Expand sidebar',
		collapseLabel = 'Collapse sidebar'
	}: {
		config: AppSidebarProps['config'];
		/** The address the rail marks (`sidebarActiveUrl`). */
		activeUrl: string;
		initialOpen: boolean;
		/** Where the brand leads: the app's home. */
		homeHref: string;
		/** The home link's tooltip. */
		homeLabel?: string;
		/** The host's mark and name, inside the home link. */
		brand?: Snippet<[{ collapsed: boolean; drawer: boolean }]>;
		ontoggle?: AppSidebarProps['ontoggle'];
		/** The rail as the navigation drawer's content. */
		drawer?: boolean;
		/** The drawer's Close button. */
		onclose?: () => void;
		closeLabel?: string;
		expandLabel?: string;
		collapseLabel?: string;
	} = $props();

	function handleToggle(collapsed: boolean): void {
		ontoggle?.(collapsed);
	}
</script>

<AppSidebar
	{config}
	{activeUrl}
	{initialOpen}
	ontoggle={handleToggle}
	class={drawer ? 'gawdux-shell-sidebar-drawer' : ''}
>
	{#snippet header({ collapsed }: { collapsed: boolean })}
		{#if drawer}
			<div class="drawer-head" data-shell-drawer-head>
				<a href={homeHref} class="drawer-home" title={homeLabel}>
					{@render brand?.({ collapsed: false, drawer: true })}
				</a>
				<button
					type="button"
					onclick={onclose}
					class="gawdux-shell-navigation-close"
					aria-label={closeLabel}
					title={closeLabel}
				>
					<CloseOutline class="gawdux-shell-sidebar-icon" />
				</button>
			</div>
		{:else}
			<a href={homeHref} class="rail-home" title={homeLabel} data-shell-rail-home>
				{@render brand?.({ collapsed, drawer: false })}
			</a>
		{/if}
	{/snippet}

	{#snippet toggleBar({ collapsed, toggle }: { collapsed: boolean; toggle: () => void })}
		{#if !drawer}
			<div class="rail-foot">
				<button
					type="button"
					onclick={toggle}
					class="rail-toggle"
					class:collapsed
					aria-label={collapsed ? expandLabel : collapseLabel}
				>
					<ChevronDoubleLeftOutline class="gawdux-shell-sidebar-icon" />
				</button>
			</div>
		{/if}
	{/snippet}
</AppSidebar>

<style>
	.drawer-head {
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.5rem;
		height: 3.5rem;
		padding-inline: 0.75rem;
		border-bottom: 1px solid var(--gawdux-border);
	}
	.drawer-home {
		display: flex;
		flex: 1 1 0%;
		align-items: center;
		gap: 0.625rem;
		min-width: 0;
		border-radius: 0.5rem;
		color: var(--gawdux-text-primary);
		text-decoration: none;
	}
	.gawdux-shell-navigation-close,
	.rail-toggle {
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
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
	.gawdux-shell-navigation-close {
		width: 2.75rem;
		height: 2.75rem;
	}
	.rail-toggle {
		width: 2rem;
		height: 2rem;
	}
	.gawdux-shell-navigation-close:hover,
	.rail-toggle:hover {
		background-color: var(--gawdux-menu-item-hover);
		color: var(--gawdux-text-primary);
	}
	.gawdux-shell-navigation-close:focus {
		outline: none;
	}
	.gawdux-shell-navigation-close:focus-visible,
	.rail-toggle:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px var(--gawdux-focus-ring);
	}
	.drawer-head :global(.gawdux-shell-sidebar-icon),
	.rail-foot :global(.gawdux-shell-sidebar-icon) {
		width: 1.5rem;
		height: 1.5rem;
		transition: transform 300ms;
	}
	.rail-toggle.collapsed :global(.gawdux-shell-sidebar-icon) {
		transform: rotate(180deg);
	}
	.rail-home {
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.625rem;
		height: 3rem;
		min-width: 38px;
		margin: 0.25rem 14px;
		border-radius: 0.5rem;
		color: var(--gawdux-text-primary);
		text-decoration: none;
		transition: background-color 150ms ease-out;
	}
	.rail-home:hover {
		background-color: color-mix(in srgb, var(--gawdux-menu-item-hover) 70%, transparent);
	}
	.rail-foot {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		height: 3rem;
		padding-inline: 1rem;
		background-color: var(--gawdux-surface-sidebar);
	}
</style>
