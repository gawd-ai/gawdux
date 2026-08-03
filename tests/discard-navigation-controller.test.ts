import { describe, expect, it, vi } from 'vitest';
import type { BeforeNavigate } from '@sveltejs/kit';
import {
	DiscardNavigationController,
	navigationTargets,
	type DiscardNavigationRuntime
} from '../src/lib/utils/discard-navigation.svelte';

function deferred() {
	let resolve!: () => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<void>((done, fail) => {
		resolve = done;
		reject = fail;
	});
	return { promise, resolve, reject };
}

function target(href: string) {
	return {
		params: {},
		route: { id: '/test' },
		url: new URL(href)
	};
}

function makeNavigation({
	type = 'link',
	from = 'https://app.example/current',
	to = 'https://app.example/next',
	willUnload = false,
	delta = null,
	event
}: {
	type?: BeforeNavigate['type'];
	from?: string;
	to?: string | null;
	willUnload?: boolean;
	delta?: number | null;
	event?: Event;
} = {}) {
	let cancelled = false;
	const completion = deferred();
	const navigation = {
		from: target(from),
		to: to === null ? null : target(to),
		type,
		willUnload,
		cancel: () => {
			cancelled = true;
		},
		complete: completion.promise,
		...(delta === null ? {} : { delta }),
		...(event ? { event } : {})
	} as unknown as BeforeNavigate;
	return {
		navigation,
		completion,
		get cancelled() {
			return cancelled;
		}
	};
}

function createFakeRuntime(initialHref = 'https://app.example/current') {
	let href = initialHref;
	const popstateListeners = new Set<() => void>();
	const gotoMock = vi.fn(
		async (_href: string | URL, _options?: Parameters<DiscardNavigationRuntime['goto']>[1]) => {}
	);
	const historyGoMock = vi.fn();
	const assignLocationMock = vi.fn();
	const runtime: DiscardNavigationRuntime = {
		goto: gotoMock as unknown as DiscardNavigationRuntime['goto'],
		currentHref: () => href,
		historyGo: historyGoMock,
		assignLocation: assignLocationMock,
		addPopstateListener: (listener) => {
			popstateListeners.add(listener);
			return () => popstateListeners.delete(listener);
		}
	};
	return {
		runtime,
		gotoMock,
		historyGoMock,
		assignLocationMock,
		setHref(next: string) {
			href = next;
		},
		emitPopstate() {
			for (const listener of popstateListeners) listener();
		}
	};
}

function registerDirty(controller: DiscardNavigationController, overrides = {}) {
	return controller.register({
		label: 'Draft',
		isDirty: () => true,
		message: 'You have unsaved draft changes.',
		...overrides
	});
}

