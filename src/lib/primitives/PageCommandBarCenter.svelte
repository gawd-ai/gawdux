<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { PAGE_COMMAND_BAR_CONTEXT, type PageCommandBarContext } from './page-chrome';

	let { children }: { children?: Snippet } = $props();

	const bar = getContext<PageCommandBarContext | undefined>(PAGE_COMMAND_BAR_CONTEXT);
	// Register WITH the snippet so the bar fills in the same render batch as
	// the page. Registering null and filling from the $effect made the bar
	// clear on every navigation and repopulate a frame late — the command bar
	// must never lag the content it commands.
	// svelte-ignore state_referenced_locally -- initial value is intended; the $effect below tracks changes
	const registrationId = bar?.register('center', children ?? null);

	// Released by a teardown that exists from the moment of registering:
	// `$effect.pre` runs while the component initializes, so its teardown runs
	// on every destroy. `onDestroy` is a deferred effect's teardown, and a
	// component destroyed in the flush that created it (an earlier effect
	// closed its block) never ran that effect: the registration stayed live
	// and its dead snippet came back to the bar whenever it was the newest.
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
