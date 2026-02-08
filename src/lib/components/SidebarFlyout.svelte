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
	style="top: {top}px; left: {left}px; --flyout-duration: {duration}ms;"
	on:mouseenter={onMouseEnter}
	on:mouseleave={onMouseLeave}
>
	{#if children}
		{@render children()}
	{:else}
		<div class="flyout-header" style="height: {headerHeight - 1}px;">{label}</div>
		{#each sortedItems as item}
			<a href={item.href} class="flyout-item" onclick={() => onItemClick?.(item.href)}>{item.label}</a>
		{/each}
	{/if}
</div>

<style>
	.flyout-menu {
		position: fixed;
		min-width: 180px;
		background: white;
		border: 1px solid rgb(229 231 235);
		border-left: none;
		border-radius: 0 0.5rem 0.5rem 0;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
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
		background: rgb(31 41 55);
		border-color: rgb(55 65 81);
	}

	.flyout-header {
		display: flex;
		align-items: center;
		padding: 0 1rem;
		font-size: 0.875rem;
		font-weight: 700;
		text-transform: uppercase;
		color: rgb(107 114 128);
		background-color: rgb(243 244 246);
	}

	:global(.dark) .flyout-header {
		color: white;
		background-color: rgb(55 65 81);
	}

	.flyout-item {
		display: block;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: rgb(55 65 81);
		text-decoration: none;
		transition: background-color 0.15s ease;
	}

	.flyout-item:hover {
		background-color: rgb(243 244 246);
	}

	:global(.dark) .flyout-item {
		color: rgb(209 213 219);
	}

	:global(.dark) .flyout-item:hover {
		background-color: rgb(55 65 81);
	}
</style>
