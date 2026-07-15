<script lang="ts">
	import { CloseOutline } from 'flowbite-svelte-icons';
	import type { ActiveFilterDescriptor } from './list-query';

	let {
		filter,
		onRemove,
		disabled = false
	}: {
		filter: ActiveFilterDescriptor;
		onRemove?: (filter: ActiveFilterDescriptor) => void;
		disabled?: boolean;
	} = $props();

	const displayLabel = $derived(filter.value ? `${filter.label}: ${filter.value}` : filter.label);
	const removeLabel = $derived(filter.removeLabel ?? `Remove ${displayLabel} filter`);
</script>

<span
	class="active-filter-chip inline-flex max-w-full shrink-0 items-center overflow-hidden rounded-full border border-blue-200 bg-blue-50 pl-2 text-xs font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-200"
>
	<span class="truncate py-1" title={displayLabel}>
		{#if filter.value}<span class="font-normal text-blue-600 dark:text-blue-300"
				>{filter.label}:</span
			>{' '}{filter.value}{:else}{filter.label}{/if}
	</span>
	{#if onRemove}
		<button
			type="button"
			class="active-filter-remove ml-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-blue-500 hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-300 dark:hover:bg-blue-900 dark:hover:text-blue-100"
			aria-label={removeLabel}
			{disabled}
			onclick={() => onRemove(filter)}
		>
			<CloseOutline class="h-3 w-3" aria-hidden="true" />
		</button>
	{/if}
</span>

<style>
	@media (max-width: 1024px) {
		.active-filter-chip {
			min-height: 44px;
		}

		.active-filter-remove {
			width: 44px;
			height: 44px;
			min-width: 44px;
			min-height: 44px;
		}
	}
</style>
