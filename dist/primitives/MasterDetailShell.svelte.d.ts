import type { Snippet } from 'svelte';
type $$ComponentProps = {
    rail: Snippet;
    detail: Snippet;
    /** Optional pinned zone above the rail (search/filters): stays in view
     *  while the rail list scrolls underneath it. */
    railHeader?: Snippet;
};
declare const MasterDetailShell: import("svelte").Component<$$ComponentProps, {}, "">;
type MasterDetailShell = ReturnType<typeof MasterDetailShell>;
export default MasterDetailShell;
