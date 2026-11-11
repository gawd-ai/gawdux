<script lang="ts">
	import { AiKnowledgePanel } from 'gawdux/admin';
	import { ConfirmationCommandSurface } from 'gawdux/primitives';
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
	let panel = $state<{
		openCreate(): void;
		deletion: {
			shown: boolean;
			disabled: boolean;
			reason: string | null;
			request: import('gawdux/primitives').ConfirmationCommandRequest | null;
			busy: boolean;
			error: string | null;
			open(focusTarget?: HTMLElement | null): void;
			confirm(): void;
			cancel(): void;
		};
	}>();
	let editorDirty = $state(false);
	let editorBusy = $state(false);
</script>

<button onclick={() => panel?.openCreate()}>Host create</button>
<!-- The host's command bar: the panel's act on the selected knowledge base. -->
{#if panel?.deletion.shown}
	<button
		data-host-bar-delete
		disabled={panel.deletion.disabled}
		title={panel.deletion.reason ?? undefined}
		onclick={(event) => panel?.deletion.open(event.currentTarget)}>Delete knowledge base</button
	>
{/if}
<AiKnowledgePanel
	bind:this={panel}
	{model}
	{actions}
	bind:editorDirty
	bind:editorBusy
	guideId="host-knowledge"
	history={withHistory ? history : undefined}
/>
<ConfirmationCommandSurface
	request={panel?.deletion.request ?? null}
	busy={panel?.deletion.busy ?? false}
	error={panel?.deletion.error ?? null}
	onconfirm={() => panel?.deletion.confirm()}
	oncancel={() => panel?.deletion.cancel()}
/>
{#snippet history()}<p data-host-history>Authorized host history</p>{/snippet}
<output data-panel-state>{JSON.stringify({ editorDirty, editorBusy })}</output>
