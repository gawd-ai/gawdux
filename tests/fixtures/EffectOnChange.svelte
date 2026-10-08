<script lang="ts">
	import { untrack } from 'svelte';

	// Calls `onchange` from an effect each time `value` moves off its first
	// value: a component whose effect writes state that another block reads
	// (a data reload closing a decision, flowbite's TabItem closing its
	// siblings from an action).
	let { value, onchange }: { value: number; onchange: () => void } = $props();

	$effect(() => {
		if (value === 0) return;
		untrack(onchange);
	});
</script>
