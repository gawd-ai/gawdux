import { type Readable } from 'svelte/store';
import { type FieldErrors } from './form-errors';
export interface EditModeOptions<F extends string = string> {
    serverErrorMapper?: (message: string) => FieldErrors<F> | null;
}
export interface EditModeSnapshot<F extends string, D> {
    isEditing: boolean;
    edited: D;
    actionError: string | null;
    fieldErrors: FieldErrors<F>;
    /** A field has changed since `start`: cancelling would discard an edit.
        Changing a field back to what it was, or clearing a field that was
        empty, leaves nothing to discard. */
    changed: boolean;
}
/** A deep copy of a record's values to measure an edit against: dates,
    arrays and objects copied (a reactive proxy read through its keys), any
    other value kept as it is. A form that is not an edit mode measures its
    input the same way: `!sameEditValue(model, editSnapshot(modelAsOpened))`. */
export declare function editSnapshot<V>(value: V): V;
/** Whether two values of an edited record hold the same input. */
export declare function sameEditValue(a: unknown, b: unknown): boolean;
export interface EditModeApi<T, F extends string = string, D = Partial<T>> extends Readable<EditModeSnapshot<F, D>> {
    isEditing: boolean;
    edited: D;
    actionError: string | null;
    fieldErrors: FieldErrors<F>;
    /** A field has changed since `start` (read-only). */
    readonly changed: boolean;
    setEditedField<K extends keyof D>(key: K, value: D[K]): void;
    updateEdited(updater: (draft: D) => D): void;
    start(draft: D): void;
    cancel(): void;
    validate(validator: (draft: D) => FieldErrors<F>): boolean;
    clearFieldError(field: F): void;
    assignServerError(message: string): void;
    dismissActionError(): void;
}
export declare function createEditMode<T, F extends string = string, D = Partial<T>>(opts?: EditModeOptions<F>): EditModeApi<T, F, D>;
