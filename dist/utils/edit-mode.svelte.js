import { writable, get } from 'svelte/store';
import { clearFieldError, focusFirstFieldError, hasFieldErrors } from './form-errors';
// Svelte writable store under the hood: legacy `.svelte` consumers subscribe
// via `$editMode` and Svelte's compiler wires up reactivity properly.
// Property accessors on the returned object delegate to `store.update()` so
// existing JS like `editMode.actionError = null` still works.
export function createEditMode(opts = {}) {
    const store = writable({
        isEditing: false,
        edited: {},
        actionError: null,
        fieldErrors: {}
    });
    function patch(updates) {
        store.update((s) => ({ ...s, ...updates }));
    }
    // Deep proxy: any set anywhere under `edited` (including row mutations from
    // `bind:value={row.field}` inside `{#each $editMode.edited.items as row}`)
    // patches the store so subscribers re-render. Reads through the proxy lazily
    // wrap nested objects so the trap is reached on assignment.
    function notify() {
        store.update((s) => ({ ...s, edited: { ...s.edited } }));
    }
    function deepProxy(target) {
        return new Proxy(target, {
            get(t, prop, receiver) {
                const value = Reflect.get(t, prop, receiver);
                if (value && typeof value === 'object' && !Object.isFrozen(value)) {
                    return deepProxy(value);
                }
                return value;
            },
            set(t, prop, value) {
                t[prop] = value;
                notify();
                return true;
            }
        });
    }
    function editedProxy() {
        return deepProxy(get(store).edited);
    }
    return {
        subscribe: store.subscribe,
        get isEditing() {
            return get(store).isEditing;
        },
        set isEditing(v) {
            patch({ isEditing: v });
        },
        get edited() {
            return editedProxy();
        },
        set edited(v) {
            patch({ edited: v });
        },
        get actionError() {
            return get(store).actionError;
        },
        set actionError(v) {
            patch({ actionError: v });
        },
        get fieldErrors() {
            return get(store).fieldErrors;
        },
        set fieldErrors(v) {
            patch({ fieldErrors: v });
        },
        setEditedField(key, value) {
            store.update((s) => ({ ...s, edited: { ...s.edited, [key]: value } }));
        },
        updateEdited(updater) {
            store.update((s) => ({ ...s, edited: updater(s.edited) }));
        },
        start(draft) {
            let cloned;
            try {
                cloned = structuredClone(draft);
            }
            catch {
                cloned = (draft && typeof draft === 'object' ? { ...draft } : draft);
            }
            patch({ isEditing: true, edited: cloned, fieldErrors: {}, actionError: null });
        },
        cancel() {
            patch({ isEditing: false, fieldErrors: {}, actionError: null });
        },
        validate(validator) {
            const errors = validator(get(store).edited);
            patch({ fieldErrors: errors });
            if (hasFieldErrors(errors)) {
                patch({ actionError: null });
                focusFirstFieldError();
                return false;
            }
            return true;
        },
        clearFieldError(field) {
            patch({ fieldErrors: clearFieldError(get(store).fieldErrors, field) });
        },
        assignServerError(message) {
            const mapped = opts.serverErrorMapper?.(message);
            if (mapped) {
                patch({ fieldErrors: mapped, actionError: null });
                focusFirstFieldError();
            }
            else {
                patch({ actionError: message, fieldErrors: {} });
            }
        },
        dismissActionError() {
            patch({ actionError: null });
        }
    };
}
