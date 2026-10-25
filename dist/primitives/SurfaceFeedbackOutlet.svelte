<!--
	SurfaceFeedbackOutlet — the page's feedback strip, rendered where a host's
	own panel wants it.

	Inside an EditablePageScaffold that does not own the surface, the page
	renders its own panel. PageTabs claims the strip for a tabbed panel; a panel
	that is not PageTabs mounts this outlet where the strip belongs (under the
	panel's header chrome, or at its top edge). It claims
	SURFACE_FEEDBACK_CONTEXT exactly as PageTabs does and renders SurfaceFeedback
	in place, so the scaffold stops rendering it above the panel.

	`active` (default true) lets a panel that is not always the page's main
	surface give the strip back: while it is false the outlet releases its claim
	and the scaffold renders the strip again. Turning it true claims again.

	One strip per page: the first claim wins. An outlet that finds the strip
	already claimed (by PageTabs, another outlet, or a scaffold that owns its
	surface) renders nothing, and does not retry until its `active` turns
	false and true again. Outside a scaffold it renders nothing.
-->
<script lang="ts">
	import { getContext, onDestroy, untrack } from 'svelte';
	import { readable } from 'svelte/store';
	import SurfaceFeedback from './SurfaceFeedback.svelte';
	import {
		SURFACE_FEEDBACK_CONTEXT,
		type SurfaceFeedbackHost,
		type SurfaceFeedbackState
	} from './surface-feedback-context';

	let {
		active = true
	}: {
		/** False releases the claim, so the scaffold renders the strip itself. */
		active?: boolean | undefined;
	} = $props();

	const host = getContext<SurfaceFeedbackHost | undefined>(SURFACE_FEEDBACK_CONTEXT);
	const feedback = host ? host.state : readable<SurfaceFeedbackState | null>(null);

	let release: (() => void) | null = null;
	let claimed = $state(false);

	function take() {
		if (release || !host) return;
		release = host.claim();
		claimed = release !== null;
	}

	function give() {
		release?.();
		release = null;
		claimed = false;
	}

	/* Claim during initialisation, as PageTabs does, so the scaffold never
	   renders its own strip for a frame before the outlet takes it over. */
	if (untrack(() => active)) take();

	$effect(() => {
		if (active) take();
		else give();
	});

	onDestroy(give);
</script>

{#if claimed && $feedback}
	<SurfaceFeedback {...$feedback} />
{/if}