describe('DiscardNavigationController', () => {
	it('holds one internal destination and allows only its approved retry', async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		registerDirty(controller);
		const first = makeNavigation();
		controller.intercept(first.navigation);
		const request = controller.request;
		expect(first.cancelled).toBe(true);
		expect(request?.message).toContain('unsaved draft');

		const competing = makeNavigation({ to: 'https://app.example/other' });
		controller.intercept(competing.navigation);
		expect(competing.cancelled).toBe(true);
		expect(controller.request?.id).toBe(request?.id);

		fake.gotoMock.mockImplementationOnce(async (href) => {
			const replay = makeNavigation({ type: 'goto', to: String(href) });
			controller.intercept(replay.navigation);
			expect(replay.cancelled).toBe(false);
			replay.completion.resolve();
		});
		await request?.continue();
		expect(fake.gotoMock).toHaveBeenCalledWith('https://app.example/next', {
			keepFocus: false,
			noScroll: undefined,
			replaceState: false
		});
		controller.dispose();
	});

	it("keeps the goto approval armed through SvelteKit's asynchronous beforeNavigate turn", async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		registerDirty(controller);
		const initial = makeNavigation();
		controller.intercept(initial.navigation);
		const request = controller.request;
		fake.gotoMock.mockImplementationOnce(async (href) => {
			await Promise.resolve();
			const replay = makeNavigation({ type: 'goto', to: String(href) });
			controller.intercept(replay.navigation);
			expect(replay.cancelled).toBe(false);
			replay.completion.resolve();
		});

		await request?.continue();
		controller.dispose();
	});

	it('holds guarded goto callers and preserves their full retry intent', async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		registerDirty(controller);
		const options = {
			replaceState: true,
			noScroll: true,
			keepFocus: true,
			invalidateAll: true,
			state: { source: 'detail-rail' }
		};
		const caller = controller.navigate('/records/42', options);
		const request = controller.request;
		expect(fake.gotoMock).not.toHaveBeenCalled();

		fake.gotoMock.mockImplementationOnce(async (href) => {
			const replay = makeNavigation({ type: 'goto', to: String(href) });
			controller.intercept(replay.navigation);
			expect(replay.cancelled).toBe(false);
			replay.completion.resolve();
		});
		await request?.continue();
		expect(fake.gotoMock).toHaveBeenCalledWith('https://app.example/records/42', {
			...options,
			keepFocus: false
		});
		controller.complete(request!);
		await caller;
		controller.dispose();
	});

	it('waits for the router to roll back popstate before replaying the original delta', async () => {
		const from = 'https://app.example/current';
		const to = 'https://app.example/previous';
		const fake = createFakeRuntime(to);
		const controller = new DiscardNavigationController(fake.runtime);
		registerDirty(controller);
		const initial = makeNavigation({ type: 'popstate', from, to, delta: -1 });
		controller.intercept(initial.navigation);
		const request = controller.request;

		fake.historyGoMock.mockImplementationOnce((delta) => {
			expect(delta).toBe(-1);
			fake.setHref(to);
			const replay = makeNavigation({ type: 'popstate', from, to, delta: -1 });
			controller.intercept(replay.navigation);
			expect(replay.cancelled).toBe(false);
			replay.completion.resolve();
		});
		const retry = request?.continue();
		await Promise.resolve();
		expect(fake.historyGoMock).not.toHaveBeenCalled();

		fake.setHref(from);
		fake.emitPopstate();
		await retry;
		expect(fake.historyGoMock).toHaveBeenCalledTimes(1);
		controller.dispose();
	});

	it('uses one leave approval for a confirmed external or reload navigation', async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		registerDirty(controller);
		const external = makeNavigation({
			to: 'https://outside.example/path',
			willUnload: true
		});
		controller.intercept(external.navigation);
		expect(external.cancelled).toBe(true);
		const request = controller.request;

		fake.assignLocationMock.mockImplementationOnce(() => {
			const leave = makeNavigation({ type: 'leave', to: null, willUnload: true });
			controller.intercept(leave.navigation);
			expect(leave.cancelled).toBe(false);
		});
		await request?.continue();
		expect(fake.assignLocationMock).toHaveBeenCalledWith('https://outside.example/path', false);
		controller.dispose();
	});

	it('limits an editor-owned navigation approval to its exact target', () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		controller.register({
			label: 'Saving config',
			isDirty: () => true,
			isBusy: () => true,
			allowsNavigation: (navigation) => navigationTargets(navigation, '/saved-config')
		});

		const approved = makeNavigation({ to: 'https://app.example/saved-config' });
		controller.intercept(approved.navigation);
		expect(approved.cancelled).toBe(false);

		const unrelated = makeNavigation({ to: 'https://app.example/other' });
		controller.intercept(unrelated.navigation);
		expect(unrelated.cancelled).toBe(true);
		expect(controller.request?.disabled).toBe(true);
		controller.dispose();
	});

	it('rechecks a hosted action when a write starts after the drawer opens', async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		let busy = false;
		registerDirty(controller, { isBusy: () => busy });
		const continueAction = vi.fn();
		expect(
			controller.requestGuardedAction('workspace-switch', {
				message: 'Discard changes and switch?',
				confirmLabel: 'Discard and switch',
				continue: continueAction
			})
		).toBe(true);
		const request = controller.request!;

		busy = true;
		await expect(request.continue()).rejects.toThrow('current save');
		expect(continueAction).not.toHaveBeenCalled();

		busy = false;
		await request.continue();
		expect(continueAction).toHaveBeenCalledTimes(1);
		controller.complete(request);
		controller.dispose();
	});

	it('keeps held navigation and hosted-action intent when the last save finishes', async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		let busy = true;
		controller.register({
			label: 'Saving draft',
			isDirty: () => false,
			isBusy: () => busy
		});

		const navigation = makeNavigation();
		controller.intercept(navigation.navigation);
		const navigationRequestId = controller.request?.id;
		expect(controller.request?.disabled).toBe(true);
		busy = false;
		await vi.waitFor(() => expect(controller.request?.autoContinue).toBe(true));
		expect(controller.request?.id).toBe(navigationRequestId);
		controller.cancel(controller.request!);

		busy = true;
		const continueAction = vi.fn();
		expect(
			controller.requestGuardedAction('workspace-switch', {
				message: 'Wait to switch workspace.',
				confirmLabel: 'Switch workspace',
				continue: continueAction
			})
		).toBe(true);
		const actionRequestId = controller.request?.id;
		busy = false;
		await vi.waitFor(() => expect(controller.request?.autoContinue).toBe(true));
		expect(controller.request?.id).toBe(actionRequestId);
		await controller.request?.continue();
		expect(continueAction).toHaveBeenCalledTimes(1);
		controller.complete(controller.request!);
		controller.dispose();
	});

	it('does not auto-resume a hosted action that is independently disabled', async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		let busy = true;
		controller.register({
			label: 'Saving draft',
			isDirty: () => false,
			isBusy: () => busy
		});
		controller.requestGuardedAction('disabled-action', {
			message: 'Wait for access.',
			confirmLabel: 'Continue',
			continue: vi.fn(),
			disabled: true,
			disabledMessage: 'This action is unavailable.'
		});

		busy = false;
		await vi.waitFor(() => expect(controller.request?.disabledMessage).toContain('unavailable'));
		expect(controller.request?.disabled).toBe(true);
		expect(controller.request?.autoContinue).toBe(false);
		controller.dispose();
	});

	it('leaves direct unload warnings to the router and exposes saving state without a second prompt', async () => {
		const fake = createFakeRuntime();
		const controller = new DiscardNavigationController(fake.runtime);
		let busy = true;
		registerDirty(controller, { isBusy: () => busy });

		const leave = makeNavigation({ type: 'leave', to: null, willUnload: true });
		controller.intercept(leave.navigation);
		expect(leave.cancelled).toBe(true);
		expect(controller.request).toBeNull();

		const internal = makeNavigation();
		controller.intercept(internal.navigation);
		expect(controller.request?.disabled).toBe(true);
		busy = false;
		await vi.waitFor(() => expect(controller.request?.disabled).toBe(false));
		controller.dispose();
	});
});
