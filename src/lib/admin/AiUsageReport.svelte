<!--
	An AI activity report over a window: the totals as stat tiles, the
	per-day bars, and one card per breakdown (by bot, by person, by whatever
	the host attributes turns to), each row with its share of the window.

	Turns and tokens only, never money: this answers "what has the AI been
	doing", and a cost column would gate it to whoever may see money. A host
	that must show an amount puts it in a row's `note`.

	Presentation only. The host loads the report, names every row, and
	decides what a window change does (`onwindow`, usually a navigation so
	the load runs again). Exports and other commands are the host's, on its
	command bar.
-->
<script lang="ts">
	import CardContainer from '../primitives/CardContainer.svelte';
	import FilterPillRow from '../primitives/FilterPillRow.svelte';
	import StatTile from '../primitives/StatTile.svelte';
	import StatTileStrip from '../primitives/StatTileStrip.svelte';
	import AiUsageBars from './AiUsageBars.svelte';
	import type { AiUsageBreakdown, AiUsageBreakdownRow, AiUsageDay, AiUsageTile, AiUsageTotals } from './types';

	let {
		totals,
		daily,
		days,
		breakdowns = [],
		tiles = [],
		windows = [7, 30, 90],
		onwindow,
		metric = 'tokens',
		tokenUnit = 'tokens',
		dayLabel,
		dayTitle,
		emptyText,
		hideEmptyBreakdowns = false
	}: {
		totals: AiUsageTotals;
		/** Every day of the window, oldest first. */
		daily: AiUsageDay[];
		/** The window the report covers, in days. */
		days: number;
		breakdowns?: AiUsageBreakdown[];
		/** Tiles after Turns and Tokens (bots on, a limit). */
		tiles?: AiUsageTile[];
		/** The windows offered; none are offered without `onwindow`. */
		windows?: readonly number[];
		onwindow?: (days: number) => void;
		/** What the bars count. */
		metric?: 'turns' | 'tokens';
		/** What the product calls a token ("credits"), plural, lower case. */
		tokenUnit?: string;
		dayLabel?: (day: string) => string;
		dayTitle?: (day: string) => string;
		/** Shown in place of the bars when the window holds no activity. */
		emptyText?: string;
		/** Leave out a breakdown with no rows instead of saying it is empty. */
		hideEmptyBreakdowns?: boolean;
	} = $props();

	const numberFormat = new Intl.NumberFormat('en-US');
	const count = (n: number) => numberFormat.format(n);
	/** Compact for a reading line: 12.4k reads faster than 12,412. */
	function compact(n: number): string {
		if (n < 1000) return String(n);
		if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
		return `${(n / 1_000_000).toFixed(1)}M`;
	}
	const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

	const unit = $derived(metric === 'turns' ? 'turns' : tokenUnit);
	const hasActivity = $derived(daily.some((d) => d.turns > 0 || d.tokens > 0));
	const bars = $derived(daily.map((d) => ({ day: d.day, value: metric === 'turns' ? d.turns : d.tokens })));
	const shown = $derived(hideEmptyBreakdowns ? breakdowns.filter((b) => b.rows.length > 0) : breakdowns);

	/** The row's share of the window, floored so a small real slice stays visible; zero draws nothing. */
	function share(row: AiUsageBreakdownRow): number {
		const total = metric === 'turns' ? totals.turns : totals.tokens;
		const value = metric === 'turns' ? row.turns : row.tokens;
		return total > 0 && value > 0 ? Math.min(100, Math.max(2, (value / total) * 100)) : 0;
	}

	const windowPills = $derived(windows.map((w) => ({ id: String(w), label: `${w} days` })));
</script>

<div class="ai-usage-report space-y-3" data-ai-usage-report>
	<StatTileStrip ariaLabel="AI activity">
		<StatTile label="Turns" value={count(totals.turns)} meta={`Last ${days} days`} />
		<StatTile
			label={capital(tokenUnit)}
			value={compact(totals.tokens)}
			valueTitle={`${count(totals.tokens)} ${tokenUnit}`}
			meta={`Last ${days} days`}
		/>
		{#each tiles as tile (tile.label)}
			<StatTile label={tile.label} value={tile.value} meta={tile.meta ?? null} />
		{/each}
	</StatTileStrip>

	<CardContainer title={`${capital(unit)} per day`}>
		<div slot="header">
			{#if onwindow && windows.length > 1}
				<FilterPillRow
					pills={windowPills}
					selected={String(days)}
					onSelect={(id) => onwindow?.(Number(id))}
					ariaLabel="Window"
				/>
			{/if}
		</div>
		<svelte:fragment slot="content">
			{#if hasActivity}
				<AiUsageBars rows={bars} {unit} {...dayLabel ? { dayLabel } : {}} {...dayTitle ? { dayTitle } : {}} />
			{:else}
				<p class="py-6 text-center text-sm text-gray-500 dark:text-gray-400" data-ai-usage-empty>
					{emptyText ?? `No AI activity in the last ${days} days.`}
				</p>
			{/if}
		</svelte:fragment>
	</CardContainer>

	{#if shown.length > 0}
		<div class="grid grid-cols-1 gap-3 xl:grid-cols-2">
			{#each shown as breakdown (breakdown.id)}
				<CardContainer title={breakdown.title}>
					<span slot="header" class="text-[11px] text-gray-500 dark:text-gray-400"
						>{breakdown.caption ?? breakdown.rows.length}</span
					>
					<svelte:fragment slot="content">
						{#if breakdown.rows.length === 0}
							<p class="py-4 text-center text-sm text-gray-500 dark:text-gray-400">No activity in this window.</p>
						{:else}
							<ul class="space-y-2.5" data-ai-usage-breakdown={breakdown.id}>
								{#each breakdown.rows as row (row.key)}
									<li>
										<div class="flex items-baseline justify-between gap-3 text-sm">
											<span class="min-w-0 truncate text-gray-800 dark:text-gray-200" title={row.label}>{row.label}</span>
											<span
												class="shrink-0 whitespace-nowrap text-xs tabular-nums text-gray-600 dark:text-gray-300"
												title={`${count(row.turns)} turns, ${count(row.tokens)} ${tokenUnit}`}
											>
												{count(row.turns)} turns · {compact(row.tokens)} {tokenUnit}{#if row.note}<span
														class="ml-1.5 text-gray-500 dark:text-gray-400">· {row.note}</span
													>{/if}
											</span>
										</div>
										<div class="mt-1 h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
											<div class="h-full rounded-full bg-blue-500/70 dark:bg-blue-400/70" style:width={`${share(row)}%`}></div>
										</div>
									</li>
								{/each}
							</ul>
						{/if}
					</svelte:fragment>
				</CardContainer>
			{/each}
		</div>
	{/if}
</div>
