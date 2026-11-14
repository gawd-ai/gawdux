import { createPageCommandBarRegistry } from './page-command-bar-registry';
/**
 * The command bar's three zones as state an app shell holds, filled by the
 * bar's registry. The shell makes one in its persistent layout, publishes
 * its `context` (PAGE_COMMAND_BAR_CONTEXT), where pages register what they
 * put in the bar (`PageCommandBarCenter` and the like), and hands the
 * instance to `PageFrame` as its `bar`, which renders each zone:
 *
 * ```svelte
 * <script>
 *   const bar = new PageCommandBarZones();
 *   setContext(PAGE_COMMAND_BAR_CONTEXT, bar.context);
 * </script>
 * <PageFrame {bar}>{@render children()}</PageFrame>
 * ```
 *
 * Each zone is the newest live registration's snippet (see
 * `createPageCommandBarRegistry`), read as state, so the frame follows it.
 * A legacy-mode template does not track state on a class instance: a host
 * that reads the zones itself does so in runes mode.
 */
export class PageCommandBarZones {
    left = $state(null);
    center = $state(null);
    right = $state(null);
    /** The registry to publish as PAGE_COMMAND_BAR_CONTEXT. */
    context;
    constructor() {
        this.context = createPageCommandBarRegistry((zone, snippet) => {
            if (zone === 'left')
                this.left = snippet;
            else if (zone === 'center')
                this.center = snippet;
            else
                this.right = snippet;
        });
    }
}
