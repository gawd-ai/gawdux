<script lang="ts">
	import { AiKnowledgePanel } from 'gawdux/admin';
	import type {
		AiKnowledgeBase,
		AiKnowledgePanelModel,
		AiKnowledgePanelActions
	} from 'gawdux/admin';

	interface HostKnowledge extends AiKnowledgeBase<string> {
		hostMetadata: string;
	}
	let {
		model,
		actions,
		withHistory = false
	}: {
		model: AiKnowledgePanelModel<string, string, HostKnowledge> | null;
		actions: AiKnowledgePanelActions<string, string, string, HostKnowledge>;
		withHistory?: boolean;
	} = $props();
	let panel = $state<{ openCreate(): void }>();
	let editorDirty = $state(false);
	let editorBusy = $state(false);
</script>

<button onclick={() => panel?.openCreate()}>Host create</button>
<AiKnowledgePanel
	bind:this={panel}
	{model}
	{actions}
	bind:editorDirty
	bind:editorBusy
	guideId="host-knowledge"
	history={withHistory ? history : undefined}
/>
{#snippet history()}<p data-host-history>Authorized host history</p>{/snippet}
<output data-panel-state>{JSON.stringify({ editorDirty, editorBusy })}</output>
