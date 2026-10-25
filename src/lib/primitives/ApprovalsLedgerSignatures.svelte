<!--
    The approvals ledger's table of electronic signatures: who
    signed, with what meaning, when (at the zone given, named), the reason, and
    whether the content still matches what they signed. One row per
    signature; a withdrawn signature keeps its row and reads Withdrawn, so the
    list reads as a history and never loses a line. A withdrawal is what lets
    the record change, so a change after it is expected: a signature no longer
    standing never reads as broken, and only a standing signature whose
    content changed reads Content changed since signature in red. A signature
    whose content cannot be checked (`intact: null`) reads Not verified, never
    Intact. A surface that does not compare the content with what was signed
    says nothing about it: `integrity={false}` drops the column rather than
    show a check that never ran. The ledger's disclosure opens it; a host may also
    list any set of signatures through it on its own.
-->
<script lang="ts">
	import { formatAuditDateTimeText } from '../utils/temporal';
	import type { LedgerSignature } from './approvals-ledger';

	let {
		signatures,
		timeZone,
		emptyText = 'No signatures yet.',
		integrity = true
	}: {
		signatures: LedgerSignature[];
		/** The zone every moment is shown in, named. */
		timeZone: string;
		emptyText?: string;
		/** False where the content is not compared with what was signed. */
		integrity?: boolean;
	} = $props();

	const meaningTone: Record<LedgerSignature['meaning'], string> = {
		Executed: 'text-blue-700 dark:text-blue-300',
		Reviewed: 'text-blue-700 dark:text-blue-300',
		Approved: 'text-emerald-700 dark:text-emerald-300',
		Withdrawn: 'text-gray-500 dark:text-gray-400'
	};

	function signedAt(iso: string): string {
		return formatAuditDateTimeText(iso, { timeZone }) || iso;
	}
</script>

{#if signatures.length === 0}
	<p class="text-xs text-gray-500 dark:text-gray-400">{emptyText}</p>
{:else}
	<div class="overflow-x-auto">
		<table class="w-full text-xs" data-signatures>
			<thead>
				<tr class="text-left text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
					<th class="py-1 pr-3 font-semibold">Meaning</th>
					<th class="py-1 pr-3 font-semibold">Signed by</th>
					<th class="py-1 pr-3 font-semibold">Signed at</th>
					<th class="py-1 pr-3 font-semibold">Reason</th>
					{#if integrity}
						<th class="py-1 font-semibold">Integrity</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each signatures as signature (signature.id)}
					<tr
						class="border-t border-gray-200 align-top dark:border-gray-800"
						data-signature-meaning={signature.meaning}
					>
						<td class="py-1.5 pr-3 font-medium {meaningTone[signature.meaning]}"
							>{signature.meaning}</td
						>
						<td class="py-1.5 pr-3 text-gray-900 dark:text-gray-100">
							{signature.signerName}
							<span class="block text-[11px] text-gray-500 dark:text-gray-400"
								>{signature.signerEmail}</span
							>
						</td>
						<td class="py-1.5 pr-3 whitespace-nowrap text-gray-700 dark:text-gray-300"
							>{signedAt(signature.signedAt)}</td
						>
						<td class="py-1.5 pr-3 text-gray-700 dark:text-gray-300">{signature.reason ?? ''}</td>
						{#if integrity}
							<td class="py-1.5">
								{#if !signature.standing && signature.meaning !== 'Withdrawn'}
									<span class="text-gray-500 dark:text-gray-400">Withdrawn</span>
								{:else if signature.intact === false && signature.standing}
									<span class="font-medium text-red-600 dark:text-red-400"
										>Content changed since signature</span
									>
								{:else if signature.intact === false}
									<!-- The withdrawal itself: the record was free to change after it. -->
									<span class="text-gray-500 dark:text-gray-400"
										>Content changed since signature</span
									>
								{:else if signature.intact === null}
									<span class="text-gray-500 dark:text-gray-400">Not verified</span>
								{:else}
									<span class="text-gray-500 dark:text-gray-400">Intact</span>
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
