import { beforeNavigate, goto } from '$app/navigation';
import type { BeforeNavigate } from '@sveltejs/kit';
import { getContext, onDestroy } from 'svelte';

export interface DiscardNavigationRequest {
	id?: number;
	message: string;
	confirmLabel: string;
	continue: () => void | Promise<void>;
	focusAfter?: () => HTMLElement | null;
	focusOnCancel?: () => HTMLElement | null;
	disabled?: boolean;
	disabledMessage?: string;
	autoContinue?: boolean;
}

export type RequestDiscardNavigation = (request: DiscardNavigationRequest) => void;

export interface DiscardGuardRegistration {
	label: string;
	isDirty: () => boolean;
	isBusy?: () => boolean;
	allowsNavigation?: (navigation: BeforeNavigate) => boolean;
	message?: string;
}

interface RegisteredGuard extends DiscardGuardRegistration {
	id: symbol;
}

interface RouterOptions {
	keepFocus?: boolean | undefined;
	noScroll?: boolean | undefined;
	replaceState?: boolean | undefined;
}

interface PendingNavigation {
	id: number;
	fromHref: string;
	toHref: string;
	type: BeforeNavigate['type'];
	delta: number | null;
	gotoOptions: Parameters<typeof goto>[1];
	willUnload: boolean;
	onClear?: () => void;
	focusTarget: HTMLElement | null;
}

interface NavigationApproval {
	kind: 'goto' | 'popstate' | 'leave';
	toHref?: string;
	delta?: number | null;
	guardStates: Map<symbol, string>;
	resolve?: () => void;
	reject?: (error: unknown) => void;
	expiry?: ReturnType<typeof setTimeout>;
	claimed?: boolean;
}

interface HostedAction {
	owner: string;
	baseRequest: DiscardNavigationRequest;
	request: DiscardNavigationRequest;
}

export interface DiscardNavigationRuntime {
	goto: typeof goto;
	currentHref: () => string;
	historyGo: (delta: number) => void;
	assignLocation: (href: string, replace: boolean) => void;
	addPopstateListener: (listener: () => void) => () => void;
}

const browserRuntime: DiscardNavigationRuntime = {
	goto,
	currentHref: () => window.location.href,
	historyGo: (delta) => window.history.go(delta),
	assignLocation: (href, replace) => {
		if (replace) window.location.replace(href);
		else window.location.assign(href);
	},
	addPopstateListener: (listener) => {
		window.addEventListener('popstate', listener);
		return () => window.removeEventListener('popstate', listener);
	}
};

function readBooleanRouterOption(element: Element | null, name: string): boolean | undefined {
	let current = element;
	while (current && current !== document.documentElement) {
		const value = current.getAttribute(`data-sveltekit-${name}`);
		if (value !== null) {
			if (value === '' || value === 'true') return true;
			if (value === 'false' || value === 'off') return false;
			return undefined;
		}
		current = current.parentElement;
	}
	return undefined;
}

function eventRouterElement(event: Event | undefined): Element | null {
	if (event instanceof SubmitEvent && event.target instanceof HTMLFormElement) return event.target;
	if (!(event instanceof MouseEvent) || !(event.target instanceof Element)) return null;
	return event.target.closest('a');
}

function captureRouterOptions(event: Event | undefined): RouterOptions {
	const element = eventRouterElement(event);
	return {
		keepFocus: readBooleanRouterOption(element, 'keepfocus'),
		noScroll: readBooleanRouterOption(element, 'noscroll'),
		replaceState: readBooleanRouterOption(element, 'replacestate')
	};
}

function safeFlag(read: (() => boolean) | undefined): boolean {
	if (!read) return false;
	try {
		return Boolean(read());
	} catch {
		return true;
	}
}

function safeAllow(read: (() => boolean) | undefined): boolean {
	if (!read) return false;
	try {
		return read() === true;
	} catch {
		return false;
	}
}

function errorFromUnknown(error: unknown): Error {
	return error instanceof Error ? error : new Error('Navigation could not be completed.');
}

function activeElement(): HTMLElement | null {
	return typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
		? document.activeElement
		: null;
}

export const DISCARD_NAVIGATION_CONTEXT = Symbol('gawdux.discard-navigation');

export type GuardedGoto = typeof goto;

export function useGuardedGoto(): GuardedGoto {
	const controller = getContext<DiscardNavigationController | undefined>(
		DISCARD_NAVIGATION_CONTEXT
	);
	return controller ? controller.navigate.bind(controller) : goto;
}

export function navigationTargets(navigation: BeforeNavigate, targetHref: string | null): boolean {
	if (!targetHref || !navigation.to) return false;
	const base = navigation.from?.url ?? navigation.to.url;
	return navigation.to.url.href === new URL(targetHref, base).href;
}

