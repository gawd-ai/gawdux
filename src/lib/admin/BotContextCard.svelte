<!--
	What a tenant tells one bot: the composed block the bot reads at the
	start of every turn, byte for byte, with the parts it is made of (configs
	in order, then whatever else the product composes) and its size against
	the budget. Read-only: authoring lives where the parts are written, and
	`link` leads there with the go-to icon.

	With parts, the block itself sits behind a disclosure (the parts are the
	summary); without them it is shown in full.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import CardContainer from '../primitives/CardContainer.svelte';
	import type { BotContextPart } from './types';

	let {
		block,
		parts,
		maxChars,
		version,
		title = 'What this tenant tells it',
		link = null,
		status,
		emptyText = 'Nothing yet. The configs written for this bot appear here.'
	}: {
		/** The composed block, exactly as the bot receives it. */
		block: string;
		parts?: BotContextPart[];
		/** The tenant's share of the budget, in characters. */
		maxChars?: number;
		/** A content hash, shown for verification. */
		version?: string | null;
		title?: string;
		/** Where the parts are written. */
		link?: { label: string; href?: string; onclick?: (event: MouseEvent) => void } | null;
		/** A delivery line (pulled, lagging, never pulled) from the host. */
		status?: Snippet;
		emptyText?: string;
	} = $props();

	const numberFormat = new Intl.NumberFormat('en-US');
	const size = $derived(
		`${numberFormat.format(block.length)}${maxChars ? ` of ${numberFormat.format(maxChars)}` : ''} characters`
	);
</script>

<CardContainer {title} {link}>
	<span slot="header" class="text-[11px] tabular-nums text-gray-500 dark:text-gray-400"
		>{size}{#if version}<span class="ml-2" title="Context version (content hash)">v{version}</span>{/if}</span
	>
	<div slot="content" class="space-y-2" data-bot-context>
		{@render status?.()}
		{#if block === ''}
			<p class="py-3 text-center text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
		{:else if parts && parts.length > 0}
			<ul class="divide-y divide-gray-100 dark:divide-gray-800">
				{#each parts as part, index (index)}
					<li class="flex items-center justify-between gap-3 py-1.5 text-sm">
						<span class="flex min-w-0 items-center gap-2">
							<span
								class="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-300"
								>{part.kind}</span
							>
							<span class="truncate text-gray-800 dark:text-gray-200">{part.label}</span>
						</span>
						<span class="shrink-0 whitespace-nowrap text-xs tabular-nums text-gray-500 dark:text-gray-400"
							>{numberFormat.format(part.chars)} characters</span
						>
					</li>
				{/each}
			</ul>
			<details class="group">
				<summary class="cursor-pointer select-none text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>Composed text</summary
				>
				<pre
					class="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-200">{block}</pre>
			</details>
		{:else}
			<pre
				class="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-mono text-[11px] leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-200">{block}</pre>
		{/if}
	</div>
</CardContainer>
