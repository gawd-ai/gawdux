<script lang="ts">
	import type { Component } from 'svelte';
	import { TableHeadCell } from 'flowbite-svelte';
	import { ArrowUpOutline, ArrowDownOutline } from 'flowbite-svelte-icons';
	import HeadLabel from './HeadLabel.svelte';

	export let field: string;
	export let label: string;
	export let sortField: string;
	export let sortDirection: 'asc' | 'desc' = 'asc';
	export let onSort: (field: string) => void;
	export let className: string = '';
	/** The column's icon, before the label: rendered through the one header
	    shape (HeadLabel), aria-hidden, sized by the head-icon knobs. It never
	    shows the sort; the arrow and aria-sort do. */
	export let icon: Component | undefined = undefined;
	/** Aligns the label and arrow with the column's cells. Left by default. */
	export let align: 'left' | 'center' | 'right' = 'left';

	$: isActive = sortField === field;
	$: sortIcon = isActive
		? sortDirection === 'asc'
			? ArrowUpOutline
			: ArrowDownOutline
		: ArrowUpOutline;
	$: iconClass = isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50';
	$: alignCellClass = align === 'right' ? ' text-right' : align === 'center' ? ' text-center' : '';
	$: alignRowClass = align === 'right' ? ' justify-end' : align === 'center' ? ' justify-center' : '';
	/** The active sort, for assistive technology; absent on every other column. */
	let ariaSort: 'ascending' | 'descending' | undefined;
	$: ariaSort = isActive ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined;
</script>

<TableHeadCell
	class={`interactive-hover whitespace-nowrap group ${className}${alignCellClass}`}
	aria-sort={ariaSort}
	on:click={() => onSort(field)}
>
	<div class={`flex items-center gap-2${alignRowClass}`}>
		<!-- Two blocks rather than an else: without an icon the row keeps the
		     exact markup of 0.17.0 (whitespace included). -->
		{#if icon}
			<HeadLabel {label} {icon} />
		{/if}
		{#if !icon}
			<span>{label}</span>
		{/if}
		<svelte:component this={sortIcon} class={`w-4 h-4 transition-opacity ${iconClass}`} />
	</div>
</TableHeadCell>
