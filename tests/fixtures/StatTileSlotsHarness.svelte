<script lang="ts">
	import StatTile from '../../src/lib/primitives/StatTile.svelte';
</script>

<StatTile label="Connectivity">
	{#snippet aside()}<span data-testid="aside">2m ago</span>{/snippet}
	<div data-testid="body">ETH default route</div>
</StatTile>
