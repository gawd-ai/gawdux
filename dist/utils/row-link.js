const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [role="link"], ' +
    '[role="checkbox"], [role="switch"], [role="combobox"], [role="menuitem"], [role="tab"], ' +
    '[contenteditable]:not([contenteditable="false"]), [data-row-interactive]';
function targetElement(event) {
    const target = event.target;
    return target && typeof target.closest === 'function' ? target : (target?.parentElement ?? null);
}
/** No navigation for controls, selected text, cancelled events or secondary clicks. */
export function rowLinkIntent(event) {
    if (event.defaultPrevented || event.altKey || ![0, 1].includes(event.button))
        return null;
    const element = targetElement(event);
    if (element?.closest(INTERACTIVE))
        return null;
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
