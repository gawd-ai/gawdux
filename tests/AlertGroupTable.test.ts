import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AlertGroupTable from '../src/lib/alert-ops/AlertGroupTable.svelte';
import { makeAlert, makeGroup } from './fixtures/alert-ops';

afterEach(() => cleanup());

const groups = [
	makeGroup({
		key: '{service="api"}',
		labels: { service: 'api' },
		alerts: [
			makeAlert({ fingerprint: 'f-critical-0001', severity: 'critical' }),
			makeAlert({ fingerprint: 'f-warning-0002', severity: 'warning', receiver: 'ops-mail' }),
			makeAlert({ fingerprint: 'f-info-0003', severity: 'info' }),
			makeAlert({ fingerprint: 'f-notice-0004', severity: 'notice' })
		]
	})
];

describe('AlertGroupTable', () => {
	it('follows the row-click list rule: click, Enter and Space select; aria-selected marks the row', async () => {
		const onselect = vi.fn();
		render(AlertGroupTable, {
			props: { groups, selectedFingerprint: 'f-critical-0001', onselect }
		});

		const rows = screen.getAllByTestId('alert-row');
		expect(rows).toHaveLength(4);
		expect(rows[0]!.getAttribute('aria-selected')).toBe('true');
		expect(rows[1]!.getAttribute('aria-selected')).toBe('false');
		expect(rows[0]!.getAttribute('tabindex')).toBe('0');
		// Compact master-detail navigation hook.
		expect(rows[0]!.hasAttribute('data-master-detail-row')).toBe(true);

		await fireEvent.click(rows[1]!);
		expect(onselect).toHaveBeenLastCalledWith('f-warning-0002');

		await fireEvent.keyDown(rows[2]!, { key: 'Enter' });
		expect(onselect).toHaveBeenLastCalledWith('f-info-0003');

		await fireEvent.keyDown(rows[3]!, { key: ' ' });
		expect(onselect).toHaveBeenLastCalledWith('f-notice-0004');
		expect(onselect).toHaveBeenCalledTimes(3);
	});

	it('maps severities onto badge colors: critical red, warning yellow, info blue, unknown gray', () => {
		render(AlertGroupTable, { props: { groups } });
		const rows = screen.getAllByTestId('alert-row');
		expect(rows[0]!.querySelector('.bg-red-100')).not.toBeNull();
		expect(rows[1]!.querySelector('.bg-yellow-100')).not.toBeNull();
		expect(rows[2]!.querySelector('.bg-blue-100')).not.toBeNull();
		expect(rows[3]!.querySelector('.bg-gray-100')).not.toBeNull();
	});

	it('carries data-label attributes on every cell for the responsive card pattern', () => {
		const { container } = render(AlertGroupTable, { props: { groups } });
		expect(container.querySelector('.responsive-card-table')).not.toBeNull();
		const cells = screen.getAllByTestId('alert-row')[0]!.querySelectorAll('td');
		expect(cells.length).toBeGreaterThan(0);
		for (const cell of cells) {
			expect(cell.getAttribute('data-label'), 'every td must carry data-label').toBeTruthy();
		}
	});

	it('renders group-label header rows, receiver when present, and short fingerprints with full titles', () => {
		render(AlertGroupTable, { props: { groups } });
		expect(screen.getByTestId('alert-group-header').textContent).toContain('service=api');

		const rows = screen.getAllByTestId('alert-row');
		expect(rows[1]!.textContent).toContain('ops-mail');

		const code = rows[0]!.querySelector('code');
		expect(code?.textContent?.trim()).toBe('f-critic');
		expect(code?.getAttribute('title')).toBe('f-critical-0001');
	});

	it('renders the ungrouped label for groups without labels', () => {
		render(AlertGroupTable, {
			props: { groups: [makeGroup({ key: '{}', labels: {}, alerts: [makeAlert()] })] }
		});
		expect(screen.getByTestId('alert-group-header').textContent).toContain('Ungrouped');
	});
});
