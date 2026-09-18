import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FilterPillRow, { filterPillClass } from '../src/lib/primitives/FilterPillRow.svelte';

afterEach(() => cleanup());

const PILLS = [
	{ id: 'all', label: 'All' },
	{ id: 'open', label: 'Open', count: 3 }
];

describe('FilterPillRow', () => {
	it('presses the selected pill and nothing when selected is null', async () => {
		const { rerender } = render(FilterPillRow, {
			props: { pills: PILLS, selected: 'open', onSelect: () => {} }
		});
		expect(screen.getByRole('button', { name: 'Open 3' }).getAttribute('aria-pressed')).toBe(
			'true'
		);
		expect(screen.getByRole('button', { name: 'All' }).getAttribute('aria-pressed')).toBe('false');

		await rerender({ pills: PILLS, selected: null, onSelect: () => {} });
		for (const button of screen.getAllByRole('button')) {
			expect(button.getAttribute('aria-pressed')).toBe('false');
		}
	});

	it('reports the chosen pill id', async () => {
		const onSelect = vi.fn();
		render(FilterPillRow, { props: { pills: PILLS, selected: 'all', onSelect } });
		await fireEvent.click(screen.getByRole('button', { name: 'Open 3' }));
		expect(onSelect).toHaveBeenCalledWith('open');
	});

	it('renders the remove control only on the pressed pill, with the given label', async () => {
		const onRemove = vi.fn();
		render(FilterPillRow, {
			props: {
				pills: PILLS,
				selected: 'open',
				onSelect: () => {},
				onRemove,
				removeLabel: (pill: { label: string }) => `Delete view ${pill.label}`
			}
		});
		const remove = screen.getByRole('button', { name: 'Delete view Open' });
		expect(screen.queryByRole('button', { name: 'Delete view All' })).toBeNull();
		await fireEvent.click(remove);
		expect(onRemove).toHaveBeenCalledWith(PILLS[1]);
	});

	it('renders no remove control without onRemove', () => {
		render(FilterPillRow, { props: { pills: PILLS, selected: 'open', onSelect: () => {} } });
		expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
	});

	it('renders trailing content inside the track after the pills', () => {
		const trailing = createRawSnippet(() => ({
			render: () => '<button type="button" data-trailing>Trailing</button>'
		}));
		const { container } = render(FilterPillRow, {
			props: { pills: PILLS, selected: 'all', onSelect: () => {}, trailing }
		});
		const track = container.querySelector('.filter-pill-track');
		const buttons = Array.from(track?.querySelectorAll('button') ?? []);
		expect(buttons.at(-1)?.hasAttribute('data-trailing')).toBe(true);
	});

	it('disables every pill while disabled', () => {
		render(FilterPillRow, {
			props: { pills: PILLS, selected: 'all', onSelect: () => {}, onRemove: () => {}, disabled: true }
		});
		for (const button of screen.getAllByRole('button')) {
			expect(button).toHaveProperty('disabled', true);
		}
	});

	it('exports the pill recipe for controls that must read as a pill', () => {
		expect(filterPillClass(true)).toContain('filter-pill');
		expect(filterPillClass(true)).toContain('bg-white');
		expect(filterPillClass(false)).toContain('border-transparent');
	});
});
