<script lang="ts">
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { buildPageWindow } from './page-window.js';

	export let mode: 'exact' | 'cursor' = 'exact';
	export let total = 0;
	export let currentPage = 1;
	export let totalPages = 0;
	/** Defaults to 50. Pages with a non-50 page size must pass explicitly.
	    Deriving from total/totalPages doesn't work because the last page is
	    partial: e.g. 423 items in 9 pages of 50 → ceil(423/9) = 47, wrong. */
	export let pageSize = 50;
	export let onPage: ((page: number) => void) | undefined = undefined;
	export let visibleCount = 0;
	export let hasPrevious = false;
	export let hasNext = false;
	export let onPrevious: (() => void) | undefined = undefined;
	export let onNext: (() => void) | undefined = undefined;
	/** CSS selector for the page's scroll region. After navigation, the nav
	    scrolls this container to top. Defaults to `.list-table-scroll` (the
	    convention used by gawdux ListSurface and consumer list pages). Set to null
	    to disable auto-scroll. */
	export let scrollTargetSelector: string | null = '.list-table-scroll';
	/** Render numbered page buttons between the range readout and Next, so a
	    reader can jump directly instead of stepping. Opt-in and default OFF:
	    every existing consumer keeps the exact nav it has today. Only applies
	    to `mode="exact"` — a cursor pager has no page numbers to offer. */
	export let showPageNumbers = false;
	export let className = '';

	$: pageWindow = showPageNumbers && mode === 'exact' ? buildPageWindow(currentPage, totalPages) : [];
	$: effectivePageSize = pageSize > 0 ? pageSize : 50;
	$: lastItemOnPage = Math.min(currentPage * effectivePageSize, total);
	// First item index on the current page, so the readout is a range
	// ("51-100 / 199") rather than a single running count.
	$: firstItemOnPage = total === 0 ? 0 : (currentPage - 1) * effectivePageSize + 1;

	function startNavigation(navigate: () => void) {
		// Blur the clicked button so `keepFocus: true` on the navigation
		// doesn't make the browser auto-scroll back to keep it visible.
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		navigate();
		if (!scrollTargetSelector) return;
		// Defer one frame so navigation kicks off before the scroll.
		requestAnimationFrame(() => {
			document.querySelector(scrollTargetSelector!)?.scrollTo({ top: 0 });
		});
	}

	function goToPage(page: number) {
		if (page < 1 || page > totalPages || page === currentPage) return;
		startNavigation(() => onPage?.(page));
	}

	function goToPrevious() {
		if (!hasPrevious || !onPrevious) return;
		startNavigation(onPrevious);
	}

	function goToNext() {
		if (!hasNext || !onNext) return;
		startNavigation(onNext);
	}
</script>

<div class="pagination-pill {className}">
	<button
		type="button"
		class="pp-btn pp-btn-prev"
		disabled={mode === 'cursor' ? !hasPrevious : currentPage <= 1}
		aria-label="Previous page"
		on:click={() => (mode === 'cursor' ? goToPrevious() : goToPage(currentPage - 1))}
	>
		<ChevronLeftOutline class="h-4 w-4" />
	</button>
	<span class="pp-range" aria-live="polite">
		{#if mode === 'cursor'}
			{visibleCount.toLocaleString()} shown
		{:else}
			{firstItemOnPage.toLocaleString()}-{lastItemOnPage.toLocaleString()} / {total.toLocaleString()}
		{/if}
	</span>
	{#if pageWindow.length > 1}
		<span class="pp-pages">
			{#each pageWindow as item, i (`${item}-${i}`)}
				{#if item === 'ellipsis'}
					<span class="pp-gap" aria-hidden="true">…</span>
				{:else}
					<button
						type="button"
						class="pp-page"
						class:pp-page-active={item === currentPage}
						aria-label={`Page ${item}`}
						aria-current={item === currentPage ? 'page' : undefined}
						on:click={() => goToPage(item)}
					>
						{item.toLocaleString()}
					</button>
				{/if}
			{/each}
		</span>
	{/if}
	<button
		type="button"
		class="pp-btn pp-btn-next"
		disabled={mode === 'cursor' ? !hasNext : currentPage >= totalPages}
		aria-label="Next page"
		on:click={() => (mode === 'cursor' ? goToNext() : goToPage(currentPage + 1))}
	>
		<ChevronRightOutline class="h-4 w-4" />
	</button>
</div>

<style>
	.pagination-pill {
		display: inline-flex;
		align-items: stretch;
		border: 1px solid rgb(229 231 235);
		border-radius: 0.375rem;
		overflow: hidden;
		background-color: rgb(255 255 255);
	}
	:global(.dark) .pagination-pill {
		border-color: rgb(75 85 99);
		background-color: rgb(31 41 55);
	}
	.pp-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.375rem 0.5rem;
		background: transparent;
		border: 0;
		color: rgb(75 85 99);
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			color 150ms ease-out;
	}
	:global(.dark) .pp-btn {
		color: rgb(156 163 175);
	}
	.pp-btn:hover:not(:disabled) {
		background-color: rgb(243 244 246);
		color: rgb(17 24 39);
	}
	:global(.dark) .pp-btn:hover:not(:disabled) {
		background-color: rgb(55 65 81);
		color: rgb(243 244 246);
	}
	.pp-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.pp-range {
		display: inline-flex;
		align-items: center;
		padding: 0 0.75rem;
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		color: rgb(75 85 99);
		border-left: 1px solid rgb(229 231 235);
		border-right: 1px solid rgb(229 231 235);
		white-space: nowrap;
	}
	:global(.dark) .pp-range {
		color: rgb(209 213 219);
		border-left-color: rgb(75 85 99);
		border-right-color: rgb(75 85 99);
	}
	.pp-pages {
		display: inline-flex;
		align-items: stretch;
		border-right: 1px solid rgb(229 231 235);
	}
	:global(.dark) .pp-pages {
		border-right-color: rgb(75 85 99);
	}
	.pp-page,
	.pp-gap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		padding: 0 0.375rem;
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;
		color: rgb(75 85 99);
	}
	:global(.dark) .pp-page,
	:global(.dark) .pp-gap {
		color: rgb(156 163 175);
	}
	.pp-page {
		background: transparent;
		border: 0;
		cursor: pointer;
		transition:
			background-color 150ms ease-out,
			color 150ms ease-out;
	}
	.pp-page:hover:not(.pp-page-active) {
		background-color: rgb(243 244 246);
		color: rgb(17 24 39);
	}
	:global(.dark) .pp-page:hover:not(.pp-page-active) {
		background-color: rgb(55 65 81);
		color: rgb(243 244 246);
	}
	.pp-page-active {
		background-color: rgb(243 244 246);
		color: rgb(17 24 39);
		font-weight: 600;
		cursor: default;
	}
	:global(.dark) .pp-page-active {
		background-color: rgb(55 65 81);
		color: rgb(243 244 246);
	}
	.pp-gap {
		cursor: default;
	}
</style>
