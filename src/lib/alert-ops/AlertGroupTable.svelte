<!-- Grouped alert list. Group-label header rows precede each group's alert
     rows. Rows follow the row-click list rule: click, Enter or Space select;
     the selected row carries aria-selected. On narrow viewports the 0.3.0
     `responsive-card-table` pattern turns rows into labelled cards via the
     td[data-label] hook. Rows also carry data-master-detail-row so
     MasterDetailShell's compact single-pane navigation opens the detail. -->
<script lang="ts">
	import StatusBadge from '../primitives/StatusBadge.svelte';
	import {
		alertSeverityBadgeColor,
		alertSeverityLabel,
		alertStatusLabel,
		formatAlertOpsDuration,
		formatAlertOpsTimestamp,
		shortAlertFingerprint
	} from './states';
	import { resolveAlertOpsCopy, type AlertOpsCopy, type AlertOpsGroup } from './types';

	let {
		groups,
		selectedFingerprint = null,
		copy: copyOverrides,
		onselect
	}: {
		groups: AlertOpsGroup[];
		selectedFingerprint?: string | null;
		copy?: Partial<AlertOpsCopy>;
		onselect?: (fingerprint: string) => void;
	} = $props();

	const copy = $derived(resolveAlertOpsCopy(copyOverrides));
	const showReceiver = $derived(
		groups.some((group) => group.alerts.some((alert) => alert.receiver))
	);
	const columnCount = $derived(showReceiver ? 8 : 7);

	function groupLabelText(group: AlertOpsGroup): string {
		const entries = Object.entries(group.labels);
		if (entries.length === 0) return copy.ungroupedLabel;
		return entries.map(([name, value]) => `${name}=${value}`).join(', ');
	}

	function select(fingerprint: string): void {
		onselect?.(fingerprint);
	}

	function handleRowKeydown(event: KeyboardEvent, fingerprint: string): void {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		select(fingerprint);
	}
</script>

<div class="responsive-card-table overflow-x-auto" data-testid="alert-group-table">
	<table class="w-full text-left text-sm text-gray-600 dark:text-gray-300">
		<caption class="sr-only">{copy.alertsTableCaption}</caption>
		<thead
			class="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-400"
		>
			<tr>
				<th scope="col" class="px-4 py-2.5">{copy.columnSeverity}</th>
				<th scope="col" class="px-4 py-2.5">{copy.columnStatus}</th>
				<th scope="col" class="px-4 py-2.5">{copy.columnService}</th>
				<th scope="col" class="px-4 py-2.5">{copy.columnSummary}</th>
				<th scope="col" class="px-4 py-2.5">{copy.columnStarted}</th>
				<th scope="col" class="px-4 py-2.5">{copy.columnDuration}</th>
				{#if showReceiver}
					<th scope="col" class="px-4 py-2.5">{copy.columnReceiver}</th>
				{/if}
				<th scope="col" class="px-4 py-2.5">{copy.columnFingerprint}</th>
			</tr>
		</thead>
		<tbody>
			{#each groups as group (group.key)}
				<tr data-testid="alert-group-header">
					<th
						colspan={columnCount}
						scope="colgroup"
						class="border-b border-gray-200 bg-gray-100/70 px-4 py-1.5 text-left text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
					>
						{groupLabelText(group)}
					</th>
				</tr>
				{#each group.alerts as alert (alert.fingerprint)}
					{@const selected = selectedFingerprint === alert.fingerprint}
					<!-- Row-click list rule: the whole row is the target, with Enter/
					     Space equivalents and aria-selected. The compiler flags rows
					     as noninteractive; this is the deliberate house pattern. -->
					<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
					<tr
						data-master-detail-row
						data-testid="alert-row"
						data-fingerprint={alert.fingerprint}
						tabindex="0"
						aria-selected={selected}
						class={`cursor-pointer border-b border-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:border-gray-800 ${selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
						onclick={() => select(alert.fingerprint)}
						onkeydown={(event) => handleRowKeydown(event, alert.fingerprint)}
					>
						<td data-label={copy.columnSeverity} class="whitespace-nowrap px-4 py-2.5">
							<StatusBadge
								color={alertSeverityBadgeColor(alert.severity)}
								label={alertSeverityLabel(alert.severity, copy)}
							/>
						</td>
						<td data-label={copy.columnStatus} class="whitespace-nowrap px-4 py-2.5">
							{alertStatusLabel(alert.status, copy)}
						</td>
						<td data-label={copy.columnService} class="whitespace-nowrap px-4 py-2.5">
							{alert.service}
						</td>
						<td data-label={copy.columnSummary} class="max-w-96 px-4 py-2.5">
							<span class="block truncate" title={alert.summary}>{alert.summary}</span>
						</td>
						<td data-label={copy.columnStarted} class="whitespace-nowrap px-4 py-2.5">
							<time datetime={alert.startsAt} title={alert.startsAt}>
								{formatAlertOpsTimestamp(alert.startsAt)}
							</time>
						</td>
						<td data-label={copy.columnDuration} class="whitespace-nowrap px-4 py-2.5">
							{formatAlertOpsDuration(alert.durationSeconds, copy)}
						</td>
						{#if showReceiver}
							<td data-label={copy.columnReceiver} class="whitespace-nowrap px-4 py-2.5">
								{alert.receiver ?? '—'}
							</td>
						{/if}
						<td data-label={copy.columnFingerprint} class="whitespace-nowrap px-4 py-2.5">
							<code class="text-xs" title={alert.fingerprint}>
								{shortAlertFingerprint(alert.fingerprint)}
							</code>
						</td>
					</tr>
				{/each}
			{/each}
		</tbody>
	</table>
</div>
