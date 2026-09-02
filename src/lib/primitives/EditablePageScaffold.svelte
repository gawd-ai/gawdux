<script lang="ts">
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import PageActionBar from './PageActionBar.svelte';
	import type { EditModeProps, LifecycleAction, LifecycleKindRenderers } from './PageActionBar.svelte';
	import PageFeedback from './PageFeedback.svelte';
	import type { SurfaceFeedbackAction } from './PageFeedback.svelte';

	/** A failed action on this page. One band fused to the top of the
	    surface, dismissable; forward `on:dismiss` to clear it. */
	export let actionError: string | null | undefined = null;
	export let feedbackTone: 'error' | 'success' | 'info' = 'error';
	export let dismissableFeedback = true;
	/** The page, or a panel in it, could not be loaded. Same band, not
	    dismissable; `loadErrorAction` is the way back (a list). */
	export let loadError: string | null | undefined = null;
	export let loadErrorAction: SurfaceFeedbackAction | null = null;
	export let editMode: EditModeProps | null = null;
	export let lifecycle: LifecycleAction[] = [];
	export let kindRenderers: LifecycleKindRenderers = {};
	/** When true, wraps slot content in `.context-surface .page-tabs-shell`
	    so single-panel pages (create / edit forms) get the same white shell
	    + bar-merge as PageTabs / ListSurface pages. Detail pages that
	    already render their own `<PageTabs>` (which carries the wrapper)
	    should leave this false. */
	export let surface = false;
	export let className = '';
</script>

<!-- The `breadcrumb` slot is declared but intentionally not rendered.
     The visible breadcrumb comes from `$page.data.appBreadcrumb` in the
     layout; pages still pass content here for source compatibility, and
     declaring the slot keeps TypeScript happy without surfacing the
     duplicate breadcrumb. -->
<div class="editable-page-scaffold {className}">
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

	{#if loadError?.trim() || actionError?.trim()}
		<div class="surface-feedback">
			{#if loadError?.trim()}
				<PageFeedback
					layout="band"
					message={loadError}
					title={null}
					tone="error"
					dismissable={false}
					actionLabel={loadErrorAction?.label ?? null}
					actionHref={loadErrorAction?.href ?? null}
				/>
			{/if}
			{#if actionError?.trim()}
				<PageFeedback
					layout="band"
					message={actionError}
					title={null}
					tone={feedbackTone}
					dismissable={dismissableFeedback}
					on:dismiss
				/>
			{/if}
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

	/* The house page inset: 1rem sides and top, 0.25rem above the command
	   bar, the same values .scroll-surface and the list chrome use. Every
	   surface reads the same because none of them chooses. */
	.editable-page-surface {
		padding: 1rem 1rem 0.25rem;
	}
	/* A two-pane shell brings its own inset (so it also works inside a tab
	   panel); a surface that hosts one directly must not add a second. */
	.editable-page-surface:has(> :global(.master-detail-shell)) {
		padding: 0;
	}
</style>
