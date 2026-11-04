const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], ' +
    '[role="checkbox"], [role="switch"], [role="combobox"], [role="menuitem"], [role="tab"], ' +
    '[contenteditable]:not([contenteditable="false"]), [data-row-interactive]';
function targetElement(event) {
    const target = event.target;
    return target && typeof target.closest === 'function' ? target : (target?.parentElement ?? null);
}
/** The row-click guard: whether a click inside a row is the row's own. A
 * click on a control inside the row, or inside one, is that control's. So is
 * a click whose target has left the document: a real click runs the page's
 * microtasks between one listener and the next, so a control that redraws
 * itself on click (a disclosure chevron that swaps its icon) has removed the
 * click's target by the time the click reaches the row, and read as the
 * row's, the row would undo what the control did. */
export function isRowClickTarget(event) {
    const target = event.target;
    if (!target)
        return true;
    if (target.isConnected === false)
        return false;
    return !targetElement(event)?.closest(INTERACTIVE);
}
/** No navigation for controls, selected text, cancelled events or secondary clicks. */
export function rowLinkIntent(event) {
    if (event.defaultPrevented || event.altKey || ![0, 1].includes(event.button))
        return null;
    if (!isRowClickTarget(event))
        return null;
    const element = targetElement(event);
    const view = event.view ?? element?.ownerDocument.defaultView;
    if (view?.getSelection()?.isCollapsed === false)
        return null;
    if (event.button === 1 || event.metaKey || event.ctrlKey || event.shiftKey)
        return 'new-context';
    return 'current';
}
/** Handles only row background clicks. Nested anchors retain their native behavior. */
export function activateRowLink(event, href, ports) {
    const intent = rowLinkIntent(event);
    if (!intent)
        return;
    event.preventDefault();
    if (intent === 'current')
        return ports.navigate(href);
    if (ports.open)
        return ports.open(href);
    const view = event.view ?? targetElement(event)?.ownerDocument.defaultView;
    return view?.open(href, '_blank', 'noopener');
}
