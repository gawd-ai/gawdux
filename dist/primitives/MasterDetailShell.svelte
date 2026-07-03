<!-- House two-pane master-detail shell: centered card, 18rem selector rail +
     detail pane. On lg+ the card fills its host and each pane scrolls
     independently; below lg it stacks and the page scrolls. Hosts must
     provide a bounded flex column for the independent-scroll mode. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { rail, detail }: { rail: Snippet; detail: Snippet } = $props();
</script>

<div class="min-h-0 flex-1 overflow-auto p-3 lg:flex lg:flex-col lg:overflow-hidden">
	<div
		class="mx-auto grid min-h-[30rem] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:min-h-0 lg:flex-1 lg:grid-cols-[18rem_minmax(0,1fr)] lg:grid-rows-[minmax(0,1fr)]"
	>
		<aside
			class="border-b border-gray-100 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-950/30 lg:min-h-0 lg:overflow-y-auto lg:border-b-0 lg:border-r"
		>
			{@render rail()}
		</aside>
		<section class="min-w-0 space-y-3 p-3 lg:min-h-0 lg:overflow-y-auto">
			{@render detail()}
		</section>
	</div>
</div>
