<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SidebarMenuItem } from '../types/sidebar.types';

	interface Props {
		label?: string;
		items?: SidebarMenuItem[];
		children?: Snippet;
		top: number;
		left: number;
		headerHeight?: number;
		duration?: number;
		onMouseEnter?: () => void;
		onMouseLeave?: () => void;
		onItemClick?: (href: string) => void;
		class?: string;
	}

	let {
		label,
		items,
		children,
		top,
		left,
		headerHeight = 44,
		duration = 200,
		onMouseEnter,
		onMouseLeave,
		onItemClick,
		class: className = ''
	}: Props = $props();

	// Sort items by order
	let sortedItems = $derived(
		[...(items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);

	// Portal action: moves the element to document.body to escape
	// ancestor overflow/stacking contexts that can block pointer events
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}
</script>

<div
	use:portal
	class="flyout-menu {className}"
	data-sidebar-flyout="true"
	style="top: {top}px; left: {left}px; --flyout-duration: {duration}ms; --flyout-header-height: {headerHeight}px;"
	role="menu"
	tabindex="-1"
	aria-label={label ? `${label} submenu` : 'Sidebar submenu'}
	onmouseenter={onMouseEnter}
	onmouseleave={onMouseLeave}
>
	{#if children}
		{@render children()}
	{:else}
		<div class="flyout-header" style="height: {headerHeight}px;">{label}</div>
		{#each sortedItems as item}
			<a
				href={item.href}
				class="flyout-item"
				role="menuitem"
				onclick={() => onItemClick?.(item.href)}
			>
				{item.label}
			</a>
		{/each}
	{/if}
</div>

<style>
	.flyout-menu {
		position: fixed;
		min-width: 180px;
		background: var(--color-gray-50);
		border: 1px solid white;
		border-left: none;
		border-radius: 0 0.5rem 0.5rem 0;
		box-shadow: 0 2px 6px -1px rgb(0 0 0 / 0.12);
		/* Clip ONLY the items area (below the header) on the left, so the
		   items panel starts at the sidebar's right edge. The header
		   keeps its full width and extends into the 8px overlap zone,
		   staying visually continuous with the icon button BG.
		   Right/bottom extended so the shadow can render outward. */
		clip-path: polygon(
			0 0,
			calc(100% + 50px) 0,
			calc(100% + 50px) calc(100% + 50px),
			8px calc(100% + 50px),
			8px calc(var(--flyout-header-height, 44px) + 1px),
			0 calc(var(--flyout-header-height, 44px) + 1px)
		);
		z-index: 9999;
		overflow: hidden;
		animation: flyout-enter var(--flyout-duration, 200ms) ease-out;
	}

	@keyframes flyout-enter {
		from {
			opacity: 0;
			transform: translateX(-30px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	:global(.dark) .flyout-menu {
		background: var(--color-gray-800);
		border-color: var(--color-gray-900); /* matches sidebar surface */
		/* Dark-on-dark shadows are barely visible with low alpha; bump
		   the opacity so the eye actually catches the depth. */
		box-shadow: 0 2px 6px -1px rgb(0 0 0 / 0.4);
	}

	.flyout-header {
		display: flex;
		align-items: center;
		padding: 0 1rem 0 1.5rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: rgb(107 114 128);
		background-color: var(--color-gray-100);
	}

	:global(.dark) .flyout-header {
		color: white;
		background-color: var(--color-gray-700);
	}

	.flyout-item {
		display: block;
		padding: 0.5rem 1rem 0.5rem 1.5rem;
		font-size: 0.875rem;
		color: rgb(55 65 81);
		text-decoration: none;
		transition: background-color 0.15s ease;
	}

	.flyout-item:hover {
		background-color: var(--color-gray-100);
	}

	:global(.dark) .flyout-item {
		color: rgb(209 213 219);
	}

	:global(.dark) .flyout-item:hover {
		background-color: rgb(55 65 81);
	}
</style>
