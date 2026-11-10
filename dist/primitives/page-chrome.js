export const PAGE_STATUS_CONTEXT = Symbol('page-status');
/** A host's page status, read live from `read`, drawn by the first header that claims it. */
export function createPageStatusHost(read) {
    let holder = null;
    return {
        get status() {
            return read();
        },
        claim() {
            if (holder)
                return null;
            const mine = Symbol('page-status-claim');
            holder = mine;
            return () => {
                if (holder === mine)
                    holder = null;
            };
        }
    };
}
export const EMPTY_PAGE_COMMAND_BAR_SLOTS = {
    left: null,
    center: null,
    right: null
};
export const PAGE_COMMAND_BAR_CONTEXT = Symbol('page-command-bar');
