// 0.5.0 — opt-in silence mutation on the otherwise read-only SilenceTable.
// The 0.4.0 read-only contract is pinned in SilenceTable.test.ts and stays
// untouched; this suite pins the opt-in gate itself.

import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SilenceTable from '../src/lib/alert-ops/SilenceTable.svelte';
import { makeSilence } from './fixtures/alert-ops';

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

const activeSilence = makeSilence();
const expiredSilence = makeSilence({ id: 'silence-expired', state: 'expired' });
const pendingSilence = makeSilence({ id: 'silence-pending', state: 'pending' });

describe('SilenceTable mutation gate (no decorative controls)', () => {
	it('renders zero controls at the 0.4.0 call site — neither gate supplied', () => {
		const { container } = render(SilenceTable, { props: { silences: [activeSilence] } });
		expect(container.querySelectorAll('button, a, input, select, textarea')).toHaveLength(0);
		expect(screen.queryByTestId('silence-expire')).toBeNull();
	});

	it('renders zero controls when canMutate is granted but no onexpire is supplied', () => {
		const { container } = render(SilenceTable, {
			props: { silences: [activeSilence], canMutate: true }
		});
		expect(container.querySelectorAll('button, a, input, select, textarea')).toHaveLength(0);
		expect(screen.queryByTestId('silence-expire')).toBeNull();
	});

	it('renders zero controls when onexpire is supplied but canMutate is false', () => {
		const { container } = render(SilenceTable, {
			props: { silences: [activeSilence], onexpire: vi.fn() }
		});
		expect(container.querySelectorAll('button, a, input, select, textarea')).toHaveLength(0);
		expect(screen.queryByTestId('silence-expire')).toBeNull();
	});

	it('keeps the actions column out of the header until both gates are satisfied', () => {
		const { container, unmount } = render(SilenceTable, {
			props: { silences: [activeSilence], canMutate: true }
		});
		expect(container.querySelectorAll('thead th')).toHaveLength(5);
		expect(screen.queryByText('Actions')).toBeNull();
		unmount();

		render(SilenceTable, {
			props: { silences: [activeSilence], canMutate: true, onexpire: vi.fn() }
		});
		expect(screen.getByText('Actions')).toBeTruthy();
	});
});

