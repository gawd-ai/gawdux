import { goto } from '$app/navigation';
import type { BeforeNavigate } from '@sveltejs/kit';
export interface DiscardNavigationRequest {
    id?: number;
    /**
     * The one question, naming the act and what it discards ("Discard the
     * unsaved skill settings and open another skill?"), or the state while
     * the drawer only reports (saved, continuing).
     */
    title: string;
    /** Only what follows, drawn under the title; absent when nothing does. */
    message?: string;
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
    /** The drawer's question when this guard alone holds changes ("Discard the unsaved product changes?"). */
    title?: string;
}
export interface DiscardNavigationRuntime {
    goto: typeof goto;
    currentHref: () => string;
    historyGo: (delta: number) => void;
    assignLocation: (href: string, replace: boolean) => void;
    addPopstateListener: (listener: () => void) => () => void;
}
export declare const DISCARD_NAVIGATION_CONTEXT: unique symbol;
export type GuardedGoto = typeof goto;
export declare function useGuardedGoto(): GuardedGoto;
export declare function navigationTargets(navigation: BeforeNavigate, targetHref: string | null): boolean;
export declare class DiscardNavigationController {
    #private;
    request: DiscardNavigationRequest | null;
    surfacePending: boolean;
    constructor(runtime?: DiscardNavigationRuntime);
    install(): void;
    dispose(): void;
    register(registration: DiscardGuardRegistration): () => void;
    requestGuardedAction(owner: string, request: DiscardNavigationRequest): boolean;
    clearAction(owner: string): void;
    navigate(url: string | URL, options?: Parameters<typeof goto>[1]): ReturnType<typeof goto>;
    intercept(navigation: BeforeNavigate): void;
    cancel(request: DiscardNavigationRequest): void;
    complete(request: DiscardNavigationRequest): void;
}
