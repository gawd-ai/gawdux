import type { Component } from 'svelte';
type $$ComponentProps = {
    /** The place it opens, its caption. */
    place: string;
    href: string;
    icon: Component<{
        class?: string;
        'aria-hidden'?: boolean | 'true' | 'false';
    }>;
    size?: 'xs' | 'sm';
    /** The accessible name; "Open in {place}" by default. It holds the caption. */
    label?: string;
    /** The data attribute a test or a runner finds it by. */
    hook?: `data-${string}`;
};
/**
 * A command that opens the item in another place of the app (its history,
 * its records, where it is written). Its caption is the place alone, beside
 * the place's icon; its accessible name says what it does and holds the
 * caption: "Open in History".
 */
declare const PlaceDoor: Component<$$ComponentProps, {}, "">;
type PlaceDoor = ReturnType<typeof PlaceDoor>;
export default PlaceDoor;
