import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
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
