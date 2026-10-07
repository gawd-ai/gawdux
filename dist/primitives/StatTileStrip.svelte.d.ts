import type { Snippet } from 'svelte';
type $$ComponentProps = {
    children?: Snippet;
    /** A CSS length; overrides the --gawdux-tile-min-width knob for this strip. */
    minTileWidth?: string;
    ariaLabel?: string;
    className?: string;
};
declare const StatTileStrip: import("svelte").Component<$$ComponentProps, {}, "">;
type StatTileStrip = ReturnType<typeof StatTileStrip>;
export default StatTileStrip;
