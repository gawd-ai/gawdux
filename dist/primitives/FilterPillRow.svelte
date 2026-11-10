<!-- One-line quick-filter strip. It stays compact when the pills fit and
     becomes an internally scrollable rail when they do not, its edge fading
     where more pills lie (scrollEdges, the one sign a strip scrolls). The pressed
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
	import type { Snippet } from 'svelte';
	import { CloseOutline } from 'flowbite-svelte-icons';
	import { scrollEdges } from './scroll-edges';

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
		 * horizontal gesture nobody thinks to make. A wrapped row scrolls
		 * nowhere, so it shows no fade.
		 */
		wrap?: boolean;
	} = $props();

	let trackEl: HTMLDivElement | null = null;

	/** The fade where more pills lie, on a row that scrolls; a wrapped one has none. */
	function edges(node: HTMLElement, wrapped: boolean) {
		let current = wrapped ? null : scrollEdges(node);
		return {
			update(next: boolean) {
				if (next === !current) return;
				current?.destroy();
				current = next ? null : scrollEdges(node);
			},
			destroy() {
				current?.destroy();
			}
		};
	}

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

<div class={`filter-pill-shell relative min-w-0 ${className}`}>
	<div
		use:edges={wrap}
		class={`filter-pill-viewport w-full ${wrap ? '' : 'overflow-x-auto overscroll-x-contain'}`}
		role="group"
		aria-label={ariaLabel}
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
