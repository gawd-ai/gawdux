import { cleanup, fireEvent, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClockOutline } from 'flowbite-svelte-icons';
import BareIcon from './fixtures/BareIcon.svelte';
import type { DataTableColumn } from '../src/lib/primitives/data-table';
import SortableHeadCell from '../src/lib/primitives/SortableHeadCell.svelte';
import TableContainer from '../src/lib/primitives/TableContainer.svelte';
import DataTableHarness from './fixtures/DataTableHarness.svelte';

afterEach(() => cleanup());

const ROWS = [
	{ id: 'a', name: 'Core switch', status: 'Up', latency: 3 },
	{ id: 'b', name: 'Camera NVR', status: 'Down', latency: 120 }
];

const headers = (container: HTMLElement) => [...container.querySelectorAll('thead th')] as HTMLElement[];

describe('DataTable', () => {
	it('composes a framed TableContainer that is not a page surface', () => {
		const { container } = render(DataTableHarness, { props: { rows: ROWS } });
		const root = container.querySelector('.data-table') as HTMLElement;
		expect(root.classList.contains('table-container')).toBe(true);
		expect(root.classList.contains('context-surface')).toBe(false);
		expect(root.querySelector('table caption')?.textContent).toBe('Targets');
	});

	it('renders one header per column and one cell per column per row', () => {
		const { container } = render(DataTableHarness, { props: { rows: ROWS } });
		expect(headers(container).map((th) => th.textContent?.trim())).toEqual([
			'Name',
			'Status',
			'Latency',
			'Actions'
		]);
		const bodyRows = container.querySelectorAll('tbody tr');
		expect(bodyRows).toHaveLength(2);
		expect([...bodyRows[0]!.querySelectorAll('td')].map((td) => td.textContent?.trim())).toEqual([
			'Core switch',
			'Up',
			'3 ms',
			'Test'
		]);
	});

	it('wires sortable columns to SortableHeadCell and the host sort handler', async () => {
		const onSort = vi.fn();
		const { container } = render(DataTableHarness, {
			props: { rows: ROWS, onSort, sortField: 'latency', sortDirection: 'desc' }
		});
		const [name, status, latency] = headers(container);
		// Sortable headers are SortableHeadCells: interactive, with an arrow.
		expect(name!.className).toContain('interactive-hover');
		expect(latency!.className).toContain('interactive-hover');
		expect(status!.className).not.toContain('interactive-hover');
		// Only the active column shows its arrow at full strength.
		expect(latency!.querySelector('svg.opacity-100')).toBeTruthy();
		expect(name!.querySelector('svg.opacity-100')).toBeNull();

		await fireEvent.click(name!);
		expect(onSort).toHaveBeenLastCalledWith('name');
		await fireEvent.click(latency!);
		expect(onSort).toHaveBeenLastCalledWith('latency');
		await fireEvent.click(status!);
		expect(onSort).toHaveBeenCalledTimes(2);
	});

	it('renders plain headers when the host does not sort', () => {
		const { container } = render(DataTableHarness, { props: { rows: ROWS } });
		for (const th of headers(container)) {
			expect(th.className).not.toContain('interactive-hover');
			expect(th.className).toContain('whitespace-nowrap');
		}
	});

	it('applies column alignment and classes to header and body cells', () => {
		const onSort = vi.fn();
		const { container } = render(DataTableHarness, { props: { rows: ROWS, onSort } });
		const [, status, latency, actions] = headers(container);
		expect(latency!.className).toContain('text-right');
		expect(latency!.querySelector('div')?.className).toContain('justify-end');
		expect(actions!.className).toContain('text-center');
		expect(status!.className).toContain('status-col');
		const cells = container.querySelectorAll('tbody tr:first-child td');
		expect(cells[1]!.className).toContain('status-col');
		expect(cells[2]!.className).toContain('text-right');
		expect(cells[2]!.className).toContain('tabular-nums');
		expect(cells[3]!.className).toContain('text-center');
		// Body cells keep flowbite's default padding, which the density knobs drive.
		expect(cells[0]!.className).toContain('px-6');
		expect(cells[0]!.className).toContain('py-4');
	});

	it('makes rows clickable while a control inside the row keeps its own click', async () => {
		const onRowClick = vi.fn();
		const onAction = vi.fn();
		const { container } = render(DataTableHarness, { props: { rows: ROWS, onRowClick, onAction } });
		const row = container.querySelectorAll('tbody tr')[1] as HTMLElement;
		expect(row.className).toContain('interactive-hover');

		await fireEvent.click(within(row).getByText('Camera NVR'));
		expect(onRowClick).toHaveBeenCalledTimes(1);
		expect(onRowClick.mock.calls[0]![0]).toEqual(ROWS[1]);

		await fireEvent.click(within(row).getByRole('button', { name: 'Test' }));
		expect(onAction).toHaveBeenCalledWith(ROWS[1]);
		expect(onRowClick).toHaveBeenCalledTimes(1);
	});

	it('leaves rows inert without a row handler', () => {
		const { container } = render(DataTableHarness, { props: { rows: ROWS } });
		for (const row of container.querySelectorAll('tbody tr')) {
			expect(row.className).not.toContain('interactive-hover');
		}
	});

	it('shows the house empty row spanning every column', () => {
		const { container } = render(DataTableHarness, {
			props: { rows: [], emptyText: 'No targets', emptyHint: 'Add a target to monitor it.' }
		});
		const cell = container.querySelector('tbody td');
		expect(cell?.getAttribute('colspan')).toBe('4');
		expect(screen.getByText('No targets')).toBeTruthy();
		expect(screen.getByText('Add a target to monitor it.')).toBeTruthy();
	});

	it('takes a card header title, and drops the frame inside a card', () => {
		const framed = render(DataTableHarness, { props: { rows: ROWS, title: 'Monitored systems' } });
		const heading = framed.getByRole('heading', { name: 'Monitored systems' });
		expect(heading.className).toContain('card-header-title');
		expect(heading.parentElement?.className).toContain('card-header');
		cleanup();

		const bare = render(DataTableHarness, { props: { rows: ROWS, framed: false } });
		const root = bare.container.querySelector('.data-table') as HTMLElement;
		expect(root.classList.contains('table-container')).toBe(false);
		expect(root.querySelector('table')).toBeTruthy();
	});
});

