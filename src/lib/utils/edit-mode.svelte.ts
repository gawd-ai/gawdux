import { writable, get, type Readable } from 'svelte/store';
import {
	clearFieldError,
	focusFirstFieldError,
	hasFieldErrors,
	type FieldErrors
} from './form-errors';

export interface EditModeOptions<F extends string = string> {
	serverErrorMapper?: (message: string) => FieldErrors<F> | null;
}

export interface EditModeSnapshot<F extends string, D> {
	isEditing: boolean;
	edited: D;
	actionError: string | null;
	fieldErrors: FieldErrors<F>;
}

export interface EditModeApi<T, F extends string = string, D = Partial<T>>
	extends Readable<EditModeSnapshot<F, D>> {
	// Mutable property accessors keep ergonomic JS access (`editMode.actionError = null`)
	// while the store powers template reactivity via `$editMode.X`.
	isEditing: boolean;
	edited: D;
	actionError: string | null;
	fieldErrors: FieldErrors<F>;
	// Field-level setter so callers can update one field of `edited` without
	// reassigning the whole draft. Triggers store notify.
	setEditedField<K extends keyof D>(key: K, value: D[K]): void;
	updateEdited(updater: (draft: D) => D): void;
	start(draft: D): void;
	cancel(): void;
	validate(validator: (draft: D) => FieldErrors<F>): boolean;
	clearFieldError(field: F): void;
	assignServerError(message: string): void;
	dismissActionError(): void;
}

// Svelte writable store under the hood: legacy `.svelte` consumers subscribe
// via `$editMode` and Svelte's compiler wires up reactivity properly.
// Property accessors on the returned object delegate to `store.update()` so
// existing JS like `editMode.actionError = null` still works.
export function createEditMode<T, F extends string = string, D = Partial<T>>(
	opts: EditModeOptions<F> = {}
): EditModeApi<T, F, D> {
	const store = writable<EditModeSnapshot<F, D>>({
		isEditing: false,
		edited: {} as D,
		actionError: null,
		fieldErrors: {}
	});

	function patch(updates: Partial<EditModeSnapshot<F, D>>) {
		store.update((s) => ({ ...s, ...updates }));
	}

	// Deep proxy: any set anywhere under `edited` (including row mutations from
	// `bind:value={row.field}` inside `{#each $editMode.edited.items as row}`)
	// patches the store so subscribers re-render. Reads through the proxy lazily
	// wrap nested objects so the trap is reached on assignment.
	function notify() {
		store.update((s) => ({ ...s, edited: { ...s.edited } }));
	}

	function deepProxy<V extends object>(target: V): V {
		return new Proxy(target, {
			get(t, prop, receiver) {
				const value = Reflect.get(t, prop, receiver);
				if (value && typeof value === 'object' && !Object.isFrozen(value)) {
					return deepProxy(value);
				}
				return value;
			},
			set(t, prop, value) {
				(t as Record<PropertyKey, unknown>)[prop as PropertyKey] = value;
				notify();
				return true;
			}
		});
	}

	function editedProxy(): D {
		return deepProxy(get(store).edited as object) as D;
	}

	return {
		subscribe: store.subscribe,

		get isEditing() {
			return get(store).isEditing;
		},
		set isEditing(v: boolean) {
			patch({ isEditing: v });
		},
		get edited() {
			return editedProxy();
		},
		set edited(v: D) {
			patch({ edited: v });
		},
		get actionError() {
			return get(store).actionError;
		},
		set actionError(v: string | null) {
			patch({ actionError: v });
		},
		get fieldErrors() {
			return get(store).fieldErrors;
		},
		set fieldErrors(v: FieldErrors<F>) {
			patch({ fieldErrors: v });
		},

		setEditedField<K extends keyof D>(key: K, value: D[K]) {
			store.update((s) => ({ ...s, edited: { ...s.edited, [key]: value } }));
		},

		updateEdited(updater: (draft: D) => D) {
			store.update((s) => ({ ...s, edited: updater(s.edited) }));
		},

		start(draft: D): void {
			let cloned: D;
			try {
				cloned = structuredClone(draft);
			} catch {
				cloned = (draft && typeof draft === 'object' ? { ...draft } : draft) as D;
			}
			patch({ isEditing: true, edited: cloned, fieldErrors: {}, actionError: null });
		},

		cancel(): void {
			patch({ isEditing: false, fieldErrors: {}, actionError: null });
		},

		validate(validator: (draft: D) => FieldErrors<F>): boolean {
			const errors = validator(get(store).edited);
			patch({ fieldErrors: errors });
			if (hasFieldErrors(errors)) {
				patch({ actionError: null });
				focusFirstFieldError();
				return false;
			}
			return true;
		},

		clearFieldError(field: F): void {
			patch({ fieldErrors: clearFieldError(get(store).fieldErrors, field) });
		},

		assignServerError(message: string): void {
			const mapped = opts.serverErrorMapper?.(message);
			if (mapped) {
				patch({ fieldErrors: mapped, actionError: null });
				focusFirstFieldError();
			} else {
				patch({ actionError: message, fieldErrors: {} });
			}
		},

		dismissActionError(): void {
			patch({ actionError: null });
		}
	};
}
