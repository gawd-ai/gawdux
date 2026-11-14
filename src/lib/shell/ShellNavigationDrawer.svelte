<!--
	@component
	The navigation drawer of the phone shell: the side rail as a modal drawer
	from the screen's left edge, at or below the compact width. The host
	renders it while its navigation is open (AppShell's `drawer`), and the
	header's menu button opens it.

	While it is open the focus stays inside it (Tab wraps), Escape and a press
	on the backdrop close it, a press on a link of the rail closes it and lets
	the navigation run, everything beside it is inert, and the page does not
	scroll. Closing gives back the focus, the inert state and the scroll as
	they were. All of it is `activateFocusScope`; the drawer adds none of its
	own.

	The rail never stores its open state here: the drawer is always open at
	its full width.
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { activateFocusScope } from '../utils/focus-scope';
	import type { AppSidebarProps } from '../types/sidebar.types';
	import ShellSidebar from './ShellSidebar.svelte';

	let {
		config,
		activeUrl,
		homeHref,
		homeLabel = 'Home',
		brand,
		onclose,
		label = 'Main navigation',
		closeLabel = 'Close navigation'
	}: {
		config: AppSidebarProps['config'];
		activeUrl: string;
		homeHref: string;
		homeLabel?: string;
		/** The host's mark and name (ShellSidebar's `brand`). */
		brand?: Snippet<[{ collapsed: boolean; drawer: boolean }]>;
		onclose: () => void;
		/** The dialog's name. */
		label?: string;
		closeLabel?: string;
	} = $props();

	let drawerEl = $state<HTMLElement>();
	const drawerConfig = $derived.by(() => {
		const { storageKey: _storageKey, ...configWithoutStorage } = config;
		return { ...configWithoutStorage, expandedWidth: 288 };
	});

	onMount(() =>
		activateFocusScope({
			document,
			eventTarget: window,
			root: () => drawerEl,
			background: () => {
				const layer = drawerEl?.closest('.gawdux-shell-navigation-layer');
				return layer?.parentElement
					? (Array.from(layer.parentElement.children).filter(
							(element) => element !== layer
						) as HTMLElement[])
					: [];
			},
			initialFocus: () =>
				drawerEl?.querySelector<HTMLButtonElement>('.gawdux-shell-navigation-close'),
			onEscape: onclose,
			onLink: () => onclose()
		})
	);
</script>

<div class="gawdux-shell-navigation-layer" data-shell-navigation-layer>
	<button type="button" class="backdrop" onclick={onclose} aria-label={closeLabel}></button>
	<div
		bind:this={drawerEl}
		class="gawdux-shell-navigation-drawer"
		role="dialog"
		aria-modal="true"
		aria-label={label}
	>
		<ShellSidebar
			config={drawerConfig}
			{activeUrl}
			initialOpen={true}
			{homeHref}
			{homeLabel}
			{...brand ? { brand } : {}}
			drawer={true}
			{onclose}
			{closeLabel}
		/>
	</div>
</div>

<style>
	/* The layer is the compact width's alone (tokens.css draws it there). */
	.gawdux-shell-navigation-layer {
		position: fixed;
		inset: 0;
		z-index: 80;
	}
	.backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		background-color: rgb(3 7 18 / 0.45);
		backdrop-filter: blur(1px);
		cursor: default;
	}
	.gawdux-shell-navigation-drawer {
		position: relative;
		box-sizing: border-box;
		width: 18rem;
		max-width: calc(100vw - 3rem);
		height: 100%;
		background-color: var(--gawdux-surface);
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
	}
	.gawdux-shell-navigation-drawer :global(.app-sidebar) {
		width: 100% !important;
		min-width: 0;
		margin-bottom: 0;
		border-bottom-right-radius: 0;
	}
</style>
