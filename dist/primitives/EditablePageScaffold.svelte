<script lang="ts">
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import PageActionBar from './PageActionBar.svelte';
	import type { EditModeProps, LifecycleAction, LifecycleKindRenderers } from './PageActionBar.svelte';
	import PageFeedback from './PageFeedback.svelte';

	export let actionError: string | null | undefined = null;
	export let actionErrorTitle = 'Needs attention';
	export let feedbackTone: 'error' | 'success' | 'info' = 'error';
	export let dismissableFeedback = true;
	export let editMode: EditModeProps | null = null;
	export let lifecycle: LifecycleAction[] = [];
	export let kindRenderers: LifecycleKindRenderers = {};
	/** When true, wraps slot content in `.context-surface .page-tabs-shell`
	    so single-panel pages (create / edit forms) get the same white shell
	    + bar-merge as PageTabs / ListSurface pages. Detail pages that
	    already render their own `<PageTabs>` (which carries the wrapper)
	    should leave this false. */
	export let surface = false;
</script>

<!-- The `breadcrumb` slot is declared but intentionally not rendered.
     The visible breadcrumb comes from `$page.data.appBreadcrumb` in the
     layout; pages still pass content here for source compatibility, and
     declaring the slot keeps TypeScript happy without surfacing the
     duplicate breadcrumb. -->
<div class="editable-page-scaffold">
	<div class="hidden" aria-hidden="true">
		<slot name="breadcrumb" />
	</div>
	{#if editMode || lifecycle.length > 0}
		<PageActionBar {editMode} {lifecycle} {kindRenderers} />
	{:else if $$slots.actions}
		<PageCommandBarCenter>
			<slot name="actions" />
		</PageCommandBarCenter>
	{/if}

	{#if actionError?.trim()}
		<div class="editable-page-feedback">
			<PageFeedback
				message={actionError}
				title={actionErrorTitle}
				tone={feedbackTone}
				dismissable={dismissableFeedback}
				on:dismiss
			/>
		</div>
	{/if}

	{#if surface}
		<div class="context-surface page-tabs-shell editable-page-surface">
			<slot />
		</div>
	{:else}
		<slot />
	{/if}
</div>

<style>
	.editable-page-scaffold {
		display: contents;
		min-width: 0;
		width: 100%;
	}

	.editable-page-feedback {
		margin-bottom: 0.5rem;
		width: 100%;
	}

	.editable-page-surface {
		padding: 1.25rem 1.25rem 0.25rem;
	}
</style>
