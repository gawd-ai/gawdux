<!-- The one header label (internal): a column icon before the word.
     DataTable's headers, SortableHeadCell, HeadCell and the blocks that write
     their own headers all render through it, so a header icon has one shape:
     `span.table-head-label > svg.table-head-icon + span`. The icon is always
     aria-hidden (the label carries the meaning) and its size, gap, colour and
     display are the --gawdux-table-head-icon-* knobs (tokens.css). A caller
     renders it only when it has an icon; a header without one stays the bare
     word. -->
<script lang="ts">
	import type { Component } from 'svelte';

	let { label, icon }: { label: string; icon: Component } = $props();

	const Icon = $derived(icon);
</script>

<span class="table-head-label"><Icon class="table-head-icon h-4 w-4" aria-hidden="true" /><span>{label}</span></span>
