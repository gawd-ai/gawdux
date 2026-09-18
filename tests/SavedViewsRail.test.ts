import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SavedViewsRail from '../src/lib/primitives/SavedViewsRail.svelte';
import type { SavedViewSummary } from '../src/lib/primitives/saved-views';

afterEach(() => cleanup());

const VIEWS: SavedViewSummary[] = [
	{ id: 'v1', name: 'Offline', query: { status: 'offline' } },
	{ id: 'v2', name: 'Ford', query: { q: 'ford' } }
];

function mountRail(props: Partial<Record<string, unknown>> = {}) {
	const onSelect = vi.fn();
	const onSave = vi.fn(async () => true);
	const onDelete = vi.fn(async () => true);
	const view = render(SavedViewsRail, {
		props: {
			views: VIEWS,
			current: {},
			onSelect,
			onSave,
			onDelete,
			...props
		}
	});
	return { ...view, onSelect, onSave, onDelete };
}

function pressed(name: string): string | null {
	return screen.getByRole('button', { name }).getAttribute('aria-pressed');
}

describe('SavedViewsRail', () => {
	it('presses All for the default query and offers no save', () => {
		mountRail();
		expect(pressed('All')).toBe('true');
		expect(pressed('Offline')).toBe('false');
		expect(screen.queryByRole('button', { name: 'Save view' })).toBeNull();
		expect(screen.queryByRole('button', { name: /Delete view/ })).toBeNull();
	});

	it('shows Save view for an unsaved query with nothing pressed and no delete', () => {
		mountRail({ current: { status: 'online' } });
		expect(pressed('All')).toBe('false');
		expect(pressed('Offline')).toBe('false');
		expect(screen.getByRole('button', { name: 'Save view' })).toBeTruthy();
		expect(screen.queryByRole('button', { name: /Delete view/ })).toBeNull();
	});

	it('presses the matching view, hides Save and carries one delete control', () => {
		mountRail({ current: { status: 'offline' } });
		expect(pressed('Offline')).toBe('true');
		expect(screen.queryByRole('button', { name: 'Save view' })).toBeNull();
		expect(screen.getAllByRole('button', { name: /Delete view/ })).toHaveLength(1);
		expect(screen.getByRole('button', { name: 'Delete view Offline' })).toBeTruthy();
	});

	it('opens a focused name field with the suggested name', async () => {
		mountRail({ current: { status: 'online' }, suggestedName: 'Online' });
		await fireEvent.click(screen.getByRole('button', { name: 'Save view' }));
		await tick();
		const input = screen.getByRole('textbox', { name: 'Save view' }) as HTMLInputElement;
		expect(input.value).toBe('Online');
		expect(document.activeElement).toBe(input);
		expect(screen.queryByRole('button', { name: 'Save view' })).toBeNull();
	});

	it('saves the trimmed name on Enter and closes on success', async () => {
		const { onSave, rerender } = mountRail({ current: { status: 'online' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save view' }));
		const input = screen.getByRole('textbox', { name: 'Save view' });
		await fireEvent.input(input, { target: { value: '  Online now  ' } });
		await fireEvent.keyDown(input, { key: 'Enter' });
		await tick();
		expect(onSave).toHaveBeenCalledWith('Online now');
		// The host lists the new view; the query now matches and the editor is gone.
		await rerender({
			views: [...VIEWS, { id: 'v3', name: 'Online now', query: { status: 'online' } }],
			current: { status: 'online' },
			onSelect: vi.fn(),
			onSave,
			onDelete: vi.fn()
		});
		expect(screen.queryByRole('textbox')).toBeNull();
		expect(pressed('Online now')).toBe('true');
	});

	it('stays open and marks the field invalid when the host refuses', async () => {
		const onSave = vi.fn(async () => false);
		mountRail({ current: { status: 'online' }, onSave });
		await fireEvent.click(screen.getByRole('button', { name: 'Save view' }));
		const input = screen.getByRole('textbox', { name: 'Save view' });
		await fireEvent.input(input, { target: { value: 'Dup' } });
		await fireEvent.keyDown(input, { key: 'Enter' });
		await tick();
		await tick();
		expect(onSave).toHaveBeenCalledOnce();
		expect(screen.getByRole('textbox', { name: 'Save view' }).getAttribute('aria-invalid')).toBe(
			'true'
		);
	});

	it('refuses an empty name without calling the host', async () => {
		const { onSave } = mountRail({ current: { status: 'online' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Save view' }));
		const input = screen.getByRole('textbox', { name: 'Save view' });
		await fireEvent.input(input, { target: { value: '   ' } });
		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(onSave).not.toHaveBeenCalled();
		expect(input.getAttribute('aria-invalid')).toBe('true');
	});

	it('cancels on Escape without saving and without reaching the window', async () => {
		const { onSave } = mountRail({ current: { status: 'online' }, suggestedName: 'Online' });
		const windowListener = vi.fn();
		window.addEventListener('keydown', windowListener);
		try {
			await fireEvent.click(screen.getByRole('button', { name: 'Save view' }));
			const input = screen.getByRole('textbox', { name: 'Save view' });
			await fireEvent.keyDown(input, { key: 'Escape' });
			expect(onSave).not.toHaveBeenCalled();
			expect(screen.queryByRole('textbox')).toBeNull();
			expect(screen.getByRole('button', { name: 'Save view' })).toBeTruthy();
			expect(windowListener).not.toHaveBeenCalled();
		} finally {
			window.removeEventListener('keydown', windowListener);
		}
	});

	it('deletes the pressed view immediately', async () => {
		const { onDelete } = mountRail({ current: { status: 'offline' } });
		await fireEvent.click(screen.getByRole('button', { name: 'Delete view Offline' }));
		expect(onDelete).toHaveBeenCalledWith(VIEWS[0]);
	});

	it('reports All as null and a view as itself', async () => {
		const { onSelect } = mountRail({ current: { status: 'offline' } });
		await fireEvent.click(screen.getByRole('button', { name: 'All' }));
		expect(onSelect).toHaveBeenLastCalledWith(null);
		await fireEvent.click(screen.getByRole('button', { name: 'Ford' }));
		expect(onSelect).toHaveBeenLastCalledWith(VIEWS[1]);
	});

	it('carries the host error on the name field', async () => {
		mountRail({ current: { status: 'online' }, error: 'A view with that name exists.' });
		await fireEvent.click(screen.getByRole('button', { name: 'Save view' }));
		const input = screen.getByRole('textbox', { name: 'Save view' });
		expect(input.getAttribute('title')).toBe('A view with that name exists.');
		expect(input.getAttribute('aria-invalid')).toBe('true');
	});

	it('always renders the All pill, even with no views', () => {
		mountRail({ views: [] });
		expect(pressed('All')).toBe('true');
		expect(screen.getAllByRole('button')).toHaveLength(1);
	});
});
