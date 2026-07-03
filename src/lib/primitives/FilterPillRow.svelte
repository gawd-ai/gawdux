<!-- Filter pill row: single-select filter chips for list rails and toolbars.
     Wrap-aware: when the pills don't fit on one line they re-distribute into
     visually balanced, horizontally centered rows instead of stranding an
     orphan pill on the last line. Balancing is measurement-based (hidden
     nowrap copy of the row), so it adapts to any host width; until a
     measurement exists it falls back to plain centered flex-wrap. -->
<script lang="ts">
	interface FilterPill {
		id: string;
		label: string;
		count?: number;
	}

	let {
		pills,
		selected,
		onSelect
	}: {
		pills: FilterPill[];
		selected: string;
		onSelect: (id: string) => void;
	} = $props();

	/** Must match the gap-1 between pills. */
	const GAP = 4;

	let containerWidth = $state(0);
	let pillWidths = $state<number[]>([]);
	let measureEls: HTMLElement[] = $state([]);

	// Measure from the hidden copy whenever the pill set changes. Reading
	// offsetWidth of the nowrap copy cannot feed back into its own layout.
	$effect(() => {
		void pills;
		pillWidths = measureEls.slice(0, pills.length).map((el) => el?.offsetWidth ?? 0);
	});

	const rows = $derived(balancedRows(pills, pillWidths, containerWidth));

	function rowWidth(widths: number[]): number {
		return widths.reduce((sum, w) => sum + w, 0) + GAP * Math.max(0, widths.length - 1);
	}

	/** Minimal line count a greedy left-to-right wrap would need. */
	function greedyLineCount(widths: number[], max: number): number {
		let lines = 1;
		let current = 0;
		for (const width of widths) {
			const next = current === 0 ? width : current + GAP + width;
			if (next > max && current !== 0) {
				lines += 1;
				current = width;
			} else {
				current = next;
			}
		}
		return lines;
	}

	/**
	 * Split into `lineCount` rows of roughly equal width (fill to the balance
	 * target, keeping order). Returns null if any row would overflow `max` —
	 * the caller then retries with one more row.
	 */
	function chunkToLines(
		items: FilterPill[],
		widths: number[],
		max: number,
		lineCount: number
	): FilterPill[][] | null {
		const target = rowWidth(widths) / lineCount;
		const chunks: FilterPill[][] = [];
		let current: FilterPill[] = [];
		let currentWidth = 0;
		for (let i = 0; i < items.length; i += 1) {
			const width = widths[i];
			const next = currentWidth === 0 ? width : currentWidth + GAP + width;
			if (current.length > 0 && chunks.length < lineCount - 1 && next > target) {
				chunks.push(current);
				current = [items[i]];
				currentWidth = width;
			} else {
				current.push(items[i]);
				currentWidth = next;
			}
			if (currentWidth > max) return null;
		}
		if (current.length > 0) chunks.push(current);
		return chunks;
	}

	function balancedRows(items: FilterPill[], widths: number[], max: number): FilterPill[][] {
		if (
			max <= 0 ||
			widths.length !== items.length ||
			widths.some((width) => width <= 0) ||
			rowWidth(widths) <= max
		) {
			return [items];
		}
		for (let lines = greedyLineCount(widths, max); lines <= items.length; lines += 1) {
			const chunks = chunkToLines(items, widths, max, lines);
			if (chunks) return chunks;
		}
		return [items];
	}

	function pillClass(active: boolean): string {
		return `rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
			active
				? 'border-blue-300 bg-white text-blue-700 shadow-sm dark:border-blue-800 dark:bg-gray-900 dark:text-blue-300'
				: 'border-transparent text-gray-500 hover:border-gray-200 hover:bg-white dark:text-gray-400 dark:hover:border-gray-800 dark:hover:bg-gray-900'
		}`;
	}
</script>

<div class="relative" bind:clientWidth={containerWidth}>
	<!-- Hidden nowrap copy, measured for row balancing. -->
	<div class="pointer-events-none absolute -z-10 flex w-max gap-1 opacity-0" aria-hidden="true">
		{#each pills as pill, i (pill.id)}
			<span bind:this={measureEls[i]} class={pillClass(false)}>
				{pill.label}{#if pill.count != null}<span class="ml-0.5 opacity-60">{pill.count}</span>{/if}
			</span>
		{/each}
	</div>
	<div class="space-y-1">
		{#each rows as row, rowIndex (rowIndex)}
			<div class="flex flex-wrap justify-center gap-1">
				{#each row as pill (pill.id)}
					<button
						type="button"
						class={pillClass(selected === pill.id)}
						aria-pressed={selected === pill.id}
						onclick={() => onSelect(pill.id)}
					>
						{pill.label}{#if pill.count != null}<span class="ml-0.5 opacity-60"
								>{pill.count}</span
							>{/if}
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>
