import type { Snippet } from 'svelte';
import type { PageCommandBarContext, PageCommandBarZone } from './page-chrome';

/**
 * Registry backing the persistent bottom command bar (one instance lives in the
 * app `+layout.svelte`, published via PAGE_COMMAND_BAR_CONTEXT). Pages and panes
 * register a zone snippet on mount (`PageCommandBarCenter` etc.), fill it from a
 * deferred `$effect`, and clear it on destroy.
 *
 * Because the registry state lives in the *persistent* layout, any inconsistency
 * survives client-side navigation and is only reset by a full page reload. The
 * earlier "active id wins + clear-only-if-still-active" model was fragile to
 * overlapping registrations: during a navigation a superseded/transient mount
 * could steal the active slot with a null snippet and then be destroyed before
 * its deferred `update()` ran, orphaning an older still-alive registrant — the
 * zone stranded empty until refresh (the "Edit button disappears" bug).
 *
 * This model is order-independent: every live registration is tracked in
 * insertion order and each zone always renders the *most-recently-registered
 * live* registration's snippet. Register / update / clear simply recompute the
 * winner, so no mount/destroy/effect interleaving can strand a zone — when the
 * top registrant goes away the next-newest live one is shown immediately. A null
 * snippet is a legitimate value (a page with no actions clears the bar), so the
 * newest live registration wins even when its snippet is null.
 */
export function createPageCommandBarRegistry(
	apply: (zone: PageCommandBarZone, snippet: Snippet | null) => void
): PageCommandBarContext {
	const registrations = new Map<symbol, { zone: PageCommandBarZone; snippet: Snippet | null }>();

	// Last live registration in insertion order wins. Map preserves insertion
	// order and `set` on an existing key keeps its position, so an `update()`
	// never reorders a registrant relative to its peers.
	function recompute(zone: PageCommandBarZone): void {
		let winner: Snippet | null = null;
		for (const reg of registrations.values()) {
			if (reg.zone === zone) winner = reg.snippet;
		}
		apply(zone, winner);
	}

	return {
		register(zone, snippet) {
			const id = Symbol(`page-command-bar-${zone}`);
			registrations.set(id, { zone, snippet: snippet ?? null });
			recompute(zone);
			return id;
		},
		update(id, snippet) {
			const reg = registrations.get(id);
			if (!reg) return;
			reg.snippet = snippet ?? null;
			recompute(reg.zone);
		},
		clear(id) {
			const reg = registrations.get(id);
			if (!reg) return;
			registrations.delete(id);
			recompute(reg.zone);
		}
	};
}
