import type { Component, Snippet } from 'svelte';
type $$ComponentProps = {
    /** The icon; or `children` for a glyph that is no icon. */
    icon?: Component;
    children?: Snippet;
    /** What it does ("Remove Camera 3"), for the screen reader and the tooltip. */
    label: string;
    onclick?: (event: MouseEvent) => void;
    tone?: 'neutral' | 'danger';
    /** `sm` (28px) in a row or a card; `md` (32px, 44px at the compact width) in a header. */
    size?: 'sm' | 'md';
    disabled?: boolean;
    className?: string;
};
declare const IconButton: Component<$$ComponentProps, {}, "">;
type IconButton = ReturnType<typeof IconButton>;
export default IconButton;
