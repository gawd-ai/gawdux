import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import BareIcon from './fixtures/BareIcon.svelte';
import AuditHistoryTable from '../src/lib/admin/AuditHistoryTable.svelte';
import type { AuditHistoryRow } from '../src/lib/admin/types';

afterEach(() => cleanup());

const LONG = 'Device RELAY-001 ' + 'rebooted after the uplink failover because '.repeat(20);
const ROWS: AuditHistoryRow[] = [
	{
		id: 'a1',
		at: '2026-09-23T12:00:00Z',
		module: { label: 'Devices', tone: 'blue' },
		action: 'Command executed',
		comment: LONG,
		user: 'owner@example.test',
		record: 'RELAY-001',
		facts: [{ label: 'Request id', value: 'req-123' }],
		changes: [{ field: 'status', label: 'Status', oldValue: 'online', newValue: 'rebooting' }]
	},
	{ id: 'a2', at: null, action: 'Signed in', comment: '', user: null, changes: [] }
];

describe('AuditHistoryTable', () => {
	it('keeps a fixed layout so no row can widen the table', () => {
		const { container } = render(AuditHistoryTable, { props: { rows: ROWS } });
		const table = container.querySelector('table.audit-table') as HTMLTableElement;
		expect(table.classList.contains('table-fixed')).toBe(true);
		expect(container.querySelector('.line-clamp-2')?.getAttribute('title')).toBe(LONG);
	});

	it('opens the full entry beneath the row, one at a time', async () => {
		render(AuditHistoryTable, { props: { rows: ROWS } });
		expect(screen.queryByText('req-123')).toBeNull();
		const toggles = screen.getAllByRole('button', { name: 'Show details' });
		await fireEvent.click(toggles[0]!);
		expect(screen.getAllByText('req-123').length).toBeGreaterThan(0);
		expect(screen.getAllByText('rebooting').length).toBeGreaterThan(0);
		await fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
		expect(screen.queryByText('req-123')).toBeNull();
	});

	it('drops the module column where every row is one record', () => {
		const { container } = render(AuditHistoryTable, { props: { rows: ROWS, showModule: false } });
		const heads = Array.from(container.querySelectorAll('thead th'), (th) => th.textContent?.trim());
		expect(heads).not.toContain('Module');
		expect(container.querySelectorAll('col')).toHaveLength(5);
	});

	it('says so when there is nothing', () => {
		render(AuditHistoryTable, { props: { rows: [], emptyText: 'Nothing yet' } });
		expect(screen.getByText('Nothing yet')).toBeTruthy();
	});
});

describe('AuditHistoryTable column icons (headIcons)', () => {
	it('draws no header icon without headIcons', () => {
		const { container } = render(AuditHistoryTable, { props: { rows: ROWS } });
		expect(container.querySelector('thead svg')).toBeNull();
		expect([...container.querySelectorAll('thead th')].map((th) => th.textContent?.trim())).toEqual([
			'When',
			'Module',
			'Action',
			'Comment',
			'User / record',
			'Details'
		]);
	});

	it("puts a key's icon before that header's word and no other", () => {
		const { container } = render(AuditHistoryTable, {
			props: { rows: ROWS, headIcons: { when: BareIcon, user: BareIcon } }
		});
		const ths = [...container.querySelectorAll('thead th')] as HTMLElement[];
		const iconed = ths.filter((th) => th.querySelector('svg'));
		expect(iconed.map((th) => th.textContent?.trim())).toEqual(['When', 'User / record']);
		for (const th of iconed) {
			const label = th.querySelector('.table-head-label')!;
			expect(label.firstElementChild?.classList.contains('table-head-icon')).toBe(true);
			expect(label.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
		}
		// The screen-reader Details header never takes one.
		expect(ths.at(-1)!.querySelector('svg')).toBeNull();
	});
});
