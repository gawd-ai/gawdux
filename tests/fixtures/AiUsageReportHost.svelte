<script lang="ts">
	import { AiUsageReport } from 'gawdux/admin';
	import type {
		AiUsageBreakdown,
		AiUsageBreakdownRow,
		AiUsageDay,
		AiUsageTotals
	} from 'gawdux/admin';

	interface HostReport {
		totals: AiUsageTotals;
		daily: AiUsageDay[];
		days: number;
		breakdowns: AiUsageBreakdown[];
	}
	let {
		model,
		customPresentation = true,
		omitSummary = false,
		omitActivity = false,
		omitRowValue = false,
		disclose = false,
		onwindow
	}: {
		model: HostReport | null;
		customPresentation?: boolean;
		omitSummary?: boolean;
		omitActivity?: boolean;
		omitRowValue?: boolean;
		disclose?: boolean;
		onwindow?: (days: number) => void;
	} = $props();
</script>

{#if model}
	<AiUsageReport
		{...model}
		{onwindow}
		summary={customPresentation && !omitSummary ? hostSummary : undefined}
		activity={customPresentation && !omitActivity ? hostActivity : undefined}
		rowValue={customPresentation && !omitRowValue ? hostRowValue : undefined}
		contentClass={customPresentation ? 'space-y-4' : undefined}
		breakdownGridClass={customPresentation
			? 'grid grid-cols-1 gap-4 lg:grid-cols-2'
			: undefined}
		breakdownRowsClass={customPresentation ? 'space-y-3' : undefined}
	/>
{/if}

{#snippet hostSummary()}
	<section data-host-summary aria-label="Host overview">
		{model?.totals.turns} activities in the selected window
	</section>
{/snippet}
{#snippet hostActivity()}
	<section data-host-activity aria-label="Host activity">
		Host-selected activity presentation for {model?.days} days
	</section>
{/snippet}
{#snippet hostRowValue(row: AiUsageBreakdownRow)}
	<span
		class="host-row-value"
		data-host-row={row.key}
		title={`Host value for ${row.key}`}
	>
		{row.tokens.toLocaleString('en-US')} units{#if disclose && row.note}
			· {row.note}{/if}
	</span>
{/snippet}
