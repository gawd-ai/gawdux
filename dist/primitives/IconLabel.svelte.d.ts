export type IconLabelSize = 'xs' | 'sm' | 'md' | 'lg';
import type { Component } from 'svelte';
type $$ComponentProps = {
    /** An icon component (e.g. from flowbite-svelte-icons). Optional: a cue
        without an icon renders the word alone, at the same baseline. */
    icon?: Component | null;
    label: string;
    /** Icon box: xs 12px, sm 14px, md 16px (text-sm), lg 20px. */
    size?: IconLabelSize;
    iconClass?: string;
    labelClass?: string;
    /** Clip a long word with an ellipsis inside a constrained parent. */
    truncate?: boolean;
    title?: string;
    className?: string;
};
declare const IconLabel: Component<$$ComponentProps, {}, "">;
type IconLabel = ReturnType<typeof IconLabel>;
export default IconLabel;
