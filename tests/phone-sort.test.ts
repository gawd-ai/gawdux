import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import postcss, { type AtRule, type Root } from 'postcss';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FilterBar from '../src/lib/primitives/FilterBar.svelte';
import type { ListSort } from '../src/lib/primitives/list-query';
import source from '../src/lib/styles/tokens.css?raw';
import packaged from '../dist/styles/tokens.css?raw';
import PhoneSortListHarness from './fixtures/PhoneSortListHarness.svelte';

// The house phone sort in a list's own toolbar: FilterBar's `sort`, which
// ListSurface and ListPageScaffold pass on. At or below the compact width a
// register's heads are hidden and its rows read as cards; the toolbar then
// offers "Sort by", one choice per key and direction, each order worded,
// and a choice writes the register's sort as a head's click does.

afterEach(() => cleanup());

const sort: ListSort = {
	keys: [
		{ key: 'issued', label: 'Issued', order: 'date' },
		{ key: 'name', label: 'Name' },
		{ key: 'total', label: 'Total', order: 'number' }
	],
	field: 'issued',
	direction: 'desc',
	onsort: () => {}
};

const select = () => screen.getByLabelText('Sort by') as HTMLSelectElement;

describe("FilterBar's phone sort", () => {
	it('offers "Sort by", one choice per key and direction, each order worded, the current one chosen', () => {
		const { container } = render(FilterBar, { props: { sort } });
		expect([...select().options].map((option) => option.textContent)).toEqual([
			'Issued: latest first',
			'Issued: earliest first',
			'Name: A to Z',
			'Name: Z to A',
			'Total: highest first',
			'Total: lowest first'
		]);
		expect(select().value).toBe('issued:desc');
		const control = select().closest('[data-list-phone-sort]')!;
		expect(control.classList.contains('mobile-sort')).toBe(true);
		const bar = container.querySelector('.filter-bar')!;
		expect(bar.classList.contains('filter-bar-has-sort')).toBe(true);
		// Under the filter row, a field of its own.
		expect(control.parentElement).toBe(bar);
		expect(control.previousElementSibling?.classList.contains('filter-row')).toBe(true);
	});

	it("writes the register's sort at once when a choice is made", async () => {
		const onsort = vi.fn();
		render(FilterBar, { props: { sort: { ...sort, onsort } } });
		select().value = 'name:desc';
		await fireEvent.change(select());
		expect(onsort).toHaveBeenCalledWith('name', 'desc');
		select().value = 'total:asc';
		await fireEvent.change(select());
		expect(onsort).toHaveBeenLastCalledWith('total', 'asc');
	});

	it("reads the register's own order before a key is chosen", () => {
		render(FilterBar, { props: { sort: { ...sort, field: '' } } });
		expect(select().selectedOptions[0]?.textContent).toBe('Default order');
		expect(select().selectedOptions[0]?.disabled).toBe(true);
	});

	it('draws no phone sort without a sort or its keys, the bar as it was', () => {
		for (const props of [{}, { sort: { ...sort, keys: [] } }]) {
			const { container } = render(FilterBar, { props });
			expect(container.querySelector('[data-list-phone-sort]')).toBeNull();
			expect(container.querySelector('.filter-bar')?.classList.contains('filter-bar-has-sort')).toBe(false);
			cleanup();
		}
	});
});

