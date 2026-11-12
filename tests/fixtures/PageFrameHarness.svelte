<!--
	A page in the frame, as an app shell renders it: the bar's registry in
	context, the frame reading what the page puts in each zone after the page.
-->
<script lang="ts">
	import { setContext } from 'svelte';
	import PageFrame from '../../src/lib/primitives/PageFrame.svelte';
	import PageCommandBarCenter from '../../src/lib/primitives/PageCommandBarCenter.svelte';
	import PageCommandBarPair from '../../src/lib/primitives/PageCommandBarPair.svelte';
	import { createPageCommandBarRegistry } from '../../src/lib/primitives/page-command-bar-registry';
	import {
		PAGE_COMMAND_BAR_CONTEXT,
		type PageCommandBarSlots
	} from '../../src/lib/primitives/page-chrome';

	let {
		acts = true,
		pair = false,
		discards = false
	}: { acts?: boolean; pair?: boolean; discards?: boolean } = $props();

	let slots = $state<PageCommandBarSlots>({ left: null, center: null, right: null });
	setContext(
		PAGE_COMMAND_BAR_CONTEXT,
		createPageCommandBarRegistry((zone, snippet) => {
			slots[zone] = snippet;
		})
	);
</script>

<PageFrame bar={slots} data-probe="frame" aria-label="Page">
	<div data-testid="page">page content</div>
	{#if acts && !pair}
		<PageCommandBarCenter><button type="button">Submit</button></PageCommandBarCenter>
	{/if}
	{#if pair}
		<PageCommandBarPair label="Archive role" tone="red" {discards} onact={() => {}} oncancel={() => {}} />
	{/if}
</PageFrame>
