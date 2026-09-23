<!--
	The fields of one tenant-written bot config, for the host's own form.

	No form, no buttons: the host wraps these in its form and puts Cancel and
	Save wherever its layout says commands go. Field names are fixed (`name`,
	`body`, `enabled`, `botIds`) so a host's action reads the same shape
	everywhere. `draft` is bindable, so the host sees edits as they happen.
-->
<script lang="ts">
	import { Checkbox, Input, Label, Textarea, Toggle } from 'flowbite-svelte';
	import type { BotConfigDraft, BotOption } from './types';

	let {
		draft = $bindable(),
		bots,
		maxBodyChars = 4000,
		maxNameChars = 120,
		disabled = false,
		idPrefix = 'bot-config'
	}: {
		draft: BotConfigDraft;
		bots: BotOption[];
		maxBodyChars?: number;
		maxNameChars?: number;
		disabled?: boolean;
		idPrefix?: string;
	} = $props();

	const remaining = $derived(maxBodyChars - draft.body.length);

	function toggleBot(id: string, on: boolean) {
		draft.botIds = on ? [...new Set([...draft.botIds, id])] : draft.botIds.filter((b) => b !== id);
	}
</script>

<div class="space-y-4" data-bot-config-fields>
	<div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
		<div>
			<Label for={`${idPrefix}-name`} class="mb-1 text-xs">Name</Label>
			<Input
				id={`${idPrefix}-name`}
				name="name"
				required
				maxlength={maxNameChars}
				bind:value={draft.name}
				{disabled}
			/>
		</div>
		<label class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
			<Toggle name="enabled" value="true" bind:checked={draft.enabled} {disabled} />
			Enabled
		</label>
	</div>
	<div>
		<Label for={`${idPrefix}-body`} class="mb-1 flex justify-between text-xs">
			<span>Instructions</span>
			<span class={remaining < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}>{remaining} characters left</span>
		</Label>
		<Textarea id={`${idPrefix}-body`} name="body" rows={10} bind:value={draft.body} {disabled} />
	</div>
	<fieldset>
		<legend class="mb-1 text-xs font-medium text-gray-900 dark:text-gray-300">Applies to</legend>
		<div class="flex flex-wrap gap-4">
			{#each bots as bot (bot.id)}
				<Checkbox
					name="botIds"
					value={bot.id}
					checked={draft.botIds.includes(bot.id)}
					on:change={(e) => toggleBot(bot.id, (e.currentTarget as HTMLInputElement).checked)}
					{disabled}>{bot.name}</Checkbox
				>
			{/each}
		</div>
	</fieldset>
</div>
