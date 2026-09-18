<!-- One-line quick-filter strip. It stays compact when the pills fit and
     becomes an internally scrollable rail when they do not. The pressed
     pill can carry a remove control, and the track accepts trailing content
     (SavedViewsRail puts its inline save control there). -->
<script module lang="ts">
	export interface FilterPill {
		id: string;
		label: string;
		count?: number;
	}

	/** The pill recipe, shared with controls that must read as one of the pills. */
	export function filterPillClass(active: boolean): string {
		return `filter-pill shrink-0 whitespace-nowrap rounded border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue-500 ${
			active
				? 'border-gray-200 bg-white text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
				: 'border-transparent text-gray-600 hover:bg-white hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
		}`;
	}
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { CloseOutline } from 'flowbite-svelte-icons';

	let {
		pills,
		selected,
		onSelect,
		onRemove,
		removeLabel = (pill: FilterPill) => `Remove ${pill.label}`,
		trailing,
		disabled = false,
		ariaLabel = 'Quick filters',
		className = '',
		wrap = false
	}: {
		pills: FilterPill[];
		/** The pressed pill's id; null presses nothing. */
		selected: string | null;
		onSelect: (id: string) => void;
		/** When given, the pressed pill carries a remove control. */
		onRemove?: (pill: FilterPill) => void;
		removeLabel?: (pill: FilterPill) => string;
		/** Rendered inside the track after the last pill. */
		trailing?: Snippet;
		disabled?: boolean;
		ariaLabel?: string;
		className?: string;
		/**
		 * Let the pills flow onto further lines instead of scrolling sideways.
		 *
		 * Off by default, so every existing surface keeps the single scrolling
		 * line it was designed with. Turn it on where the row lives in a NARROW
		 * column — a master-detail rail, say — because there the scroller is
		 * technically correct and practically wrong: the filters are the first
		 * thing a reader needs, and half of them are off-screen behind a
		 * horizontal gesture nobody thinks to make. The overflow affordances are
		 * suppressed when wrapping, since there is nothing left to scroll to.
		 */
		wrap?: boolean;
	} = $props();

	let viewportEl: HTMLDivElement | null = null;
	let trackEl: HTMLDivElement | null = null;
	let canScrollBackward = $state(false);
	let canScrollForward = $state(false);

	function updateOverflow() {
		if (!viewportEl) return;
		if (wrap) {
			canScrollBackward = false;
			canScrollForward = false;
			return;
		}
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

	// Keep the pressed pill in view when the selection changes under a
	// scrolled rail (a view applied from the URL, a deep link).
	$effect(() => {
		const id = selected;
		if (id === null || !trackEl) return;
		const pressed = trackEl.querySelector<HTMLElement>('[aria-pressed="true"]');
		if (pressed && typeof pressed.scrollIntoView === 'function') {
			pressed.scrollIntoView({ inline: 'nearest', block: 'nearest' });
		}
	});
</script>

<div
	class={`filter-pill-shell relative min-w-0 ${className}`}
	class:filter-pill-can-scroll-backward={canScrollBackward}
	class:filter-pill-can-scroll-forward={canScrollForward}
>
	<div
		bind:this={viewportEl}
		class={`filter-pill-viewport w-full ${wrap ? '' : 'overflow-x-auto overscroll-x-contain'}`}
		role="group"
		aria-label={ariaLabel}
		onscroll={updateOverflow}
	>
		<div
			bind:this={trackEl}
			class={`filter-pill-track items-stretch gap-px rounded-md border border-gray-200 bg-gray-50 p-px dark:border-gray-700 dark:bg-gray-900 ${
				wrap ? 'flex w-full flex-wrap' : 'inline-flex w-max min-w-max flex-nowrap'
			}`}
		>
			{#each pills as pill (pill.id)}
				{@const active = selected === pill.id}
				{#if active && onRemove}
					<span class="group inline-flex shrink-0 items-stretch">
						<button
							type="button"
							class={`${filterPillClass(true)} rounded-r-none`}
							aria-pressed="true"
							{disabled}
							onclick={() => onSelect(pill.id)}
						>
							{pill.label}{#if pill.count != null}<span class="ml-1 opacity-60">{pill.count}</span>{/if}
						</button>
						<button
							type="button"
							class={`${filterPillClass(true)} filter-pill-remove inline-flex items-center rounded-l-none border-l-0 px-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100`}
							aria-label={removeLabel(pill)}
							{disabled}
							onclick={() => onRemove(pill)}
						>
							<CloseOutline class="h-3 w-3" />
						</button>
					</span>
				{:else}
					<button
						type="button"
						class={filterPillClass(active)}
						aria-pressed={active}
						{disabled}
						onclick={() => onSelect(pill.id)}
					>
						{pill.label}{#if pill.count != null}<span class="ml-1 opacity-60">{pill.count}</span>{/if}
					</button>
				{/if}
			{/each}
			{#if trailing}{@render trailing()}{/if}
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
		.filter-pill-track :global(.filter-pill) {
			min-width: 44px;
			min-height: 44px;
		}

		.filter-pill-track :global(.filter-pill-remove) {
			opacity: 1;
		}
	}
</style>
