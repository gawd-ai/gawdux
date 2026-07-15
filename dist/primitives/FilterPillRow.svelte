<!-- One-line quick-filter strip. It stays compact when the pills fit and
     becomes an internally scrollable rail when they do not. -->
<script module lang="ts">
	export interface FilterPill {
		id: string;
		label: string;
		count?: number;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let {
		pills,
		selected,
		onSelect,
		ariaLabel = 'Quick filters',
		className = ''
	}: {
		pills: FilterPill[];
		selected: string;
		onSelect: (id: string) => void;
		ariaLabel?: string;
		className?: string;
	} = $props();

	let viewportEl: HTMLDivElement | null = null;
	let trackEl: HTMLDivElement | null = null;
	let canScrollBackward = $state(false);
	let canScrollForward = $state(false);

	function updateOverflow() {
		if (!viewportEl) return;
		const maxScrollLeft = Math.max(0, viewportEl.scrollWidth - viewportEl.clientWidth);
		canScrollBackward = viewportEl.scrollLeft > 1;
		canScrollForward = viewportEl.scrollLeft < maxScrollLeft - 1;
	}

	onMount(() => {
		updateOverflow();
		const resizeObserver =
			typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateOverflow);
		if (viewportEl) resizeObserver?.observe(viewportEl);
		if (trackEl) resizeObserver?.observe(trackEl);
		window.addEventListener('resize', updateOverflow);
		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener('resize', updateOverflow);
		};
	});

	function pillClass(active: boolean): string {
		return `filter-pill shrink-0 whitespace-nowrap rounded border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 ${
			active
				? 'border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
				: 'border-transparent text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
		}`;
	}
</script>

<div
	class={`filter-pill-shell relative min-w-0 ${className}`}
	class:filter-pill-can-scroll-backward={canScrollBackward}
	class:filter-pill-can-scroll-forward={canScrollForward}
>
	<div
		bind:this={viewportEl}
		class="filter-pill-viewport w-full overflow-x-auto overscroll-x-contain"
		role="group"
		aria-label={ariaLabel}
		onscroll={updateOverflow}
	>
		<div
			bind:this={trackEl}
			class="filter-pill-track inline-flex w-max min-w-max flex-nowrap items-stretch gap-px rounded-md border border-gray-200 bg-gray-50 p-px dark:border-gray-700 dark:bg-gray-900"
		>
			{#each pills as pill (pill.id)}
				<button
					type="button"
					class={pillClass(selected === pill.id)}
					aria-pressed={selected === pill.id}
					onclick={() => onSelect(pill.id)}
				>
					{pill.label}{#if pill.count != null}<span class="ml-1 opacity-60">{pill.count}</span>{/if}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.filter-pill-viewport {
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
	}

	.filter-pill-viewport::-webkit-scrollbar {
		display: none;
	}

	.filter-pill-shell::before,
	.filter-pill-shell::after {
		content: '';
		position: absolute;
		top: 25%;
		bottom: 25%;
		z-index: 1;
		display: none;
		width: 1px;
		border-radius: 9999px;
		background: rgb(156 163 175);
		pointer-events: none;
	}

	.filter-pill-shell::before {
		left: 0;
	}

	.filter-pill-shell::after {
		right: 0;
	}

	.filter-pill-can-scroll-backward::before,
	.filter-pill-can-scroll-forward::after {
		display: block;
	}

	:global(.dark) .filter-pill-shell::before,
	:global(.dark) .filter-pill-shell::after {
		background: rgb(107 114 128);
	}

	@media (max-width: 1024px) {
		.filter-pill {
			min-width: 44px;
			min-height: 44px;
		}
	}
</style>
