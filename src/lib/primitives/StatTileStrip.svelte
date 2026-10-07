<!-- The hero strip: a grid of StatTiles that fills its row and wraps onto
     further rows when the tiles no longer fit. It never clips and never
     scrolls sideways: a column is at least --gawdux-tile-min-width (or the
     `minTileWidth` prop) and at most the strip's own width, and the tiles
     share the row equally, so seven tiles sit on one row on a wide screen
     and wrap at a narrow one. The gap is the --gawdux-tile-gap knob. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		minTileWidth,
		ariaLabel,
		className = ''
	}: {
		children?: Snippet;
		/** A CSS length; overrides the --gawdux-tile-min-width knob for this strip. */
		minTileWidth?: string;
		ariaLabel?: string;
		className?: string;
	} = $props();
</script>

<div
	class={`stat-tile-strip grid min-w-0 grid-cols-[repeat(auto-fit,minmax(min(100%,var(--gawdux-tile-min-width,9rem)),1fr))] gap-[var(--gawdux-tile-gap,0.75rem)] ${className}`}
	style:--gawdux-tile-min-width={minTileWidth}
	role={ariaLabel ? 'group' : undefined}
	aria-label={ariaLabel}
>
	{@render children?.()}
</div>
