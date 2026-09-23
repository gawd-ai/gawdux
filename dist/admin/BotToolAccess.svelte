<!--
	Which tools one bot may use, grouped by area, each with a switch.

	A switch is an INTENT: the host writes the change and hands the new state
	back, so a switch never shows a state the server has not confirmed.
	Controls render only when the host grants `canEdit` and supplies
	`ontoggle`; otherwise the list is read-only.
-->
<script lang="ts">
	import { Badge, Toggle } from 'flowbite-svelte';
	import CardContainer from '../primitives/CardContainer.svelte';
	import type { BotToolGroup } from './types';

	let {
		groups,
		canEdit = false,
		busy = false,
		ontoggle,
		changesLabel = 'writes'
	}: {
		groups: BotToolGroup[];
		canEdit?: boolean;
		busy?: boolean;
		ontoggle?: (toolId: string, allowed: boolean) => void;
		/** The badge on a tool that changes something rather than reading. */
		changesLabel?: string;
	} = $props();

	const editable = $derived(canEdit && typeof ontoggle === 'function');
</script>

<div class="grid grid-cols-1 gap-3 xl:grid-cols-2" data-bot-tool-access>
	{#each groups as group (group.id)}
		<CardContainer title={group.label}>
			<span slot="header" class="text-[11px] text-gray-500 dark:text-gray-400">
				{group.tools.filter((t) => t.allowed).length} of {group.tools.length}
			</span>
			<svelte:fragment slot="content">
				<div class="divide-y divide-gray-100 dark:divide-gray-800">
					{#each group.tools as tool (tool.id)}
						<div class="flex items-center justify-between gap-3 py-2" data-tool={tool.id}>
							<div class="min-w-0">
								<div class="flex items-center gap-2">
									<span class="truncate text-sm font-medium text-gray-900 dark:text-white">{tool.label}</span>
									{#if tool.mutating}<Badge color="yellow" class="shrink-0 whitespace-nowrap">{changesLabel}</Badge>{/if}
								</div>
								{#if tool.description}
									<div class="truncate text-[11px] text-gray-500 dark:text-gray-400" title={tool.description}>
										{tool.description}
									</div>
								{/if}
							</div>
							{#if editable}
								<button
									type="button"
									class="flex shrink-0 items-center"
									disabled={busy}
									aria-label={tool.allowed ? `Turn off ${tool.label}` : `Turn on ${tool.label}`}
									onclick={() => ontoggle?.(tool.id, !tool.allowed)}
								>
									<Toggle size="small" checked={tool.allowed} tabindex={-1} disabled={busy} />
								</button>
							{:else}
								<Badge color={tool.allowed ? 'green' : 'dark'}>{tool.allowed ? 'On' : 'Off'}</Badge>
							{/if}
						</div>
					{/each}
				</div>
			</svelte:fragment>
		</CardContainer>
	{/each}
</div>
