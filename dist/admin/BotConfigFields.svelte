<!--
	The fields of one tenant-written bot config, for the host's own form.

	No form, no buttons: the host wraps these in its form and puts Cancel and
	Save wherever its layout says commands go. Field names are fixed (`name`,
	`body`, `enabled`, `botIds`) so a host's action reads the same shape
	everywhere. `draft` is bindable, so the host sees edits as they happen.
-->
<script lang="ts">
	import BotConfigContentFields from './BotConfigContentFields.svelte';
	import BotConfigAssignments from './BotConfigAssignments.svelte';
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

</script>

<div class="space-y-4" data-bot-config-fields>
	<BotConfigContentFields
		bind:name={draft.name}
		bind:body={draft.body}
		bind:enabled={draft.enabled}
		{maxBodyChars}
		{maxNameChars}
		{disabled}
		{idPrefix}
	/>
	<fieldset>
		<legend class="mb-1 text-xs font-medium text-gray-900 dark:text-gray-300">Applies to</legend>
		<BotConfigAssignments bind:botIds={draft.botIds} {bots} {disabled} />
	</fieldset>
</div>
