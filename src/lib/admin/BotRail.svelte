<!--
	The bots of a tenant as a master-detail rail: an avatar, the name, its
	role as the qualifier line, and one state (on or off) as a dot. Shared by
	every tab that picks a bot first (its details, its tools), so the rail
	reads the same wherever it appears.

	`groups` splits the rail into lanes with a rule between them; `search`
	adds a filter above it (the rail header). Selection is the host's: it
	usually rides the URL.
-->
<script module lang="ts">
	import type { BotRailItem as Item } from './types';

	/** Two letters from the name when the host gives none. */
	export function botInitials(bot: Pick<Item, 'name' | 'initials'>): string {
		if (bot.initials) return bot.initials.slice(0, 2).toUpperCase();
		const words = bot.name.trim().split(/\s+/).filter(Boolean);
		const letters = words.length > 1 ? `${words[0]![0]}${words[1]![0]}` : bot.name.slice(0, 2);
		return letters.toUpperCase();
	}
</script>

<script lang="ts">
	import RailRowButton from '../primitives/RailRowButton.svelte';
	import SearchInput from '../primitives/SearchInput.svelte';
	import type { BotRailItem } from './types';

	let {
		bots = [],
		groups,
		selected = null,
		onselect,
		search = false,
		disabled = false,
		emptyText = 'No bots.'
	}: {
		bots?: BotRailItem[];
		/** Lanes, drawn with a rule between them; overrides `bots`. */
		groups?: BotRailItem[][];
		selected?: string | null;
		onselect: (id: string) => void;
		/** A search field in the rail (worth it past a handful of bots). */
		search?: boolean;
		disabled?: boolean;
		emptyText?: string;
	} = $props();

	let query = $state('');

	const lanes = $derived.by(() => {
		const all = groups ?? [bots];
		const q = query.trim().toLowerCase();
		const match = (b: BotRailItem) =>
			!q || b.name.toLowerCase().includes(q) || (b.role ?? '').toLowerCase().includes(q);
		return all.map((lane) => lane.filter(match)).filter((lane) => lane.length > 0);
	});
	const total = $derived((groups ?? [bots]).reduce((n, lane) => n + lane.length, 0));
</script>

<div class="bot-rail" data-bot-rail>
	{#if search && total > 0}
		<div class="mb-2">
			<SearchInput bind:value={query} placeholder="Search bots" ariaLabel="Search bots" />
		</div>
	{/if}
	{#if total === 0}
		<p class="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">{emptyText}</p>
	{:else if lanes.length === 0}
		<p class="px-2 py-3 text-sm text-gray-500 dark:text-gray-400">No bots match.</p>
	{:else}
		{#each lanes as lane, laneIndex (laneIndex)}
			<div class={laneIndex === 0 ? 'space-y-1' : 'mt-2 space-y-1 border-t border-gray-200/70 pt-2 dark:border-gray-800'}>
				{#each lane as bot (bot.id)}
					<RailRowButton selected={bot.id === selected} {disabled} onclick={() => onselect(bot.id)}>
						<span
							class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold text-white ${bot.color ?? 'bg-slate-500 dark:bg-slate-600'}`}
							aria-hidden="true">{botInitials(bot)}</span
						>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{bot.name}</span>
							{#if bot.role}
								<span class="mt-0.5 block truncate text-[11px] text-gray-500 dark:text-gray-400">{bot.role}</span>
							{/if}
						</span>
						{#if bot.status}
							<span
								class={`h-2 w-2 shrink-0 rounded-full ${bot.status.on ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}
								title={bot.status.label}
								data-bot-status={bot.status.on ? 'on' : 'off'}><span class="sr-only">{bot.status.label}</span></span
							>
						{/if}
					</RailRowButton>
				{/each}
			</div>
		{/each}
	{/if}
</div>
