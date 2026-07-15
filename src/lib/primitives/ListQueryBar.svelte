<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ActiveFilterDescriptor } from './list-query';

	export interface ListQueryBarProps {
		value?: string;
		filtersOpen?: boolean;
		inputEl?: HTMLInputElement | null;
		placeholder?: string;
		ariaLabel?: string;
		busy?: boolean;
		disabled?: boolean;
		className?: string;
		searchId?: string;
		filtersLabel?: string;
		filterPanelId?: string;
		activeFilters?: readonly ActiveFilterDescriptor[];
		activeFilterCount?: number;
		resultCount?: number | null;
		resultNoun?: string;
		resultNounPlural?: string;
		resultSummary?: string | null;
		keyboardShortcuts?: boolean;
		oninput?: () => void;
		onclear?: () => void;
		onsubmit?: (value: string) => void;
		onRemoveFilter?: (filter: ActiveFilterDescriptor) => void;
		onResetFilters?: () => void;
		quickFilters?: Snippet;
		advancedFilters?: Snippet;
		mobileSort?: Snippet;
	}

	const QUERY_BAR_SELECTOR = '[data-gawdux-list-query-bar]';

	function isRendered(element: HTMLElement): boolean {
		for (let current: HTMLElement | null = element; current; current = current.parentElement) {
			if (
				current.hidden ||
				current.hasAttribute('inert') ||
				current.getAttribute('aria-hidden') === 'true'
			) {
				return false;
			}
			const style = window.getComputedStyle(current);
			if (style.display === 'none' || style.visibility === 'hidden') return false;
		}
		return true;
	}

	function keyboardOwner(target: EventTarget | null): HTMLElement | null {
		const targetBar =
			target instanceof Element ? target.closest<HTMLElement>(QUERY_BAR_SELECTOR) : null;
		if (targetBar && isRendered(targetBar)) return targetBar;
		return (
			Array.from(document.querySelectorAll<HTMLElement>(QUERY_BAR_SELECTOR)).find(isRendered) ??
			null
		);
	}

	function isEditableTarget(target: EventTarget | null): boolean {
		if (!(target instanceof Element)) return false;
		return Boolean(
			target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
		);
	}
</script>

