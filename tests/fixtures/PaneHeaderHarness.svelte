<script lang="ts">
	import { setContext } from 'svelte';
	import { TabItem } from 'flowbite-svelte';
	import { FileOutline } from 'flowbite-svelte-icons';
	import PaneHeader from '../../src/lib/primitives/PaneHeader.svelte';
	import PageTabs from '../../src/lib/primitives/PageTabs.svelte';
	import { PAGE_STATUS_CONTEXT, createPageStatusHost } from '../../src/lib/primitives/page-chrome';

	let {
		withStatus = false,
		pageStatus = null,
		bare = false
	}: { withStatus?: boolean; pageStatus?: string | null; bare?: boolean } = $props();

	setContext(
		PAGE_STATUS_CONTEXT,
		createPageStatusHost(() => (pageStatus ? pageChip : null))
	);
</script>

{#snippet pageChip()}<span class="chip">{pageStatus}</span>{/snippet}
{#snippet folder()}<button type="button">Folders</button>{/snippet}
{#snippet chip()}<span class="chip">Draft</span>{/snippet}
{#snippet controls()}<button type="button">Close</button>{/snippet}

{#if bare}
	<PaneHeader title="Balance calibration SOP" icon={FileOutline} />
{:else}
	<PaneHeader
		title="Balance calibration SOP"
		subtitle="Monthly checks against certified weights"
		icon={FileOutline}
		leading={withStatus ? folder : undefined}
		status={withStatus ? chip : undefined}
		actions={controls}
	/>
{/if}
<PageTabs>
	<TabItem open title="Process"><p>Process</p></TabItem>
</PageTabs>
