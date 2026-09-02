import type { Readable } from 'svelte/store';
import type { SurfaceFeedbackAction } from './PageFeedback.svelte';

/**
 * The one place a page reports a failed action, a failed load, or a standing
 * condition: a full-width strip INSIDE the content panel, directly under the
 * panel's header chrome (tab strip, filter bar) or under its top edge when
 * there is none. EditablePageScaffold collects the messages; whichever shell
 * owns the panel renders the strip (the scaffold itself when it owns the
 * surface, PageTabs when the page renders its own tabbed panel).
 */
export const SURFACE_FEEDBACK_CONTEXT = Symbol('gawdux.surface-feedback');

export type SurfaceNoticeTone = 'warning' | 'info' | 'success';

export interface SurfaceFeedbackState {
	actionError: string | null;
	loadError: string | null;
	loadErrorAction: SurfaceFeedbackAction | null;
	tone: 'error' | 'success' | 'info';
	dismissable: boolean;
	/** A standing condition of the record or page (archived, awaiting a
	    password reset). Same strip, not dismissable, never an error tone. */
	notice: string | null;
	noticeTone: SurfaceNoticeTone;
	ondismiss: () => void;
}

export interface SurfaceFeedbackHost {
	state: Readable<SurfaceFeedbackState>;
	/** Take over rendering the strip. Returns a release function, or null when
	    the scaffold owns the surface itself or another shell already claimed it. */
	claim(): (() => void) | null;
}
