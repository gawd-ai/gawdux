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
}
export interface EditModeApi<T, F extends string = string, D = Partial<T>> extends Readable<EditModeSnapshot<F, D>> {
    isEditing: boolean;
    edited: D;
    actionError: string | null;
    fieldErrors: FieldErrors<F>;
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
