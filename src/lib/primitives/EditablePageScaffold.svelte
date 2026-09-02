<script lang="ts">
	import { createEventDispatcher, setContext } from 'svelte';
	import { get, writable } from 'svelte/store';
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import PageActionBar from './PageActionBar.svelte';
	import SurfaceFeedback from './SurfaceFeedback.svelte';
	import type { EditModeProps, LifecycleAction, LifecycleKindRenderers } from './PageActionBar.svelte';
	import type { SurfaceFeedbackAction } from './PageFeedback.svelte';
	import {
		SURFACE_FEEDBACK_CONTEXT,
		type SurfaceFeedbackHost,
		type SurfaceFeedbackState
	} from './surface-feedback-context';

	/** A failed action on this page. Rendered as the one feedback strip
	    inside the panel; forward `on:dismiss` to clear it. */
	export let actionError: string | null | undefined = null;
	export let feedbackTone: 'error' | 'success' | 'info' = 'error';
	export let dismissableFeedback = true;
	/** The page, or a panel in it, could not be loaded. Same strip, not
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

	const dispatch = createEventDispatcher<{ dismiss: void }>();
	const feedback = writable<SurfaceFeedbackState>({
		actionError: null,
		loadError: null,
		loadErrorAction: null,
		tone: 'error',
		dismissable: true,
		ondismiss: () => dispatch('dismiss')
	});
	$: feedback.set({
		actionError: actionError ?? null,
		loadError: loadError ?? null,
		loadErrorAction,
		tone: feedbackTone,
		dismissable: dismissableFeedback,
		ondismiss: () => dispatch('dismiss')
	});

	/* When the page renders its own panel (PageTabs), that shell claims the
	   strip and renders it under its tab strip, so the messages sit inside
	   the panel and nothing above them moves. Until a shell claims it, the
	   scaffold renders the strip itself. */
	const claimed = writable(false);
	setContext<SurfaceFeedbackHost>(SURFACE_FEEDBACK_CONTEXT, {
		state: feedback,
		claim() {
			if (surface || get(claimed)) return null;
			claimed.set(true);
			return () => claimed.set(false);
		}
	});
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

	{#if surface}
		<div class="context-surface page-tabs-shell editable-page-surface">
			<SurfaceFeedback {...$feedback} />
			<div class="editable-page-body">
				<slot />
			</div>
		</div>
	{:else}
		{#if !$claimed}
			<SurfaceFeedback {...$feedback} />
		{/if}
		<slot />
	{/if}
</div>

<style>
	.editable-page-scaffold {
		display: contents;
		min-width: 0;
		width: 100%;
	}

	.editable-page-surface {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	/* The house page inset: 1rem sides and top, 0.25rem above the command
	   bar, the same values .scroll-surface and the list chrome use. Every
	   surface reads the same because none of them chooses. The inset is on
	   the body, not the panel, so the feedback strip above it runs edge to
	   edge like the tab strip and the filter bar do. */
	.editable-page-body {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		padding: 1rem 1rem 0.25rem;
	}
	/* A two-pane shell brings its own inset (so it also works inside a tab
	   panel); a surface that hosts one directly must not add a second. */
	.editable-page-body:has(> :global(.master-detail-shell)) {
		padding: 0;
	}
</style>
