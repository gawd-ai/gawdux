<script lang="ts">
	import { TabItem } from 'flowbite-svelte';
	import EditablePageScaffold from '../../src/lib/primitives/EditablePageScaffold.svelte';
	import PageTabs from '../../src/lib/primitives/PageTabs.svelte';

	export let actionError: string | null = null;
	export let loadError: string | null = null;
	export let notice: string | null = null;
	export let tabs = true;
	export let ondismiss = () => {};
</script>

<EditablePageScaffold {actionError} {loadError} {notice} on:dismiss={ondismiss}>
	{#if tabs}
		<PageTabs>
			<TabItem open title="Details"><p>Record details</p></TabItem>
		</PageTabs>
	{:else}
		<p>Record details</p>
	{/if}
</EditablePageScaffold>
