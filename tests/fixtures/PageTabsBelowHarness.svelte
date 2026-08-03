<script lang="ts">
	import { TabItem } from 'flowbite-svelte';
	import PageTabs from '../../src/lib/primitives/PageTabs.svelte';

	export let withBelow = false;
</script>

{#if withBelow}
	<PageTabs panelId="harness-panel">
		<TabItem open title="First">
			<p data-testid="tab-body">first tab body</p>
		</TabItem>
		<TabItem title="Second">
			<p>second tab body</p>
		</TabItem>
		<svelte:fragment slot="below">
			<div data-testid="below-content">persistent console</div>
		</svelte:fragment>
	</PageTabs>
{:else}
	<PageTabs panelId="harness-panel">
		<TabItem open title="First">
			<p data-testid="tab-body">first tab body</p>
		</TabItem>
		<TabItem title="Second">
			<p>second tab body</p>
		</TabItem>
	</PageTabs>
{/if}
