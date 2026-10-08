<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { PAGE_COMMAND_BAR_CONTEXT, type PageCommandBarContext } from './page-chrome';

	let { children }: { children?: Snippet } = $props();

	const bar = getContext<PageCommandBarContext | undefined>(PAGE_COMMAND_BAR_CONTEXT);
	// Register WITH the snippet so the bar fills in the same render batch as
	// the page (see PageCommandBarCenter).
	// svelte-ignore state_referenced_locally -- initial value is intended; the $effect below tracks changes
	const registrationId = bar?.register('left', children ?? null);

	// Released on every destroy, even one in the flush that created this
	// component (see PageCommandBarCenter).
	$effect.pre(() => () => {
		if (registrationId) bar?.clear(registrationId);
	});

	$effect(() => {
		if (registrationId) bar?.update(registrationId, children ?? null);
	});
</script>

{#if !bar && children}
	{@render children()}
{/if}
