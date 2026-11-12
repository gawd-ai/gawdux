import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** What the page puts in the bar, zone by zone. Null: no bar is drawn. */
    bar?: {
        left: Snippet | null;
        center: Snippet | null;
        right: Snippet | null;
    } | null;
    children?: Snippet;
    [key: string]: unknown;
};
declare const PageFrame: import("svelte").Component<$$ComponentProps, {}, "">;
type PageFrame = ReturnType<typeof PageFrame>;
export default PageFrame;
