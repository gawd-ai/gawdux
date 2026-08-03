<!-- Silence inspection, read-only by default. Mutation is OPT-IN: unless the
     host both grants `canMutate` AND supplies `onexpire`, the table renders
     ZERO controls — a decorative control that cannot work is never shipped.
     When gated on, the Expire control emits INTENT ONLY: no dialog, no
     request, no optimistic edit. The host confirms (ConfirmationCommandSurface)
     and performs the call, feeding progress back through `mutation`.
     Uses the responsive-card-table pattern for narrow viewports. -->
<script lang="ts">
	import StatusBadge from '../primitives/StatusBadge.svelte';
	import {
		canExpireAlertOpsSilence,
		formatAlertOpsTimestamp,
		silenceStateBadgeColor,
		silenceStateLabel
	} from './states';
	import {
		formatAlertOpsTemplate,
		resolveAlertOpsCopy,
		type AlertOpsCopy,
		type AlertOpsMutationState,
		type AlertOpsSilence
	} from './types';

	let {
		silences,
		copy: copyOverrides,
		canMutate = false,
		onexpire,
		mutation
	}: {
		silences: AlertOpsSilence[];
		copy?: Partial<AlertOpsCopy>;
		/** Opt-in: the host authorized silence expiry for this viewer. */
		canMutate?: boolean;
		/** Intent only — the host confirms, then performs the expiry. */
		onexpire?: (silenceId: string) => void;
		/** Host-owned mutation lifecycle; the table keeps no state of its own. */
		mutation?: AlertOpsMutationState;
	} = $props();

	const copy = $derived(resolveAlertOpsCopy(copyOverrides));
	// Double gate: permission AND a handler. Either one missing renders the
	// read-only table, byte-for-byte as before.
	const mutable = $derived(canMutate === true && typeof onexpire === 'function');
	const columnCount = $derived(mutable ? 6 : 5);
	// One mutation at a time: while the host works, every row is inert.
	const pending = $derived(mutation?.state === 'pending');

	function matcherSummary(silence: AlertOpsSilence): string {
		return silence.matchers
			.map((matcher) => `${matcher.name}${matcher.isRegex ? '=~' : '='}${matcher.value}`)
			.join(', ');
	}

	function expireAccessibleLabel(silence: AlertOpsSilence): string {
		return formatAlertOpsTemplate(copy.expireSilenceAccessibleLabel, {
			matchers: matcherSummary(silence)
		});
	}

	function isBusy(silenceId: string): boolean {
		if (!pending) return false;
		return mutation?.silenceId === undefined || mutation.silenceId === silenceId;
	}

	function requestExpire(silenceId: string): void {
		if (!mutable || pending) return;
		onexpire?.(silenceId);
	}
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
				{#if mutable}
					<th scope="col" class="px-4 py-2.5">{copy.silenceColumnActions}</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#if silences.length === 0}
				<tr>
					<td colspan={columnCount} class="px-4 py-8 text-center">
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
						{#if mutable}
							<td data-label={copy.silenceColumnActions} class="whitespace-nowrap px-4 py-2.5">
								{#if canExpireAlertOpsSilence(silence.state)}
									{@const busy = isBusy(silence.id)}
									<button
										type="button"
										class="inline-flex min-h-9 items-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
										data-testid="silence-expire"
										data-silence-id={silence.id}
										aria-label={expireAccessibleLabel(silence)}
										aria-busy={busy}
										disabled={pending}
										onclick={() => requestExpire(silence.id)}
									>
										{busy ? copy.mutationPending : copy.expireSilence}
									</button>
								{:else}
									<!-- Nothing left to expire: explanatory text, never a control
									     that could not do anything. -->
									<span
										class="text-xs text-gray-400 dark:text-gray-500"
										data-testid="silence-expire-unavailable"
									>
										{copy.expireDisabledExpired}
									</span>
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>
