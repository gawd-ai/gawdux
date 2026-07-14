import { type Snippet } from 'svelte';
type $$ComponentProps = {
    rail: Snippet;
    detail: Snippet;
    /** Optional pinned zone above the rail (search/filters): stays in view
     *  while the rail list scrolls underneath it. */
    railHeader?: Snippet;
    /** Identity of the active detail. Change this when selection or create
     *  mode changes so compact layouts can open the new detail pane. */
    detailKey?: string | number | null;
    /** Accessible name for the compact detail region. */
    detailLabel?: string;
};
declare const MasterDetailShell: import("svelte").Component<$$ComponentProps, {}, "">;
type MasterDetailShell = ReturnType<typeof MasterDetailShell>;
export default MasterDetailShell;
