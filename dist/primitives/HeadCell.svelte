<!-- A labelled, non-sortable header of a hand-built table: flowbite's
     TableHeadCell with `whitespace-nowrap`, the column's alignment and, when
     the product passes one, a column icon before the label (HeadLabel: one
     shape, aria-hidden, sized by the --gawdux-table-head-icon-* knobs).

     Without an icon it renders the `th` a plain
     `<TableHeadCell class="whitespace-nowrap">Label</TableHeadCell>` renders.
     A header that is empty or only for screen readers is not a HeadCell; it
     stays a TableHeadCell. A sortable header is a SortableHeadCell, which
     takes the same `icon`. -->
<script lang="ts">
	import type { Component } from 'svelte';
	import { TableHeadCell } from 'flowbite-svelte';
	import HeadLabel from './HeadLabel.svelte';
	import { dataTableAlignClass } from './data-table';

	let {
		label,
		icon,
		align = 'left',
		className = ''
	}: {
		/** The visible word. Required: a header is never icon-only. */
		label: string;
		/** The column's icon, before the label. */
		icon?: Component;
		/** Aligns the label with the column's cells. Left by default. */
		align?: 'left' | 'center' | 'right';
		/** Classes on the `th` (a width, `status-col`). */
		className?: string;
	} = $props();
</script>

<TableHeadCell class={`whitespace-nowrap ${dataTableAlignClass(align)} ${className}`}>
	{#if icon}
		<HeadLabel {label} {icon} />
	{:else}
		{label}
	{/if}
</TableHeadCell>
