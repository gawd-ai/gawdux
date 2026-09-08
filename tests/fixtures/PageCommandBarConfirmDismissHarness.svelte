<script lang="ts">
	import { onMount } from 'svelte';
	import PageCommandBarConfirm from '../../src/lib/primitives/PageCommandBarConfirm.svelte';

	let {
		focusTarget,
		focusFallback,
		acknowledgement = false
	}: {
		focusTarget: HTMLElement;
		focusFallback?: () => HTMLElement | null;
		acknowledgement?: boolean;
	} = $props();

	let request = $state<{
		focusTarget: HTMLElement;
		focusFallback: (() => HTMLElement | null) | undefined;
		cancelLabel: string | null;
	} | null>(null);

	onMount(() => {
		request = {
			focusTarget,
			focusFallback,
			cancelLabel: acknowledgement ? null : 'Cancel'
		};
	});
</script>

<button onclick={() => (request = null)}>Close from host</button>
{#if request}
	<PageCommandBarConfirm
		message="Review this item."
		confirmLabel="Done"
		cancelLabel={request.cancelLabel}
		focusTarget={request.focusTarget}
		focusFallback={request.focusFallback}
		onconfirm={() => (request = null)}
		oncancel={() => (request = null)}
	/>
{/if}
