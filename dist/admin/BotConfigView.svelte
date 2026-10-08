<!--
	One saved tenant config, read: its name, whether it is on, the bots it
	applies to and the instructions exactly as written. The read side of an
	Edit mode; the host swaps in BotConfigFields when the operator chooses
	Edit, and the bar carries Cancel and Save.
-->
<script lang="ts">
	import CardContainer from '../primitives/CardContainer.svelte';
	import ReadonlyField from '../primitives/ReadonlyField.svelte';
	import type { BotConfigSummary, BotOption } from './types';

	let {
		config,
		bots,
		maxBodyChars
	}: {
		config: BotConfigSummary;
		bots: BotOption[];
		/** The body's budget, shown beside its length when given. */
		maxBodyChars?: number;
	} = $props();

	const appliesTo = $derived(
		config.botIds.length === 0
			? 'No bot'
			: config.botIds.map((id) => bots.find((b) => b.id === id)?.name ?? id).join(', ')
	);
	const numberFormat = new Intl.NumberFormat('en-US');
</script>

<div class="space-y-3" data-bot-config-view>
	<CardContainer title="Config">
		<svelte:fragment slot="content">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<ReadonlyField label="Name" value={config.name} />
				<ReadonlyField label="State" value={config.enabled ? 'On' : 'Off'} />
				<ReadonlyField label="Applies to" value={appliesTo} />
			</div>
		</svelte:fragment>
	</CardContainer>
	<CardContainer title="Instructions">
		<span slot="header" class="text-[11px] tabular-nums text-gray-500 dark:text-gray-400"
			>{numberFormat.format(config.body.length)}{maxBodyChars ? ` of ${numberFormat.format(maxBodyChars)}` : ''} characters</span
		>
		<svelte:fragment slot="content">
			{#if config.body}
				<pre
					class="max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800 dark:bg-gray-900 dark:text-gray-200">{config.body}</pre>
			{:else}
				<p class="py-3 text-center text-sm text-gray-500 dark:text-gray-400">No instructions yet.</p>
			{/if}
		</svelte:fragment>
	</CardContainer>
</div>
