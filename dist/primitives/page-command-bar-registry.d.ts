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
 *
 * Two rules keep a dead page's buttons out of the bar:
 *
 * - A registrant releases its registration from a teardown that exists from
 *   the moment it registers (`$effect.pre(() => () => clear(id))`), never from
 *   `onDestroy`. In runes mode `onDestroy` is a deferred effect's teardown, and
 *   a component destroyed in the flush that created it (an earlier effect
 *   closed its block) never ran that effect: the registration stayed live and,
 *   whenever it was the newest, the bar showed its dead buttons.
 * - A host renders each zone as `{@render zone?.()}`, never
 *   `{#if zone}{@render zone()}{/if}`. After server rendering, Svelte (seen on
 *   5.56 and 5.57) hydrates that `{#if}` branch with the snippet's first node
 *   as the branch's own start. Swapping to another snippet removes that node;
 *   when the zone later empties, the branch's removal starts from the detached
 *   node and removes nothing, so the current buttons stay in the zone with no
 *   owner, beside every later page's buttons, until a full reload.
 */
export declare function createPageCommandBarRegistry(apply: (zone: PageCommandBarZone, snippet: Snippet | null) => void): PageCommandBarContext;
