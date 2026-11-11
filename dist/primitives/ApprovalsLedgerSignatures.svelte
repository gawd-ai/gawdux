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
    list any set of signatures through it on its own. It never scrolls on its
    own and never breaks a moment inside itself: the moment is a run that does
    not wrap, an address breaks anywhere, and below 32rem of its own width
    (five columns and a whole moment need about 26rem) each signature reads as
    one block, every fact under its column's name, a reason not given left
    out. So it reads inside the one scroller of the page that holds it.
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
	<div class="ledger-signatures" data-signatures-frame>
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
						class="border-t border-gray-200 align-top dark:border-gray-700"
						data-signature-meaning={signature.meaning}
					>
						<td
							data-label="Meaning"
							class="py-1.5 pr-3 font-medium {meaningTone[signature.meaning]}"
							>{signature.meaning}</td
						>
						<td data-label="Signed by" class="py-1.5 pr-3 text-gray-900 dark:text-gray-100">
							<div>
								{signature.signerName}
								<span
									class="block text-[11px] text-gray-500 [overflow-wrap:anywhere] dark:text-gray-400"
									>{signature.signerEmail}</span
								>
							</div>
						</td>
						<td data-label="Signed at" class="py-1.5 pr-3 text-gray-700 dark:text-gray-300"
							><span class="whitespace-nowrap" data-signature-at
								>{signedAt(signature.signedAt)}</span
							></td
						>
						<td
							data-label="Reason"
							data-empty={signature.reason ? undefined : ''}
							class="py-1.5 pr-3 text-gray-700 dark:text-gray-300">{signature.reason ?? ''}</td
						>
						{#if integrity}
							<td data-label="Integrity" class="py-1.5">
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

<style>
	.ledger-signatures {
		container-type: inline-size;
		width: 100%;
	}
	@container (max-width: 32rem) {
		.ledger-signatures thead {
			display: none;
		}
		.ledger-signatures table,
		.ledger-signatures tbody,
		.ledger-signatures tr {
			display: block;
		}
		.ledger-signatures tr {
			padding: 0.375rem 0;
		}
		.ledger-signatures td {
			display: grid;
			grid-template-columns: 5.5rem minmax(0, 1fr);
			column-gap: 0.75rem;
			padding: 0.125rem 0;
		}
		.ledger-signatures td::before {
			content: attr(data-label);
			font-size: 11px;
			font-weight: 600;
			letter-spacing: 0.025em;
			text-transform: uppercase;
			color: rgb(107 114 128);
		}
		:global(.dark) .ledger-signatures td::before {
			color: rgb(156 163 175);
		}
		.ledger-signatures td[data-empty] {
			display: none;
		}
	}
</style>
