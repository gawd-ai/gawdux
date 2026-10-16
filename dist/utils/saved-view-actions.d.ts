import type { SavedViewSummary } from "../primitives/saved-views";
export interface SavedViewActionRecord extends SavedViewSummary {
    pageKey: string;
}
export interface SavedViewActionPorts<View extends SavedViewActionRecord> {
    currentKey: () => string | null;
    pageKey: () => string;
    currentQuery: () => Record<string, string>;
    views: () => readonly View[];
    changed: (views: View[]) => void;
    error: (message: string | null) => void;
    request: (method: "POST" | "DELETE", body: Record<string, unknown>) => Promise<unknown>;
    isView: (value: unknown) => value is View;
    errorMessage: (error: unknown, operation: "save" | "remove") => string;
}
/**
 * Settle authoritative preference responses without letting an old identity,
 * page or same-row write overwrite its successor. Transport and policy stay
 * in the host; distinct rows may settle independently.
 */
export declare function createSavedViewActions<View extends SavedViewActionRecord>(ports: SavedViewActionPorts<View>): {
    save(name: string): Promise<boolean>;
    remove(view: Pick<View, "id">): Promise<boolean>;
};
