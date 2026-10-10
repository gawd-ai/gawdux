<script lang="ts">
	import { AiSkillsPanel } from 'gawdux/admin';
	import type { AiSkillsPanelModel, AiSkillsPanelActions } from 'gawdux/admin';

	let {
		model,
		actions,
		withHistory = false
	}: {
		model: AiSkillsPanelModel<string> | null;
		actions: AiSkillsPanelActions<string>;
		withHistory?: boolean;
	} = $props();
	let settingsDirty = $state(false);
	let editorBusy = $state(false);
</script>

<AiSkillsPanel
	{model}
	{actions}
	bind:settingsDirty
	bind:editorBusy
	guideId="host-skills"
	history={withHistory ? history : undefined}
/>
{#snippet history()}<p data-host-history>Authorized host history</p>{/snippet}
<output data-panel-state>{JSON.stringify({ settingsDirty, editorBusy })}</output>
