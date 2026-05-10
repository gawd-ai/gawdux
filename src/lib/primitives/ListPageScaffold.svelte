<script lang="ts">
	import ListSurface from './ListSurface.svelte';

	export let showFooter = true;
	/** Declarative pagination — when provided, the scaffold renders the
	    pill into the bar's RIGHT zone. Pages no longer wire up `slot="footer"`
	    individually. Pass `null` (or omit) to hide pagination entirely. */
	export let pagination: {
		total: number;
		currentPage: number;
		totalPages: number;
		pageSize?: number;
		onPage: (page: number) => void;
	} | null = null;
</script>

<ListSurface
	mode="page"
	{showFooter}
	{pagination}
	hasActions={!!$$slots.actions}
	hasFooter={!!$$slots.footer}
>
	<svelte:fragment slot="actions">
		<slot name="actions" />
	</svelte:fragment>
	<svelte:fragment slot="filters">
		<slot name="filters" />
	</svelte:fragment>
	<slot />
	<svelte:fragment slot="footer">
		<slot name="footer" />
	</svelte:fragment>
</ListSurface>
