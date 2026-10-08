<!-- Alert Operations console composition: ProviderHealthBar + (Alerts tab:
     FilterRail + AlertGroupTable/AlertDetailPanel in a MasterDetailShell) +
     (Silences tab: read-only SilenceTable) behind PageTabs.

     Transport-agnostic by design: NO data fetching happens here. The host
     passes `data` down and reacts to onrefresh/onfilterschange/onselect
     (data down, events up); the polling cadence lives in the separate
     createAlertOpsPoller helper. Filtering is host-side too — the console
     renders exactly the groups it is given.

     Seven explicit states, all prop-driven: loading, empty, no-results,
     unavailable, stale, partial, denied (see states.ts).

     Silence mutation is OPT-IN and absent by default: the console only
     forwards the double gates (canMutate+onexpire, canSilence+onsilence) to
     the table and the panel, and mirrors the host's `mutation` lifecycle —
     it owns no mutation state machine and issues no request. -->

<script lang="ts">
	import { TabItem } from 'flowbite-svelte';
	import {
		BellOutline,
		ExclamationCircleOutline,
		LockOutline,
		VolumeMuteOutline
	} from 'flowbite-svelte-icons';
	import CollectionEmptyState from '../primitives/CollectionEmptyState.svelte';
	import TableContainer from '../primitives/TableContainer.svelte';
	import TabTitle from '../primitives/TabTitle.svelte';
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
		type AlertOpsHeadIcons,
		type AlertOpsMutationState,
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
		onselect,
		canMutate = false,
		onexpire,
		canSilence = false,
		onsilence,
		mutation,
		healthBar = true,
		headIcons = {}
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
		/** Opt-in: the host authorized expiring silences. Needs `onexpire` too. */
		canMutate?: boolean;
		/** Intent only — the host confirms, then expires the silence. */
		onexpire?: (silenceId: string) => void;
		/** Opt-in: the host authorized silencing alerts. Needs `onsilence` too. */
		canSilence?: boolean;
		/** Intent only — the host confirms, then creates the silence. */
		onsilence?: (alert: AlertOpsAlert) => void;
		/**
		 * Host-owned mutation lifecycle. The console runs no mutation state
		 * machine: it only reflects what it is handed — pending disables the
		 * affordances and shows the busy indicator, failed shows the inline
		 * error (already sanitized by the host, rendered as text).
		 */
		mutation?: AlertOpsMutationState;
		/**
		 * Render the provider health strip above the tabs. A host whose page
		 * grammar keeps status and actions elsewhere (a breadcrumb badge, a
		 * bottom command bar) passes false and shows `data.status` itself; the
		 * console then opens directly on its tabs, like any other list surface,
		 * and the unavailable state offers no Retry of its own: the host's
		 * Refresh is the one way to ask again.
		 */
		healthBar?: boolean;
		/**
		 * A column icon before a header's word, per header of the alert groups
		 * and the silences; none by default. The product chooses the meanings.
		 */
		headIcons?: AlertOpsHeadIcons;
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
	const mutationPendingClass =
		'flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200';
	const mutationErrorClass =
		'space-y-0.5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200';
</script>

<div class="alert-ops-console responsive-list-page space-y-3" data-testid="alert-ops-console">
	{#if healthBar}
		<ProviderHealthBar
			status={data.status}
			{environmentLabel}
			{planeLabel}
			copy={copyOverrides}
			{now}
			{refreshing}
			{onrefresh}
		/>
	{/if}

	{#if mutation && mutation.state !== 'idle'}
		<!-- Mutation feedback is prop-driven and lives in one predictable place,
		     above the tabs, so it is visible whichever tab raised the intent. -->
		{#if mutation.state === 'pending'}
			<div
				class={mutationPendingClass}
				role="status"
				aria-live="polite"
				aria-busy="true"
				data-testid="alert-ops-mutation-pending"
			>
				<svg class="h-4 w-4 shrink-0 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="9"
						fill="none"
						stroke="currentColor"
						stroke-width="3"
					/>
					<path
						class="opacity-80"
						fill="currentColor"
						d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3Z"
					/>
				</svg>
				{copy.mutationPending}
			</div>
		{:else}
			<div class={mutationErrorClass} role="alert" data-testid="alert-ops-mutation-error">
				<strong class="block font-semibold">{copy.mutationFailed}</strong>
				{#if mutation.error}
					<!-- Host-sanitized text, rendered as text ({@html} is never used):
					     hostile markup stays inert. -->
					<span class="block text-xs" data-testid="alert-ops-mutation-error-detail">
						{mutation.error}
					</span>
				{/if}
			</div>
		{/if}
	{/if}

	{#if view.kind === 'denied'}
		<!-- Permission message only, no data skeletons behind a denial: the
		     house empty state on the page's surface, like every list. -->
		<TableContainer>
			<div data-testid="alert-ops-denied">
				<CollectionEmptyState
					title={copy.deniedTitle}
					message={copy.deniedMessage}
					icon={LockOutline}
					state="denied"
				/>
			</div>
		</TableContainer>
	{:else if view.kind === 'loading'}
		<div data-testid="alert-ops-loading">
			<DeferredLoadingIndicator active label={copy.loadingLabel} />
		</div>
	{:else if view.kind === 'unavailable'}
		<!-- The house error state on the page's surface. The provider's own
		     words, when the host passes them, follow the message. Retry only
		     when the console carries its own health strip; otherwise the
		     host's Refresh asks again. -->
		<TableContainer>
			<div role="alert" data-testid="alert-ops-unavailable">
				<CollectionEmptyState
					title={copy.unavailableTitle}
					message={data.status.error
						? `${copy.unavailableMessage} ${data.status.error}`
						: copy.unavailableMessage}
					icon={ExclamationCircleOutline}
					state="error"
					{...healthBar && onrefresh
						? { actionLabel: copy.retryLabel, onaction: () => onrefresh?.() }
						: {}}
				/>
			</div>
		</TableContainer>
	{:else}
		{#if view.stale}
			<!-- Banner over the last-good data: the content below is stale. -->
			<div class={bannerClass} role="status" data-testid="alert-ops-stale-banner">
				<strong class="font-semibold">{copy.staleBannerTitle}</strong>
				{copy.staleBannerMessage}
			</div>
		{/if}

		<PageTabs>
			<TabItem open>
				<TabTitle slot="title" icon={BellOutline} label={copy.alertsTab} />
				<div class="space-y-3">
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
									{headIcons}
								/>
							{/snippet}
							{#snippet detail()}
								<AlertDetailPanel
									alert={selected?.alert ?? null}
									groupKey={selected?.groupKey}
									copy={copyOverrides}
									{canSilence}
									{onsilence}
									{mutation}
								/>
							{/snippet}
						</MasterDetailShell>
					{/if}
				</div>
			</TabItem>

			<TabItem>
				<TabTitle slot="title" icon={VolumeMuteOutline} label={copy.silencesTab} />
				<div class="space-y-3">
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
						<SilenceTable
							silences={data.silences}
							copy={copyOverrides}
							{canMutate}
							{onexpire}
							{mutation}
							{headIcons}
						/>
					{/if}
				</div>
			</TabItem>
		</PageTabs>
	{/if}
</div>
