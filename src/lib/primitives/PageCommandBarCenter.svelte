<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import { get, readable } from 'svelte/store';
	import {
		PAGE_COMMAND_BAR_CONTEXT,
		PAGE_TAB_CONTEXT,
		showsOnTab,
		type PageCommandBarContext,
		type PageTabHost,
		type PageTabScope
	} from './page-chrome';

	let {
		children,
		tab = undefined
	}: {
		children?: Snippet;
		/**
		 * The tab, or tabs, whose acts these are: they show only while one of
		 * them is the page's open tab (PAGE_TAB_CONTEXT), so a tab with no act
		 * draws no bar. None: the page's, on every tab.
		 */
		tab?: PageTabScope;
	} = $props();

	const bar = getContext<PageCommandBarContext | undefined>(PAGE_COMMAND_BAR_CONTEXT);
	const tabs = getContext<PageTabHost | undefined>(PAGE_TAB_CONTEXT);
	const openTab = tabs?.open ?? readable<string | null>(null);
	/** Whether these acts show while `open` is the page's open tab. */
	function present(open: string | null): boolean {
		return !tabs || showsOnTab(tab, open);
	}
	// Register WITH the snippet so the bar fills in the same render batch as
	// the page. Registering null and filling from the $effect made the bar
	// clear on every navigation and repopulate a frame late — the command bar
	// must never lag the content it commands.
	// svelte-ignore state_referenced_locally -- initial value is intended; the $effect below tracks changes
	const registrationId = bar?.register('center', children ?? null, present(get(openTab)));

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
		if (registrationId) bar?.update(registrationId, children ?? null, present($openTab));
	});
</script>

{#if !bar && children && present($openTab)}
	{@render children()}
{/if}
