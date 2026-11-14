import { AdjustmentsVerticalOutline, ArrowsRepeatOutline, BadgeCheckOutline, BookOutline, BuildingOutline, ChartMixedOutline, ClipboardCheckOutline, ClockOutline, CogOutline, EnvelopeOutline, EyeOutline, FileLinesOutline, FolderOpenOutline, GridOutline, InfoCircleOutline, LandmarkOutline, LayersOutline, LockOutline, ShareNodesOutline, ShieldCheckOutline, ShieldOutline, TagOutline, UsersGroupOutline } from 'flowbite-svelte-icons';
/**
 * The tab icon base table. A tab is an icon and its label (`TabTitle`), the
 * icon alone while the strip's labels do not fit its box, so one meaning has
 * one icon on every strip: History is the clock and Content the page of
 * lines wherever they stand. The table is keyed by the label a tab shows.
 *
 * These are the meanings every app shares: an item's Content, Workflow,
 * Process, Access, Automation, History and Versions, a detail page's Details
 * and Overview, and the administration tabs. An app adds its own meanings
 * with `extendTabIcons`, replaces by name (with its reason) a base meaning
 * its strips already draw another way, and names its tabs from the table it
 * gets back;
 * `tabIconFaults` (`gawdux/utils`) holds every `TabTitle` to it.
 */
export const TAB_ICONS = Object.freeze({
    Content: FileLinesOutline,
    Workflow: ClipboardCheckOutline,
    Process: ShareNodesOutline,
    Access: LockOutline,
    Automation: ArrowsRepeatOutline,
    History: ClockOutline,
    Versions: LayersOutline,
    Details: InfoCircleOutline,
    Overview: EyeOutline,
    Security: ShieldOutline,
    Roles: ShieldCheckOutline,
    Members: UsersGroupOutline,
    Bots: UsersGroupOutline,
    Invitations: EnvelopeOutline,
    Organization: LandmarkOutline,
    Departments: BuildingOutline,
    Modules: GridOutline,
    Types: TagOutline,
    Folders: FolderOpenOutline,
    Workflows: ClipboardCheckOutline,
    Usage: ChartMixedOutline,
    Settings: CogOutline,
    Configs: AdjustmentsVerticalOutline,
    Knowledge: BookOutline,
    Skills: BadgeCheckOutline
});
/** The shortest reason that says something. */
const SHORTEST_REASON = 10;
/**
 * An app's table: the base and the app's own meanings. A meaning the base
 * holds keeps the base's icon unless the app names it in `replaces` with its
 * reason: a base meaning given another icon and not named is refused, by
 * name, and so is one named with no reason, one named that the base does not
 * hold, and one named that takes the base's icon after all (a list of
 * replacements never outlives what it replaced).
 */
export function extendTabIcons(own, options = {}) {
    const base = TAB_ICONS;
    const replaces = options.replaces ?? {};
    const said = (meaning) => Object.hasOwn(replaces, meaning);
    const list = (meanings, one, many) => `extendTabIcons: ${meanings.join(', ')} ${meanings.length > 1 ? many : one}`;
    const changed = Object.keys(own).filter((meaning) => Object.hasOwn(base, meaning) && own[meaning] !== base[meaning] && !said(meaning));
    if (changed.length > 0)
        throw new Error(list(changed, 'has an icon in the base table, which an app keeps or replaces by name with its reason', 'have an icon in the base table, which an app keeps or replaces by name with its reason'));
    const named = Object.keys(replaces);
    const unknown = named.filter((meaning) => !Object.hasOwn(base, meaning));
    if (unknown.length > 0)
        throw new Error(list(unknown, 'is not a meaning of the base table to replace', 'are not meanings of the base table to replace'));
    const kept = named.filter((meaning) => !Object.hasOwn(own, meaning) || own[meaning] === base[meaning]);
    if (kept.length > 0)
        throw new Error(list(kept, "is named as replaced and takes the base's icon", "are named as replaced and take the base's icon"));
    const unsaid = named.filter((meaning) => (replaces[meaning] ?? '').trim().length < SHORTEST_REASON);
    if (unsaid.length > 0)
        throw new Error(list(unsaid, 'is replaced with no reason', 'are replaced with no reason'));
    return Object.freeze({ ...TAB_ICONS, ...own });
}
/** The icons of a document viewer's own tabs, Content and Versions. */
export const VIEWER_TAB_ICONS = Object.freeze({
    content: TAB_ICONS.Content,
    history: TAB_ICONS.Versions
});
/**
 * A viewer tab of the host's: its id, the label it shows and the icon that
 * label has in the table (`icons`, the base by default); `afterVersions`
 * places it after the viewer's Versions tab (History, the last tab on every
 * page), and `count` is what on it waits on the reader (the counted-icon
 * pill).
 */
export function viewerTab(id, label, options = {}) {
    const table = options.icons ?? TAB_ICONS;
    const icon = table[label];
    if (!icon)
        throw new Error(`viewerTab: ${label} is not in the tab icon table`);
    return {
        id,
        label,
        icon,
        ...(options.afterVersions ? { afterVersions: true } : {}),
        ...(options.count ? { count: options.count } : {})
    };
}