describe('SilenceTable expire affordance (both gates satisfied)', () => {
	it('renders one Expire control per expirable row and calls back with that silence id', async () => {
		const onexpire = vi.fn();
		render(SilenceTable, {
			props: { silences: [activeSilence, pendingSilence], canMutate: true, onexpire }
		});

		const buttons = screen.getAllByTestId('silence-expire');
		expect(buttons).toHaveLength(2);
		await fireEvent.click(buttons[0]!);
		expect(onexpire).toHaveBeenCalledOnce();
		expect(onexpire).toHaveBeenCalledWith('silence-1');

		await fireEvent.click(buttons[1]!);
		expect(onexpire).toHaveBeenCalledTimes(2);
		expect(onexpire).toHaveBeenLastCalledWith('silence-pending');
	});

	it('gives every control a distinct accessible name naming its matchers', () => {
		render(SilenceTable, {
			props: {
				silences: [
					activeSilence,
					makeSilence({
						id: 'silence-2',
						matchers: [{ name: 'env', value: 'prod-.*', isRegex: true }]
					})
				],
				canMutate: true,
				onexpire: vi.fn()
			}
		});
		// Visible label is contained in the accessible name (label-in-name).
		expect(screen.getByRole('button', { name: 'Expire silence for service=api' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Expire silence for env=~prod-.*' })).toBeTruthy();
		for (const button of screen.getAllByTestId('silence-expire')) {
			expect(button.textContent?.trim()).toBe('Expire silence');
		}
	});

	it('activates from the keyboard: a focusable native button, Enter and Space reach the callback', async () => {
		const onexpire = vi.fn();
		render(SilenceTable, {
			props: { silences: [activeSilence], canMutate: true, onexpire }
		});
		const button = screen.getByTestId('silence-expire') as HTMLButtonElement;

		// Native <button type="button"> in the tab order: Enter/Space activation
		// is the platform's, so no scripted key handler shadows it.
		expect(button.tagName).toBe('BUTTON');
		expect(button.getAttribute('type')).toBe('button');
		expect(button.hasAttribute('tabindex')).toBe(false);
		expect(button.disabled).toBe(false);
		button.focus();
		expect(document.activeElement).toBe(button);

		// Key events alone must not double-dispatch alongside that activation.
		await fireEvent.keyDown(button, { key: 'Enter' });
		expect(onexpire).not.toHaveBeenCalled();
		// `detail: 0` is the activation click a browser dispatches for Enter.
		await fireEvent.click(button, { detail: 0 });
		expect(onexpire).toHaveBeenCalledOnce();
		expect(onexpire).toHaveBeenCalledWith('silence-1');

		await fireEvent.keyDown(button, { key: ' ' });
		await fireEvent.keyUp(button, { key: ' ' });
		await fireEvent.click(button, { detail: 0 });
		expect(onexpire).toHaveBeenCalledTimes(2);
		expect(onexpire).toHaveBeenLastCalledWith('silence-1');
	});

	it('never renders an Expire control for an already-expired silence, gated on or not', () => {
		render(SilenceTable, {
			props: {
				silences: [expiredSilence, activeSilence],
				canMutate: true,
				onexpire: vi.fn()
			}
		});
		const rows = screen.getAllByTestId('silence-row');
		expect(rows[0]!.querySelectorAll('button')).toHaveLength(0);
		expect(rows[0]!.textContent).toContain('Already expired');
		expect(rows[1]!.querySelectorAll('button')).toHaveLength(1);
		expect(screen.getAllByTestId('silence-expire')).toHaveLength(1);
		expect(screen.getByTestId('silence-expire').getAttribute('data-silence-id')).toBe('silence-1');
	});

	it('treats an unknown silence state as not expirable', () => {
		render(SilenceTable, {
			props: {
				silences: [makeSilence({ id: 'silence-x', state: 'unknown-state' })],
				canMutate: true,
				onexpire: vi.fn()
			}
		});
		expect(screen.queryByTestId('silence-expire')).toBeNull();
	});
});

describe('SilenceTable mutation feedback is prop-driven', () => {
	it('pending disables every control and marks the targeted row aria-busy', () => {
		render(SilenceTable, {
			props: {
				silences: [activeSilence, pendingSilence],
				canMutate: true,
				onexpire: vi.fn(),
				mutation: { state: 'pending' as const, silenceId: 'silence-1' }
			}
		});
		const [targeted, other] = screen.getAllByTestId('silence-expire') as HTMLButtonElement[];

		expect(targeted!.disabled).toBe(true);
		expect(targeted!.getAttribute('aria-busy')).toBe('true');
		expect(targeted!.textContent?.trim()).toBe('Working…');

		// One mutation at a time: the untargeted row is inert but not busy.
		expect(other!.disabled).toBe(true);
		expect(other!.getAttribute('aria-busy')).not.toBe('true');
		expect(other!.textContent?.trim()).toBe('Expire silence');
	});

	it('does not dispatch intent while a mutation is pending', async () => {
		const onexpire = vi.fn();
		render(SilenceTable, {
			props: {
				silences: [activeSilence],
				canMutate: true,
				onexpire,
				mutation: { state: 'pending' as const, silenceId: 'silence-1' }
			}
		});
		await fireEvent.click(screen.getByTestId('silence-expire'));
		expect(onexpire).not.toHaveBeenCalled();
	});

	it('idle mutation state renders the affordance exactly as an absent one does', () => {
		const { container: withIdle, unmount } = render(SilenceTable, {
			props: {
				silences: [activeSilence],
				canMutate: true,
				onexpire: vi.fn(),
				mutation: { state: 'idle' as const }
			}
		});
		const idleHtml = withIdle.innerHTML;
		unmount();

		const { container: withoutMutation } = render(SilenceTable, {
			props: { silences: [activeSilence], canMutate: true, onexpire: vi.fn() }
		});
		expect(withoutMutation.innerHTML).toBe(idleHtml);
	});
});

describe('SilenceTable expire is intent-only', () => {
	it('clicking Expire runs no request, no navigation, and changes nothing in the DOM', async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal('fetch', fetchSpy);
		const pushState = vi.spyOn(window.history, 'pushState');
		const replaceState = vi.spyOn(window.history, 'replaceState');
		const onexpire = vi.fn();

		const { container } = render(SilenceTable, {
			props: { silences: [activeSilence], canMutate: true, onexpire }
		});
		const before = container.innerHTML;
		// Nothing that could navigate or submit exists in the first place.
		expect(container.querySelectorAll('a, form')).toHaveLength(0);
		await fireEvent.click(screen.getByTestId('silence-expire'));

		expect(onexpire).toHaveBeenCalledOnce();
		expect(onexpire).toHaveBeenCalledWith('silence-1');
		expect(fetchSpy).not.toHaveBeenCalled();
		expect(pushState).not.toHaveBeenCalled();
		expect(replaceState).not.toHaveBeenCalled();
		// No optimistic edit, no internal state machine: the table is unchanged
		// until the host feeds new data/mutation props back down.
		expect(container.innerHTML).toBe(before);
	});
});
