<!-- A page whose host states its status: the page's tabs head its panel and
     draw it; a second set of tabs inside the first draws nothing. -->
<script lang="ts">
	import { setContext } from 'svelte';
	import { TabItem } from 'flowbite-svelte';
	import PageTabs from '../../src/lib/primitives/PageTabs.svelte';
	import { PAGE_STATUS_CONTEXT, createPageStatusHost } from '../../src/lib/primitives/page-chrome';

	let { status = 'Active', nested = false }: { status?: string | null; nested?: boolean } = $props();

	setContext(
		PAGE_STATUS_CONTEXT,
		createPageStatusHost(() => (status ? chip : null))
	);
</script>

{#snippet chip()}<span class="chip">{status}</span>{/snippet}

<PageTabs>
	<TabItem open title="Overview">
		<p>Overview</p>
		{#if nested}
			<PageTabs>
				<TabItem open title="Inner"><p>Inner</p></TabItem>
			</PageTabs>
		{/if}
	</TabItem>
	<TabItem title="History"><p>History</p></TabItem>
</PageTabs>
