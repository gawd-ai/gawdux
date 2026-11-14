<!--
	Test harness: a host that opens the manual observation drawer for a case,
	closes it on Cancel and once the observation is recorded, and can open it
	for another case while it is open.
-->
<script lang="ts">
	import ManualObservationCommandSurface from '../../src/lib/validation/ManualObservationCommandSurface.svelte';
	import type { ManualObservationInput } from '../../src/lib/validation/types';

	let {
		record
	}: { record: (input: ManualObservationInput) => Promise<void> } = $props();

	let open = $state(true);
	let current = $state({ id: 'C-4', title: 'Inspect the label' });
</script>

<button type="button" data-harness-toggle onclick={() => (open = !open)}>toggle</button>
<button
	type="button"
	data-harness-other
	onclick={() => (current = { id: 'C-5', title: 'Inspect the seal' })}>other</button
>
<ManualObservationCommandSurface
	{open}
	caseId={current.id}
	title={current.title}
	expectedRevision="7"
	oncomplete={async (input) => {
		await record(input);
		open = false;
	}}
	oncancel={() => (open = false)}
/>
