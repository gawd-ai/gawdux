<script lang="ts">
	import { Tabs } from 'flowbite-svelte';
	import { getContext, onDestroy, tick } from 'svelte';
	import { readable } from 'svelte/store';
	import SurfaceFeedback from './SurfaceFeedback.svelte';
	import {
		SURFACE_FEEDBACK_CONTEXT,
		type SurfaceFeedbackHost,
		type SurfaceFeedbackState
	} from './surface-feedback-context';
	export let className: string = 'w-full tabs-underline tabs-stick';
	export let contentClass: string = 'tab-content scroll-surface !mt-0 rounded-b-lg';
	export let shellClass: string = 'page-tabs-shell';
	export let divider = false;
	export let panelId: string | undefined = undefined;
	export let panelLabelledBy: string | undefined = undefined;

	/* Inside an EditablePageScaffold this shell owns the panel, so it renders
	   the page's feedback strip between the tab strip and the content: the
	   messages sit inside the panel and the tabs never move. */
	const host = getContext<SurfaceFeedbackHost | undefined>(SURFACE_FEEDBACK_CONTEXT);
	const release = host?.claim() ?? null;
	const feedback = release && host ? host.state : readable<SurfaceFeedbackState | null>(null);
	onDestroy(() => release?.());
	$: hasFeedback = Boolean($feedback?.loadError?.trim() || $feedback?.actionError?.trim());

	function wirePanel(node: HTMLElement, options: { id?: string; labelledBy?: string }) {
		async function apply(next: { id?: string; labelledBy?: string }) {
			await tick();
			const panel = node.querySelector<HTMLElement>('[role="tabpanel"]');
			if (!panel) return;
			if (next.id) panel.id = next.id;
			if (next.labelledBy) panel.setAttribute('aria-labelledby', next.labelledBy);
		}
		void apply(options);
		return { update: (next: { id?: string; labelledBy?: string }) => void apply(next) };
	}
</script>

<!-- The `below` slot lets a page render persistent content (e.g. a streaming
     console) inside the same panel chrome, surviving tab switches. Pair it
     with contentClass="hidden" on the active tab to swap which body shows. -->
<div
	class="context-surface {shellClass}"
	use:wirePanel={{ id: panelId, labelledBy: panelLabelledBy }}
>
	<Tabs
		tabStyle="underline"
		class={`page-tabs-list ${className}`}
		{contentClass}
		divider={divider || hasFeedback}
	>
		<slot />
		<svelte:fragment slot="divider">
			{#if hasFeedback && $feedback}
				<SurfaceFeedback {...$feedback} />
			{:else if divider}
				<div class="h-px bg-gray-200 dark:bg-gray-700"></div>
			{/if}
		</svelte:fragment>
	</Tabs>
	<slot name="below" />
</div>
