<!--
    The approvals ledger: one line per role of the workflow,
    "Quality · Jane Roe (jane@site) · Approved · 2026-10-21 14:03:11 EDT", or
    the role and why it is not signed yet. Under the rows: the integrity
    sentence, what the version was approved with, and a disclosure opening
    every signature, withdrawn ones kept. The host composes every word; this
    draws them, each moment at the zone it is given, named.
-->
<script lang="ts">
	import { formatAuditDateTimeText } from '../utils/temporal';
	import ApprovalsLedgerSignatures from './ApprovalsLedgerSignatures.svelte';
	import { ledgerRowText, type LedgerRow, type LedgerView } from './approvals-ledger';

	let {
		ledger,
		timeZone
	}: {
		ledger: LedgerView;
		/** IANA zone: every moment is shown there, zone named. */
		timeZone: string;
	} = $props();

	function stamp(iso: string): string {
		return formatAuditDateTimeText(iso, { timeZone }) || iso;
	}

	function tone(row: LedgerRow): string {
		if (row.state === 'signed')
			return row.integrity === 'changed'
				? 'text-red-700 dark:text-red-300'
				: 'text-gray-900 dark:text-gray-100';
		if (row.state === 'awaiting' || row.state === 'sent') return 'text-blue-700 dark:text-blue-300';
		return 'text-gray-500 dark:text-gray-400';
	}
</script>

<div class="space-y-2" data-approvals-ledger>
	<p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
		{ledger.title}
	</p>
	{#if ledger.rows.length === 0}
		<p class="text-xs text-gray-500 dark:text-gray-400">No approval steps.</p>
	{:else}
		<ul class="space-y-1 text-sm">
			{#each ledger.rows as row (row.stepCode)}
				<li data-ledger-row data-step={row.stepCode} data-state={row.state} class={tone(row)}>
					{ledgerRowText(row, stamp)}
					{#if row.state === 'signed' && row.reason}
						<span class="block text-xs italic text-gray-500 dark:text-gray-400">{row.reason}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if ledger.integritySentence}
		<p
			class="text-xs {ledger.verified === false
				? 'font-medium text-red-700 dark:text-red-300'
				: 'text-gray-600 dark:text-gray-300'}"
			data-ledger-integrity
		>
			{ledger.integritySentence}
		</p>
	{/if}
	{#if ledger.approvedWith}
		<p class="text-xs text-gray-600 dark:text-gray-300">
			Approved with <a
				href={ledger.approvedWith.href}
				class="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
				>{ledger.approvedWith.title}</a
			>
		</p>
	{/if}
	{#if ledger.signatures.length > 0}
		<details class="text-xs">
			<summary class="cursor-pointer text-gray-600 dark:text-gray-300">
				All signatures ({ledger.signatures.length})
			</summary>
			<div class="mt-2">
				<ApprovalsLedgerSignatures signatures={ledger.signatures} {timeZone} />
			</div>
		</details>
	{/if}
</div>
