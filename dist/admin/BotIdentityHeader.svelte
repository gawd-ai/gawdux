<!--
	Who the selected bot is, at the top of its detail pane: the avatar its
	rail row shows, the name, its role and its state as pills, and what it
	does in one line. The facts that change (usage, limits, context) live in
	the cards below it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { botInitials } from './BotRail.svelte';
	import type { BotRailItem } from './types';

	let {
		bot,
		tagline,
		meta
	}: {
		bot: BotRailItem;
		/** What it does, in one line. */
		tagline?: string | null;
		/** Extra pills or a version after the state pill. */
		meta?: Snippet;
	} = $props();
</script>

<div class="flex min-w-0 items-center gap-3" data-bot-identity>
	<span
		class={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm ${bot.color ?? 'bg-slate-500 dark:bg-slate-600'}`}
		aria-hidden="true">{botInitials(bot)}</span
	>
	<div class="min-w-0">
		<div class="flex flex-wrap items-center gap-2">
			<h3 class="truncate text-base font-semibold text-gray-900 dark:text-gray-100">{bot.name}</h3>
			{#if bot.role}
				<span
					class="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
					>{bot.role}</span
				>
			{/if}
			{#if bot.status}
				<span
					class={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
						bot.status.on
							? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
							: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
					}`}
					data-bot-status={bot.status.on ? 'on' : 'off'}>{bot.status.label}</span
				>
			{/if}
			{@render meta?.()}
		</div>
		{#if tagline}
			<p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{tagline}</p>
		{/if}
	</div>
</div>
