<script lang="ts">
	import { createEventDispatcher, getContext, setContext } from 'svelte';
	import { get, writable } from 'svelte/store';
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';
	import PageActionBar from './PageActionBar.svelte';
	import SurfaceFeedback from './SurfaceFeedback.svelte';
	import type { EditModeProps, LifecycleAction, LifecycleKindRenderers } from './PageActionBar.svelte';
	import type { SurfaceFeedbackAction } from './PageFeedback.svelte';
	import {
		SURFACE_FEEDBACK_CONTEXT,
		type SurfaceFeedbackHost,
		type SurfaceFeedbackState,
		type SurfaceNoticeTone
	} from './surface-feedback-context';
	import {
		PAGE_TAB_CONTEXT,
		createPageTabHost,
		type PageTabHost,
		type PageTabScope
	} from './page-chrome';

	/** A failed action on this page. Rendered as the one feedback strip
	    inside the panel; forward `on:dismiss` to clear it. */
	export let actionError: string | null | undefined = null;
	export let feedbackTone: 'error' | 'success' | 'info' = 'error';
	export let dismissableFeedback = true;
	/** The page, or a panel in it, could not be loaded. Same strip, not
	    dismissable; `loadErrorAction` is the way back (a list). */
	export let loadError: string | null | undefined = null;
	export let loadErrorAction: SurfaceFeedbackAction | null = null;
	/** A standing condition of the record (archived, awaiting a password
	    reset). Same strip, not dismissable, never an error tone. */
	export let notice: string | null | undefined = null;
	export let noticeTone: SurfaceNoticeTone = 'warning';
	export let editMode: EditModeProps | null = null;
	export let lifecycle: LifecycleAction[] = [];
	export let kindRenderers: LifecycleKindRenderers = {};
	/** The tab, or tabs, whose acts the `actions` slot holds (PAGE_TAB_CONTEXT):
	    shown only while one of them is open. None: the page's, on every tab. */
	export let actionsTab: PageTabScope = undefined;
	/** When true, wraps slot content in `.context-surface .page-tabs-shell`
	    so single-panel pages (create / edit forms) get the same white shell
	    + bar-merge as PageTabs / ListSurface pages. Detail pages that
	    already render their own `<PageTabs>` (which carries the wrapper)
	    should leave this false. */
	export let surface = false;
	/** With `surface`: the surface hosts panes, not content (a list beside a
	    reader), so its body takes no inset and the panes run to the panel's
	    edges, as a two-pane card's do. The inset stays the one value the
	    knob gives every other inset host; nothing sets it to zero. */
	export let panes = false;
	export let className = '';

	/* The page's open tab, which its tab strip reports and its command bar
	   reads, so the bar holds the open tab's acts and a drawer out of the bar
	   closes when the tab changes. One per page: a host above that already
	   publishes one keeps it. */
	if (!getContext<PageTabHost | undefined>(PAGE_TAB_CONTEXT)) {
		setContext<PageTabHost>(PAGE_TAB_CONTEXT, createPageTabHost());
	}

	const dispatch = createEventDispatcher<{ dismiss: void }>();
	const feedback = writable<SurfaceFeedbackState>({
		actionError: null,
		loadError: null,
		loadErrorAction: null,
		tone: 'error',
		dismissable: true,
		notice: null,
		noticeTone: 'warning',
		ondismiss: () => dispatch('dismiss')
	});
	$: feedback.set({
		actionError: actionError ?? null,
		loadError: loadError ?? null,
		loadErrorAction,
		tone: feedbackTone,
		dismissable: dismissableFeedback,
		notice: notice ?? null,
		noticeTone,
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

<!-- No breadcrumb of its own: the app header draws the page's trail. -->
<div class="editable-page-scaffold {className}">
	{#if editMode || lifecycle.length > 0}
		<PageActionBar {editMode} {lifecycle} {kindRenderers} />
	{:else if $$slots.actions}
		<PageCommandBarCenter tab={actionsTab}>
			<slot name="actions" />
		</PageCommandBarCenter>
	{/if}

	{#if surface}
		<div class="context-surface page-tabs-shell editable-page-surface">
			<SurfaceFeedback {...$feedback} />
			<div class="editable-page-body" class:editable-page-body--panes={panes}>
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

	/* The body is an inset host: the content inset is its padding, read from
	   the same knob as .scroll-surface (1rem on all four sides by default,
	   8px at or below the compact width). Every surface reads the same
	   because none of them chooses. The inset is on the body, not the panel,
	   so the feedback strip above it runs edge to edge like the tab strip and
	   the filter bar do. A MasterDetailShell inside the body adds no inset of
	   its own. */
	.editable-page-body {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
		padding: var(--gawdux-page-inset, 1rem);
	}
	.editable-page-body--panes {
		padding: 0;
	}
</style>
