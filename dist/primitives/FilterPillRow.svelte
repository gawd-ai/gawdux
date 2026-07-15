<!-- One-line quick-filter strip. It stays compact when the pills fit and
     becomes an internally scrollable rail when they do not. -->
<script module lang="ts">
	export interface FilterPill {
		id: string;
		label: string;
		count?: number;
	}
</script>

<script lang="ts">
	let {
		pills,
		selected,
		onSelect,
		ariaLabel = 'Quick filters',
		className = ''
	}: {
		pills: FilterPill[];
		selected: string;
		onSelect: (id: string) => void;
		ariaLabel?: string;
		className?: string;
	} = $props();

	function pillClass(active: boolean): string {
		return `filter-pill shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
			active
				? 'border-blue-300 bg-white text-blue-700 shadow-sm dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300'
				: 'border-transparent text-gray-500 hover:border-gray-200 hover:bg-white dark:text-gray-400 dark:hover:border-gray-800 dark:hover:bg-gray-900'
		}`;
	}
</script>

<div
	class={`filter-pill-viewport w-full overflow-x-auto overscroll-x-contain ${className}`}
	role="group"
	aria-label={ariaLabel}
>
	<div class="flex w-max min-w-full flex-nowrap justify-center gap-1">
		{#each pills as pill (pill.id)}
			<button
				type="button"
				class={pillClass(selected === pill.id)}
				aria-pressed={selected === pill.id}
				onclick={() => onSelect(pill.id)}
			>
				{pill.label}{#if pill.count != null}<span class="ml-0.5 opacity-60">{pill.count}</span>{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.filter-pill-viewport {
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
	}

	@media (max-width: 1024px) {
		.filter-pill {
			min-width: 44px;
			min-height: 44px;
		}
	}
</style>
