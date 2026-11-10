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
