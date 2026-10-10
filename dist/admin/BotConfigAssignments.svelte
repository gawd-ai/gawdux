<!-- The host supplies identities and keeps aggregate assignment policy. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Checkbox } from 'flowbite-svelte';
	import type { BotOption } from './types';

	let {
		botIds = $bindable(),
		bots,
		disabled = false,
		class: layoutClass = 'flex flex-wrap gap-4',
		optionClass = '',
		optionLabel
	}: {
		botIds: string[];
		bots: BotOption[];
		disabled?: boolean;
		class?: string;
		optionClass?: string;
		optionLabel?: Snippet<[bot: BotOption]>;
	} = $props();

	function toggleBot(id: string, on: boolean) {
		botIds = on ? [...new Set([...botIds, id])] : botIds.filter((botId) => botId !== id);
	}
</script>

<div class={layoutClass} data-bot-config-assignments>
	{#each bots as bot (bot.id)}
		<div class={optionClass}>
			<Checkbox
				name="botIds"
				value={bot.id}
				checked={botIds.includes(bot.id)}
				on:change={(event) => toggleBot(bot.id, (event.currentTarget as HTMLInputElement).checked)}
				{disabled}
			>
				{#if optionLabel}
					{@render optionLabel(bot)}
				{:else}
					{bot.name}
				{/if}
			</Checkbox>
		</div>
	{/each}
</div>
