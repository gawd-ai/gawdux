import type { Snippet } from 'svelte';
import type { ActiveFilterDescriptor, ListSort } from './list-query';
export interface ListQueryBarProps {
    value?: string;
    filtersOpen?: boolean;
    inputEl?: HTMLInputElement | null;
    placeholder?: string;
    ariaLabel?: string;
    busy?: boolean;
    disabled?: boolean;
    className?: string;
    searchId?: string;
    filtersLabel?: string;
    filterPanelId?: string;
    activeFilters?: readonly ActiveFilterDescriptor[];
    activeFilterCount?: number;
    keyboardShortcuts?: boolean;
    oninput?: () => void;
    onclear?: () => void;
    onsubmit?: (value: string) => void;
    onRemoveFilter?: (filter: ActiveFilterDescriptor) => void;
    onResetFilters?: () => void;
    quickFilters?: Snippet;
    advancedFilters?: Snippet;
    /**
     * The register's sort. At or below the compact width, where a
     * register's column heads are hidden (its rows read as cards), the
     * bar offers it as the house phone sort, "Sort by" and one choice per
     * key and direction, behind the filter button (or a Sort button when
     * the bar has no other filters). Above the compact width the heads
     * sort and the bar draws none.
     */
    sort?: ListSort;
}
declare const ListQueryBar: import("svelte").Component<ListQueryBarProps, {}, "value" | "inputEl" | "filtersOpen">;
type ListQueryBar = ReturnType<typeof ListQueryBar>;
export default ListQueryBar;
