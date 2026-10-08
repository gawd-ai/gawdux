import type { Component } from 'svelte';
type $$ComponentProps = {
    /** The visible word. Required: a header is never icon-only. */
    label: string;
    /** The column's icon, before the label. */
    icon?: Component;
    /** Aligns the label with the column's cells. Left by default. */
    align?: 'left' | 'center' | 'right';
    /** Lets the label wrap onto a second line; one line by default. */
    wrap?: boolean;
    /** Classes on the `th` (a width, `status-col`). */
    className?: string;
};
declare const HeadCell: Component<$$ComponentProps, {}, "">;
type HeadCell = ReturnType<typeof HeadCell>;
export default HeadCell;
