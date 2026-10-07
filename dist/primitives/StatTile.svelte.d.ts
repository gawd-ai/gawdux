export type StatTileTone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info';
/** The tint classes for a tone, for a host that must match a tile. */
export declare function statTileToneClass(tone: StatTileTone, nested?: boolean): string;
import type { Component, Snippet } from 'svelte';
type $$ComponentProps = {
    /** The micro-label, rendered uppercase. */
    label: string;
    value?: string | number | null;
    meta?: string | null;
    /** Optional icon before the label. */
    icon?: Component | null;
    tone?: StatTileTone;
    /** A status dot in the tone's colour before the value. */
    dot?: boolean;
    /** The dot pings (attention). Implies `dot`. */
    pulse?: boolean;
    /** The in-card variant. */
    nested?: boolean;
    /** Merged over the value's classes (a colour, a mono readout). */
    valueClass?: string;
    /** Tooltip for the value; defaults to the value itself. */
    valueTitle?: string;
    /** Tooltip for the meta line (an absolute time behind a relative one). */
    metaTitle?: string;
    /** Drill-down handler, rendered as the small text button. */
    onclick?: (event: MouseEvent) => void;
    /** Drill-down target, rendered as the small text link. */
    href?: string;
    actionLabel?: string;
    aside?: Snippet;
    children?: Snippet;
    className?: string;
};
declare const StatTile: Component<$$ComponentProps, {}, "">;
type StatTile = ReturnType<typeof StatTile>;
export default StatTile;
