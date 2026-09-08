import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor
} from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PageCommandBarConfirm from '../src/lib/primitives/PageCommandBarConfirm.svelte';

afterEach(() => cleanup());

describe('PageCommandBarConfirm', () => {
	it('focuses Confirm, dispatches once, and permits retry after a failed attempt', async () => {
		const onconfirm = vi.fn();
		const view = render(PageCommandBarConfirm, {
			props: {
				message: 'Archive this item?',
				confirmLabel: 'Archive',
				onconfirm,
				oncancel: vi.fn()
			}
		});
		const confirm = screen.getByRole('button', { name: 'Archive' });
		await waitFor(() => expect(document.activeElement).toBe(confirm));
		await fireEvent.click(confirm);
		await fireEvent.click(confirm);
		expect(onconfirm).toHaveBeenCalledOnce();
		await view.rerender({ busy: true });
		expect(
			screen.getByRole('button', { name: 'Applying…' }).hasAttribute('disabled')
		).toBe(true);
		expect(screen.getByRole('group').getAttribute('aria-busy')).toBe('true');
		await view.rerender({
			busy: false,
			error: 'The request failed. Try again.'
		});
		expect(screen.getByRole('alert').textContent).toBe(
			'The request failed. Try again.'
		);
		await fireEvent.click(screen.getByRole('button', { name: 'Archive' }));
		expect(onconfirm).toHaveBeenCalledTimes(2);
	});

	it('blocks Escape while busy, then cancels and restores focus', async () => {
		const focusTarget = document.createElement('button');
		document.body.append(focusTarget);
		const oncancel = vi.fn();
		const view = render(PageCommandBarConfirm, {
			props: {
				message: 'Archive this item?',
				confirmLabel: 'Archive',
				busy: true,
				focusTarget,
				onconfirm: vi.fn(),
				oncancel
			}
		});
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(oncancel).not.toHaveBeenCalled();
		await view.rerender({ busy: false });
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(oncancel).toHaveBeenCalledOnce();
		await waitFor(() => expect(document.activeElement).toBe(focusTarget));
		view.unmount();
		focusTarget.remove();
	});

	it('announces an acknowledgement and restores its invoking control on Confirm', async () => {
		const focusTarget = document.createElement('button');
		document.body.append(focusTarget);
		const onconfirm = vi.fn();
		const view = render(PageCommandBarConfirm, {
			props: {
				message: 'The access code is ready.',
				confirmLabel: 'Done',
				cancelLabel: null,
				live: 'status',
				code: 'example-code',
				focusTarget,
				onconfirm,
				oncancel: vi.fn()
			}
		});
		expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
		expect(screen.getByRole('status').textContent).toBe(
			'The access code is ready.'
		);
		expect(screen.getByText('example-code').tagName).toBe('CODE');
		await fireEvent.click(screen.getByRole('button', { name: 'Done' }));
		expect(onconfirm).toHaveBeenCalledOnce();
		await waitFor(() => expect(document.activeElement).toBe(focusTarget));
		view.unmount();
		focusTarget.remove();
	});
});
