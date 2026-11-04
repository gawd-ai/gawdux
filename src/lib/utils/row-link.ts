/** Keep a row's primary anchor for keyboard/native link behavior. This helper
 * makes the non-interactive remainder of the row follow the same destination. */
export type RowLinkIntent = 'current' | 'new-context';

const INTERACTIVE =
	'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], ' +
	'[role="checkbox"], [role="switch"], [role="combobox"], [role="menuitem"], [role="tab"], ' +
	'[contenteditable]:not([contenteditable="false"]), [data-row-interactive]';

function targetElement(event: Event): Element | null {
	const target = event.target as (Element & { parentElement: Element | null }) | null;
	return target && typeof target.closest === 'function' ? target : (target?.parentElement ?? null);
}

/** The row-click guard: whether a click inside a row is the row's own. A
 * click on a control inside the row, or inside one, is that control's. So is
 * a click whose target has left the document: a real click runs the page's
 * microtasks between one listener and the next, so a control that redraws
 * itself on click (a disclosure chevron that swaps its icon) has removed the
 * click's target by the time the click reaches the row, and read as the
 * row's, the row would undo what the control did. */
export function isRowClickTarget(event: Event): boolean {
	const target = event.target as Node | null;
	if (!target) return true;
	if (target.isConnected === false) return false;
	return !targetElement(event)?.closest(INTERACTIVE);
}

/** No navigation for controls, selected text, cancelled events or secondary clicks. */
export function rowLinkIntent(event: MouseEvent): RowLinkIntent | null {
	if (event.defaultPrevented || event.altKey || ![0, 1].includes(event.button)) return null;
	if (!isRowClickTarget(event)) return null;
	const element = targetElement(event);
	const view = event.view ?? element?.ownerDocument.defaultView;
	if (view?.getSelection()?.isCollapsed === false) return null;
	if (event.button === 1 || event.metaKey || event.ctrlKey || event.shiftKey) return 'new-context';
	return 'current';
}

export interface RowLinkNavigation {
	/** The host router; not selected for modified or middle clicks. */
	navigate(href: string): unknown;
	/** Optional browser adapter, useful for hosts with an explicit window policy. */
	open?(href: string): unknown;
}

/** Handles only row background clicks. Nested anchors retain their native behavior. */
export function activateRowLink(
	event: MouseEvent,
	href: string,
	ports: RowLinkNavigation
): unknown {
	const intent = rowLinkIntent(event);
	if (!intent) return;
	event.preventDefault();
	if (intent === 'current') return ports.navigate(href);
	if (ports.open) return ports.open(href);
	const view = event.view ?? targetElement(event)?.ownerDocument.defaultView;
	return view?.open(href, '_blank', 'noopener');
}
