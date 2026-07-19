import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FilterPillRow from '../src/lib/primitives/FilterPillRow.svelte';
import ListQueryBar from '../src/lib/primitives/ListQueryBar.svelte';
import SearchInput from '../src/lib/primitives/SearchInput.svelte';

const advancedFilters = createRawSnippet(() => ({
	render: () =>
		'<div><label for="owner-filter">Owner</label><select id="owner-filter"><option>Any</option></select></div>'
}));

const quickFilters = createRawSnippet(() => ({
	render: () => '<div data-testid="quick-filters">Quick filters</div>'
}));

const mobileSort = createRawSnippet(() => ({
	render: () => '<button type="button">Sort records</button>'
}));

afterEach(() => cleanup());

describe('SearchInput', () => {
	it('preserves focus when its clear button removes the query', async () => {
		const onclear = vi.fn();
		render(SearchInput, { props: { value: 'alpha', onclear } });

		const input = screen.getByRole('textbox', { name: 'Search' });
		await fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

		expect(input).toHaveProperty('value', '');
		expect(document.activeElement).toBe(input);
		expect(onclear).toHaveBeenCalledOnce();
	});

	it('submits on Enter and exposes a labelled busy state', async () => {
		const onsubmit = vi.fn();
		render(SearchInput, {
			props: {
				value: 'release',
				busy: true,
				busyLabel: 'Loading records',
				onsubmit
			}
		});

		const input = screen.getByRole('textbox', { name: 'Search' });
		expect(input.getAttribute('aria-busy')).toBe('true');
		expect(screen.getByRole('status').textContent).toBe('Loading records');

		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(onsubmit).toHaveBeenCalledWith('release');
	});

	it('puts autocomplete semantics on the input and lets callers own handled keys', async () => {
		const onsubmit = vi.fn();
		const onkeydown = vi.fn((event: KeyboardEvent) => event.preventDefault());
		render(SearchInput, {
			props: {
				value: 'tenant',
				role: 'combobox',
				ariaControls: 'tenant-options',
				ariaExpanded: true,
				ariaAutocomplete: 'list',
				ariaActiveDescendant: 'tenant-option-2',
				ariaInvalid: true,
				ariaDescribedby: 'tenant-error',
				autocomplete: 'organization',
				clearLabel: 'Clear tenant search',
				onkeydown,
				onsubmit
			}
		});

		const input = screen.getByRole('combobox', { name: 'Search' });
		expect(input.getAttribute('aria-controls')).toBe('tenant-options');
		expect(input.getAttribute('aria-expanded')).toBe('true');
		expect(input.getAttribute('aria-autocomplete')).toBe('list');
		expect(input.getAttribute('aria-activedescendant')).toBe('tenant-option-2');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')).toBe('tenant-error');
		expect(input.getAttribute('autocomplete')).toBe('organization');
		expect(screen.getByRole('button', { name: 'Clear tenant search' })).toBeTruthy();

		await fireEvent.keyDown(input, { key: 'Enter' });
		expect(onkeydown).toHaveBeenCalledOnce();
		expect(onsubmit).not.toHaveBeenCalled();
	});
});

describe('ListQueryBar', () => {
	it('discloses advanced filters and renders active-filter controls and summary', async () => {
		let focusWhenRemoved: Element | null = null;
		let focusWhenReset: Element | null = null;
		const onRemoveFilter = vi.fn(() => (focusWhenRemoved = document.activeElement));
		const onResetFilters = vi.fn(() => (focusWhenReset = document.activeElement));
		render(ListQueryBar, {
			props: {
				advancedFilters,
				quickFilters,
				mobileSort,
				activeFilters: [{ id: 'status', label: 'Status', value: 'Open' }],
				resultCount: 12,
				onRemoveFilter,
				onResetFilters
			}
		});

		expect(screen.getByTestId('quick-filters')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Sort records' })).toBeNull();
		expect(screen.getByText('12 results')).toBeTruthy();
		expect(screen.getAllByRole('status')).toHaveLength(1);
		expect(screen.queryByRole('region', { name: 'Filters' })).toBeNull();

		await fireEvent.click(screen.getByRole('button', { name: 'Filters, 1 active filter' }));
		expect(screen.getByRole('region', { name: 'Filters' })).toBeTruthy();
		expect(screen.getByLabelText('Owner').closest('.list-query-advanced-grid')).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Sort records' })).toBeTruthy();

		const input = screen.getByRole('textbox', { name: 'Search' });
		await fireEvent.click(screen.getByRole('button', { name: 'Remove Status: Open filter' }));
		expect(onRemoveFilter).toHaveBeenCalledWith({
			id: 'status',
			label: 'Status',
			value: 'Open'
		});
		expect(focusWhenRemoved).toBe(input);

		await fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
		expect(onResetFilters).toHaveBeenCalledOnce();
		expect(focusWhenReset).toBe(input);
	});

	it('focuses with slash and handles Escape as query-first then panel-close', async () => {
		const onclear = vi.fn();
		render(ListQueryBar, {
			props: { value: 'needle', filtersOpen: true, advancedFilters, onclear }
		});
		const input = screen.getByRole('textbox', { name: 'Search' });
		const outside = document.createElement('button');
		document.body.append(outside);
		outside.focus();

		await fireEvent.keyDown(outside, { key: '/' });
		expect(document.activeElement).toBe(input);

		await fireEvent.keyDown(input, { key: 'Escape' });
		expect(input).toHaveProperty('value', '');
		expect(onclear).toHaveBeenCalledOnce();
		expect(screen.getByRole('region', { name: 'Filters' })).toBeTruthy();

		await fireEvent.keyDown(input, { key: 'Escape' });
		expect(screen.queryByRole('region', { name: 'Filters' })).toBeNull();
		expect(document.activeElement).toBe(input);
		outside.remove();
	});

	it('marks a mobile-sort-only disclosure as tablet-only', async () => {
		render(ListQueryBar, { props: { mobileSort } });

		const disclosure = screen.getByRole('button', { name: 'Sort' });
		expect(disclosure.classList.contains('list-query-sort-only')).toBe(true);
		expect(disclosure.getAttribute('title')).toBe('Sort');
		expect(screen.queryByRole('button', { name: 'Sort records' })).toBeNull();

		await fireEvent.click(disclosure);
		const panel = screen.getByRole('region', { name: 'Sort' });
		expect(panel.classList.contains('list-query-sort-only')).toBe(true);
		expect(screen.getByRole('button', { name: 'Sort records' })).toBeTruthy();
	});

	it('assigns the slash shortcut to only the first visible mounted bar', async () => {
		render(ListQueryBar, { props: { ariaLabel: 'First search' } });
		render(ListQueryBar, { props: { ariaLabel: 'Second search' } });

		await fireEvent.keyDown(window, { key: '/' });
		expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'First search' }));
	});
});

describe('FilterPillRow', () => {
	it('keeps the caller API while exposing one quick-filter group', async () => {
		const onSelect = vi.fn();
		render(FilterPillRow, {
			props: {
				pills: [
					{ id: 'all', label: 'All', count: 8 },
					{ id: 'open', label: 'Open', count: 3 }
				],
				selected: 'all',
				onSelect
			}
		});

		expect(screen.getByRole('group', { name: 'Quick filters' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'All 8' }).getAttribute('aria-pressed')).toBe('true');
		await fireEvent.click(screen.getByRole('button', { name: 'Open 3' }));
		expect(onSelect).toHaveBeenCalledWith('open');
	});
});
