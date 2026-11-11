import { derived, toStore, writable } from 'svelte/store';
export const PAGE_STATUS_CONTEXT = Symbol('page-status');
/** A host's page status, read live from `read`, drawn by the first live claim. */
export function createPageStatusHost(read) {
    const claims = writable([]);
    // A store of the live read, so a header written in either Svelte mode
    // follows the status as the host's state changes.
    const current = toStore(read);
    return {
        get status() {
            return read();
        },
        claim() {
            const mine = Symbol('page-status-claim');
            claims.update((held) => [...held, mine]);
            return {
                status: derived([claims, current], ([held, status]) => (held[0] === mine ? status : null)),
                release: () => claims.update((held) => held.filter((claim) => claim !== mine))
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
export const PAGE_TAB_CONTEXT = Symbol('page-tab');
/** A page's open tab, reported by its tab strips. */
export function createPageTabHost() {
    const claims = writable([]);
    const open = derived(claims, (held) => {
        for (let i = held.length - 1; i >= 0; i--)
            if (held[i].tab !== null)
                return held[i].tab;
        return null;
    });
    return {
        open,
        claim() {
            const id = Symbol('page-tab-claim');
            claims.update((held) => [...held, { id, tab: null }]);
            return {
                report(tab) {
                    claims.update((held) => held.map((claim) => (claim.id === id ? { id, tab } : claim)));
                },
                release() {
                    claims.update((held) => held.filter((claim) => claim.id !== id));
                }
            };
        }
    };
}
/**
 * Whether an action of `scope` shows while `open` is the page's open tab:
 * always when it names no tab; while one of its tabs is open when it does,
 * never before a tab strip has reported (`open` null).
 */
export function showsOnTab(scope, open) {
    if (scope == null)
        return true;
    if (open === null)
        return false;
    return typeof scope === 'string' ? scope === open : scope.includes(open);
}
