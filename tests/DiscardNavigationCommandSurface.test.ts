import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync, mount, tick, unmount } from 'svelte';
import DiscardNavigationCommandSurface from '../src/lib/primitives/DiscardNavigationCommandSurface.svelte';
import type { DiscardNavigationRequest } from '../src/lib/utils/discard-navigation.svelte';

function deferred() {
	let resolve!: () => void;
	const promise = new Promise<void>((done) => {
		resolve = done;
	});
	return { promise, resolve };
}

function setup(request: DiscardNavigationRequest | null) {
	const cancel = vi.fn();
	const complete = vi.fn();
	const app = mount(DiscardNavigationCommandSurface, {
		target: document.body,
		props: {
			request,
			oncancel: cancel,
			oncomplete: complete
		}
	});
	return { app, cancel, complete };
}

const strip = () => document.querySelector<HTMLElement>('[data-workflow-role="command-drawer"]');
const confirmButton = () =>
	document.querySelector<HTMLButtonElement>('button[data-action-confirm]');

let active: ReturnType<typeof setup> | null = null;
afterEach(() => {
	if (active) unmount(active.app);
	active = null;
	document.body.innerHTML = '';
});

describe('DiscardNavigationCommandSurface', () => {
	it('does not render without a pending transition', () => {
		active = setup(null);
		expect(strip()).toBeNull();
	});

	it('shows the pending target and focuses its destructive action', async () => {
		active = setup({
			message: 'Discard the unsaved config changes and open another tab?',
			confirmLabel: 'Discard and open Settings',
			continue: vi.fn()
		});
		expect(strip()?.textContent).toContain('Discard unsaved changes?');
		expect(strip()?.textContent).toContain('open another tab');
		expect(confirmButton()?.textContent).toContain('Discard and open Settings');
		await tick();
		await tick();
		expect(document.activeElement).toBe(confirmButton());
	});

	it('runs one pending continuation and completes only after it settles', async () => {
		const gate = deferred();
		const continuation = vi.fn(() => gate.promise);
		const destination = document.createElement('button');
		destination.textContent = 'Destination';
		document.body.append(destination);
		const request: DiscardNavigationRequest = {
			message: 'Discard this draft?',
			confirmLabel: 'Discard and continue',
			continue: continuation,
			focusAfter: () => destination
		};
		active = setup(request);
		confirmButton()!.click();
		confirmButton()!.click();
		flushSync();
		expect(continuation).toHaveBeenCalledTimes(1);
		expect(confirmButton()?.disabled).toBe(true);
		expect(active.complete).not.toHaveBeenCalled();

		gate.resolve();
		await vi.waitFor(() => expect(active?.complete).toHaveBeenCalledWith(request));
		expect(document.activeElement).toBe(destination);
	});

	it('cancels on Escape and returns focus to the invoking control', async () => {
		const trigger = document.createElement('button');
		document.body.append(trigger);
		trigger.focus();
		const request: DiscardNavigationRequest = {
			message: 'Discard this draft?',
			confirmLabel: 'Discard and continue',
			continue: vi.fn()
		};
		active = setup(request);
		await tick();
		await tick();
		expect(document.activeElement).toBe(confirmButton());

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		await tick();
		expect(active.cancel).toHaveBeenCalledWith(request);
		expect(document.activeElement).toBe(trigger);
	});

	it('keeps the surface open and reports a failed continuation', async () => {
		active = setup({
			message: 'Discard this draft?',
			confirmLabel: 'Discard and continue',
			continue: () => Promise.reject(new Error('navigation failed'))
		});
		confirmButton()!.click();
		await tick();
		await tick();
		expect(active.complete).not.toHaveBeenCalled();
		expect(strip()?.querySelector('[role="alert"]')?.textContent).toContain('Could not continue');
		expect(confirmButton()?.disabled).toBe(false);
	});

	it('automatically resumes a newly clean request only once', async () => {
		const continuation = vi.fn(() => Promise.reject(new Error('navigation failed')));
		active = setup({
			id: 42,
			message: 'Your changes are saved. Continuing...',
			confirmLabel: 'Continue',
			continue: continuation,
			autoContinue: true
		});

		await vi.waitFor(() => expect(continuation).toHaveBeenCalledTimes(1));
		expect(active.complete).not.toHaveBeenCalled();
		expect(strip()?.querySelector('[role="alert"]')?.textContent).toContain('Could not continue');
		await tick();
		await tick();
		expect(continuation).toHaveBeenCalledTimes(1);

		confirmButton()!.click();
		await vi.waitFor(() => expect(continuation).toHaveBeenCalledTimes(2));
	});

	it('keeps cancel available while a write blocks destructive continuation', async () => {
		const trigger = document.createElement('button');
		document.body.append(trigger);
		trigger.focus();
		active = setup({
			message: 'Discard this draft?',
			confirmLabel: 'Discard and continue',
			continue: vi.fn(),
			disabled: true,
			disabledMessage: 'This change is still being saved.'
		});
		await tick();
		await tick();
		expect(confirmButton()?.disabled).toBe(true);
		expect(strip()?.textContent).toContain('still being saved');

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
		flushSync();
		await tick();
		expect(active.cancel).toHaveBeenCalledTimes(1);
		expect(document.activeElement).toBe(trigger);
	});
});
