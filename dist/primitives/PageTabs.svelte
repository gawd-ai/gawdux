<script lang="ts">
	import { Tabs } from 'flowbite-svelte';
	import { getContext, onDestroy, tick, type Snippet } from 'svelte';
	import { readable } from 'svelte/store';
	import SurfaceFeedback from './SurfaceFeedback.svelte';
	import {
		SURFACE_FEEDBACK_CONTEXT,
		type SurfaceFeedbackHost,
		type SurfaceFeedbackState
	} from './surface-feedback-context';
	import { PAGE_STATUS_CONTEXT, type PageStatusHost } from './page-chrome';
	import PageStatusOutlet from './PageStatusOutlet.svelte';
	import { scrollEdges } from './scroll-edges';
	import { fitLabels } from './fit-labels';
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

	/* The page's status, as its host states it: the tabs head the page's panel,
	   so the first live strip draws it after its end, once (the trail never
	   does), and a strip that mounts while another holds it draws it once that
	   one goes. */
	const statusHost = getContext<PageStatusHost | undefined>(PAGE_STATUS_CONTEXT);
	const statusClaim = statusHost?.claim() ?? null;
	const drawnStatus = statusClaim?.status ?? readable<Snippet | null>(null);
	onDestroy(() => statusClaim?.release());
	$: hasFeedback = Boolean(
		$feedback?.loadError?.trim() || $feedback?.actionError?.trim() || $feedback?.notice?.trim()
	);

	/* The strip and the status after it: the strip shows its tabs' labels
	   while they fit its box and each tab's icon alone when they do not
	   (fitLabels), fades where more of its tabs lie (scrollEdges), and ends
	   where the status begins, which stands as tall as the strip beside it
	   (tokens.css, "The page's status after its tab strip"), so a tab's label
	   is never under the status. */
	function stripChrome(node: HTMLElement) {
		const strip = node.querySelector<HTMLElement>(':scope > .page-tabs-list');
		const labels = strip ? fitLabels(strip) : null;
		const edges = strip ? scrollEdges(strip) : null;
		const measure = () => {
			const status = node.querySelector<HTMLElement>(':scope > .page-tabs-status');
			if (!strip || !status) {
				node.style.removeProperty('--gawdux-page-tabs-status-width');
				node.style.removeProperty('--gawdux-page-tabs-strip-height');
				node.style.removeProperty('--gawdux-page-tabs-strip-top');
				return;
			}
			node.style.setProperty('--gawdux-page-tabs-status-width', `${status.offsetWidth}px`);
			node.style.setProperty('--gawdux-page-tabs-strip-height', `${strip.offsetHeight}px`);
			node.style.setProperty('--gawdux-page-tabs-strip-top', `${strip.offsetTop}px`);
		};
		const sized = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
		const watch = () => {
			if (!sized) return;
			sized.disconnect();
			if (strip) sized.observe(strip);
			const status = node.querySelector<HTMLElement>(':scope > .page-tabs-status');
			if (status) sized.observe(status);
		};
		const changed =
			typeof MutationObserver === 'undefined'
				? null
				: new MutationObserver(() => {
						watch();
						measure();
					});
		changed?.observe(node, { childList: true });
		watch();
		measure();
		return {
			destroy() {
				labels?.destroy();
				edges?.destroy();
				sized?.disconnect();
				changed?.disconnect();
			}
		};
	}

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
	class="context-surface gawdux-page-tabs {shellClass}"
	class:page-tabs-has-status={Boolean($drawnStatus && statusHost)}
	use:wirePanel={{ id: panelId, labelledBy: panelLabelledBy }}
	use:stripChrome
>
	<Tabs
		tabStyle="underline"
		class={`page-tabs-list gawdux-tab-strip ${className}`}
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
	{#if $drawnStatus && statusHost}
		<div class="page-tabs-status" data-page-status>
			<PageStatusOutlet host={statusHost} />
		</div>
	{/if}
	<slot name="below" />
</div>
