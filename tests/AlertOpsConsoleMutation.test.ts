// 0.5.0 — the console forwards the opt-in mutation gates to the silence
// table and the detail panel, and reflects the host's mutation lifecycle.
// It runs no mutation state machine of its own: every affordance and every
// feedback region below is a pure function of the props handed down.

import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AlertOpsConsole from '../src/lib/alert-ops/AlertOpsConsole.svelte';
import { makeData, makeGroup, makeSilence, sampleScope } from './fixtures/alert-ops';

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const baseProps = { scope: sampleScope, now: new Date('2026-08-02T12:00:00Z') };
const SELECTED = 'abcdef0123456789';

function contentData() {
	return makeData('ok', [makeGroup()], [makeSilence()]);
}

async function openSilencesTab(): Promise<void> {
	await fireEvent.click(screen.getByRole('tab', { name: 'Silences' }));
	await screen.findByTestId('silence-table');
}

describe('AlertOpsConsole forwards the mutation gates', () => {
	it('renders no silence or alert affordance at the 0.4.0 call site', async () => {
		render(AlertOpsConsole, {
			props: { ...baseProps, data: contentData(), selectedFingerprint: SELECTED }
		});
		expect(screen.queryByTestId('alert-silence')).toBeNull();
		await openSilencesTab();
		expect(screen.queryByTestId('silence-expire')).toBeNull();
	});

	it('renders no affordance when a gate is granted without its callback', async () => {
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: contentData(),
				selectedFingerprint: SELECTED,
				canMutate: true,
				canSilence: true
			}
		});
		expect(screen.queryByTestId('alert-silence')).toBeNull();
		await openSilencesTab();
		expect(screen.queryByTestId('silence-expire')).toBeNull();
	});

	it('renders no affordance when the callbacks arrive without the permission flags', async () => {
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: contentData(),
				selectedFingerprint: SELECTED,
				onexpire: vi.fn(),
				onsilence: vi.fn()
			}
		});
		expect(screen.queryByTestId('alert-silence')).toBeNull();
		await openSilencesTab();
		expect(screen.queryByTestId('silence-expire')).toBeNull();
	});

	it('forwards onexpire to the silence table with the row id', async () => {
		const onexpire = vi.fn();
		render(AlertOpsConsole, {
			props: { ...baseProps, data: contentData(), canMutate: true, onexpire }
		});
		await openSilencesTab();
		await fireEvent.click(screen.getByTestId('silence-expire'));
		expect(onexpire).toHaveBeenCalledOnce();
		expect(onexpire).toHaveBeenCalledWith('silence-1');
	});

	it('forwards onsilence to the detail panel with the selected alert', async () => {
		const onsilence = vi.fn();
		render(AlertOpsConsole, {
			props: { ...baseProps, data: contentData(), canSilence: true, onsilence }
		});
		// Nothing to silence until an alert is selected.
		expect(screen.queryByTestId('alert-silence')).toBeNull();
		await fireEvent.click(screen.getAllByTestId('alert-row')[0]!);

		await fireEvent.click(screen.getByRole('button', { name: 'Silence this alert' }));
		expect(onsilence).toHaveBeenCalledOnce();
		expect(onsilence.mock.calls[0]![0]).toMatchObject({
			fingerprint: SELECTED,
			service: 'api'
		});
	});
});

describe('AlertOpsConsole mutation feedback is prop-driven', () => {
	it('idle renders no feedback region at all', async () => {
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: contentData(),
				canMutate: true,
				onexpire: vi.fn(),
				mutation: { state: 'idle' as const }
			}
		});
		expect(screen.queryByTestId('alert-ops-mutation-pending')).toBeNull();
		expect(screen.queryByTestId('alert-ops-mutation-error')).toBeNull();
		await openSilencesTab();
		expect((screen.getByTestId('silence-expire') as HTMLButtonElement).disabled).toBe(false);
	});

	it('pending shows the busy indicator and disables the forwarded affordances', async () => {
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: contentData(),
				selectedFingerprint: SELECTED,
				canMutate: true,
				onexpire: vi.fn(),
				canSilence: true,
				onsilence: vi.fn(),
				mutation: { state: 'pending' as const, silenceId: 'silence-1' }
			}
		});

		const busy = screen.getByTestId('alert-ops-mutation-pending');
		expect(busy.getAttribute('role')).toBe('status');
		expect(busy.getAttribute('aria-busy')).toBe('true');
		expect(busy.textContent).toContain('Working…');

		const silenceAlert = screen.getByTestId('alert-silence') as HTMLButtonElement;
		expect(silenceAlert.disabled).toBe(true);
		expect(silenceAlert.getAttribute('aria-busy')).toBe('true');

		await openSilencesTab();
		const expire = screen.getByTestId('silence-expire') as HTMLButtonElement;
		expect(expire.disabled).toBe(true);
		expect(expire.getAttribute('aria-busy')).toBe('true');
	});

	it('failed renders the host error as text — hostile markup never becomes elements', () => {
		const { container } = render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: contentData(),
				canMutate: true,
				onexpire: vi.fn(),
				mutation: {
					state: 'failed' as const,
					silenceId: 'silence-1',
					error: '<script>alert(1)</script>'
				}
			}
		});

		const region = screen.getByTestId('alert-ops-mutation-error');
		expect(region.getAttribute('role')).toBe('alert');
		expect(region.textContent).toContain('The action could not be completed.');
		expect(container.querySelector('script')).toBeNull();
		expect(container.querySelector('img')).toBeNull();
		expect(screen.getByText('<script>alert(1)</script>')).toBeTruthy();
		expect(screen.getByTestId('alert-ops-mutation-error-detail').textContent?.trim()).toBe(
			'<script>alert(1)</script>'
		);
		expect(screen.queryByTestId('alert-ops-mutation-pending')).toBeNull();
	});

	it('failed re-enables the affordances so the operator can retry', async () => {
		const onexpire = vi.fn();
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: contentData(),
				canMutate: true,
				onexpire,
				mutation: { state: 'failed' as const, silenceId: 'silence-1', error: 'Upstream refused' }
			}
		});
		await openSilencesTab();
		const expire = screen.getByTestId('silence-expire') as HTMLButtonElement;
		expect(expire.disabled).toBe(false);
		await fireEvent.click(expire);
		expect(onexpire).toHaveBeenCalledOnce();
		expect(onexpire).toHaveBeenCalledWith('silence-1');
	});

	it('localizes the feedback copy through the copy prop', () => {
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: contentData(),
				mutation: { state: 'failed' as const, error: 'Erreur' },
				copy: { mutationFailed: "L'action n'a pas pu être effectuée." }
			}
		});
		expect(screen.getByTestId('alert-ops-mutation-error').textContent).toContain(
			"L'action n'a pas pu être effectuée."
		);
	});

	it('keeps the seven surface states intact: denied still hides every affordance', () => {
		render(AlertOpsConsole, {
			props: {
				...baseProps,
				data: makeData('denied'),
				canMutate: true,
				onexpire: vi.fn(),
				canSilence: true,
				onsilence: vi.fn()
			}
		});
		expect(screen.getByTestId('alert-ops-denied')).toBeTruthy();
		expect(screen.queryByTestId('silence-expire')).toBeNull();
		expect(screen.queryByTestId('alert-silence')).toBeNull();
	});
});
