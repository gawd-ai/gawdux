import { cleanup, fireEvent, render, screen, within } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
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
