/**
 * Live-injected stylesheet that highlights the active sidebar sub-item
 * (and, when the sidebar is collapsed, the parent section icon) by matching
 * `[href]` to the current activeUrl. We use a dynamic style element rather
 * than a class toggle because the gawdux dropdown sub-items don't expose an
 * `active` prop, and the collapsed flyout is portaled to body on hover and
 * wouldn't be reachable from a normal Svelte reactive at mount.
 *
 * The parent-icon highlight (collapsed mode) is keyed off a
 * `data-active-group` attribute the consumer (or a future helper) stamps
 * onto the wrapper — using `:has(ul …)` instead would fail in collapsed
 * mode because gawdux force-closes every dropdown on collapse and the
 * `<ul>` (and its anchors) leave the DOM.
 */

import { isBrowser } from './browser.js';

export type ActiveSubitemPalette = {
	/** Light-mode active background (e.g. blue-50). */
	lightBg: string;
	/** Light-mode active text (e.g. blue-700). */
	lightFg: string;
	/** Light-mode hover-on-active background (e.g. blue-100). */
	lightHoverBg: string;
	/** Light-mode 4px tab + border (e.g. blue-200). */
	lightAccent: string;
	/** Light-mode top-level active text (e.g. blue-600). */
	lightTopFg: string;
	/** Dark-mode active background (e.g. blue-950). */
	darkBg: string;
	/** Dark-mode active text (e.g. blue-300). */
	darkFg: string;
	/** Dark-mode hover-on-active background (e.g. blue-900). */
	darkHoverBg: string;
	/** Dark-mode 4px tab + border (e.g. blue-900). */
	darkAccent: string;
	/** Dark-mode top-level active text (e.g. blue-400). */
	darkTopFg: string;
};

export const DEFAULT_PALETTE: ActiveSubitemPalette = {
	lightBg: 'rgb(239 246 255)', // blue-50
	lightFg: 'rgb(29 78 216)', // blue-700
	lightHoverBg: 'rgb(219 234 254)', // blue-100
	lightAccent: 'rgb(191 219 254)', // blue-200
	lightTopFg: 'rgb(37 99 235)', // blue-600
	darkBg: 'rgb(23 37 84)', // blue-950
	darkFg: 'rgb(147 197 253)', // blue-300
	darkHoverBg: 'rgb(30 58 138)', // blue-900
	darkAccent: 'rgb(30 58 138)', // blue-900
	darkTopFg: 'rgb(96 165 250)' // blue-400
};

export type ActiveSubitemStylesheetOptions = {
	/** Optional element id for the injected <style>. */
	id?: string;
	/** Color palette. Defaults to gawdux blue. */
	palette?: Partial<ActiveSubitemPalette>;
};

export type ActiveSubitemStylesheetController = {
	/** Update the active URL (rewrites the stylesheet). Pass null/empty to clear. */
	setActiveUrl: (url: string | null | undefined) => void;
	/** Tear down the style element. */
	destroy: () => void;
};

