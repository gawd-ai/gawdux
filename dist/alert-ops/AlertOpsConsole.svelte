<!-- Alert Operations console composition: ProviderHealthBar + (Alerts tab:
     FilterRail + AlertGroupTable/AlertDetailPanel in a MasterDetailShell) +
     (Silences tab: read-only SilenceTable) behind PageTabs.

     Transport-agnostic by design: NO data fetching happens here. The host
     passes `data` down and reacts to onrefresh/onfilterschange/onselect
     (data down, events up); the polling cadence lives in the separate
     createAlertOpsPoller helper. Filtering is host-side too — the console
     renders exactly the groups it is given.

     Seven explicit states, all prop-driven: loading, empty, no-results,
     unavailable, stale, partial, denied (see states.ts). -->
<script lang="ts">
	import { TabItem } from 'flowbite-svelte';
	import CollectionEmptyState from '../primitives/CollectionEmptyState.svelte';
	import DeferredLoadingIndicator from '../primitives/DeferredLoadingIndicator.svelte';
	import MasterDetailShell from '../primitives/MasterDetailShell.svelte';
	import PageTabs from '../primitives/PageTabs.svelte';
	import AlertDetailPanel from './AlertDetailPanel.svelte';
	import AlertGroupTable from './AlertGroupTable.svelte';
	import FilterRail from './FilterRail.svelte';
	import ProviderHealthBar from './ProviderHealthBar.svelte';
	import SilenceTable from './SilenceTable.svelte';
	import {
		hasActiveAlertOpsFilters,
		resolveAlertOpsCollection,
		resolveAlertOpsView
	} from './states';
	import {
		resolveAlertOpsCopy,
		type AlertOpsAlert,
		type AlertOpsCopy,
		type AlertOpsData,
		type AlertOpsFilters,
		type AlertOpsScope
	} from './types';

	let {
		scope,
		filters = $bindable({}),
		data,
		selectedFingerprint = $bindable(null),
		copy: copyOverrides,
		now,
		refreshing = false,
		onrefresh,
		onfilterschange,
		onselect
	}: {
		scope: AlertOpsScope;
		filters?: AlertOpsFilters;
		data: AlertOpsData;
		selectedFingerprint?: string | null;
		copy?: Partial<AlertOpsCopy>;
		/** Injected clock for deterministic relative time (forwarded to the health bar). */
		now?: number | Date;
		/** True while the host's fetch is in flight; disables Refresh. */
		refreshing?: boolean;
		onrefresh?: () => void;
		onfilterschange?: (filters: AlertOpsFilters) => void;
		onselect?: (fingerprint: string) => void;
	} = $props();

	const copy = $derived(resolveAlertOpsCopy(copyOverrides));
	const view = $derived(resolveAlertOpsView(data.status.state));
	const alertCount = $derived(
		data.groups.reduce((count, group) => count + group.alerts.length, 0)
	);
	const collection = $derived(
		resolveAlertOpsCollection(alertCount, hasActiveAlertOpsFilters(filters))
	);

	const selected = $derived.by((): { alert: AlertOpsAlert; groupKey: string } | null => {
		if (!selectedFingerprint) return null;
		for (const group of data.groups) {
			for (const alert of group.alerts) {
				if (alert.fingerprint === selectedFingerprint) return { alert, groupKey: group.key };
			}
		}
		return null;
	});

	const environmentLabel = $derived(
		scope.environments.find((environment) => environment.id === filters.environmentId)?.label
	);
	const planeLabel = $derived(scope.planes.find((plane) => plane.id === filters.planeId)?.label);

	function handleSelect(fingerprint: string): void {
		selectedFingerprint = fingerprint;
		onselect?.(fingerprint);
	}

	const bannerClass =
		'rounded-md border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
</script>

