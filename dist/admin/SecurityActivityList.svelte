<!--
	A person's sign-in and account activity, newest first, as a card.

	The host supplies the rows already labelled and formats time through
	`formatTime`, so the block carries no clock, zone or vocabulary of its own.
-->
<script lang="ts">
	import { Badge } from 'flowbite-svelte';
	import CardContainer from '../primitives/CardContainer.svelte';
	import type { SecurityActivityEvent } from './types';

	let {
		events,
		title = 'Sign-in activity',
		emptyText = 'No sign-in activity recorded.',
		formatTime = (iso: string) => iso
	}: {
		events: SecurityActivityEvent[];
		title?: string;
		emptyText?: string;
		formatTime?: (iso: string) => string;
	} = $props();

	const toneColor = { success: 'green', failure: 'red', neutral: 'dark' } as const;
</script>

<CardContainer {title}>
	<span slot="header" class="text-[11px] text-gray-500 dark:text-gray-400">{events.length}</span>
	<svelte:fragment slot="content">
		{#if events.length === 0}
			<div class="py-6 text-center text-sm text-gray-400">{emptyText}</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full text-sm" data-security-activity>
					<thead>
						<tr
							class="border-b border-gray-200 text-left text-[11px] uppercase text-gray-400 dark:border-gray-700"
						>
							<th class="py-2 pr-3 font-semibold">When</th>
							<th class="py-2 pr-3 font-semibold">Event</th>
							<th class="py-2 pr-3 font-semibold">Result</th>
							<th class="py-2 pr-3 font-semibold">Detail</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-gray-800">
						{#each events as event (event.id)}
							<tr>
								<td class="telemetry-readout whitespace-nowrap py-2 pr-3 text-gray-500 dark:text-gray-400"
									>{formatTime(event.at)}</td
								>
								<td class="py-2 pr-3 text-gray-900 dark:text-white">{event.label}</td>
								<td class="py-2 pr-3"><Badge color={toneColor[event.tone]}>{event.result}</Badge></td>
								<td class="truncate py-2 pr-3 text-gray-500 dark:text-gray-400" title={event.detail ?? ''}
									>{event.detail ?? ''}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</svelte:fragment>
</CardContainer>