describe('a register sorted by its heads and its phone sort alike', () => {
	it('takes the sort through ListPageScaffold into its toolbar', () => {
		const { container } = render(PhoneSortListHarness);
		const control = container.querySelector('.filter-bar [data-list-phone-sort]');
		expect(control).not.toBeNull();
		expect(container.querySelectorAll('[data-list-phone-sort]')).toHaveLength(1);
	});

	it("keeps one sort state: a head's click and a choice write it alike", async () => {
		render(PhoneSortListHarness);
		const order = screen.getByTestId('order');
		expect(order.textContent).toBe('issued:desc');

		await fireEvent.click(screen.getByText('Name', { selector: 'th span' }).closest('th')!);
		expect(order.textContent).toBe('name:asc');
		expect(select().value).toBe('name:asc');

		select().value = 'issued:asc';
		await fireEvent.change(select());
		expect(order.textContent).toBe('issued:asc');
		expect(select().value).toBe('issued:asc');
	});

	it('draws none for a register given no sort', () => {
		const { container } = render(PhoneSortListHarness, { props: { sorted: false } });
		expect(container.querySelector('[data-list-phone-sort]')).toBeNull();
	});

	it('leaves an empty filter row beside the sort with no element in it', () => {
		const { container } = render(PhoneSortListHarness, { props: { filters: false } });
		const row = container.querySelector('.filter-bar-has-sort > .filter-row')!;
		expect(row.children).toHaveLength(0);
	});

	it("draws a tab's toolbar for the sort alone only where it shows", () => {
		const alone = render(PhoneSortListHarness, { props: { mode: 'tab', filters: false } });
		const bar = alone.container.querySelector('.filter-bar')!;
		expect(bar.classList.contains('filter-bar-sort-only')).toBe(true);
		expect(bar.querySelector('[data-list-phone-sort]')).not.toBeNull();
		// The list's own modifiers are as they were without the sort.
		expect(alone.container.querySelector('.list-tab-scaffold')?.classList.contains('list-surface-has-filters')).toBe(
			false
		);
		cleanup();

		for (const props of [
			{ mode: 'tab' as const, filters: true },
			{ mode: 'tab' as const, filters: true, rail: true },
			{ mode: 'scaffold' as const, filters: false }
		]) {
			const { container } = render(PhoneSortListHarness, { props });
			const found = container.querySelector('.filter-bar')!;
			expect(found.classList.contains('filter-bar-sort-only'), JSON.stringify(props)).toBe(false);
			expect(found.querySelector('[data-list-phone-sort]')).not.toBeNull();
			cleanup();
		}

		const unsorted = render(PhoneSortListHarness, { props: { mode: 'tab', filters: false, sorted: false } });
		expect(unsorted.container.querySelector('.filter-bar')).toBeNull();
	});
});

function mediaBlocks(root: Root, params: string): AtRule[] {
	const found: AtRule[] = [];
	root.each((node) => {
		if (node.type === 'atrule' && node.name === 'media' && node.params === params) found.push(node);
	});
	return found;
}

function declarations(scopes: Array<Root | AtRule>, selector: string): Record<string, string> {
	const found: Record<string, string> = {};
	for (const scope of scopes) {
		scope.walkRules((rule) => {
			if (!rule.selectors.map((s) => s.trim()).includes(selector)) return;
			rule.each((child) => {
				if (child.type === 'decl') found[child.prop] = `${child.value}${child.important ? ' !important' : ''}`;
			});
		});
	}
	return found;
}

for (const [name, css] of [
	['tokens.css', source],
	['the packaged tokens.css', packaged]
] as const) {
	describe(`the phone sort's rules (${name})`, () => {
		const root = postcss.parse(css);
		const compact = mediaBlocks(root, '(max-width: 1024px)');
		const wide = mediaBlocks(root, '(min-width: 1025px)');

		it('shows the sort at or below the compact width, its label on its select, and nowhere above it', () => {
			expect(declarations(compact, '.mobile-sort')).toMatchObject({ display: 'flex' });
			expect(declarations(compact, '.mobile-sort > .form-label')).toEqual({ 'margin-bottom': '0' });
			expect(declarations(compact, '.mobile-sort select')).toMatchObject({ 'min-height': '44px' });
			expect(declarations(wide, '.mobile-sort')).toEqual({ display: 'none' });
		});

		it('draws no toolbar held only for the sort above the compact width', () => {
			expect(declarations(wide, '.filter-bar-sort-only')).toEqual({ display: 'none' });
			expect(declarations(compact, '.filter-bar-sort-only')).toEqual({});
		});

		it('gives an empty filter row beside the sort no room', () => {
			expect(declarations([root], '.filter-bar-has-sort > .filter-row:not(:has(*))')).toEqual({
				display: 'none !important'
			});
		});
	});
}
