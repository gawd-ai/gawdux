<script lang="ts">
	import ListSurface from '../../src/lib/primitives/ListSurface.svelte';
	import ListPageScaffold from '../../src/lib/primitives/ListPageScaffold.svelte';

	export let mode: 'page' | 'tab' | 'scaffold' = 'page';
	export let withRail = true;
</script>

{#if mode === 'scaffold'}
	{#if withRail}
		<ListPageScaffold>
			<div slot="rail" data-rail>Rail</div>
			<div slot="filters" data-filters>Filters</div>
			<div>Rows</div>
		</ListPageScaffold>
	{:else}
		<ListPageScaffold>
			<div slot="filters" data-filters>Filters</div>
			<div>Rows</div>
		</ListPageScaffold>
	{/if}
{:else if withRail}
	<ListSurface {mode}>
		<div slot="rail" data-rail>Rail</div>
		<div slot="filters" data-filters>Filters</div>
		<div>Rows</div>
	</ListSurface>
{:else}
	<ListSurface {mode}>
		<div slot="filters" data-filters>Filters</div>
		<div>Rows</div>
	</ListSurface>
{/if}
