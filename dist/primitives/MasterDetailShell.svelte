<!-- House two-pane master-detail shell: centered card, 18rem selector rail +
     detail pane. Container-query driven: in hosts ≥ @3xl (48rem) the card
     fills the host and each pane scrolls independently; narrower hosts stack
     the panes and scroll as one. Independent scrolling additionally needs the
     host to provide a bounded flex column; in an unbounded host the shell
     grows with its content and the host page scrolls (graceful fallback). -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { rail, detail }: { rail: Snippet; detail: Snippet } = $props();
</script>

<div class="@container min-h-0 w-full flex-1">
	<div class="h-full min-h-0 overflow-auto p-3 @3xl:flex @3xl:flex-col @3xl:overflow-hidden">
		<div
			class="mx-auto grid min-h-[30rem] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 @3xl:min-h-0 @3xl:flex-1 @3xl:grid-cols-[18rem_minmax(0,1fr)] @3xl:grid-rows-[minmax(0,1fr)]"
		>
			<aside
				class="border-b border-gray-100 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-950/30 @3xl:min-h-0 @3xl:overflow-y-auto @3xl:border-b-0 @3xl:border-r"
			>
				{@render rail()}
			</aside>
			<section class="min-w-0 space-y-3 p-3 @3xl:min-h-0 @3xl:overflow-y-auto">
				{@render detail()}
			</section>
		</div>
	</div>
</div>
