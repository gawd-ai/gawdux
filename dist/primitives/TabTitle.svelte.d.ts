import type { Component } from 'svelte';
type $$ComponentProps = {
    /** The tab's icon, from the house set: one meaning, one icon. */
    icon?: Component | null;
    label: string;
    /** What on the tab waits on the reader; above zero, the pill on the icon. */
    count?: number | null;
    className?: string;
};
declare const TabTitle: Component<$$ComponentProps, {}, "">;
type TabTitle = ReturnType<typeof TabTitle>;
export default TabTitle;
