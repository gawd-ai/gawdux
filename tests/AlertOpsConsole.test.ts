import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { HeartOutline } from 'flowbite-svelte-icons';
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

	it('unavailable sits on the house error state and the page surface', () => {
		const { container } = render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: { status: { state: 'unavailable', error: 'dial tcp: refused' }, groups: [], silences: [] }
			}
		});
		const panel = screen.getByTestId('alert-ops-unavailable');
		expect(panel.querySelector('[data-collection-state="error"]')).not.toBeNull();
		expect(panel.textContent).toContain('dial tcp: refused');
		expect(container.querySelector('.context-surface')?.contains(panel)).toBe(true);
	});

	it('unavailable offers no Retry when the host carries status and Refresh (healthBar off)', () => {
		const onrefresh = vi.fn();
		render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('unavailable'), onrefresh, healthBar: false }
		});
		expect(screen.getByTestId('alert-ops-unavailable')).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
	});

	it('denied is the house empty state with a lock, on the page surface', () => {
		const { container } = render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('denied') }
		});
		const denied = screen.getByTestId('alert-ops-denied');
		expect(denied.querySelector('[data-collection-state="denied"] svg')).not.toBeNull();
		expect(container.querySelector('.context-surface')?.contains(denied)).toBe(true);
	});

	it('every tab carries an icon beside its label', () => {
		render(AlertOpsConsole, { props: { ...baseProps, data: makeData('ok', [makeGroup()]) } });
		const tabs = screen.getAllByRole('tab');
		expect(tabs.map((t) => t.textContent?.trim())).toEqual(['Alerts', 'Silences']);
		for (const tab of tabs) expect(tab.querySelector('svg')).not.toBeNull();
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
	it('lets a host omit the health strip without removing alert content', async () => {
		const view = render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('ok', [makeGroup()]) }
		});
		expect(screen.getByTestId('alert-ops-provider-health')).toBeTruthy();
		await view.rerender({ healthBar: false });
		expect(screen.queryByTestId('alert-ops-provider-health')).toBeNull();
		expect(screen.getAllByTestId('alert-row').length).toBeGreaterThan(0);
	});

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

describe('AlertOpsConsole content inset', () => {
	/** Padding or margin utilities on an element, whatever their variant prefix. */
	const insetClasses = (element: Element | null | undefined) =>
		[...(element?.classList ?? [])].filter((c) => /^(?:[\w@-]+:)*!?-?[pm][xytrblse]?-/.test(c));

	it("opens the Alerts tab on the panel's inset: the tab body pads nothing", () => {
		const { container } = render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('partial', [makeGroup()], [makeSilence()]) }
		});
		const panel = container.querySelector<HTMLElement>('[role="tabpanel"]');
		expect(panel?.classList.contains('scroll-surface')).toBe(true);
		// The panel holds TabItem's wrapper, and the wrapper holds the body.
		const body = panel?.firstElementChild?.firstElementChild;
		expect(body?.classList.contains('space-y-3')).toBe(true);
		expect(insetClasses(body)).toEqual([]);
		expect(body?.querySelector('[data-testid="alert-ops-partial-alerts"]')).not.toBeNull();
	});

	it('opens the Silences tab on the same inset', async () => {
		const { container } = render(AlertOpsConsole, {
			props: { ...baseProps, data: makeData('partial', [makeGroup()], [makeSilence()]) }
		});
		await fireEvent.click(screen.getByRole('tab', { name: /Silences/ }));
		const panel = container.querySelector<HTMLElement>('[role="tabpanel"]');
		const body = panel?.firstElementChild?.firstElementChild;
		expect(body?.querySelector('[data-testid="alert-ops-partial-silences"]')).not.toBeNull();
		expect(insetClasses(body)).toEqual([]);
	});
});

describe('AlertOpsConsole column icons (headIcons)', () => {
	it('passes headIcons to the alert groups; none by default', () => {
		const plain = render(AlertOpsConsole, { props: { ...baseProps, data: makeData('ok', [makeGroup()]) } });
		expect(plain.container.querySelector('thead svg')).toBeNull();
		cleanup();
		const { container } = render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: makeData('ok', [makeGroup()]),
				headIcons: { status: HeartOutline, silenceState: HeartOutline }
			}
		});
		const iconed = [...container.querySelectorAll('[data-testid="alert-group-table"] thead th')]
			.filter((th) => th.querySelector('svg.table-head-icon'))
			.map((th) => th.textContent?.trim());
		expect(iconed).toEqual(['Status']);
	});

	it('passes headIcons to the silences', async () => {
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: makeData('ok', [makeGroup()], [makeSilence()]),
				headIcons: { silenceState: HeartOutline }
			}
		});
		await fireEvent.click(screen.getByRole('tab', { name: /Silences/ }));
		const table = await screen.findByTestId('silence-table');
		const iconed = [...table.querySelectorAll('thead th')]
			.filter((th) => th.querySelector('svg.table-head-icon'))
			.map((th) => th.textContent?.trim());
		expect(iconed).toEqual(['State']);
	});
});
