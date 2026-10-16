/** Caller-owned state and elements; listeners exist only for an explicit binding. */
export function createDisclosureController(ports) {
    function close({ restoreFocus = false } = {}) {
        ports.setOpen(false);
        const trigger = ports.trigger?.();
        if (restoreFocus && trigger?.isConnected && !trigger.matches(":disabled"))
            trigger.focus();
    }
    return {
        toggle: () => ports.setOpen(!ports.isOpen()),
        close,
        bind(target) {
            const click = (event) => {
                const root = ports.root();
                const node = event.target;
                if (ports.isOpen() &&
                    root &&
                    (!node || !("nodeType" in node) || !root.contains(node)))
                    close();
            };
            const keydown = (event) => {
                const key = event;
                if (!ports.isOpen() ||
                    key.defaultPrevented ||
                    key.isComposing ||
                    key.key !== "Escape")
                    return;
                close({ restoreFocus: true });
            };
            target.addEventListener("click", click);
            target.addEventListener("keydown", keydown);
            let bound = true;
            return () => {
                if (!bound)
                    return;
                bound = false;
                target.removeEventListener("click", click);
                target.removeEventListener("keydown", keydown);
            };
        },
    };
}