<div class="alert-ops-console responsive-list-page space-y-3" data-testid="alert-ops-console">
	<ProviderHealthBar
		status={data.status}
		{environmentLabel}
		{planeLabel}
		copy={copyOverrides}
		{now}
		{refreshing}
		{onrefresh}
	/>

	{#if view.kind === 'denied'}
		<!-- Permission message only — no data skeletons behind a denial. -->
		<div
			class="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center dark:border-gray-800 dark:bg-gray-900"
			role="status"
			data-testid="alert-ops-denied"
		>
			<h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">{copy.deniedTitle}</h3>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{copy.deniedMessage}</p>
		</div>
	{:else if view.kind === 'loading'}
		<div data-testid="alert-ops-loading">
			<DeferredLoadingIndicator active label={copy.loadingLabel} />
		</div>
	{:else if view.kind === 'unavailable'}
		<div
			class="space-y-3 rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center dark:border-red-900 dark:bg-red-950/30"
			role="alert"
			data-testid="alert-ops-unavailable"
		>
			<h3 class="text-sm font-semibold text-red-800 dark:text-red-200">
				{copy.unavailableTitle}
			</h3>
			<p class="text-sm text-red-700 dark:text-red-300">{copy.unavailableMessage}</p>
			{#if data.status.error}
				<p class="text-xs text-red-600 dark:text-red-400">{data.status.error}</p>
			{/if}
			<button
				type="button"
				class="inline-flex min-h-9 items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 dark:border-red-800 dark:bg-gray-900 dark:text-red-300 dark:hover:bg-red-950"
				onclick={() => onrefresh?.()}
			>
				{copy.retryLabel}
			</button>
		</div>
	{:else}
		{#if view.stale}
			<!-- Banner over the last-good data: the content below is stale. -->
			<div class={bannerClass} role="status" data-testid="alert-ops-stale-banner">
				<strong class="font-semibold">{copy.staleBannerTitle}</strong>
				{copy.staleBannerMessage}
			</div>
		{/if}

		<PageTabs>
			<TabItem open title={copy.alertsTab}>
				<div class="space-y-3 p-3">
					{#if view.partial}
						<div class={bannerClass} role="status" data-testid="alert-ops-partial-alerts">
							{copy.partialAlertsBanner}
						</div>
					{/if}

					<FilterRail {scope} bind:filters copy={copyOverrides} onchange={onfilterschange} />

					{#if collection === 'empty'}
						<CollectionEmptyState
							title={copy.emptyTitle}
							message={copy.emptyMessage}
							variant="empty"
						/>
					{:else if collection === 'no-results'}
						<CollectionEmptyState
							title={copy.noResultsTitle}
							message={copy.noResultsMessage}
							variant="no-results"
						/>
					{:else}
						<MasterDetailShell
							detailKey={selectedFingerprint ?? null}
							detailLabel={copy.detailHeading}
						>
							{#snippet rail()}
								<AlertGroupTable
									groups={data.groups}
									{selectedFingerprint}
									copy={copyOverrides}
									onselect={handleSelect}
								/>
							{/snippet}
							{#snippet detail()}
								<AlertDetailPanel
									alert={selected?.alert ?? null}
									groupKey={selected?.groupKey}
									copy={copyOverrides}
								/>
							{/snippet}
						</MasterDetailShell>
					{/if}
				</div>
			</TabItem>

			<TabItem title={copy.silencesTab}>
				<div class="space-y-3 p-3">
					{#if view.partial}
						<div class={bannerClass} role="status" data-testid="alert-ops-partial-silences">
							{copy.partialSilencesBanner}
						</div>
					{/if}
					{#if data.silences.length === 0}
						<CollectionEmptyState
							title={copy.silencesEmptyTitle}
							message={copy.silencesEmptyMessage}
							variant="empty"
						/>
					{:else}
						<SilenceTable silences={data.silences} copy={copyOverrides} />
					{/if}
				</div>
			</TabItem>
		</PageTabs>
	{/if}
</div>
