<script lang="ts">
	import BotConfigFields from '../../src/lib/admin/BotConfigFields.svelte';
	import BotConfigContentFields from '../../src/lib/admin/BotConfigContentFields.svelte';
	import BotConfigAssignments from '../../src/lib/admin/BotConfigAssignments.svelte';
	import type { BotConfigDraft } from '../../src/lib/admin/types';

	let { mode = 'composite', disabled = false }: { mode?: 'composite' | 'leaves'; disabled?: boolean } = $props();
	let draft = $state<BotConfigDraft>({ name: 'Initial', body: 'Initial', enabled: true, botIds: ['ops'] });
	let nameError = $state<string | null>('A name is required.');
	const bots = [{ id: 'ops', name: 'Operations' }, { id: 'review', name: 'Review' }];
</script>

{#if mode === 'composite'}
	<BotConfigFields bind:draft {bots} {disabled} />
{:else}
	<div class="space-y-3">
		<BotConfigContentFields
			bind:name={draft.name}
			bind:body={draft.body}
			bind:enabled={draft.enabled}
			{disabled}
			{nameError}
			idPrefix="custom"
			maxBodyChars={40}
			maxNameChars={30}
			bodyRows={18}
			bodyClass="long-editor min-h-[22rem]"
			bodyLabel="Context"
			enabledLabel={draft.enabled ? 'On' : 'Off'}
			enabledAriaLabel="Config enabled"
			namePlaceholder="Organization vocabulary"
			bodyPlaceholder="Context goes here"
		>
			{#snippet bodyCounter(used, maximum)}
				<span data-host-counter>{used} of {maximum}</span>
			{/snippet}
			{#snippet bodyHelp()}
				<p data-host-help>Plain text remains exactly as entered.</p>
			{/snippet}
		</BotConfigContentFields>
	</div>
	<BotConfigAssignments
		bind:botIds={draft.botIds}
		{bots}
		{disabled}
		class="grid grid-cols-2"
		optionClass="assignment-choice"
	>
		{#snippet optionLabel(bot)}
			<span data-host-option={bot.id}>{bot.name} / Agent</span>
		{/snippet}
	</BotConfigAssignments>
	<button type="button" onclick={() => (nameError = null)}>Clear validation</button>
	<button type="button" onclick={() => (draft.botIds = bots.map((bot) => bot.id))}>Assign all</button>
{/if}

<button type="button" onclick={() => (draft = { name: 'Replacement', body: 'Replaced', enabled: false, botIds: ['review'] })}>
	Replace working copy
</button>
<output data-working-copy>{JSON.stringify(draft)}</output>
