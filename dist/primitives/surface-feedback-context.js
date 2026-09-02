/**
 * The one place a page reports a failed action, a failed load, or a standing
 * condition: a full-width strip INSIDE the content panel, directly under the
 * panel's header chrome (tab strip, filter bar) or under its top edge when
 * there is none. EditablePageScaffold collects the messages; whichever shell
 * owns the panel renders the strip (the scaffold itself when it owns the
 * surface, PageTabs when the page renders its own tabbed panel).
 */
export const SURFACE_FEEDBACK_CONTEXT = Symbol('gawdux.surface-feedback');
