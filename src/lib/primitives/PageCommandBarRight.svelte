<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import { PAGE_COMMAND_BAR_CONTEXT, type PageCommandBarContext } from './page-chrome';

	let { children }: { children?: Snippet } = $props();

	const bar = getContext<PageCommandBarContext | undefined>(PAGE_COMMAND_BAR_CONTEXT);
	// Register WITH the snippet so the bar fills in the same render batch as
	// the page (see PageCommandBarCenter).
	const registrationId = bar?.register('right', children ?? null);

	$effect(() => {
		if (registrationId) bar?.update(registrationId, children ?? null);
	});

	onDestroy(() => {
		if (registrationId) bar?.clear(registrationId);
	});
</script>

{#if !bar && children}
	{@render children()}
{/if}
