import { cleanup, fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClockOutline } from 'flowbite-svelte-icons';
import SortableHeadCell from '../src/lib/primitives/SortableHeadCell.svelte';
import SortableHeadCell0170 from './fixtures/SortableHeadCell_0_17_0.svelte';
import BareIcon from './fixtures/BareIcon.svelte';

afterEach(() => cleanup());

/** A cell's markup without Svelte's anchor comments. */
const markup = (el: Element) => el.outerHTML.replace(/<!--[^>]*-->/g, '');

const base = { field: 'name', label: 'Name', sortField: 'other', onSort: () => {} };

describe('SortableHeadCell: the header shape and aria-sort (column icons)', () => {
	it('without an icon renders the markup of 0.17.0 on an inactive column', () => {
		for (const align of ['left', 'center', 'right'] as const) {
			const now = render(SortableHeadCell, { props: { ...base, align, className: 'w-24' } });
			const thNow = now.container.querySelector('th')!;
			const then = render(SortableHeadCell0170, { props: { ...base, align, className: 'w-24' } });
			const thThen = then.container.querySelector('th')!;
			expect(markup(thNow)).toBe(markup(thThen));
			cleanup();
		}
		const { container } = render(SortableHeadCell, { props: base });
		const row = container.querySelector('th > div') as HTMLElement;
		expect(row.className).toBe('flex items-center gap-2');
		expect([...row.children].map((c) => c.tagName.toLowerCase())).toEqual(['span', 'svg']);
		expect(container.querySelector('.table-head-label')).toBeNull();
	});

	it('without an icon, the active column differs from 0.17.0 only by aria-sort', () => {
		const props = { ...base, sortField: 'name', sortDirection: 'desc' as const };
		const now = render(SortableHeadCell, { props });
		const thNow = now.container.querySelector('th')!;
		expect(thNow.getAttribute('aria-sort')).toBe('descending');
		const then = render(SortableHeadCell0170, { props });
		const thThen = then.container.querySelector('th')!;
		thNow.removeAttribute('aria-sort');
		expect(markup(thNow)).toBe(markup(thThen));
	});

	it('with an icon puts the one header shape before the arrow, the icon aria-hidden', () => {
		const { container } = render(SortableHeadCell, { props: { ...base, icon: BareIcon } });
		const row = container.querySelector('th > div') as HTMLElement;
		const [label, arrow] = [...row.children] as HTMLElement[];
		expect(row.children).toHaveLength(2);
		expect(label!.className).toBe('table-head-label');
		const icon = label!.querySelector('svg') as SVGElement;
		expect(icon.classList.contains('table-head-icon')).toBe(true);
		expect(icon.getAttribute('aria-hidden')).toBe('true');
		expect(label!.querySelector('span')?.textContent).toBe('Name');
		expect(label!.firstElementChild).toBe(icon);
		// The arrow is unchanged: still the sort's, still last.
		expect(arrow!.tagName.toLowerCase()).toBe('svg');
		expect(arrow!.getAttribute('class')).toContain('transition-opacity');
		expect(arrow!.classList.contains('table-head-icon')).toBe(false);
	});

	it('sets aria-sort on the active column only, never through the icon', () => {
		const asc = render(SortableHeadCell, {
			props: { ...base, sortField: 'name', sortDirection: 'asc', icon: ClockOutline }
		});
		const th = asc.container.querySelector('th')!;
		expect(th.getAttribute('aria-sort')).toBe('ascending');
		const iconBefore = th.querySelector('.table-head-icon')!.getAttribute('class');
		cleanup();
		const inactive = render(SortableHeadCell, { props: { ...base, icon: ClockOutline } });
		const idle = inactive.container.querySelector('th')!;
		expect(idle.hasAttribute('aria-sort')).toBe(false);
		// The column icon does not change with the sort.
		expect(idle.querySelector('.table-head-icon')!.getAttribute('class')).toBe(iconBefore);
	});

	it('sorts on a click anywhere in the cell, the icon included', async () => {
		const onSort = vi.fn();
		const { container } = render(SortableHeadCell, { props: { ...base, onSort, icon: ClockOutline } });
		await fireEvent.click(container.querySelector('.table-head-icon')!);
		expect(onSort).toHaveBeenCalledWith('name');
		await fireEvent.click(container.querySelector('th')!);
		expect(onSort).toHaveBeenCalledTimes(2);
	});
});
