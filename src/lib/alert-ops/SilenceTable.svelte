<!-- Read-only silence inspection. Deliberately renders ZERO controls:
     silence mutation is deferred platform-side, and decorative controls
     that cannot safely work are not shipped. Uses the responsive-card-table
     pattern for narrow viewports. -->
<script lang="ts">
	import StatusBadge from '../primitives/StatusBadge.svelte';
	import { formatAlertOpsTimestamp, silenceStateBadgeColor, silenceStateLabel } from './states';
	import { resolveAlertOpsCopy, type AlertOpsCopy, type AlertOpsSilence } from './types';

	let {
		silences,
		copy: copyOverrides
	}: {
		silences: AlertOpsSilence[];
		copy?: Partial<AlertOpsCopy>;
	} = $props();

	const copy = $derived(resolveAlertOpsCopy(copyOverrides));
</script>

<div class="responsive-card-table overflow-x-auto" data-testid="silence-table">
	<table class="w-full text-left text-sm text-gray-600 dark:text-gray-300">
		<caption class="sr-only">{copy.silencesTableCaption}</caption>
		<thead
			class="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-700 dark:text-gray-400"
		>
			<tr>
				<th scope="col" class="px-4 py-2.5">{copy.silenceColumnState}</th>
				<th scope="col" class="px-4 py-2.5">{copy.silenceColumnMatchers}</th>
				<th scope="col" class="px-4 py-2.5">{copy.silenceColumnWindow}</th>
				<th scope="col" class="px-4 py-2.5">{copy.silenceColumnCreatedBy}</th>
				<th scope="col" class="px-4 py-2.5">{copy.silenceColumnComment}</th>
			</tr>
		</thead>
		<tbody>
			{#if silences.length === 0}
				<tr>
					<td colspan="5" class="px-4 py-8 text-center">
						<span class="text-gray-500 dark:text-gray-400">{copy.silencesEmptyTitle}</span>
						<span class="mt-1 block text-sm text-gray-400 dark:text-gray-500">
							{copy.silencesEmptyMessage}
						</span>
					</td>
				</tr>
			{:else}
				{#each silences as silence (silence.id)}
					<tr
						class="border-b border-gray-100 last:border-0 dark:border-gray-800"
						data-testid="silence-row"
					>
						<td data-label={copy.silenceColumnState} class="whitespace-nowrap px-4 py-2.5">
							<StatusBadge
								color={silenceStateBadgeColor(silence.state)}
								label={silenceStateLabel(silence.state, copy)}
							/>
						</td>
						<td data-label={copy.silenceColumnMatchers} class="px-4 py-2.5">
							<ul class="space-y-0.5">
								{#each silence.matchers as matcher, index (`${index}-${matcher.name}`)}
									<li class="flex flex-wrap items-center gap-1.5">
										<code class="break-all text-xs">
											{matcher.name}{matcher.isRegex ? '=~' : '='}{matcher.value}
										</code>
										{#if matcher.isRegex}
											<span
												class="rounded bg-gray-100 px-1 py-0.5 text-[10px] font-medium uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400"
											>
												{copy.regexMarkerLabel}
											</span>
										{/if}
									</li>
								{/each}
							</ul>
						</td>
						<td data-label={copy.silenceColumnWindow} class="whitespace-nowrap px-4 py-2.5">
							<time datetime={silence.startsAt} title={silence.startsAt}>
								{formatAlertOpsTimestamp(silence.startsAt)}
							</time>
							<span aria-hidden="true">→</span>
							<time datetime={silence.endsAt} title={silence.endsAt}>
								{formatAlertOpsTimestamp(silence.endsAt)}
							</time>
						</td>
						<td data-label={copy.silenceColumnCreatedBy} class="whitespace-nowrap px-4 py-2.5">
							{silence.createdBy}
						</td>
						<td data-label={copy.silenceColumnComment} class="min-w-48 px-4 py-2.5">
							<span class="block max-w-96" style="overflow-wrap: anywhere;">{silence.comment}</span>
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
