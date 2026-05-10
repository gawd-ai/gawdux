<script lang="ts">
	import { getContext, onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import { PAGE_COMMAND_BAR_CONTEXT, type PageCommandBarContext } from './page-chrome';

	let { children }: { children?: Snippet } = $props();

	const bar = getContext<PageCommandBarContext | undefined>(PAGE_COMMAND_BAR_CONTEXT);
	const registrationId = bar?.register('left', null);

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
