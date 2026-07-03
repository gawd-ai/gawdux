interface FilterPill {
    id: string;
    label: string;
    count?: number;
}
type $$ComponentProps = {
    pills: FilterPill[];
    selected: string;
    onSelect: (id: string) => void;
};
declare const FilterPillRow: import("svelte").Component<$$ComponentProps, {}, "">;
type FilterPillRow = ReturnType<typeof FilterPillRow>;
export default FilterPillRow;