describe('DataTable go-to link', () => {
	it('ends the card header with the go-to icon', () => {
		const { container } = render(DataTableHarness, {
			props: { rows: ROWS, title: 'Interfaces', link: { label: 'Open Network', href: '/net' } }
		});
		const header = container.querySelector('.card-header') as HTMLElement;
		const link = screen.getByRole('link', { name: 'Open Network' });
		expect(header.contains(link)).toBe(true);
		expect(link.textContent?.trim()).toBe('');
	});
});

describe('SortableHeadCell alignment (additive)', () => {
	it('renders exactly as before by default', () => {
		const { container } = render(SortableHeadCell, {
			props: { field: 'name', label: 'Name', sortField: 'name', onSort: () => {} }
		});
		const th = container.querySelector('th') as HTMLElement;
		expect(th.className).not.toMatch(/text-(right|center)/);
		expect(th.querySelector('div')?.className).toBe('flex items-center gap-2');
	});

	it('right-aligns the label and arrow with a numeric column', () => {
		const { container } = render(SortableHeadCell, {
			props: { field: 'n', label: 'Count', sortField: '', onSort: () => {}, align: 'right' }
		});
		const th = container.querySelector('th') as HTMLElement;
		expect(th.className).toContain('text-right');
		expect(th.querySelector('div')?.className).toContain('justify-end');
	});
});

describe('TableContainer surface (additive)', () => {
	it('is the page content surface by default', () => {
		const { container } = render(TableContainer);
		const root = container.firstElementChild as HTMLElement;
		expect(root.className.startsWith('context-surface table-container ')).toBe(true);
	});

	it('drops the surface role on request and keeps the frame', () => {
		const { container } = render(TableContainer, { props: { surface: false } });
		const root = container.firstElementChild as HTMLElement;
		expect(root.classList.contains('context-surface')).toBe(false);
		expect(root.classList.contains('table-container')).toBe(true);
		expect(root.classList.contains('border')).toBe(true);
	});
});

describe('DataTable column icons (one header shape)', () => {
	/** A header's label shape: the tags under `.table-head-label`, in order. */
	const shape = (th: HTMLElement) => {
		const label = th.querySelector('.table-head-label');
		return label ? [...label.children].map((c) => `${c.tagName.toLowerCase()}.${c.getAttribute('class') ?? ''}`) : null;
	};

	it('gives a plain and a sortable column with an icon the same label shape', () => {
		const columns: DataTableColumn[] = [
			{ key: 'name', label: 'Name', sort: 'name', icon: BareIcon },
			{ key: 'status', label: 'Status', icon: BareIcon },
			{ key: 'latency', label: 'Latency', sort: 'latency', align: 'right' },
			{ key: 'actions', label: 'Actions', align: 'center' }
		];
		const { container } = render(DataTableHarness, { props: { rows: ROWS, columns, onSort: vi.fn() } });
		const [sortable, plain, bareSortable, barePlain] = headers(container);
		expect(shape(sortable!)).toEqual(shape(plain!));
		for (const th of [sortable!, plain!]) {
			const icon = th.querySelector('.table-head-label > svg.table-head-icon')!;
			expect(icon.getAttribute('aria-hidden')).toBe('true');
			expect(icon.nextElementSibling?.tagName.toLowerCase()).toBe('span');
		}
		expect(sortable!.querySelector('.table-head-label > span')?.textContent).toBe('Name');
		expect(plain!.querySelector('.table-head-label > span')?.textContent).toBe('Status');
		// Columns without an icon render as in 0.17.0: the sortable one's span, the plain one's bare word.
		expect(bareSortable!.querySelector('.table-head-label, .table-head-icon')).toBeNull();
		expect(bareSortable!.querySelector('div > span')?.textContent).toBe('Latency');
		expect(barePlain!.querySelector('svg, span')).toBeNull();
		expect(barePlain!.textContent?.trim()).toBe('Actions');
	});

	it('renders no header icon for a product that passes none', () => {
		const { container } = render(DataTableHarness, { props: { rows: ROWS, onSort: vi.fn() } });
		expect(container.querySelector('thead .table-head-icon, thead .table-head-label')).toBeNull();
		const plain = render(DataTableHarness, { props: { rows: ROWS } });
		expect(plain.container.querySelector('thead svg')).toBeNull();
	});

	it('sets aria-sort on the active sortable column only', () => {
		const columns: DataTableColumn[] = [
			{ key: 'name', label: 'Name', sort: 'name', icon: ClockOutline },
			{ key: 'latency', label: 'Latency', sort: 'latency' },
			{ key: 'status', label: 'Status' }
		];
		const { container } = render(DataTableHarness, {
			props: { rows: ROWS, columns, onSort: vi.fn(), sortField: 'latency', sortDirection: 'asc' }
		});
		expect(headers(container).map((th) => th.getAttribute('aria-sort'))).toEqual([null, 'ascending', null]);
	});
});