export class DiscardNavigationController {
	request = $state<DiscardNavigationRequest | null>(null);
	surfacePending = $state(false);

	#guards = new Map<symbol, RegisteredGuard>();
	#pending: PendingNavigation | null = null;
	#hostedAction: HostedAction | null = null;
	#approval: NavigationApproval | null = null;
	#activeGotoApproval: NavigationApproval | null = null;
	#nextRequestId = 1;
	#monitor: ReturnType<typeof setInterval> | null = null;
	#runtime: DiscardNavigationRuntime;

	constructor(runtime: DiscardNavigationRuntime = browserRuntime) {
		this.#runtime = runtime;
	}

	install(): void {
		beforeNavigate((navigation) => this.intercept(navigation));
		onDestroy(() => this.dispose());
	}

	dispose(): void {
		this.#clearApproval();
		this.#clearPending();
		this.#hostedAction = null;
		this.#activeGotoApproval = null;
		this.request = null;
		this.surfacePending = false;
		this.#guards.clear();
	}

	register(registration: DiscardGuardRegistration): () => void {
		const id = Symbol(registration.label);
		this.#guards.set(id, { ...registration, id });
		return () => {
			this.#guards.delete(id);
			this.#refreshRequest();
		};
	}

	requestGuardedAction(owner: string, request: DiscardNavigationRequest): boolean {
		if (!this.#hasBlockers()) return false;
		if (this.request || this.surfacePending) return true;
		const focusTarget = activeElement();
		const id = this.#nextRequestId++;
		const hosted = {
			...request,
			id,
			continue: () => this.#continueHostedAction(id, request.continue),
			focusOnCancel: request.focusOnCancel ?? (() => focusTarget)
		};
		this.#hostedAction = { owner, baseRequest: hosted, request: hosted };
		this.#refreshHostedAction();
		this.#startMonitor();
		return true;
	}

	async #continueHostedAction(
		requestId: number,
		continueAction: DiscardNavigationRequest['continue']
	): Promise<void> {
		if (this.#hostedAction?.request.id !== requestId) return;
		if (this.#activeGuards().some((guard) => guard.busy)) {
			this.#refreshHostedAction();
			throw new Error('Wait for the current save to finish.');
		}
		await continueAction();
	}

	clearAction(owner: string): void {
		if (this.surfacePending || this.#hostedAction?.owner !== owner) return;
		this.#clearHostedAction();
	}

	navigate(url: string | URL, options?: Parameters<typeof goto>[1]): ReturnType<typeof goto> {
		if (!this.#hasBlockers()) return this.#runtime.goto(url, options);
		if (this.#pending || this.#hostedAction) return Promise.resolve();

		const fromHref = this.#runtime.currentHref();
		const toHref = new URL(url, fromHref).href;
		if (new URL(fromHref).origin !== new URL(toHref).origin) {
			return this.#runtime.goto(url, options);
		}

		return new Promise<void>((resolve) => {
			const id = this.#nextRequestId++;
			this.#pending = {
				id,
				fromHref,
				toHref,
				type: 'goto',
				delta: null,
				gotoOptions: options,
				willUnload: false,
				onClear: resolve,
				focusTarget: activeElement()
			};
			this.#refreshRequest();
			this.#startMonitor();
		});
	}

	intercept(navigation: BeforeNavigate): void {
		if (this.#consumeApproval(navigation)) return;
		if (!this.#hasBlockers(navigation)) return;

		// A direct reload/tab/window exit cannot be paused and resumed by the
		// application. Cancelling here delegates the warning to SvelteKit's
		// browser beforeunload integration.
		if (navigation.type === 'leave' && navigation.to === null) {
			navigation.cancel();
			return;
		}

		navigation.cancel();
		if (this.#pending || this.#hostedAction) return;
		if (!navigation.to) return;

		const id = this.#nextRequestId++;
		const routerOptions = captureRouterOptions(
			'event' in navigation ? navigation.event : undefined
		);
		if (
			routerOptions.replaceState === undefined &&
			(navigation.type === 'link' || navigation.type === 'form')
		) {
			routerOptions.replaceState = navigation.to.url.href === this.#runtime.currentHref();
		}
		this.#pending = {
			id,
			fromHref: navigation.from?.url.href ?? this.#runtime.currentHref(),
			toHref: navigation.to.url.href,
			type: navigation.type,
			delta: navigation.type === 'popstate' ? navigation.delta : null,
			gotoOptions: routerOptions,
			willUnload: navigation.willUnload,
			focusTarget: activeElement()
		};
		this.#refreshRequest();
		this.#startMonitor();
	}

	cancel(request: DiscardNavigationRequest): void {
		if (request.id === this.#hostedAction?.request.id) {
			this.#clearHostedAction();
			return;
		}
		if (request.id !== this.#pending?.id) return;
		this.#clearPending();
	}

	complete(request: DiscardNavigationRequest): void {
		if (request.id === this.#hostedAction?.request.id) {
			this.#clearHostedAction();
			return;
		}
		if (request.id !== this.#pending?.id) return;
		this.#clearPending();
	}

	#activeGuards(
		navigation?: BeforeNavigate
	): Array<RegisteredGuard & { dirty: boolean; busy: boolean }> {
		return [...this.#guards.values()]
			.map((guard) => {
				const allowed =
					navigation !== undefined &&
					safeAllow(() => guard.allowsNavigation?.(navigation) === true);
				return {
					...guard,
					dirty: !allowed && safeFlag(guard.isDirty),
					busy: !allowed && safeFlag(guard.isBusy)
				};
			})
			.filter((guard) => guard.dirty || guard.busy);
	}

	#hasBlockers(navigation?: BeforeNavigate): boolean {
		return this.#activeGuards(navigation).length > 0;
	}

	#refreshRequest(): void {
		this.#refreshHostedAction();
		const pending = this.#pending;
		if (!pending) return;
		const blockers = this.#activeGuards();
		if (blockers.length === 0) {
			if (this.surfacePending) return;
			this.request = {
				id: pending.id,
				message: 'Your changes are saved. Continuing…',
				confirmLabel: 'Continue',
				continue: () => this.#retry(pending.id),
				focusOnCancel: () => pending.focusTarget,
				autoContinue: true
			};
			return;
		}
		const dirty = blockers.filter((guard) => guard.dirty);
		const busy = blockers.filter((guard) => guard.busy);
		const message =
			dirty.length === 1 && dirty[0]?.message
				? dirty[0].message
				: dirty.length > 1
					? `You have unsaved changes in ${dirty.map((guard) => guard.label).join(', ')}. Discard them and continue?`
					: 'A change is still being saved. Wait for it to finish before leaving this page.';
		const requestId = pending.id;
		this.request = {
			id: requestId,
			message,
			confirmLabel: pending.willUnload ? 'Discard and leave' : 'Discard and continue',
			continue: () => this.#retry(requestId),
			focusOnCancel: () => pending.focusTarget,
			disabled: busy.length > 0,
			...(busy.length > 0
				? {
						disabledMessage:
							busy.length === 1
								? `${busy[0]?.label ?? 'This change'} is still being saved.`
								: 'Changes are still being saved.'
					}
				: {})
		};
	}

	#refreshHostedAction(): void {
		const hosted = this.#hostedAction;
		if (!hosted) return;
		const blockers = this.#activeGuards();
		const baseDisabled = hosted.baseRequest.disabled === true;
		const { disabledMessage: baseDisabledMessage, ...baseRequest } = hosted.baseRequest;
		if (blockers.length === 0) {
			if (this.surfacePending) return;
			hosted.request = {
				...baseRequest,
				message: 'Your changes are saved. Continuing…',
				confirmLabel: 'Continue',
				disabled: baseDisabled,
				autoContinue: !baseDisabled,
				...(baseDisabled && baseDisabledMessage ? { disabledMessage: baseDisabledMessage } : {})
			};
			this.request = hosted.request;
			return;
		}
		const busy = blockers.filter((guard) => guard.busy);
		const disabled = baseDisabled || busy.length > 0;
		hosted.request = {
			...baseRequest,
			disabled,
			autoContinue: false,
			...(busy.length > 0
				? {
						disabledMessage:
							busy.length === 1
								? `${busy[0]?.label ?? 'This change'} is still being saved.`
								: 'Changes are still being saved.'
					}
				: baseDisabledMessage
					? { disabledMessage: baseDisabledMessage }
					: {})
		};
		this.request = hosted.request;
	}

	#startMonitor(): void {
		if (this.#monitor) return;
		this.#monitor = setInterval(() => this.#refreshRequest(), 150);
	}

	#stopMonitor(): void {
		if (!this.#monitor) return;
		clearInterval(this.#monitor);
		this.#monitor = null;
	}

	#clearPending(): void {
		const pending = this.#pending;
		this.#pending = null;
		this.request = null;
		this.#stopMonitor();
		pending?.onClear?.();
	}

	#clearHostedAction(): void {
		this.#hostedAction = null;
		this.request = null;
		this.#stopMonitor();
	}

	#consumeApproval(navigation: BeforeNavigate): boolean {
		const approval = this.#approval;
		if (!approval) return false;
		if (approval.kind === 'goto' && this.#activeGotoApproval !== approval) return false;

		const matches =
			approval.kind === 'leave'
				? navigation.type === 'leave' && navigation.to === null
				: approval.kind === 'popstate'
					? navigation.type === 'popstate' &&
						navigation.to?.url.href === approval.toHref &&
						navigation.delta === approval.delta
					: navigation.type === 'goto' && navigation.to?.url.href === approval.toHref;
		if (!matches) return false;
		const activeGuards = this.#activeGuards();
		const blockersChanged =
			activeGuards.length !== approval.guardStates.size ||
			activeGuards.some(
				(guard) =>
					approval.guardStates.get(guard.id) !== `${Number(guard.dirty)}:${Number(guard.busy)}`
			);
		if (blockersChanged) {
			this.#clearApproval();
			this.#refreshRequest();
			approval.reject?.(new Error('Unsaved changes changed before navigation completed.'));
			return false;
		}

		approval.claimed = true;
		this.#clearApproval();
		if (approval.kind === 'leave') {
			approval.resolve?.();
			return true;
		}
		if (approval.resolve || approval.reject) {
			void navigation.complete.then(approval.resolve, approval.reject);
		}
		return true;
	}

	async #retry(requestId: number): Promise<void> {
		const pending = this.#pending;
		if (!pending || pending.id !== requestId) return;
		if (this.#activeGuards().some((guard) => guard.busy)) {
			throw new Error('Wait for the current save to finish.');
		}

		const guardStates = new Map(
			this.#activeGuards().map((guard) => [
				guard.id,
				`${Number(guard.dirty)}:${Number(guard.busy)}`
			])
		);
		if (pending.willUnload) {
			await new Promise<void>((resolve, reject) => {
				const approval: NavigationApproval = {
					kind: 'leave',
					guardStates,
					resolve,
					reject
				};
				this.#approval = approval;
				approval.expiry = setTimeout(() => {
					if (this.#approval !== approval) return;
					this.#clearApproval();
					reject(new Error('The browser did not begin leaving this page.'));
				}, 2_000);
				try {
					this.#runtime.assignLocation(pending.toHref, pending.gotoOptions?.replaceState === true);
				} catch (error) {
					this.#clearApproval();
					reject(errorFromUnknown(error));
				}
			});
			return;
		}

		if (pending.type === 'popstate' && pending.delta != null) {
			await this.#waitForRollback(pending.fromHref);
			const currentGuards = this.#activeGuards();
			if (currentGuards.some((guard) => guard.busy)) {
				throw new Error('Wait for the current save to finish.');
			}
			if (
				currentGuards.length !== guardStates.size ||
				currentGuards.some(
					(guard) => guardStates.get(guard.id) !== `${Number(guard.dirty)}:${Number(guard.busy)}`
				)
			) {
				throw new Error('Unsaved changes changed while browser history was settling.');
			}
			await new Promise<void>((resolve, reject) => {
				const approval: NavigationApproval = {
					kind: 'popstate',
					toHref: pending.toHref,
					delta: pending.delta,
					guardStates,
					resolve,
					reject
				};
				this.#approval = approval;
				approval.expiry = setTimeout(() => {
					if (this.#approval !== approval) return;
					this.#clearApproval();
					reject(new Error('Browser history navigation did not complete.'));
				}, 5_000);
				this.#runtime.historyGo(pending.delta!);
			});
			return;
		}

		const approval: NavigationApproval = {
			kind: 'goto',
			toHref: pending.toHref,
			guardStates
		};
		this.#approval = approval;
		try {
			this.#activeGotoApproval = approval;
			await this.#runtime.goto(pending.toHref, {
				...pending.gotoOptions,
				// The decision surface owns focus while it is open. Retaining
				// that button would strand focus when the surface unmounts.
				keepFocus: false
			});
			if (!approval.claimed) {
				throw new Error('The requested navigation did not begin.');
			}
		} finally {
			if (this.#activeGotoApproval === approval) this.#activeGotoApproval = null;
			if (this.#approval === approval) this.#clearApproval();
		}
	}

	#clearApproval(): void {
		const approval = this.#approval;
		if (approval?.expiry) clearTimeout(approval.expiry);
		if (this.#activeGotoApproval === approval) this.#activeGotoApproval = null;
		this.#approval = null;
	}

	async #waitForRollback(fromHref: string): Promise<void> {
		if (this.#runtime.currentHref() === fromHref) return;
		await new Promise<void>((resolve, reject) => {
			const remove = this.#runtime.addPopstateListener(() => {
				if (this.#runtime.currentHref() !== fromHref) return;
				clearTimeout(timeout);
				remove();
				resolve();
			});
			const timeout = setTimeout(() => {
				remove();
				reject(new Error('Browser history did not return to the current page.'));
			}, 2_000);
		});
	}
}
