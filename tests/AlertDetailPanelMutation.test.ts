// 0.5.0 — opt-in "Silence this alert" affordance on AlertDetailPanel.
// The panel emits intent and nothing else: confirmation and the mutation
// itself belong to the host (ConfirmationCommandSurface, ADR-029).

import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AlertDetailPanel from '../src/lib/alert-ops/AlertDetailPanel.svelte';
import { makeAlert } from './fixtures/alert-ops';

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe('AlertDetailPanel silence gate (no decorative controls)', () => {
	it('renders zero controls at the 0.4.0 call site — neither gate supplied', () => {
		const { container } = render(AlertDetailPanel, { props: { alert: makeAlert() } });
		expect(container.querySelectorAll('button, input, select, textarea')).toHaveLength(0);
		expect(screen.queryByTestId('alert-silence')).toBeNull();
	});

	it('renders zero controls when canSilence is granted but no onsilence is supplied', () => {
		const { container } = render(AlertDetailPanel, {
			props: { alert: makeAlert(), canSilence: true }
		});
		expect(container.querySelectorAll('button, input, select, textarea')).toHaveLength(0);
		expect(screen.queryByTestId('alert-silence')).toBeNull();
	});

	it('renders zero controls when onsilence is supplied but canSilence is false', () => {
		const { container } = render(AlertDetailPanel, {
			props: { alert: makeAlert(), onsilence: vi.fn() }
		});
		expect(container.querySelectorAll('button, input, select, textarea')).toHaveLength(0);
		expect(screen.queryByTestId('alert-silence')).toBeNull();
	});

	it('renders no affordance without a selected alert even when fully gated on', () => {
		const { container } = render(AlertDetailPanel, {
			props: { alert: null, canSilence: true, onsilence: vi.fn() }
		});
		expect(container.querySelectorAll('button')).toHaveLength(0);
		expect(screen.getByTestId('alert-detail-empty')).toBeTruthy();
	});
});

describe('AlertDetailPanel silence affordance (both gates satisfied)', () => {
	it('renders the control and hands the selected alert to the callback', async () => {
		const onsilence = vi.fn();
		const alert = makeAlert();
		render(AlertDetailPanel, { props: { alert, canSilence: true, onsilence } });

		const button = screen.getByRole('button', { name: 'Silence this alert' });
		await fireEvent.click(button);
		expect(onsilence).toHaveBeenCalledOnce();
		expect(onsilence).toHaveBeenCalledWith(alert);
		expect(onsilence.mock.calls[0]![0]).toMatchObject({ fingerprint: 'abcdef0123456789' });
	});

	it('activates from the keyboard: a focusable native button, Enter and Space reach the callback', async () => {
		const onsilence = vi.fn();
		render(AlertDetailPanel, {
			props: { alert: makeAlert(), canSilence: true, onsilence }
		});
		const button = screen.getByTestId('alert-silence') as HTMLButtonElement;

		expect(button.tagName).toBe('BUTTON');
		expect(button.getAttribute('type')).toBe('button');
		expect(button.hasAttribute('tabindex')).toBe(false);
		expect(button.disabled).toBe(false);
		button.focus();
		expect(document.activeElement).toBe(button);

		await fireEvent.keyDown(button, { key: 'Enter' });
		expect(onsilence).not.toHaveBeenCalled();
		// `detail: 0` is the activation click a browser dispatches for Enter.
		await fireEvent.click(button, { detail: 0 });
		expect(onsilence).toHaveBeenCalledOnce();

		await fireEvent.keyDown(button, { key: ' ' });
		await fireEvent.keyUp(button, { key: ' ' });
		await fireEvent.click(button, { detail: 0 });
		expect(onsilence).toHaveBeenCalledTimes(2);
	});

	it('pending disables the control, marks it aria-busy and blocks further intent', async () => {
		const onsilence = vi.fn();
		render(AlertDetailPanel, {
			props: {
				alert: makeAlert(),
				canSilence: true,
				onsilence,
				mutation: { state: 'pending' as const }
			}
		});
		const button = screen.getByTestId('alert-silence') as HTMLButtonElement;
		expect(button.disabled).toBe(true);
		expect(button.getAttribute('aria-busy')).toBe('true');
		expect(button.textContent?.trim()).toBe('Working…');

		await fireEvent.click(button);
		expect(onsilence).not.toHaveBeenCalled();
	});

	it('localizes the affordance through the copy prop like every other string', () => {
		render(AlertDetailPanel, {
			props: {
				alert: makeAlert(),
				canSilence: true,
				onsilence: vi.fn(),
				copy: { silenceAlert: 'Mettre en sourdine' }
			}
		});
		expect(screen.getByRole('button', { name: 'Mettre en sourdine' })).toBeTruthy();
	});
});

describe('AlertDetailPanel silence is intent-only', () => {
	it('clicking runs no request, no navigation, and mutates nothing beyond the callback', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		const pushState = vi.spyOn(window.history, 'pushState');
		const replaceState = vi.spyOn(window.history, 'replaceState');
		const onsilence = vi.fn();

		const { container } = render(AlertDetailPanel, {
			props: { alert: makeAlert(), canSilence: true, onsilence }
		});
		const before = container.innerHTML;
		const locationBefore = window.location.href;
		// No dialog, no form, no link: nothing that could navigate or submit.
		expect(container.querySelectorAll('a, form, dialog, [role="dialog"]')).toHaveLength(0);

		await fireEvent.click(screen.getByTestId('alert-silence'));

		expect(onsilence).toHaveBeenCalledOnce();
		expect(fetchSpy).not.toHaveBeenCalled();
		expect(pushState).not.toHaveBeenCalled();
		expect(replaceState).not.toHaveBeenCalled();
		expect(window.location.href).toBe(locationBefore);
		// No dialog appeared and no optimistic state landed: the panel is
		// byte-identical until the host feeds new props down.
		expect(container.querySelectorAll('dialog, [role="dialog"]')).toHaveLength(0);
		expect(container.innerHTML).toBe(before);
	});
});
