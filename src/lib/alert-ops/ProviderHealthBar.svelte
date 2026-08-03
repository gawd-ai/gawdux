<!-- Provider health strip: status pill, environment + plane, relative last
     successful refresh, and the explicit Refresh action. Pure presentation —
     `now` is injectable so relative time is deterministic under test; the
     host (or its poller) re-renders to advance it. -->
<script lang="ts">
	import StatusBadge from '../primitives/StatusBadge.svelte';
	import {
		formatAlertOpsRelativeTime,
		providerStateBadgeColor,
		providerStateLabel
	} from './states';
	import { resolveAlertOpsCopy, type AlertOpsCopy, type AlertOpsProviderStatus } from './types';

	let {
		status,
		environmentLabel,
		planeLabel,
		copy: copyOverrides,
		now,
		refreshing = false,
		onrefresh
	}: {
		status: AlertOpsProviderStatus;
		/** Display label of the environment in scope (host-resolved). */
		environmentLabel?: string;
		/** Display label of the monitoring plane in scope (host-resolved). */
		planeLabel?: string;
		copy?: Partial<AlertOpsCopy>;
		/** Injected clock for deterministic relative time. Defaults to Date.now(). */
		now?: number | Date;
		/** Disables Refresh while a host-driven fetch is in flight. */
		refreshing?: boolean;
		onrefresh?: () => void;
	} = $props();

	const copy = $derived(resolveAlertOpsCopy(copyOverrides));
	const environmentDisplay = $derived(environmentLabel ?? copy.allEnvironmentsLabel);
	const planeDisplay = $derived(planeLabel ?? copy.allPlanesLabel);
	const refreshDisabled = $derived(status.state === 'loading' || refreshing);
	const relativeRefresh = $derived(
		formatAlertOpsRelativeTime(status.lastSuccessfulRefresh, now ?? Date.now(), copy)
	);
</script>

<section
	class="alert-ops-provider-health flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900"
	aria-label={copy.providerHealthLabel}
	data-testid="alert-ops-provider-health"
>
	<span class="shrink-0" data-testid="alert-ops-provider-state">
		<StatusBadge
			color={providerStateBadgeColor(status.state)}
			label={providerStateLabel(status.state, copy)}
		/>
	</span>

	<span class="flex min-w-0 items-baseline gap-1 text-sm">
		<span class="shrink-0 text-xs text-gray-500 dark:text-gray-400">{copy.environmentLabel}:</span>
		<span
			class="truncate font-medium text-gray-800 dark:text-gray-100"
			data-testid="alert-ops-environment"
		>
			{environmentDisplay}
		</span>
	</span>

	<span class="flex min-w-0 items-baseline gap-1 text-sm">
		<span class="shrink-0 text-xs text-gray-500 dark:text-gray-400">{copy.planeLabel}:</span>
		<span
			class="truncate font-medium text-gray-800 dark:text-gray-100"
			data-testid="alert-ops-plane"
		>
			{planeDisplay}
		</span>
	</span>

	<span
		class="text-xs text-gray-500 dark:text-gray-400"
		data-testid="alert-ops-last-refresh"
		title={status.lastSuccessfulRefresh}
	>
		{copy.lastRefreshLabel}: {relativeRefresh}
	</span>

	{#if status.error}
		<span
			class="max-w-64 truncate text-xs text-red-600 dark:text-red-300"
			title={status.error}
			data-testid="alert-ops-provider-error"
		>
			{status.error}
		</span>
	{/if}

	<button
		type="button"
		class="ml-auto inline-flex min-h-9 shrink-0 items-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
		data-testid="alert-ops-refresh"
		disabled={refreshDisabled}
		onclick={() => onrefresh?.()}
	>
		{copy.refreshLabel}
	</button>
</section>
