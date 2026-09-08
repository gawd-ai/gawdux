import { describe, expect, it } from 'vitest';
import { createEditMode } from './edit-mode.svelte';
describe('createEditMode deep proxy', () => {
    it('leaves a Date inside the edited record usable and serialisable', () => {
        const editMode = createEditMode();
        editMode.edited = { receivedAt: new Date('2026-09-03T00:00:00Z'), items: [{ n: 1 }] };
        const edited = editMode.edited;
        expect(edited.receivedAt?.toISOString()).toBe('2026-09-03T00:00:00.000Z');
        expect(() => JSON.stringify(edited)).not.toThrow();
        expect(JSON.parse(JSON.stringify(edited)).receivedAt).toBe('2026-09-03T00:00:00.000Z');
    });
    it('still notifies on a nested assignment through the proxy', () => {
        const editMode = createEditMode();
        editMode.edited = { items: [{ n: 1 }] };
        let seen = 0;
        editMode.subscribe(() => {
            seen += 1;
        });
        const items = editMode.edited.items;
        if (!items)
            throw new Error('The assigned draft must contain its items.');
        items[0].n = 2;
        expect(seen).toBeGreaterThan(1);
        expect(editMode.edited.items?.[0].n).toBe(2);
    });
});
