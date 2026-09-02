<script lang="ts">
	import ListSurface from './ListSurface.svelte';
	import type { ListPagination } from './list-pagination';

	export let showFooter = true;
	/** Declarative pagination — when provided, the scaffold renders the
	    pill into the bar's RIGHT zone. Pages no longer wire up `slot="footer"`
	    individually. Pass `null` (or omit) to hide pagination entirely. */
	export let pagination: ListPagination | null = null;
	export let className = '';
	/** Feedback props mirror EditablePageScaffold; see ListSurface. */
	export let actionError: string | null | undefined = null;
	export let actionErrorTitle = 'Needs attention';
	export let loadError: string | null | undefined = null;
	export let loadErrorTitle = 'Needs attention';
	export let dismissableFeedback = true;
</script>

<ListSurface
	mode="page"
	{showFooter}
	{pagination}
	{className}
	{actionError}
	{actionErrorTitle}
	{loadError}
	{loadErrorTitle}
	{dismissableFeedback}
	on:dismiss
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
