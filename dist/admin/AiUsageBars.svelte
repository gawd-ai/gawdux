<!--
	AI usage per day, as bars: one keyboard-readable meter per day, a
	three-step y axis, sampled x-axis labels, and the exact value in a
	tooltip on hover and focus. No canvas and no chart library: the bars are
	the accessible content, so a screen reader reads the same numbers a
	sighted operator hovers.

	Product-neutral: the host names the unit ("tokens", "credits") and how a
	day reads (`dayLabel` for the axis, `dayTitle` for the tooltip and the
	meter's name); both default to the ISO day the report carries.
-->
<script lang="ts">
	let {
		rows,
		unit = 'tokens',
		dayLabel = (day: string) => day,
		dayTitle = dayLabel,
		height = 220,
		ariaLabel
	}: {
		/** Every day of the window, oldest first (`day` is `YYYY-MM-DD`). */
		rows: Array<{ day: string; value: number }>;
		/** The plural unit, lower case, as a sentence reads it. */
		unit?: string;
		dayLabel?: (day: string) => string;
		dayTitle?: (day: string) => string;
		/** The chart's height in pixels, axes included. */
		height?: number;
		ariaLabel?: string;
	} = $props();

	const legend = $derived(unit.charAt(0).toUpperCase() + unit.slice(1));
	const scaleMaximum = $derived(Math.max(1, ...rows.map((row) => row.value)));
	const axisTicks = $derived(sampleTicks(rows));

	const exactFormatter = new Intl.NumberFormat('en-US');
	const axisFormatter = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
	const formatExact = (value: number) => exactFormatter.format(value);
	const formatAxis = (value: number) => axisFormatter.format(value);
	const barHeight = (value: number) => `${Math.max(0, (value / scaleMaximum) * 100)}%`;

	function sampleTicks<T>(values: T[], maximumTicks = 5): T[] {
		if (values.length <= maximumTicks) return values;
		const lastIndex = values.length - 1;
		return Array.from({ length: maximumTicks }, (_, index) => values[Math.round((index * lastIndex) / (maximumTicks - 1))]!);
	}
</script>

<figure
	class="ai-usage-chart"
	style:height={`${height}px`}
	role="group"
	aria-label={ariaLabel ?? `${legend} per day for the last ${rows.length} days`}
	data-ai-usage-bars
>
	<figcaption class="ai-usage-chart__caption">
		<span class="ai-usage-chart__legend-swatch" aria-hidden="true"></span>
		{legend}
	</figcaption>

	<div class="ai-usage-chart__y-axis" aria-hidden="true">
		<span>{formatAxis(scaleMaximum)}</span>
		<span>{formatAxis(scaleMaximum / 2)}</span>
		<span>0</span>
	</div>

	<div class="ai-usage-chart__plot">
		<div class="ai-usage-chart__grid" aria-hidden="true">
			<span></span>
			<span></span>
			<span></span>
		</div>
		<div
			class="ai-usage-chart__bars"
			style={`--ai-usage-bar-count: ${Math.max(1, rows.length)}; --ai-usage-bar-gap: ${rows.length > 45 ? 1 : 2}px`}
		>
			{#each rows as row (row.day)}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<div
					class="ai-usage-chart__bar-slot"
					class:ai-usage-chart__bar-slot--used={row.value > 0}
					role="meter"
					tabindex="0"
					aria-label={`${legend} on ${dayTitle(row.day)}`}
					aria-valuemin="0"
					aria-valuemax={scaleMaximum}
					aria-valuenow={row.value}
					aria-valuetext={`${formatExact(row.value)} ${unit}`}
					data-tooltip={`${dayTitle(row.day)}: ${formatExact(row.value)} ${unit}`}
					style={`--ai-usage-bar-height: ${barHeight(row.value)}`}
				></div>
			{/each}
		</div>
	</div>

	<div class="ai-usage-chart__x-axis" style={`--ai-usage-tick-count: ${Math.max(1, axisTicks.length)}`} aria-hidden="true">
		{#each axisTicks as tick (tick.day)}
			<span>{dayLabel(tick.day)}</span>
		{/each}
	</div>
</figure>

<style>
	.ai-usage-chart {
		--ai-usage-bar: #2563eb;
		--ai-usage-bar-hover: #1d4ed8;
		--ai-usage-axis: #6b7280;
		--ai-usage-grid: #e5e7eb;
		display: grid;
		grid-template-columns: 3.25rem minmax(0, 1fr);
		grid-template-rows: 1.25rem minmax(0, 1fr) 1.25rem;
		column-gap: 0.5rem;
		row-gap: 0.25rem;
		width: 100%;
		margin: 0;
	}
	:global(.dark) .ai-usage-chart {
		--ai-usage-bar: #60a5fa;
		--ai-usage-bar-hover: #93c5fd;
		--ai-usage-axis: #9ca3af;
		--ai-usage-grid: #374151;
	}
	.ai-usage-chart__caption {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.375rem;
		font-size: 0.6875rem;
		line-height: 1rem;
		color: var(--ai-usage-axis);
	}
	.ai-usage-chart__legend-swatch {
		width: 0.75rem;
		height: 0.5rem;
		border-radius: 2px;
		background: var(--ai-usage-bar);
	}
	.ai-usage-chart__y-axis {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		grid-column: 1;
		grid-row: 2;
		padding-block: 0 1px;
		font-size: 0.6875rem;
		line-height: 1rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: var(--ai-usage-axis);
	}
	.ai-usage-chart__plot {
		position: relative;
		grid-column: 2;
		grid-row: 2;
		min-width: 0;
		min-height: 0;
	}
	.ai-usage-chart__grid,
	.ai-usage-chart__bars {
		position: absolute;
		inset: 0;
	}
	.ai-usage-chart__grid {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		pointer-events: none;
	}
	.ai-usage-chart__grid span {
		width: 100%;
		border-top: 1px dashed var(--ai-usage-grid);
	}
	.ai-usage-chart__bars {
		display: grid;
		grid-template-columns: repeat(var(--ai-usage-bar-count), minmax(0, 1fr));
		gap: var(--ai-usage-bar-gap);
	}
	.ai-usage-chart__bar-slot {
		position: relative;
		display: flex;
		min-width: 0;
		height: 100%;
		align-items: flex-end;
		justify-content: center;
		cursor: default;
	}
	.ai-usage-chart__bar-slot::before {
		position: absolute;
		top: 0.375rem;
		left: 50%;
		z-index: 2;
		max-width: min(15rem, calc(100vw - 2rem));
		padding: 0.25rem 0.375rem;
		border-radius: 4px;
		background: #111827;
		box-shadow: 0 2px 6px rgb(0 0 0 / 25%);
		color: #f9fafb;
		content: attr(data-tooltip);
		font-size: 0.6875rem;
		font-weight: 500;
		line-height: 1rem;
		opacity: 0;
		overflow: hidden;
		pointer-events: none;
		text-overflow: ellipsis;
		transform: translateX(-50%);
		visibility: hidden;
		white-space: nowrap;
	}
	.ai-usage-chart__bar-slot:first-child::before {
		left: 0;
		transform: none;
	}
	.ai-usage-chart__bar-slot:last-child::before {
		right: 0;
		left: auto;
		transform: none;
	}
	.ai-usage-chart__bar-slot:hover::before,
	.ai-usage-chart__bar-slot:focus-visible::before {
		opacity: 1;
		visibility: visible;
	}
	.ai-usage-chart__bar-slot::after {
		content: '';
		display: block;
		width: min(100%, 1.25rem);
		height: var(--ai-usage-bar-height);
		border-radius: 3px 3px 0 0;
		background: var(--ai-usage-bar);
	}
	.ai-usage-chart__bar-slot--used::after {
		min-height: 2px;
	}
	.ai-usage-chart__bar-slot:hover::after,
	.ai-usage-chart__bar-slot:focus-visible::after {
		background: var(--ai-usage-bar-hover);
	}
	.ai-usage-chart__bar-slot:focus-visible {
		outline: 2px solid var(--ai-usage-bar-hover);
		outline-offset: 2px;
	}
	.ai-usage-chart__x-axis {
		display: grid;
		grid-template-columns: repeat(var(--ai-usage-tick-count), minmax(0, 1fr));
		grid-column: 2;
		grid-row: 3;
		min-width: 0;
		font-size: 0.6875rem;
		line-height: 1rem;
		font-variant-numeric: tabular-nums;
		color: var(--ai-usage-axis);
	}
	.ai-usage-chart__x-axis span {
		min-width: 0;
		text-align: center;
		white-space: nowrap;
	}
	.ai-usage-chart__x-axis span:first-child {
		text-align: left;
	}
	.ai-usage-chart__x-axis span:last-child {
		text-align: right;
	}
</style>
