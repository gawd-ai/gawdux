import { describe, expect, it } from 'vitest';

import { createEditMode } from './edit-mode.svelte';

describe('createEditMode deep proxy', () => {
	it('leaves a Date inside the edited record usable and serialisable', () => {
		const editMode = createEditMode<{ receivedAt: Date; items: { n: number }[] }>();
		editMode.edited = { receivedAt: new Date('2026-09-03T00:00:00Z'), items: [{ n: 1 }] };
		const edited = editMode.edited;
		expect(edited.receivedAt?.toISOString()).toBe('2026-09-03T00:00:00.000Z');
		expect(() => JSON.stringify(edited)).not.toThrow();
		expect(JSON.parse(JSON.stringify(edited)).receivedAt).toBe('2026-09-03T00:00:00.000Z');
	});

	it('still notifies on a nested assignment through the proxy', () => {
		const editMode = createEditMode<{ items: { n: number }[] }>();
		editMode.edited = { items: [{ n: 1 }] };
		let seen = 0;
		editMode.subscribe(() => {
			seen += 1;
		});
		const items = editMode.edited.items;
		if (!items) throw new Error('The assigned draft must contain its items.');
		items[0].n = 2;
		expect(seen).toBeGreaterThan(1);
		expect(editMode.edited.items?.[0].n).toBe(2);
	});
});

describe('createEditMode changed: whether cancelling would discard an edit', () => {
	type Spec = { name: string | null; at: Date; items: { n: number }[] };
	const record = (): Spec => ({ name: 'Assay', at: new Date('2026-11-12T00:00:00Z'), items: [{ n: 1 }] });
	const changed = (editMode: { subscribe: (run: (s: { changed: boolean }) => void) => () => void }) => {
		let value = false;
		editMode.subscribe((s) => (value = s.changed))();
		return value;
	};

	it('is false before Edit and right after it', () => {
		const editMode = createEditMode<Spec, string, Spec>();
		expect(changed(editMode)).toBe(false);
		editMode.start(record());
		expect(changed(editMode)).toBe(false);
		expect(editMode.changed).toBe(false);
	});

	it('turns true when a field changes, a nested row included, and false again when it changes back', () => {
		const editMode = createEditMode<Spec, string, Spec>();
		editMode.start(record());
		editMode.setEditedField('name', 'Assay 2');
		expect(changed(editMode)).toBe(true);
		editMode.setEditedField('name', 'Assay');
		expect(changed(editMode)).toBe(false);
		editMode.edited.items[0]!.n = 2;
		expect(changed(editMode)).toBe(true);
		editMode.edited.items[0]!.n = 1;
		expect(editMode.changed).toBe(false);
	});

	it('reads an emptied field and a field typed into and cleared as nothing to discard', () => {
		const editMode = createEditMode<Spec, string, Spec>();
		editMode.start({ ...record(), name: null });
		editMode.setEditedField('name', 'a');
		expect(changed(editMode)).toBe(true);
		editMode.setEditedField('name', '');
		expect(changed(editMode)).toBe(false);
	});

	it('compares dates by their moment, and is false again after Cancel', () => {
		const editMode = createEditMode<Spec, string, Spec>();
		editMode.start(record());
		editMode.setEditedField('at', new Date('2026-11-12T00:00:00Z'));
		expect(changed(editMode)).toBe(false);
		editMode.setEditedField('at', new Date('2026-11-13T00:00:00Z'));
		expect(changed(editMode)).toBe(true);
		editMode.cancel();
		expect(changed(editMode)).toBe(false);
	});
});
