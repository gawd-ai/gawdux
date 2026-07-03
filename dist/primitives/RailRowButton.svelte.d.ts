import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
type $$ComponentProps = {
    selected?: boolean;
    class?: string;
    children: Snippet;
} & HTMLButtonAttributes;
declare const RailRowButton: import("svelte").Component<$$ComponentProps, {}, "">;
type RailRowButton = ReturnType<typeof RailRowButton>;
export default RailRowButton;
