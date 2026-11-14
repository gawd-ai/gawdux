<!--
	An app shell as it wires the command bar: one PageCommandBarZones, its
	registry published as PAGE_COMMAND_BAR_CONTEXT, the instance handed to
	PageFrame as its bar. The page puts an act in the bar, or opens the sign
	drawer, whose Cancel and confirm take the bar's center zone.
-->
<script lang="ts">
	import { setContext } from 'svelte';
	import PageFrame from '../../src/lib/primitives/PageFrame.svelte';
	import PageCommandBarCenter from '../../src/lib/primitives/PageCommandBarCenter.svelte';
	import PageCommandBarRight from '../../src/lib/primitives/PageCommandBarRight.svelte';
	import { PAGE_COMMAND_BAR_CONTEXT } from '../../src/lib/primitives/page-chrome';
	import { PageCommandBarZones } from '../../src/lib/primitives/page-command-bar-zones.svelte';
	import SignatureCommandSurface from '../../src/lib/validation/SignatureCommandSurface.svelte';

	let { acts = true, signing = false }: { acts?: boolean; signing?: boolean } = $props();

	const bar = new PageCommandBarZones();
	setContext(PAGE_COMMAND_BAR_CONTEXT, bar.context);
</script>

<PageFrame {bar} aria-label="Page">
	<div data-testid="page">page content</div>
	{#if acts}
		<PageCommandBarCenter><button type="button">Edit</button></PageCommandBarCenter>
		<PageCommandBarRight><span data-testid="count">3 shown</span></PageCommandBarRight>
	{/if}
	<SignatureCommandSurface
		open={signing}
		title="Sign: QA review"
		statement="You are about to sign step QA review on TRF-0007 with the meaning Approved."
		signer={{ name: 'Jane Doe', email: 'jane@example.test' }}
		confirmLabel="Sign QA review"
		onclose={() => {}}
		onconfirm={() => {}}
	/>
</PageFrame>
