import type { Component } from 'svelte';
type $$ComponentProps = {
    icon: Component;
    /** What it does ("Remove Camera 3"), for the screen reader and the tooltip. */
    label: string;
    onclick?: (event: MouseEvent) => void;
    tone?: 'neutral' | 'danger';
    disabled?: boolean;
    className?: string;
};
declare const IconButton: Component<$$ComponentProps, {}, "">;
type IconButton = ReturnType<typeof IconButton>;
export default IconButton;
