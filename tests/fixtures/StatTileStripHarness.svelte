<script lang="ts">
	import StatTile from '../../src/lib/primitives/StatTile.svelte';
	import StatTileStrip from '../../src/lib/primitives/StatTileStrip.svelte';

	let { count = 7, minTileWidth }: { count?: number; minTileWidth?: string } = $props();
</script>

<StatTileStrip {minTileWidth} ariaLabel="Release vitals">
	{#each Array.from({ length: count }, (_, i) => i) as i (i)}
		<StatTile label={`Tile ${i + 1}`} value={i} meta="meta" />
	{/each}
</StatTileStrip>
