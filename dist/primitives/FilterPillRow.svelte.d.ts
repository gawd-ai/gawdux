export interface FilterPill {
    id: string;
    label: string;
    count?: number;
}
type $$ComponentProps = {
    pills: FilterPill[];
    selected: string;
    onSelect: (id: string) => void;
    ariaLabel?: string;
    className?: string;
    /**
     * Let the pills flow onto further lines instead of scrolling sideways.
     *
     * Off by default, so every existing surface keeps the single scrolling
     * line it was designed with. Turn it on where the row lives in a NARROW
     * column — a master-detail rail, say — because there the scroller is
     * technically correct and practically wrong: the filters are the first
     * thing a reader needs, and half of them are off-screen behind a
     * horizontal gesture nobody thinks to make. The overflow affordances are
     * suppressed when wrapping, since there is nothing left to scroll to.
     */
    wrap?: boolean;
};
declare const FilterPillRow: import("svelte").Component<$$ComponentProps, {}, "">;
type FilterPillRow = ReturnType<typeof FilterPillRow>;
export default FilterPillRow;
