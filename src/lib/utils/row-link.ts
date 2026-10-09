/** Keep a row's primary anchor for keyboard/native link behavior. This helper
 * makes the non-interactive remainder of the row follow the same destination. */
export type RowLinkIntent = 'current' | 'new-context';

const INTERACTIVE =
	'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], ' +
	'[role="checkbox"], [role="switch"], [role="combobox"], [role="menuitem"], [role="tab"], ' +
	'[contenteditable]:not([contenteditable="false"]), [data-row-interactive]';

function targetElement(event: MouseEvent): Element | null {
	const target = event.target as (Element & { parentElement: Element | null }) | null;
	return target && typeof target.closest === 'function' ? target : (target?.parentElement ?? null);
}

/** No navigation for controls, selected text, cancelled events or secondary clicks. */
export function rowLinkIntent(event: MouseEvent): RowLinkIntent | null {
	if (event.defaultPrevented || event.altKey || ![0, 1].includes(event.button)) return null;
	const element = targetElement(event);
	if (element?.closest(INTERACTIVE)) return null;
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