<script lang="ts">
	import { ChevronDownOutline, FilterOutline } from 'flowbite-svelte-icons';
	import ActiveFilterChip from './ActiveFilterChip.svelte';
	import SearchInput from './SearchInput.svelte';

	let {
		value = $bindable(''),
		filtersOpen = $bindable(false),
		inputEl = $bindable(null),
		placeholder = 'Search',
		ariaLabel,
		busy = false,
		disabled = false,
		className = '',
		searchId,
		filtersLabel = 'Filters',
		filterPanelId,
		activeFilters = [],
		activeFilterCount,
		resultCount = null,
		resultNoun = 'result',
		resultNounPlural,
		resultSummary = null,
		keyboardShortcuts = true,
		oninput,
		onclear,
		onsubmit,
		onRemoveFilter,
		onResetFilters,
		quickFilters,
		advancedFilters,
		mobileSort
	}: ListQueryBarProps = $props();

	const instanceId = $props.id();
	let rootElement: HTMLElement | null = null;

	const panelId = $derived(filterPanelId ?? `${instanceId}-filters`);
	const filterCount = $derived(Math.max(0, activeFilterCount ?? activeFilters.length));
	const hasFilterPanel = $derived(Boolean(advancedFilters || mobileSort));
	const isSortOnlyPanel = $derived(Boolean(mobileSort && !advancedFilters));
	const pluralNoun = $derived(resultNounPlural ?? `${resultNoun}s`);
	const resolvedSummary = $derived(
		resultSummary ??
			(resultCount == null
				? null
				: `${resultCount.toLocaleString()} ${resultCount === 1 ? resultNoun : pluralNoun}`)
	);
	const filterButtonLabel = $derived(
		filterCount > 0
			? `${filtersLabel}, ${filterCount} active ${filterCount === 1 ? 'filter' : 'filters'}`
			: filtersLabel
	);

	$effect(() => {
		if (!hasFilterPanel && filtersOpen) filtersOpen = false;
	});

	function clearQuery() {
		if (!value || disabled) return;
		value = '';
		onclear?.();
		inputEl?.focus({ preventScroll: true });
	}

	function handleWindowKeydown(event: KeyboardEvent) {
		if (!keyboardShortcuts || !rootElement || disabled) return;

		if (
			event.key === '/' &&
			!event.defaultPrevented &&
			!event.repeat &&
			!event.metaKey &&
			!event.ctrlKey &&
			!event.altKey &&
			!isEditableTarget(event.target) &&
			keyboardOwner(event.target) === rootElement
		) {
			event.preventDefault();
			inputEl?.focus({ preventScroll: true });
			return;
		}

		if (event.key !== 'Escape' || event.defaultPrevented) return;
		const focusInside =
			(event.target instanceof Node && rootElement.contains(event.target)) ||
			(document.activeElement instanceof Node && rootElement.contains(document.activeElement));
		if (!focusInside || keyboardOwner(event.target) !== rootElement) return;

		if (value) {
			event.preventDefault();
			clearQuery();
			return;
		}
		if (filtersOpen) {
			event.preventDefault();
			filtersOpen = false;
			inputEl?.focus({ preventScroll: true });
		}
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<section
	bind:this={rootElement}
	class={`list-query-bar col-span-full w-full min-w-0 flex-1 space-y-2 ${className}`}
	data-gawdux-list-query-bar
	aria-busy={busy}
>
	<div class="flex min-w-0 flex-wrap items-center gap-2">
		<div class="min-w-0 flex-1">
			<SearchInput
				id={searchId}
				size="standard"
				bind:value
				bind:inputEl
				{placeholder}
				{ariaLabel}
				{busy}
				{disabled}
				{oninput}
				{onclear}
				{onsubmit}
			/>
		</div>

		{#if hasFilterPanel}
			<button
				type="button"
				class:list-query-sort-only={isSortOnlyPanel}
				class="list-query-filter-button inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
				aria-label={filterButtonLabel}
				aria-controls={panelId}
				aria-expanded={filtersOpen}
				{disabled}
				onclick={() => (filtersOpen = !filtersOpen)}
			>
				<FilterOutline class="h-4 w-4" aria-hidden="true" />
				<span>{filtersLabel}</span>
				{#if filterCount > 0}
					<span
						class="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200"
						aria-hidden="true"
					>
						{filterCount}
					</span>
				{/if}
				<ChevronDownOutline
					class={`h-3 w-3 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
					aria-hidden="true"
				/>
			</button>
		{/if}

		{#if resolvedSummary}
			<p
				class="ml-auto w-full shrink-0 text-right text-xs text-gray-500 sm:w-auto dark:text-gray-400"
				role="status"
				aria-live="polite"
				aria-busy={busy}
			>
				{resolvedSummary}
			</p>
		{/if}
	</div>

	{#if quickFilters}
		<div class="min-w-0">{@render quickFilters()}</div>
	{/if}

	{#if hasFilterPanel && filtersOpen}
		<div
			id={panelId}
			class:list-query-sort-only={isSortOnlyPanel}
			class="border-t border-gray-200 pt-2 dark:border-gray-700"
			role="region"
			aria-label={filtersLabel}
		>
			{#if advancedFilters}
				<div class="list-query-advanced-grid">
					{@render advancedFilters()}
				</div>
			{/if}
			{#if mobileSort}
				<div class="list-query-mobile-sort mt-2 border-t border-gray-100 pt-2 dark:border-gray-800">
					{@render mobileSort()}
				</div>
			{/if}
		</div>
	{/if}

	{#if activeFilters.length > 0 || (filterCount > 0 && onResetFilters)}
		<div
			class="flex min-w-0 flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2 dark:border-gray-800"
		>
			{#each activeFilters as filter (filter.id)}
				<ActiveFilterChip {filter} onRemove={onRemoveFilter} {disabled} />
			{/each}
			{#if filterCount > 0 && onResetFilters}
				<button
					type="button"
					class="list-query-reset inline-flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
					{disabled}
					onclick={onResetFilters}
				>
					Reset filters
				</button>
			{/if}
		</div>
	{/if}
</section>

<style>
	.list-query-advanced-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 16rem));
		align-items: end;
		gap: 0.75rem;
	}

	.list-query-mobile-sort {
		display: none;
	}

	@media (max-width: 1024px) {
		.list-query-filter-button,
		.list-query-reset {
			min-width: 44px;
			min-height: 44px;
		}
	}

	@media (max-width: 1024px) {
		.list-query-mobile-sort {
			display: flex;
			align-items: center;
		}
	}

	@media (min-width: 641px) and (max-width: 1024px) {
		.list-query-advanced-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (max-width: 640px) {
		.list-query-advanced-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	@media (min-width: 1025px) {
		.list-query-sort-only {
			display: none;
		}
	}
</style>
