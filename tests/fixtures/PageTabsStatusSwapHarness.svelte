<!-- One host across two pages, as a layout keeps it across a navigation: the
     next page's tabs mount while the previous page's tabs are still there,
     and the previous page goes after. The previous page states no status. -->
<script lang="ts">
	import { setContext } from 'svelte';
	import { TabItem } from 'flowbite-svelte';
	import PageTabs from '../../src/lib/primitives/PageTabs.svelte';
	import { PAGE_STATUS_CONTEXT, createPageStatusHost } from '../../src/lib/primitives/page-chrome';

	let {
		previous = true,
		next = false,
		status = null
	}: { previous?: boolean; next?: boolean; status?: string | null } = $props();

	setContext(
		PAGE_STATUS_CONTEXT,
		createPageStatusHost(() => (status ? chip : null))
	);
</script>

{#snippet chip()}<span class="chip">{status}</span>{/snippet}

{#if previous}
	<div data-page="previous">
		<PageTabs>
			<TabItem open title="New"><p>New</p></TabItem>
		</PageTabs>
	</div>
{/if}
{#if next}
	<div data-page="next">
		<PageTabs>
			<TabItem open title="Overview"><p>Overview</p></TabItem>
		</PageTabs>
	</div>
{/if}
