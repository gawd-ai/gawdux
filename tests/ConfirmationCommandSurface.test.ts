import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, tick } from 'svelte';
import { createClassComponent } from 'svelte/legacy';
import ConfirmationCommandSurface from '../src/lib/primitives/ConfirmationCommandSurface.svelte';
import type { ConfirmationCommandRequest } from '../src/lib/primitives/confirmation-command';

function confirmationRequest(
	overrides: Partial<ConfirmationCommandRequest> = {}
): ConfirmationCommandRequest {
	return {
		id: 1,
		title: 'Delete folder?',
		message: 'This permanently deletes the folder.',
		confirmLabel: 'Delete folder',
		busyLabel: 'Deleting…',
		focusTarget: null,
		...overrides
	};
}

function setup(
	request: ConfirmationCommandRequest | null,
	overrides: { busy?: boolean; error?: string | null } = {}
) {
	const confirm = vi.fn();
	const cancel = vi.fn();
	const app = createClassComponent({
		component: ConfirmationCommandSurface,
		target: document.body,
		props: {
			request,
			busy: overrides.busy ?? false,
			error: overrides.error ?? null,
			onconfirm: confirm,
			oncancel: cancel
		}
	});
	return { app, confirm, cancel };
}

const surface = () => document.querySelector<HTMLElement>('[data-confirmation-command]');
const confirmButton = () =>
	surface()?.querySelector<HTMLButtonElement>('button[data-action-confirm]') ?? null;
const cancelButton = () =>
	surface()?.querySelector<HTMLButtonElement>('button[data-action-cancel]') ?? null;

let active: ReturnType<typeof setup> | null = null;
afterEach(() => {
	active?.app.$destroy();
	active = null;
	document.body.innerHTML = '';
});

describe('ConfirmationCommandSurface', () => {
	it('renders as a non-modal command surface with an exact accessible description', () => {
		active = setup(confirmationRequest());

		expect(surface()?.textContent).toContain('Delete folder?');
		expect(surface()?.textContent).toContain('This permanently deletes the folder.');
		expect(surface()?.matches('[role="dialog"]')).toBe(false);
		expect(surface()?.hasAttribute('aria-modal')).toBe(false);
		const messageId = surface()?.getAttribute('aria-describedby');
		expect(messageId).toBeTruthy();
		expect(confirmButton()?.getAttribute('aria-describedby')).toBe(messageId);
	});

	it('focuses and dispatches confirmation once until the host settles', async () => {
		active = setup(confirmationRequest());
		await tick();
		await tick();
		expect(document.activeElement).toBe(confirmButton());

		confirmButton()!.click();
		confirmButton()!.click();
		flushSync();
		expect(active.confirm).toHaveBeenCalledTimes(1);

		active.app.$set({ busy: true });
		flushSync();
		expect(confirmButton()?.disabled).toBe(true);
		expect(confirmButton()?.textContent).toContain('Deleting…');

		active.app.$set({ busy: false, error: 'The folder could not be deleted.' });
		flushSync();
		await tick();
		expect(surface()?.querySelector('[role="alert"]')?.textContent).toContain(
			'The folder could not be deleted.'
		);
		expect(document.activeElement).toBe(confirmButton());
		confirmButton()!.click();
		flushSync();
		expect(active.confirm).toHaveBeenCalledTimes(2);
	});

	it('cancels with Escape and restores the invoking control', async () => {
		const trigger = document.createElement('button');
		trigger.textContent = 'Delete';
		document.body.append(trigger);
		trigger.focus();
		active = setup(confirmationRequest({ focusTarget: trigger }));
		await tick();
		await tick();

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		await tick();
		expect(active.cancel).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(trigger);
	});

	it('uses the stable fallback when the invoking control disappears', async () => {
		const fallback = document.createElement('button');
		fallback.textContent = 'Selected row';
		document.body.append(fallback);
		const trigger = document.createElement('button');
		trigger.textContent = 'Delete';
		document.body.append(trigger);
		trigger.focus();
		active = setup(
			confirmationRequest({
				focusTarget: trigger,
				focusFallback: () => fallback
			})
		);
		await tick();
		await tick();

		trigger.remove();
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		await tick();
		expect(active.cancel).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(fallback);
	});

	it('blocks interaction while busy and supports a positive confirmation tone', () => {
		active = setup(confirmationRequest({ confirmColor: 'green' }), { busy: true });

		confirmButton()!.click();
		cancelButton()!.click();
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		expect(active.confirm).not.toHaveBeenCalled();
		expect(active.cancel).not.toHaveBeenCalled();
		expect(confirmButton()?.className).toContain('green');
	});
});
