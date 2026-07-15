<script lang="ts">
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import PageCommandBarRight from './PageCommandBarRight.svelte';
	import TableContainer from './TableContainer.svelte';
	import FilterBar from './FilterBar.svelte';
	import ListPaginationNav from './ListPaginationNav.svelte';

	export let mode: 'page' | 'tab' | 'embedded' = 'page';
	export let showFooter = true;
	export let hasActions: boolean | undefined = undefined;
	export let hasFooter: boolean | undefined = undefined;
	export let className = '';
	/** Declarative pagination — renders the pill in the bar's RIGHT zone.
	    When provided, takes precedence over the legacy `footer` slot. */
	export let pagination: {
		total: number;
		currentPage: number;
		totalPages: number;
		pageSize?: number;
		onPage: (page: number) => void;
	} | null = null;

	$: isPage = mode === 'page';
	$: renderActions = isPage && (hasActions ?? !!$$slots.actions);
	$: renderPagination = isPage && showFooter && pagination !== null && pagination.total > 0;
	$: renderFooterSlot =
		isPage && showFooter && !renderPagination && (hasFooter ?? !!$$slots.footer);
	$: renderFooter = renderPagination || renderFooterSlot;
	$: hasHeader = !!$$slots.header;
	$: hasFilters = isPage || !!$$slots.filters;
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
	$: containerClass = isPage
		? 'list-table-container context-surface'
		: `list-${mode}-table-container`;
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
			<ListPaginationNav
				total={pagination.total}
				currentPage={pagination.currentPage}
				totalPages={pagination.totalPages}
				pageSize={pagination.pageSize ?? 0}
				onPage={pagination.onPage}
			/>
		</PageCommandBarRight>
	{:else if renderFooterSlot}
		<PageCommandBarRight>
			<slot name="footer" />
		</PageCommandBarRight>
	{/if}
{/if}

<div class={scaffoldClass}>
	<TableContainer className={containerClass}>
		{#if $$slots.header}
			<div class="list-surface-header">
				<slot name="header" />
			</div>
		{/if}
		{#if isPage || $$slots.filters}
			<FilterBar>
				<slot name="filters" />
			</FilterBar>
		{/if}
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
