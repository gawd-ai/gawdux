import type { Component } from 'svelte';
import {
	AdjustmentsVerticalOutline,
	ArrowsRepeatOutline,
	BadgeCheckOutline,
	BookOutline,
	BuildingOutline,
	ChartMixedOutline,
	ClipboardCheckOutline,
	ClockOutline,
	CogOutline,
	EnvelopeOutline,
	EyeOutline,
	FileLinesOutline,
	FolderOpenOutline,
	GridOutline,
	InfoCircleOutline,
	LandmarkOutline,
	LayersOutline,
	LockOutline,
	ShareNodesOutline,
	ShieldCheckOutline,
	ShieldOutline,
	TagOutline,
	UsersGroupOutline
} from 'flowbite-svelte-icons';

/** A tab meaning of the base table: the label the tab shows. */
export type TabMeaning =
	| 'Content'
	| 'Workflow'
	| 'Process'
	| 'Access'
	| 'Automation'
	| 'History'
	| 'Versions'
	| 'Details'
	| 'Overview'
	| 'Security'
	| 'Roles'
	| 'Members'
	| 'Bots'
	| 'Invitations'
	| 'Organization'
	| 'Departments'
	| 'Modules'
	| 'Types'
	| 'Folders'
	| 'Workflows'
	| 'Usage'
	| 'Settings'
	| 'Configs'
	| 'Knowledge'
	| 'Skills';

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
export const TAB_ICONS: Readonly<Record<TabMeaning, Component>> = Object.freeze({
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

/** A table of tab icons: the base, or an app's own over it. */
export type TabIconTable = Readonly<Record<string, Component>>;

/** What an app's table says beside its icons. */
export interface TabIconExtension {
	/**
	 * The base meanings this app draws with another icon, each with why. One
	 * meaning has one icon in an app; an app whose strips already draw a base
	 * meaning another way keeps its own by naming it here.
	 */
	replaces?: Readonly<Record<string, string>>;
}

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
export function extendTabIcons<Own extends Record<string, Component>>(
	own: Own,
	options: TabIconExtension = {}
): Readonly<Omit<typeof TAB_ICONS, keyof Own> & Own> {
	const base: TabIconTable = TAB_ICONS;
	const replaces = options.replaces ?? {};
	const said = (meaning: string) => Object.hasOwn(replaces, meaning);
	const list = (meanings: string[], one: string, many: string) =>
		`extendTabIcons: ${meanings.join(', ')} ${meanings.length > 1 ? many : one}`;
	const changed = Object.keys(own).filter(
		(meaning) => Object.hasOwn(base, meaning) && own[meaning] !== base[meaning] && !said(meaning)
	);
	if (changed.length > 0)
		throw new Error(
			list(
				changed,
				'has an icon in the base table, which an app keeps or replaces by name with its reason',
				'have an icon in the base table, which an app keeps or replaces by name with its reason'
			)
		);
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
	return Object.freeze({ ...TAB_ICONS, ...own }) as Readonly<Omit<typeof TAB_ICONS, keyof Own> & Own>;
}

/** The icons of a document viewer's own tabs, Content and Versions. */
export const VIEWER_TAB_ICONS: Readonly<{ content: Component; history: Component }> = Object.freeze({
	content: TAB_ICONS.Content,
	history: TAB_ICONS.Versions
});

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
export function viewerTab<Table extends TabIconTable = typeof TAB_ICONS>(
	id: string,
	label: keyof Table & string,
	options: { afterVersions?: boolean; count?: number; icons?: Table } = {}
): ViewerIconTab {
	const table: TabIconTable = options.icons ?? TAB_ICONS;
	const icon = table[label];
	if (!icon) throw new Error(`viewerTab: ${label} is not in the tab icon table`);
	return {
		id,
		label,
		icon,
		...(options.afterVersions ? { afterVersions: true } : {}),
		...(options.count ? { count: options.count } : {})
	};
}
