import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AlertOpsConsole from '../src/lib/alert-ops/AlertOpsConsole.svelte';
import { makeData, makeGroup, makeSilence, sampleScope } from './fixtures/alert-ops';

afterEach(() => cleanup());

const baseProps = { scope: sampleScope, now: new Date('2026-08-02T12:00:00Z') };

describe('AlertOpsConsole seven surface states', () => {
	it('loading renders the deferred indicator surface and no data shell', () => {
		render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('loading') }
		});
		expect(screen.getByTestId('alert-ops-loading')).toBeTruthy();
		expect(screen.queryByRole('tab')).toBeNull();
		expect(screen.queryByTestId('alert-row')).toBeNull();
	});

	it('empty renders the empty collection variant when no result filters are active', () => {
		const { container } = render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('ok') }
		});
		const state = container.querySelector('[data-collection-state="empty"]');
		expect(state).not.toBeNull();
		expect(container.querySelector('[data-collection-state="no-results"]')).toBeNull();
	});

	it('no-results renders the no-results variant when result filters are active', () => {
		const { container } = render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('ok'), filters: { text: 'db' } }
		});
		expect(container.querySelector('[data-collection-state="no-results"]')).not.toBeNull();
		expect(container.querySelector('[data-collection-state="empty"]')).toBeNull();
	});

	it('unavailable renders the error panel whose retry action calls onrefresh', async () => {
		const onrefresh = vi.fn();
		render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('unavailable'), onrefresh }
		});
		const panel = screen.getByTestId('alert-ops-unavailable');
		expect(panel.getAttribute('role')).toBe('alert');
		expect(screen.queryByRole('tab')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
		expect(onrefresh).toHaveBeenCalledOnce();
	});

	it('stale renders the banner over the last-good data rows', () => {
		render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('stale', [makeGroup()]) }
		});
		expect(screen.getByTestId('alert-ops-stale-banner')).toBeTruthy();
		expect(screen.getAllByTestId('alert-row').length).toBeGreaterThan(0);
	});

	it('partial renders per-section banners on the alerts and silences tabs', async () => {
		render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('partial', [makeGroup()], [makeSilence()]) }
		});
		expect(screen.getByTestId('alert-ops-partial-alerts')).toBeTruthy();
		await fireEvent.click(screen.getByRole('tab', { name: 'Silences' }));
		expect(await screen.findByTestId('alert-ops-partial-silences')).toBeTruthy();
	});

	it('denied renders the permission message with no tabs and no data skeletons', () => {
		render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('denied') }
		});
		expect(screen.getByTestId('alert-ops-denied')).toBeTruthy();
		expect(screen.queryByRole('tab')).toBeNull();
		expect(screen.queryByTestId('alert-group-table')).toBeNull();
		expect(screen.queryByTestId('alert-ops-filter-rail')).toBeNull();
		// The provider health bar stays visible so the denial is explained.
		expect(screen.getByTestId('alert-ops-provider-health')).toBeTruthy();
	});
});

describe('AlertOpsConsole selection wiring', () => {
	it('selecting a row surfaces the detail panel content and calls onselect', async () => {
		const onselect = vi.fn();
		render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('ok', [makeGroup()]), onselect }
		});
		expect(screen.getByTestId('alert-detail-empty')).toBeTruthy();
		await fireEvent.click(screen.getAllByTestId('alert-row')[0]!);
		expect(onselect).toHaveBeenCalledWith('abcdef0123456789');
		expect(screen.getByTestId('alert-detail-fingerprint').textContent?.trim()).toBe(
			'abcdef0123456789'
		);
		expect(screen.queryByTestId('alert-detail-empty')).toBeNull();
	});
});
