import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EditablePageScaffold from '../src/lib/primitives/EditablePageScaffold.svelte';

afterEach(() => cleanup());

const editMode = (discards: boolean) => ({
	isEditing: true,
	canEdit: true,
	onEdit: vi.fn(),
	onCancel: vi.fn(),
	onSave: vi.fn(),
	discards
});

// Edit mode swaps Edit for the house's action pair: Cancel and Save, one
// size; Cancel neutral until a field has changed, then red.
describe("edit mode's Cancel", () => {
	it('is neutral until a field has changed', () => {
		render(EditablePageScaffold, { props: { editMode: editMode(false) } });
		const cancel = screen.getByRole('button', { name: 'Cancel' });
		expect(cancel.dataset.tone).toBe('neutral');
		expect(cancel.className).not.toMatch(/text-red-/);
		expect(screen.getByRole('button', { name: 'Save' }).dataset.tone).toBe('green');
	});

	it('is red while cancelling would discard a change', () => {
		render(EditablePageScaffold, { props: { editMode: editMode(true) } });
		const cancel = screen.getByRole('button', { name: 'Cancel' });
		expect(cancel.dataset.tone).toBe('red');
		expect(cancel.className).toMatch(/text-red-/);
	});

	it('keeps a draft save between Cancel and Save', () => {
		render(EditablePageScaffold, {
			props: { editMode: { ...editMode(false), showSaveAsDraft: true, onSaveAsDraft: vi.fn() } }
		});
		expect(screen.getAllByRole('button').map((b) => b.textContent?.trim())).toEqual([
			'Cancel',
			'Save as draft',
			'Save'
		]);
	});
});
