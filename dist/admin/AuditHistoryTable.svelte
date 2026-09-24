<!--
	An audit history that fits its container.

	Every row is one summary line that never widens the table: the layout is
	fixed (each column has its share and keeps it), the comment is clamped to
	two lines and the user and record are truncated. A row opens its full
	entry beneath it, one at a time: every labelled fact, the whole comment,
	and each changed field with its old and new value. There is no horizontal
	scroller to hunt for at the bottom of a long page.

	Below 720px of container width the rows become stacked cards that open the
	same way. The host labels everything (`AuditHistoryRow`) and formats time
	through `formatTime`; the block carries no clock, zone or vocabulary.
-->
<script lang="ts">
	import { Badge } from 'flowbite-svelte';
	import { ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons';
	import type { AuditHistoryRow } from './types';

	let {
		rows,
		showModule = true,
		emptyText = 'No history recorded.',
		formatTime = (iso: string) => ({ date: iso.slice(0, 10), time: iso.slice(11, 19) })
	}: {
		rows: AuditHistoryRow[];
		/** A column for the area; off where every row belongs to one record. */
		showModule?: boolean;
		emptyText?: string;
		formatTime?: (iso: string) => { date: string; time: string };
	} = $props();

	let openId = $state<string | null>(null);
	const toggle = (id: string) => (openId = openId === id ? null : id);

	/** A click on a link or button inside the row is its own action. */
	function rowClick(event: MouseEvent, id: string) {
		if ((event.target as HTMLElement | null)?.closest('a, button, input, select, textarea')) return;
		if (window.getSelection()?.toString()) return;
		toggle(id);
	}

	const columns = $derived(showModule ? 6 : 5);
</script>

{#snippet detail(row: AuditHistoryRow)}
	<div class="audit-detail" id={`audit-detail-${row.id}`}>
		<dl class="audit-facts">
			<div><dt>User</dt><dd>{row.user || '—'}</dd></div>
			{#if row.record}<div><dt>Record</dt><dd>{row.record}</dd></div>{/if}
			{#each row.facts ?? [] as fact (fact.label)}
				<div><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
			{/each}
			<div class="audit-facts-wide"><dt>Comment</dt><dd>{row.comment || '—'}</dd></div>
		</dl>
		{#if row.changes.length > 0}
			<div class="audit-changes" aria-label="Changes">
				{#each row.changes as change, i (change.field || i)}
					<div class="audit-change-field">{change.label ?? change.field}</div>
					<div class="audit-change-values">
						{#if change.oldValue}<span class="audit-old">{change.oldValue}</span>{/if}
						{#if change.oldValue && change.newValue}<span class="text-gray-400">→</span>{/if}
						{#if change.newValue}<span class="audit-new">{change.newValue}</span>
						{:else if change.oldValue}<span class="text-gray-400">cleared</span>{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/snippet}

{#snippet when(row: AuditHistoryRow)}
	{#if row.at}
		{@const stamp = formatTime(row.at)}
		<div class="telemetry-readout text-sm text-gray-900 dark:text-white">{stamp.date}</div>
		<div class="telemetry-readout text-xs text-gray-500 dark:text-gray-400">{stamp.time}</div>
	{:else}
		<span class="text-gray-400">—</span>
	{/if}
{/snippet}

<div class="audit-history" data-audit-history>
	{#if rows.length === 0}
		<div class="py-10 text-center text-sm text-gray-400 dark:text-gray-500">{emptyText}</div>
	{:else}
		<table class="audit-table table-fixed" style="table-layout: fixed">
			<colgroup>
				<col style="width: 8.5rem" />
				{#if showModule}<col style="width: 10rem" />{/if}
				<col style="width: 11rem" />
				<col />
				<col style="width: 14rem" />
				<col style="width: 3rem" />
			</colgroup>
			<thead>
				<tr>
					<th>When</th>
					{#if showModule}<th>Module</th>{/if}
					<th>Action</th>
					<th>Comment</th>
					<th>User / record</th>
					<th><span class="sr-only">Details</span></th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.id)}
					{@const open = openId === row.id}
					<tr class="audit-row" aria-selected={open} onclick={(e) => rowClick(e, row.id)}>
						<td>{@render when(row)}</td>
						{#if showModule}
							<td>
								{#if row.module}
									<Badge color={row.module.tone ?? 'dark'} class="max-w-full truncate text-xs">{row.module.label}</Badge>
								{/if}
							</td>
						{/if}
						<td><Badge color={row.actionTone ?? 'blue'} class="max-w-full whitespace-normal text-left text-xs">{row.action}</Badge></td>
						<td>
							<div class="line-clamp-2 break-words text-sm text-gray-900 dark:text-white" title={row.comment}>
								{row.comment || '—'}
							</div>
						</td>
						<td>
							<div class="truncate font-medium text-gray-900 dark:text-white" title={row.user ?? ''}>{row.user || '—'}</div>
							{#if row.record && row.record !== row.user}
								<div class="truncate text-xs text-gray-500 dark:text-gray-400" title={row.record}>{row.record}</div>
							{/if}
						</td>
						<td class="text-right">
							<button
								type="button"
								class="audit-toggle"
								aria-label={open ? 'Hide details' : 'Show details'}
								aria-expanded={open}
								aria-controls={`audit-detail-${row.id}`}
								onclick={() => toggle(row.id)}
							>
								{#if open}<ChevronUpOutline class="h-5 w-5" />{:else}<ChevronDownOutline class="h-5 w-5" />{/if}
							</button>
						</td>
					</tr>
					{#if open}
						<tr class="audit-detail-row"><td colspan={columns}>{@render detail(row)}</td></tr>
					{/if}
				{/each}
			</tbody>
		</table>

		<ul class="audit-cards">
			{#each rows as row (row.id)}
				{@const open = openId === row.id}
				<li class="audit-card" data-open={open}>
					<button type="button" class="audit-card-head" aria-expanded={open} onclick={() => toggle(row.id)}>
						<div class="flex items-center justify-between gap-2">
							<Badge color={row.actionTone ?? 'blue'} class="text-xs">{row.action}</Badge>
							{#if row.at}
								{@const stamp = formatTime(row.at)}
								<span class="telemetry-readout text-xs text-gray-500 dark:text-gray-400">{stamp.date} {stamp.time}</span>
							{/if}
						</div>
						<div class="mt-1 line-clamp-2 text-left text-sm text-gray-900 dark:text-white">{row.comment || '—'}</div>
						<div class="mt-0.5 truncate text-left text-xs text-gray-500 dark:text-gray-400">
							{row.user || '—'}{#if showModule && row.module}{' · '}{row.module.label}{/if}
						</div>
					</button>
					{#if open}{@render detail(row)}{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.audit-history {
		container-type: inline-size;
		width: 100%;
	}
	.audit-table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		font-size: 0.875rem;
	}
	.audit-table thead th {
		position: sticky;
		top: 0;
		z-index: 1;
		padding: 0.6rem 0.75rem;
		text-align: left;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: rgb(107 114 128);
		background: rgb(249 250 251);
		border-bottom: 1px solid rgb(229 231 235);
	}
	:global(.dark) .audit-table thead th {
		color: rgb(156 163 175);
		background: rgb(31 41 55);
		border-bottom-color: rgb(55 65 81);
	}
	.audit-table td {
		padding: 0.55rem 0.75rem;
		vertical-align: top;
		overflow: hidden;
		border-bottom: 1px solid rgb(243 244 246);
	}
	:global(.dark) .audit-table td {
		border-bottom-color: rgb(55 65 81 / 0.6);
	}
	.audit-row {
		cursor: pointer;
	}
	.audit-row:hover {
		background: rgb(249 250 251);
	}
	:global(.dark) .audit-row:hover {
		background: rgb(55 65 81 / 0.35);
	}
	.audit-row[aria-selected='true'],
	.audit-card[data-open="true"] {
		background: rgb(239 246 255);
	}
	:global(.dark) .audit-row[aria-selected='true'],
	:global(.dark) .audit-card[data-open="true"] {
		background: rgb(30 58 138 / 0.25);
	}
	.audit-detail-row td {
		padding: 0;
	}
	.audit-toggle {
		display: inline-flex;
		height: 2rem;
		width: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 0.375rem;
		color: rgb(107 114 128);
	}
	.audit-toggle:hover {
		background: rgb(243 244 246);
		color: rgb(37 99 235);
	}
	:global(.dark) .audit-toggle:hover {
		background: rgb(55 65 81);
		color: rgb(96 165 250);
	}
	.audit-detail {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		background: rgb(248 250 252);
		border-left: 3px solid rgb(37 99 235);
	}
	:global(.dark) .audit-detail {
		background: rgb(15 23 42 / 0.6);
		border-left-color: rgb(59 130 246);
	}
	.audit-facts {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: 0.6rem 2rem;
		margin: 0;
	}
	.audit-facts > div {
		min-width: 0;
	}
	.audit-facts-wide {
		grid-column: 1 / -1;
	}
	.audit-facts dt {
		font-size: 0.62rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: rgb(100 116 139);
	}
	.audit-facts dd {
		margin: 0.1rem 0 0;
		font-size: 0.85rem;
		color: rgb(30 41 59);
		overflow-wrap: anywhere;
	}
	:global(.dark) .audit-facts dd {
		color: rgb(226 232 240);
	}
	.audit-changes {
		display: grid;
		grid-template-columns: minmax(8rem, max-content) minmax(0, 1fr);
		gap: 0.3rem 1rem;
		align-items: baseline;
		max-height: 12rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		font-size: 0.75rem;
	}
	.audit-change-field {
		font-weight: 500;
		color: rgb(100 116 139);
		overflow-wrap: anywhere;
	}
	.audit-change-values {
		overflow-wrap: anywhere;
	}
	.audit-old {
		color: rgb(220 38 38);
		text-decoration: line-through;
	}
	.audit-new {
		font-weight: 500;
		color: rgb(21 128 61);
	}
	:global(.dark) .audit-old {
		color: rgb(248 113 113);
	}
	:global(.dark) .audit-new {
		color: rgb(74 222 128);
	}
	.audit-cards {
		display: none;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.audit-card {
		border-bottom: 1px solid rgb(229 231 235);
	}
	:global(.dark) .audit-card {
		border-bottom-color: rgb(55 65 81);
	}
	.audit-card-head {
		display: block;
		width: 100%;
		padding: 0.6rem 0.75rem;
	}
	@container (max-width: 720px) {
		.audit-table {
			display: none;
		}
		.audit-cards {
			display: block;
		}
	}
</style>
