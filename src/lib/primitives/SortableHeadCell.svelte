<script lang="ts">
	import type { Component } from 'svelte';
	import { TableHeadCell } from 'flowbite-svelte';
	import { ArrowUpOutline, ArrowDownOutline } from 'flowbite-svelte-icons';

	export let field: string;
	export let label: string;
	export let sortField: string;
	export let sortDirection: 'asc' | 'desc' = 'asc';
	export let onSort: (field: string) => void;
	export let className: string = '';
	export let icon: Component | undefined = undefined;

	$: isActive = sortField === field;
	$: sortIcon = isActive
		? sortDirection === 'asc'
			? ArrowUpOutline
			: ArrowDownOutline
		: ArrowUpOutline;
	$: iconClass = isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50';
</script>

<TableHeadCell
	class={`interactive-hover whitespace-nowrap group ${className}`}
	on:click={() => onSort(field)}
>
	<div class="flex items-center gap-2">
		{#if icon}
			<svelte:component this={icon} class="w-4 h-4" />
		{/if}
		<span>{label}</span>
		<svelte:component this={sortIcon} class={`w-4 h-4 transition-opacity ${iconClass}`} />
	</div>
</TableHeadCell>
