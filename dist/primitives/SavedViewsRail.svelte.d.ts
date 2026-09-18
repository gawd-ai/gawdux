import type { SavedViewSummary } from './saved-views';
export interface SavedViewsRailProps {
    views: readonly SavedViewSummary[];
    /** The list's applied query: URL param name to value, defaults omitted. */
    current: Record<string, string>;
    /** A pill was chosen; null is the All pill (the default query). */
    onSelect: (view: SavedViewSummary | null) => void;
    /** Save the current query under `name`; resolve true on success. */
    onSave: (name: string) => Promise<boolean>;
    /** Delete a view; resolve true on success. */
    onDelete: (view: SavedViewSummary) => Promise<boolean>;
    /** Prefilled into the name field when the save control opens. */
    suggestedName?: string;
    /** The host's last failure; carried on the name field while it stands. */
    error?: string | null;
    allLabel?: string;
    saveLabel?: string;
    namePlaceholder?: string;
    ariaLabel?: string;
    maxNameLength?: number;
    className?: string;
}
declare const SavedViewsRail: import("svelte").Component<SavedViewsRailProps, {}, "">;
type SavedViewsRail = ReturnType<typeof SavedViewsRail>;
export default SavedViewsRail;
