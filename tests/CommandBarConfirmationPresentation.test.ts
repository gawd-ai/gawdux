import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConfirmationCommandSurface from '../src/lib/primitives/ConfirmationCommandSurface.svelte';
import CommandBarConfirmationPresentation from '../src/lib/primitives/CommandBarConfirmationPresentation.svelte';
import ConfirmationCommandBarHarness from './fixtures/ConfirmationCommandBarHarness.svelte';
import type { ConfirmationCommandRequest } from '../src/lib/primitives/confirmation-command';

function request(overrides: Partial<ConfirmationCommandRequest> = {}): ConfirmationCommandRequest {
	return {
		id: 1,
		title: 'Archive this item?',
		message: 'It will leave the active list.',
		confirmLabel: 'Archive',
		busyLabel: 'Archiving…',
		focusTarget: null,
		...overrides
	};
}

afterEach(() => {
	cleanup();
	document.body.innerHTML = '';
});

describe('opt-in command-bar confirmation presentation', () => {
	it('uses the command bar contract without rendering the default drawer', async () => {
		render(ConfirmationCommandSurface, {
			props: {
				request: request(),
				presentation: CommandBarConfirmationPresentation,
				onconfirm: vi.fn(),
				oncancel: vi.fn()
			}
		});
		const surface = screen.getByRole('group');
		const confirm = screen.getByRole('button', { name: 'Archive' });
		expect(surface.classList.contains('page-command-drawer')).toBe(true);
		expect(document.querySelector('.command-drawer')).toBeNull();
		expect(confirm.getAttribute('aria-describedby')).toBe(surface.getAttribute('aria-describedby'));
		expect(surface.hasAttribute('aria-modal')).toBe(false);
		await waitFor(() => expect(document.activeElement).toBe(confirm));
	});

	it('replaces only the center registration and restores prior page actions on close', async () => {
		const trigger = document.createElement('button');
		document.body.append(trigger);
		const view = render(ConfirmationCommandBarHarness, {
			props: { request: request({ focusTarget: trigger }), onconfirm: vi.fn(), oncancel: vi.fn() }
		});
		const bar = document.querySelector('[data-command-bar]')!;
		expect(bar.querySelector('[data-action-confirm]')).not.toBeNull();
		expect(bar.querySelector('[data-page-edit]')).toBeNull();
		expect(screen.getByRole('group').querySelector('button')).toBeNull();
		await view.rerender({ request: null });
		await waitFor(() => expect(bar.querySelector('[data-page-edit]')?.textContent).toBe('Edit item'));
		expect(bar.querySelector('[data-action-confirm]')).toBeNull();
		await waitFor(() => expect(document.activeElement).toBe(trigger));
	});

	it('guards duplicate dispatch and re-arms after the host reports failure', async () => {
		const onconfirm = vi.fn();
		const view = render(ConfirmationCommandSurface, {
			props: { request: request(), presentation: CommandBarConfirmationPresentation, onconfirm, oncancel: vi.fn() }
		});
		const confirm = screen.getByRole('button', { name: 'Archive' });
		await fireEvent.click(confirm);
		await fireEvent.click(confirm);
		expect(onconfirm).toHaveBeenCalledOnce();
		await view.rerender({ busy: true });
		expect(screen.getByRole('button', { name: 'Archiving…' }).hasAttribute('disabled')).toBe(true);
		await view.rerender({ busy: false, error: 'Try again.' });
		expect(screen.getByRole('alert').textContent).toBe('Try again.');
		await waitFor(() => expect(document.activeElement).toBe(confirm));
		await fireEvent.click(confirm);
		expect(onconfirm).toHaveBeenCalledTimes(2);
	});

	it('blocks busy interaction and restores the request fallback on Escape', async () => {
		const trigger = document.createElement('button');
		const fallback = document.createElement('button');
		document.body.append(trigger, fallback);
		const oncancel = vi.fn();
		const onconfirm = vi.fn();
		const view = render(ConfirmationCommandSurface, {
			props: {
				request: request({ focusTarget: trigger, focusFallback: () => fallback }),
				presentation: CommandBarConfirmationPresentation,
				busy: true,
				onconfirm,
				oncancel
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Archiving…' }));
		await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(onconfirm).not.toHaveBeenCalled();
		expect(oncancel).not.toHaveBeenCalled();
		trigger.remove();
		await view.rerender({ busy: false });
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(oncancel).toHaveBeenCalledOnce();
		await waitFor(() => expect(document.activeElement).toBe(fallback));
	});

	it('remounts a new request id and does not retain the previous dispatch guard', async () => {
		const onconfirm = vi.fn();
		const view = render(ConfirmationCommandSurface, {
			props: { request: request(), presentation: CommandBarConfirmationPresentation, onconfirm, oncancel: vi.fn() }
		});
		const first = screen.getByRole('button', { name: 'Archive' });
		await fireEvent.click(first);
		await view.rerender({ request: request({ id: 2, confirmLabel: 'Approve', confirmColor: 'green' }) });
		const second = screen.getByRole('button', { name: 'Approve' });
		expect(second).not.toBe(first);
		expect(first.isConnected).toBe(false);
		await waitFor(() => expect(document.activeElement).toBe(second));
		await fireEvent.click(second);
		expect(onconfirm).toHaveBeenCalledTimes(2);
	});

	it('keeps the existing drawer as the default for hosts that do not opt in', () => {
		render(ConfirmationCommandSurface, {
			props: { request: request(), onconfirm: vi.fn(), oncancel: vi.fn() }
		});
		expect(document.querySelector('.command-drawer--card')).not.toBeNull();
		expect(document.querySelector('.page-command-drawer')).toBeNull();
	});
});
