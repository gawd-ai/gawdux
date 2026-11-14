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
 * with `extendTabIcons` and names its tabs from the table it gets back;
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
/**
 * An app's table: the base and the app's own meanings. A meaning the base
 * holds keeps the base's icon, so an app that names one again with another
 * icon is refused, by name: one meaning has one icon in every app.
 */
export function extendTabIcons(own) {
    const base = TAB_ICONS;
    const changed = Object.keys(own).filter((meaning) => meaning in base && own[meaning] !== base[meaning]);
    if (changed.length > 0)
        throw new Error(`extendTabIcons: ${changed.join(', ')} ${changed.length > 1 ? 'have' : 'has'} an icon in the base table, which an app keeps`);
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
