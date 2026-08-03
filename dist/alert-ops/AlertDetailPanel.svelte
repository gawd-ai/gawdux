<!-- Full detail for one alert: timestamps, correlation identity (fingerprint
     + group key), complete labels/annotations tables, and validated links.
     Everything renders as plain text ({@html} is never used), so hostile
     label or annotation values stay inert even though the host already
     redacts server-side. Links the host marked safe:false render as inert
     spans without an href. -->
<script lang="ts">
	import StatusBadge from '../primitives/StatusBadge.svelte';
	import {
		alertSeverityBadgeColor,
		alertSeverityLabel,
		alertStatusLabel,
		formatAlertOpsDuration,
		formatAlertOpsTimestamp
	} from './states';
	import { resolveAlertOpsCopy, type AlertOpsAlert, type AlertOpsCopy } from './types';

	let {
		alert = null,
		groupKey,
		copy: copyOverrides
	}: {
		alert?: AlertOpsAlert | null;
		/** Group key of the selected alert, for correlation identity. */
		groupKey?: string;
		copy?: Partial<AlertOpsCopy>;
	} = $props();

	const copy = $derived(resolveAlertOpsCopy(copyOverrides));
	const labelEntries = $derived(alert ? Object.entries(alert.labels) : []);
	const annotationEntries = $derived(alert ? Object.entries(alert.annotations) : []);

	const headingClass =
		'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400';
	const mutedClass = 'text-xs text-gray-400 dark:text-gray-500';
	const keyCellClass =
		'w-40 py-1 pr-3 text-left align-top text-xs font-medium text-gray-600 dark:text-gray-300';
	const valueCellClass =
		'break-all py-1 align-top text-xs text-gray-700 dark:text-gray-200';
</script>

<section class="space-y-4" aria-label={copy.detailHeading} data-testid="alert-detail-panel">
	{#if !alert}
		<p class="text-sm text-gray-500 dark:text-gray-400" data-testid="alert-detail-empty">
			{copy.detailNoSelection}
		</p>
	{:else}
		<header class="space-y-1.5">
			<div class="flex flex-wrap items-center gap-2">
				<StatusBadge
					color={alertSeverityBadgeColor(alert.severity)}
					label={alertSeverityLabel(alert.severity, copy)}
				/>
				<span class="text-xs font-medium text-gray-500 dark:text-gray-400">
					{alertStatusLabel(alert.status, copy)}
				</span>
			</div>
			<h3 class="text-sm font-semibold text-gray-800 dark:text-gray-100">{alert.summary}</h3>
		</header>

		<dl class="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
			<div>
				<dt class={headingClass}>{copy.detailStartedLabel}</dt>
				<dd class="text-sm text-gray-700 dark:text-gray-200">
					<time datetime={alert.startsAt} title={alert.startsAt}>
						{formatAlertOpsTimestamp(alert.startsAt)}
					</time>
				</dd>
			</div>
			<div>
				<dt class={headingClass}>{copy.detailDurationLabel}</dt>
				<dd class="text-sm text-gray-700 dark:text-gray-200">
					{formatAlertOpsDuration(alert.durationSeconds, copy)}
				</dd>
			</div>
			{#if alert.receiver}
				<div>
					<dt class={headingClass}>{copy.detailReceiverLabel}</dt>
					<dd class="text-sm text-gray-700 dark:text-gray-200">{alert.receiver}</dd>
				</div>
			{/if}
			<div>
				<dt class={headingClass}>{copy.detailFingerprintLabel}</dt>
				<dd>
					<code class="break-all text-xs text-gray-700 dark:text-gray-200" data-testid="alert-detail-fingerprint">
						{alert.fingerprint}
					</code>
				</dd>
			</div>
			{#if groupKey}
				<div>
					<dt class={headingClass}>{copy.detailGroupKeyLabel}</dt>
					<dd>
						<code class="break-all text-xs text-gray-700 dark:text-gray-200" data-testid="alert-detail-group-key">
							{groupKey}
						</code>
					</dd>
				</div>
			{/if}
		</dl>

		<div class="space-y-1">
			<h4 class={headingClass}>{copy.detailLabelsHeading}</h4>
			{#if labelEntries.length === 0}
				<p class={mutedClass}>{copy.detailNoLabels}</p>
			{:else}
				<table class="w-full" data-testid="alert-detail-labels">
					<thead class="sr-only">
						<tr>
							<th scope="col">{copy.detailNameHeader}</th>
							<th scope="col">{copy.detailValueHeader}</th>
						</tr>
					</thead>
					<tbody>
						{#each labelEntries as [name, value] (name)}
							<tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
								<th scope="row" class={keyCellClass}>{name}</th>
								<td class={valueCellClass}>{value}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<div class="space-y-1">
			<h4 class={headingClass}>{copy.detailAnnotationsHeading}</h4>
			{#if annotationEntries.length === 0}
				<p class={mutedClass}>{copy.detailNoAnnotations}</p>
			{:else}
				<table class="w-full" data-testid="alert-detail-annotations">
					<thead class="sr-only">
						<tr>
							<th scope="col">{copy.detailNameHeader}</th>
							<th scope="col">{copy.detailValueHeader}</th>
						</tr>
					</thead>
					<tbody>
						{#each annotationEntries as [name, value] (name)}
							<tr class="border-b border-gray-100 last:border-0 dark:border-gray-800">
								<th scope="row" class={keyCellClass}>{name}</th>
								<td class={valueCellClass}>{value}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>

		<div class="space-y-1">
			<h4 class={headingClass}>{copy.detailLinksHeading}</h4>
			{#if alert.links.length === 0}
				<p class={mutedClass}>{copy.detailNoLinks}</p>
			{:else}
				<ul class="space-y-1" data-testid="alert-detail-links">
					{#each alert.links as link, index (`${index}-${link.href}`)}
						<li>
							{#if link.safe}
								<a
									class="text-sm text-blue-600 hover:underline dark:text-blue-400"
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
								>
									{link.label}
								</a>
							{:else}
								<!-- Inert by construction: no anchor, no href in the DOM. -->
								<span
									class="text-sm text-gray-400 dark:text-gray-500"
									title={copy.blockedLinkTitle}
									data-testid="alert-ops-blocked-link"
								>
									{link.label}
								</span>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</section>
