<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ActiveFilterDescriptor, ListSort } from './list-query';

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
		keyboardShortcuts?: boolean;
		oninput?: () => void;
		onclear?: () => void;
		onsubmit?: (value: string) => void;
		onRemoveFilter?: (filter: ActiveFilterDescriptor) => void;
		onResetFilters?: () => void;
		quickFilters?: Snippet;
		advancedFilters?: Snippet;
		/**
		 * The register's sort. At or below the compact width, where a
		 * register's column heads are hidden (its rows read as cards), the
		 * bar offers it as the house phone sort, "Sort by" and one choice per
		 * key and direction, behind the filter button (or a Sort button when
		 * the bar has no other filters). Above the compact width the heads
		 * sort and the bar draws none.
		 */
		sort?: ListSort;
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
	import { ChevronDownOutline, FilterOutline, SortOutline } from 'flowbite-svelte-icons';
	import ActiveFilterChip from './ActiveFilterChip.svelte';
	import SearchInput from './SearchInput.svelte';
	import { listSortOptions } from './list-query';

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
		keyboardShortcuts = true,
		oninput,
		onclear,
		onsubmit,
		onRemoveFilter,
		onResetFilters,
		quickFilters,
		advancedFilters,
		sort
	}: ListQueryBarProps = $props();

	const instanceId = $props.id();
	let rootElement: HTMLElement | null = null;

	const panelId = $derived(filterPanelId ?? `${instanceId}-filters`);
	const filterCount = $derived(Math.max(0, activeFilterCount ?? activeFilters.length));
	const hasSort = $derived(Boolean(sort && sort.keys.length > 0));
	const hasFilterPanel = $derived(Boolean(advancedFilters || hasSort));
	const isSortOnlyPanel = $derived(Boolean(hasSort && !advancedFilters));
	const sortOptions = $derived(sort ? listSortOptions(sort.keys) : []);
	const sortValue = $derived(sort ? `${sort.field}:${sort.direction}` : '');
	const sortId = $derived(`${instanceId}-sort`);

	function chooseSort(event: Event) {
		const option = sortOptions.find(
			(entry) => entry.value === (event.currentTarget as HTMLSelectElement).value
		);
		if (option) sort?.onsort(option.field, option.direction);
	}
	const disclosureLabel = $derived(isSortOnlyPanel ? 'Sort' : filtersLabel);
	const filterButtonLabel = $derived(
		filterCount > 0
			? `${disclosureLabel}, ${filterCount} active ${filterCount === 1 ? 'filter' : 'filters'}`
			: disclosureLabel
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

	function handleRemoveFilter(filter: ActiveFilterDescriptor) {
		inputEl?.focus({ preventScroll: true });
		onRemoveFilter?.(filter);
	}

	function handleResetFilters() {
		inputEl?.focus({ preventScroll: true });
		onResetFilters?.();
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
		<div class="list-query-search min-w-0 flex-1">
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

		{#if quickFilters}
			<div class="list-query-quick-filters min-w-0 shrink-0">{@render quickFilters()}</div>
		{/if}

		{#if hasFilterPanel}
			<button
				type="button"
				class:list-query-sort-only={isSortOnlyPanel}
				class="list-query-filter-button inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
				aria-label={filterButtonLabel}
				title={filterButtonLabel}
				aria-controls={panelId}
				aria-expanded={filtersOpen}
				{disabled}
				onclick={() => (filtersOpen = !filtersOpen)}
			>
				{#if isSortOnlyPanel}
					<SortOutline class="h-4 w-4" aria-hidden="true" />
				{:else}
					<FilterOutline class="h-4 w-4" aria-hidden="true" />
				{/if}
				<span class="list-query-filter-text">{disclosureLabel}</span>
				{#if filterCount > 0}
					<span
						class="list-query-filter-count inline-flex min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200"
						aria-hidden="true"
					>
						{filterCount}
					</span>
				{/if}
				<span
					class={`list-query-filter-chevron inline-flex transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
					aria-hidden="true"
				>
					<ChevronDownOutline class="h-3 w-3" />
				</span>
			</button>
		{/if}
	</div>

	{#if hasFilterPanel && filtersOpen}
		<div
			id={panelId}
			class:list-query-sort-only={isSortOnlyPanel}
			class="border-t border-gray-200 pt-2 dark:border-gray-700"
			role="region"
			aria-label={disclosureLabel}
		>
			{#if advancedFilters}
				<div class="list-query-advanced-grid">
					{@render advancedFilters()}
				</div>
			{/if}
			{#if hasSort}
				<div
					class="list-query-mobile-sort border-gray-100 dark:border-gray-700"
					class:list-query-sort-after={Boolean(advancedFilters)}
					data-list-phone-sort
				>
					<label for={sortId} class="shrink-0 text-xs font-medium text-gray-600 dark:text-gray-300">
						Sort by
					</label>
					<select
						id={sortId}
						class="list-query-sort-select min-w-0 flex-1 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
						value={sortValue}
						{disabled}
						onchange={chooseSort}
					>
						{#if !sortOptions.some((option) => option.value === sortValue)}
							<!-- The register's own order, before a key is chosen. -->
							<option value={sortValue} disabled>Default order</option>
						{/if}
						{#each sortOptions as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>
	{/if}

	{#if activeFilters.length > 0 || (filterCount > 0 && onResetFilters)}
		<div
			class="flex min-w-0 flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2 dark:border-gray-700"
		>
			{#each activeFilters as filter (filter.id)}
				<ActiveFilterChip
					{filter}
					onRemove={onRemoveFilter ? handleRemoveFilter : undefined}
					{disabled}
				/>
			{/each}
			{#if filterCount > 0 && onResetFilters}
				<button
					type="button"
					class="list-query-reset inline-flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
					{disabled}
					onclick={handleResetFilters}
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
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
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
			gap: 0.5rem;
		}
		.list-query-sort-after {
			margin-top: 0.5rem;
			padding-top: 0.5rem;
			border-top-width: 1px;
		}
		.list-query-sort-select {
			min-height: 44px;
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

		/* The search takes a line of its own; the pills take what the filter
		   button leaves on the next and scroll inside it, so the button sits at
		   the end of the pill row instead of alone on a line of its own. */
		.list-query-search:has(~ .list-query-quick-filters) {
			flex-basis: 100%;
		}
		.list-query-quick-filters {
			flex: 1 1 0%;
			min-width: 0;
		}
	}

	@media (max-width: 480px) {
		.list-query-filter-button {
			position: relative;
			width: 44px;
			height: 44px;
			padding: 0;
			justify-content: center;
		}

		.list-query-filter-text,
		.list-query-filter-chevron {
			display: none;
		}

		.list-query-filter-count {
			position: absolute;
			top: 2px;
			right: 2px;
			min-width: 1rem;
			height: 1rem;
			padding: 0 0.25rem;
			font-size: 0.5625rem;
			line-height: 1;
		}
	}

	@media (min-width: 1025px) {
		.list-query-sort-only {
			display: none;
		}
	}
</style>
