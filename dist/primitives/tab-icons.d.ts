import type { Component } from 'svelte';
/** A tab meaning of the base table: the label the tab shows. */
export type TabMeaning = 'Content' | 'Workflow' | 'Process' | 'Access' | 'Automation' | 'History' | 'Versions' | 'Details' | 'Overview' | 'Security' | 'Roles' | 'Members' | 'Bots' | 'Invitations' | 'Organization' | 'Departments' | 'Modules' | 'Types' | 'Folders' | 'Workflows' | 'Usage' | 'Settings' | 'Configs' | 'Knowledge' | 'Skills';
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
export declare const TAB_ICONS: Readonly<Record<TabMeaning, Component>>;
/** A table of tab icons: the base, or an app's own over it. */
export type TabIconTable = Readonly<Record<string, Component>>;
/**
 * An app's table: the base and the app's own meanings. A meaning the base
 * holds keeps the base's icon, so an app that names one again with another
 * icon is refused, by name: one meaning has one icon in every app.
 */
export declare function extendTabIcons<Own extends Record<string, Component>>(own: Own): Readonly<typeof TAB_ICONS & Own>;
/** The icons of a document viewer's own tabs, Content and Versions. */
export declare const VIEWER_TAB_ICONS: Readonly<{
    content: Component;
    history: Component;
}>;
/** A viewer tab of the host's, as `viewerTab` builds it. */
export interface ViewerIconTab {
    id: string;
    label: string;
    icon: Component;
    afterVersions?: boolean;
    count?: number;
}
/**
 * A viewer tab of the host's: its id, the label it shows and the icon that
 * label has in the table (`icons`, the base by default); `afterVersions`
 * places it after the viewer's Versions tab (History, the last tab on every
 * page), and `count` is what on it waits on the reader (the counted-icon
 * pill).
 */
export declare function viewerTab<Table extends TabIconTable = typeof TAB_ICONS>(id: string, label: keyof Table & string, options?: {
    afterVersions?: boolean;
    count?: number;
    icons?: Table;
}): ViewerIconTab;
