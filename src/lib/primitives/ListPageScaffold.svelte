<script lang="ts">
	import ListSurface from './ListSurface.svelte';
	import type { ListPagination } from './list-pagination';
	import type { SurfaceFeedbackAction } from './PageFeedback.svelte';

	export let showFooter = true;
	/** Declarative pagination — when provided, the scaffold renders the
	    pill into the bar's RIGHT zone. Pages no longer wire up `slot="footer"`
	    individually. Pass `null` (or omit) to hide pagination entirely. */
	export let pagination: ListPagination | null = null;
	export let className = '';
	/** Feedback props mirror EditablePageScaffold; see ListSurface. */
	export let actionError: string | null | undefined = null;
	export let loadError: string | null | undefined = null;
	export let loadErrorAction: SurfaceFeedbackAction | null = null;
	export let dismissableFeedback = true;
</script>

<ListSurface
	mode="page"
	{showFooter}
	{pagination}
	{className}
	{actionError}
	{loadError}
	{loadErrorAction}
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
