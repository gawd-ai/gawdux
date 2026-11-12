import { derived, writable, get, type Readable } from 'svelte/store';
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
	/** A field has changed since `start`: cancelling would discard an edit.
	    Changing a field back to what it was, or clearing a field that was
	    empty, leaves nothing to discard. */
	changed: boolean;
}

type EditModeState<F extends string, D> = Omit<EditModeSnapshot<F, D>, 'changed'>;

/** Nothing typed: an empty string, null and undefined are one value. */
function isEmpty(value: unknown): boolean {
	return value === undefined || value === null || value === '';
}

/** A deep copy of a record's values to measure an edit against: dates,
    arrays and objects copied (a reactive proxy read through its keys), any
    other value kept as it is. A form that is not an edit mode measures its
    input the same way: `!sameEditValue(model, editSnapshot(modelAsOpened))`. */
export function editSnapshot<V>(value: V): V {
	return snapshotValue(value) as V;
}

function snapshotValue(value: unknown): unknown {
	if (value instanceof Date) return new Date(value.getTime());
	if (Array.isArray(value)) return value.map(snapshotValue);
	if (value && typeof value === 'object') {
		const proto = Object.getPrototypeOf(value);
		if (proto !== Object.prototype && proto !== null) return value;
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, snapshotValue(v)]));
	}
	return value;
}

/** Whether two values of an edited record hold the same input. */
export function sameEditValue(a: unknown, b: unknown): boolean {
	if (isEmpty(a) && isEmpty(b)) return true;
	if (a instanceof Date || b instanceof Date) {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
	}
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		return a.every((item, index) => sameEditValue(item, b[index]));
	}
	const plain = (v: unknown): v is Record<string, unknown> =>
		Boolean(v) &&
		typeof v === 'object' &&
		[Object.prototype, null].includes(Object.getPrototypeOf(v as object));
	if (plain(a) && plain(b)) {
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		for (const key of keys) {
			if (!sameEditValue(a[key], b[key])) {
				return false;
			}
		}
		return true;
	}
	return Object.is(a, b);
}

export interface EditModeApi<T, F extends string = string, D = Partial<T>>
	extends Readable<EditModeSnapshot<F, D>> {
	// Mutable property accessors keep ergonomic JS access (`editMode.actionError = null`)
	// while the store powers template reactivity via `$editMode.X`.
	isEditing: boolean;
	edited: D;
	actionError: string | null;
	fieldErrors: FieldErrors<F>;
	/** A field has changed since `start` (read-only). */
	readonly changed: boolean;
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
	const store = writable<EditModeState<F, D>>({
		isEditing: false,
		edited: {} as D,
		actionError: null,
		fieldErrors: {}
	});
	// The record as `start` received it, cloned apart from `edited`, which
	// row bindings mutate in place: what an edit is measured against.
	let baseline: unknown = undefined;
	function changedIn(state: EditModeState<F, D>): boolean {
		return state.isEditing && !sameEditValue(baseline, state.edited);
	}
	const snapshot = derived(store, (state) => ({ ...state, changed: changedIn(state) }));

	function patch(updates: Partial<EditModeState<F, D>>) {
		store.update((s) => ({ ...s, ...updates }));
	}

	// Deep proxy: any set anywhere under `edited` (including row mutations from
	// `bind:value={row.field}` inside `{#each $editMode.edited.items as row}`)
	// patches the store so subscribers re-render. Reads through the proxy lazily
	// wrap nested objects so the trap is reached on assignment.
	function notify() {
		store.update((s) => ({ ...s, edited: { ...s.edited } }));
	}

	// Only plain objects and arrays are wrapped: a Date, Map, Set or File
	// reached through a Proxy loses its internal slots, so Date.prototype.toJSON
	// throws "this is not a Date object" the moment the edited record is
	// serialised for a save (found by a consumer's qualification run on a
	// record that carries a Date).
	function isPlainContainer(value: object): boolean {
		if (Array.isArray(value)) return true;
		const proto = Object.getPrototypeOf(value);
		return proto === Object.prototype || proto === null;
	}

	function deepProxy<V extends object>(target: V): V {
		return new Proxy(target, {
			get(t, prop, receiver) {
				const value = Reflect.get(t, prop, receiver);
				if (
					value &&
					typeof value === 'object' &&
					!Object.isFrozen(value) &&
					isPlainContainer(value)
				) {
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
		subscribe: snapshot.subscribe,

		get changed() {
			return changedIn(get(store));
		},

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
			baseline = snapshotValue(draft);
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
