import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CommandPalette, {
	type CommandPaletteItem
} from '../src/lib/primitives/CommandPalette.svelte';

afterEach(() => cleanup());

const items: CommandPaletteItem[] = [
	{ label: 'Dashboard', hint: 'Overview', href: '/app' },
	{ label: 'Records', hint: 'All records', href: '/app/records' },
	{ label: 'Settings', hint: 'System settings', href: '/app/settings' }
];

describe('CommandPalette', () => {
	it('opens as a labelled dialog listing the static items', async () => {
		render(CommandPalette, { props: { open: true, items } });

		const dialog = screen.getByRole('dialog', { name: 'Command palette' });
		expect(dialog.getAttribute('aria-modal')).toBe('true');
		await waitFor(() => {
			expect(screen.getAllByRole('option')).toHaveLength(items.length);
		});
		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.getByText('System settings')).toBeTruthy();
	});

	it('filters static items on label and hint as the query changes', async () => {
		render(CommandPalette, { props: { open: true, items } });
		const input = screen.getByRole('textbox');

		await fireEvent.input(input, { target: { value: 'settings' } });
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
		expect(screen.getByText('Settings')).toBeTruthy();

		await fireEvent.input(input, { target: { value: 'zzz-no-match' } });
		await waitFor(() => expect(screen.queryAllByRole('option')).toHaveLength(0));
		expect(screen.getByText('No results found')).toBeTruthy();
	});

	it('navigates with arrow keys and hands Enter to the onnavigate callback', async () => {
		const onnavigate = vi.fn();
		render(CommandPalette, { props: { open: true, items, onnavigate } });
		const input = screen.getByRole('textbox');

		await fireEvent.keyDown(input, { key: 'ArrowDown' });
		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(onnavigate).toHaveBeenCalledTimes(1);
		expect(onnavigate.mock.calls[0]?.[0]?.label).toBe('Records');
	});

	it('prepends debounced async search results above the static matches', async () => {
		const search = vi.fn(async (query: string) => [
			{ label: `Device matching ${query}`, hint: 'online', href: '/app/devices/1' }
		]);
		render(CommandPalette, {
			props: { open: true, items, search, searchDebounceMs: 0 }
		});
		const input = screen.getByRole('textbox');

		await fireEvent.input(input, { target: { value: 'record' } });
		await waitFor(() => expect(search).toHaveBeenCalledWith('record'));
		await waitFor(() => {
			const options = screen.getAllByRole('option');
			expect(options[0]?.textContent).toContain('Device matching record');
			expect(options[1]?.textContent).toContain('Records');
		});
	});

	it('skips the async source below the minimum query length', async () => {
		const search = vi.fn(async () => []);
		render(CommandPalette, {
			props: { open: true, items, search, searchDebounceMs: 0, minSearchLength: 2 }
		});
		const input = screen.getByRole('textbox');

		await fireEvent.input(input, { target: { value: 'r' } });
		await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));
		expect(search).not.toHaveBeenCalled();
	});

	it('toggles with the global Ctrl/Cmd+K shortcut and closes on Escape', async () => {
		render(CommandPalette, { props: { items } });
		expect(screen.queryByRole('dialog')).toBeNull();

		await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
		await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());

		const input = screen.getByRole('textbox');
		await fireEvent.keyDown(input, { key: 'Escape' });
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
	});

	it('leaves the shortcut uninstalled when globalShortcut is false', async () => {
		render(CommandPalette, { props: { items, globalShortcut: false } });

		await fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
		await new Promise((resolve) => setTimeout(resolve, 20));
		expect(screen.queryByRole('dialog')).toBeNull();
	});
});
