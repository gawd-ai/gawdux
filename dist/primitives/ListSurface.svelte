<script lang="ts">
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import PageCommandBarRight from './PageCommandBarRight.svelte';
	import TableContainer from './TableContainer.svelte';
	import FilterBar from './FilterBar.svelte';
	import ListPaginationNav from './ListPaginationNav.svelte';
	import SurfaceFeedback from './SurfaceFeedback.svelte';
	import type { SurfaceFeedbackAction } from './PageFeedback.svelte';
	import type { SurfaceNoticeTone } from './surface-feedback-context';
	import type { ListPagination } from './list-pagination';
	import type { ListSort } from './list-query';
	import { createEventDispatcher } from 'svelte';

	export let mode: 'page' | 'tab' | 'embedded' = 'page';
	/** Whether the list draws a card. A page's list never does: it is the page
	    frame's content. A tab's or an embedded list does, unless it is its
	    pane's whole content (a list beside a rail), which passes false. */
	export let card: boolean | undefined = undefined;
	export let showFooter = true;
	export let hasActions: boolean | undefined = undefined;
	export let hasFooter: boolean | undefined = undefined;
	/** The `rail` slot: one pill row above the filter fields (saved views).
	    Parents that forward the slot pass this, as with `hasActions`. */
	export let hasRail: boolean | undefined = undefined;
	export let className = '';
	/** Declarative pagination — renders the pill in the bar's RIGHT zone.
	    When provided, takes precedence over the legacy `footer` slot. */
	export let pagination: ListPagination | null = null;
	/** A failed action on the list (a restore, an archive, a refresh after
	    one). The one feedback strip, inside the panel under the filter bar,
	    dismissable; forward `on:dismiss` to clear it. Same shape as
	    EditablePageScaffold. */
	export let actionError: string | null | undefined = null;
	/** Tone of the action line: a success line ("Updated 3 tests.") rides
	    the same strip. Load failures are always errors. */
	export let feedbackTone: 'error' | 'success' | 'info' = 'error';
	/** The list itself could not be loaded. Same strip, not dismissable. */
	export let loadError: string | null | undefined = null;
	export let loadErrorAction: SurfaceFeedbackAction | null = null;
	export let dismissableFeedback = true;
	/** A standing condition of the list (a read-only scope). Same strip,
	    not dismissable. */
	export let notice: string | null | undefined = null;
	export let noticeTone: SurfaceNoticeTone = 'warning';
	/** The register's sort, for its toolbar (FilterBar) to draw as the house
	    phone sort at or below the compact width, where the register's heads
	    are hidden. A list with no filters and no rail draws its toolbar only
	    there, for the sort. */
	export let sort: ListSort | undefined = undefined;

	const dispatch = createEventDispatcher<{ dismiss: void }>();

	$: isPage = mode === 'page';
	$: renderActions = isPage && (hasActions ?? !!$$slots.actions);
	// Show the pagination pill whenever there are results — including on a single
	// page (it doubles as the result-count readout that used to live in the query
	// bar). Cursor mode shows it while there are items or another page.
	$: renderPagination =
		isPage &&
		showFooter &&
		pagination !== null &&
		(pagination.mode === 'cursor'
			? pagination.visibleCount > 0 || pagination.hasPrevious || pagination.hasNext
			: pagination.total > 0);
	$: renderFooterSlot =
		isPage && showFooter && !renderPagination && (hasFooter ?? !!$$slots.footer);
	$: renderFooter = renderPagination || renderFooterSlot;
	$: hasHeader = !!$$slots.header;
	$: renderRail = hasRail ?? !!$$slots.rail;
	$: hasFilters = isPage || !!$$slots.filters || renderRail;
	$: hasSort = !!sort && sort.keys.length > 0;
	// A toolbar drawn only for the phone sort is drawn only where it shows,
	// and the list's modifiers stay as they are without it.
	$: sortOnly = hasSort && !hasFilters;
	$: surfaceModifiers = [
		hasHeader ? 'list-surface-has-header' : '',
		hasFilters ? 'list-surface-has-filters' : '',
		renderFooter ? 'list-surface-has-footer' : ''
	]
		.filter(Boolean)
		.join(' ');
	$: scaffoldClass = isPage
		? `list-page-scaffold ${surfaceModifiers} ${className}`
		: `list-${mode}-scaffold ${surfaceModifiers} ${className}`;
	$: containerClass = isPage ? 'list-table-container' : `list-${mode}-table-container`;
	$: scrollClass = isPage ? 'list-table-scroll' : `list-table-scroll list-${mode}-scroll`;
	$: useCommandBar = isPage && (renderActions || renderFooter);
</script>

{#if useCommandBar}
	{#if renderActions}
		<PageCommandBarCenter>
			<slot name="actions" />
		</PageCommandBarCenter>
	{/if}

	{#if renderPagination && pagination}
		<PageCommandBarRight>
			{#if pagination.mode === 'cursor'}
				<ListPaginationNav
					mode="cursor"
					visibleCount={pagination.visibleCount}
					hasPrevious={pagination.hasPrevious}
					hasNext={pagination.hasNext}
					onPrevious={pagination.onPrevious}
					onNext={pagination.onNext}
				/>
			{:else}
				<ListPaginationNav
					total={pagination.total}
					currentPage={pagination.currentPage}
					totalPages={pagination.totalPages}
					pageSize={pagination.pageSize ?? 0}
					showPageNumbers={pagination.showPageNumbers ?? false}
					onPage={pagination.onPage}
				/>
			{/if}
		</PageCommandBarRight>
	{:else if renderFooterSlot}
		<PageCommandBarRight>
			<slot name="footer" />
		</PageCommandBarRight>
	{/if}
{/if}

<div class={scaffoldClass}>
	<!-- The page's list is the page frame's content: no card of its own. -->
	<TableContainer card={isPage ? false : (card ?? true)} className={containerClass}>
		{#if $$slots.header}
			<div class="list-surface-header">
				<slot name="header" />
			</div>
		{/if}
		{#if hasFilters || hasSort}
			<FilterBar hasRail={renderRail} {sort} className={sortOnly ? 'filter-bar-sort-only' : ''}>
				<svelte:fragment slot="rail">
					<slot name="rail" />
				</svelte:fragment>
				<slot name="filters" />
			</FilterBar>
		{/if}
		<SurfaceFeedback
			{actionError}
			{loadError}
			{loadErrorAction}
			tone={feedbackTone}
			dismissable={dismissableFeedback}
			{notice}
			{noticeTone}
			ondismiss={() => dispatch('dismiss')}
		/>
		<div class={scrollClass}>
			<slot />
		</div>
		{#if renderFooter && !isPage}
			<div class="list-page-footer">
				<slot name="footer" />
			</div>
		{/if}
	</TableContainer>
</div>