export function createActiveSubitemStylesheet(
	options: ActiveSubitemStylesheetOptions = {}
): ActiveSubitemStylesheetController {
	if (!isBrowser) {
		return { setActiveUrl: () => {}, destroy: () => {} };
	}

	const palette: ActiveSubitemPalette = { ...DEFAULT_PALETTE, ...(options.palette ?? {}) };
	const styleEl = document.createElement('style');
	if (options.id) styleEl.id = options.id;
	document.head.appendChild(styleEl);

	function setActiveUrl(url: string | null | undefined) {
		const safe = (url ?? '').replace(/"/g, '\\"');
		styleEl.textContent = safe ? buildCss(safe, palette) : '';
	}

	function destroy() {
		styleEl.remove();
	}

	return { setActiveUrl, destroy };
}

function buildCss(url: string, p: ActiveSubitemPalette): string {
	return `
		/* Active sub-item — light mode */
		.app-sidebar .dropdown-wrapper ul a[href="${url}"],
		[data-sidebar-flyout="true"] a.flyout-item[href="${url}"] {
			background-color: ${p.lightBg} !important;
			color: ${p.lightFg} !important;
		}
		.app-sidebar .dropdown-wrapper ul a[href="${url}"]:hover,
		[data-sidebar-flyout="true"] a.flyout-item[href="${url}"]:hover {
			background-color: ${p.lightHoverBg} !important;
		}
		/* Active sub-item — dark mode */
		.dark .app-sidebar .dropdown-wrapper ul a[href="${url}"],
		.dark [data-sidebar-flyout="true"] a.flyout-item[href="${url}"] {
			background-color: ${p.darkBg} !important;
			color: ${p.darkFg} !important;
		}
		.dark .app-sidebar .dropdown-wrapper ul a[href="${url}"]:hover,
		.dark [data-sidebar-flyout="true"] a.flyout-item[href="${url}"]:hover {
			background-color: ${p.darkHoverBg} !important;
		}
		/* 4px left tab on the active sub-item */
		.app-sidebar .dropdown-wrapper ul a[href="${url}"]::before {
			opacity: 1 !important;
			background: ${p.lightAccent} !important;
		}
		.dark .app-sidebar .dropdown-wrapper ul a[href="${url}"]::before {
			background: ${p.darkAccent} !important;
		}
		/* Active TOP-LEVEL item — re-apply inset border by href so the
		   parent stays lit on every detail page (gawdux only highlights
		   on exact href match). */
		.app-sidebar .sidebar a[href="${url}"]:not(.dropdown-wrapper *) {
			background-color: transparent !important;
			color: ${p.lightTopFg} !important;
			box-shadow: inset 0 0 0 2px ${p.lightAccent} !important;
		}
		.app-sidebar .sidebar a[href="${url}"]:not(.dropdown-wrapper *) svg {
			color: ${p.lightTopFg} !important;
		}
		.dark .app-sidebar .sidebar a[href="${url}"]:not(.dropdown-wrapper *) {
			color: ${p.darkTopFg} !important;
			box-shadow: inset 0 0 0 2px ${p.darkAccent} !important;
		}
		.dark .app-sidebar .sidebar a[href="${url}"]:not(.dropdown-wrapper *) svg {
			color: ${p.darkTopFg} !important;
		}
		.app-sidebar .sidebar a[href="${url}"]:not(.dropdown-wrapper *):hover {
			background-color: ${p.lightBg} !important;
		}
		.dark .app-sidebar .sidebar a[href="${url}"]:not(.dropdown-wrapper *):hover {
			background-color: rgb(30 58 138 / 0.25) !important;
		}
		/* Collapsed sidebar: parent icon shows the same 2px border treatment
		   when one of its sub-items is active. The wrapper must be tagged
		   with data-active-group from the consumer JS (gawdux can't infer
		   the group from the URL alone — see SidebarDropdownGroup notes). */
		.app-sidebar[data-collapsed-settled] .dropdown-wrapper[data-active-group] button {
			box-shadow: inset 0 0 0 2px ${p.lightAccent} !important;
			color: ${p.lightTopFg} !important;
		}
		.app-sidebar[data-collapsed-settled] .dropdown-wrapper[data-active-group] button svg {
			color: ${p.lightTopFg} !important;
		}
		.dark .app-sidebar[data-collapsed-settled] .dropdown-wrapper[data-active-group] button {
			box-shadow: inset 0 0 0 2px ${p.darkAccent} !important;
			color: ${p.darkTopFg} !important;
		}
		.dark .app-sidebar[data-collapsed-settled] .dropdown-wrapper[data-active-group] button svg {
			color: ${p.darkTopFg} !important;
		}
		.app-sidebar[data-collapsed-settled] .dropdown-wrapper[data-active-group] button:hover,
		.app-sidebar[data-collapsed-settled] .dropdown-wrapper[data-active-group].flyout-active button {
			box-shadow: none !important;
		}
	`;
}
