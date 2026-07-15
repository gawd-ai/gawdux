function focusedElement(document) {
    if (typeof HTMLElement === 'undefined')
        return null;
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement) || activeElement === document.body)
        return null;
    return activeElement;
}
function afterRender() {
    if (typeof requestAnimationFrame !== 'function')
        return Promise.resolve();
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
/**
 * Preserve focus across URL-backed navigations that update data without replacing
 * the focused control. The latest navigation owns restoration; explicit user input
 * or a later focus change always wins.
 */
export function createNavigationFocusRestorer() {
    let generation = 0;
    let cancelPending = null;
    function cancel() {
        generation += 1;
        cancelPending?.();
        cancelPending = null;
    }
    async function navigate(navigation) {
        cancelPending?.();
        const navigationGeneration = ++generation;
        const browserDocument = typeof document === 'undefined' ? null : document;
        const focusTarget = browserDocument ? focusedElement(browserDocument) : null;
        let active = true;
        let userFocusIntent = false;
        const markUserFocusIntent = () => {
            userFocusIntent = true;
        };
        const cleanup = () => {
            if (!browserDocument || !focusTarget)
                return;
            browserDocument.removeEventListener('pointerdown', markUserFocusIntent, true);
            browserDocument.removeEventListener('keydown', markUserFocusIntent, true);
        };
        const cancelThisNavigation = () => {
            active = false;
            cleanup();
        };
        cancelPending = cancelThisNavigation;
        if (browserDocument && focusTarget) {
            // Capture phase has already passed for the event that triggered persist(),
            // so only a subsequent interaction invalidates this restore.
            browserDocument.addEventListener('pointerdown', markUserFocusIntent, true);
            browserDocument.addEventListener('keydown', markUserFocusIntent, true);
        }
        try {
            await navigation();
            if (!active ||
                generation !== navigationGeneration ||
                !browserDocument ||
                !focusTarget ||
                userFocusIntent ||
                !focusTarget.isConnected ||
                focusTarget.ownerDocument !== browserDocument) {
                return;
            }
            const focusAfterNavigation = browserDocument.activeElement;
            await afterRender();
            if (!active ||
                generation !== navigationGeneration ||
                userFocusIntent ||
                !focusTarget.isConnected ||
                focusTarget.ownerDocument !== browserDocument) {
                return;
            }
            // A focus change after navigation settled is newer than this restore.
            if (browserDocument.activeElement !== focusAfterNavigation &&
                browserDocument.activeElement !== focusTarget) {
                return;
            }
            focusTarget.focus({ preventScroll: true });
        }
        catch {
            // Cancelled or rejected navigations must not restore focus or leak a rejection.
        }
        finally {
            cleanup();
            if (cancelPending === cancelThisNavigation)
                cancelPending = null;
        }
    }
    return { navigate, cancel };
}
