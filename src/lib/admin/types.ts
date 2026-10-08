// gawdux/admin: shared tenant-administration blocks.
//
// Presentation only: hosts load the data, authorize, and perform every
// mutation. A block renders what it is given and raises intents.

/** A Role (access group) as a member surface shows it. */
export interface MemberRole {
	id: number;
	name: string;
	description?: string | null;
	/** Platform-managed: membership cannot be edited here. */
	system?: boolean;
}

/** One capability the member holds, labelled for people. */
export interface MemberCapability {
	id: string;
	label: string;
}

/** Capabilities grouped by the area (module) that owns them. */
export interface MemberCapabilityGroup {
	id: string;
	label: string;
	capabilities: MemberCapability[];
}

/** One sign-in or account event. `tone` picks the badge colour. */
export interface SecurityActivityEvent {
	id: string;
	at: string;
	label: string;
	result: string;
	tone: 'success' | 'failure' | 'neutral';
	detail?: string | null;
}

export interface MemberAccessCopy {
	rolesTitle: string;
	capabilitiesTitle: string;
	noRoles: string;
	noCapabilities: string;
	addPlaceholder: string;
	add: string;
	remove: string;
	/** The trash icon's name, before the Role's ("Remove from Operators"). */
	removeFrom: string;
	system: string;
}

export const DEFAULT_MEMBER_ACCESS_COPY: MemberAccessCopy = {
	rolesTitle: 'Roles',
	capabilitiesTitle: 'What they can do',
	noRoles: 'No Roles yet.',
	noCapabilities: 'No capabilities yet. Add a Role to grant some.',
	addPlaceholder: 'Add to a Role',
	add: 'Add',
	remove: 'Remove',
	removeFrom: 'Remove from',
	system: 'system'
};

/** One host action a bot may be allowed to use. */
export interface BotTool {
	id: string;
	label: string;
	description?: string | null;
	/** Changes something (vs reads): shown so an admin knows what they allow. */
	mutating?: boolean;
	allowed: boolean;
}

/** Tools grouped by the area that owns them. */
export interface BotToolGroup {
	id: string;
	label: string;
	tools: BotTool[];
}

/** A bot a config can apply to. */
export interface BotOption {
	id: string;
	name: string;
}

/** The editable fields of one tenant config. */
export interface BotConfigDraft {
	name: string;
	body: string;
	enabled: boolean;
	botIds: string[];
}

/** The badge colours a history row may ask for. */
export type AuditTone =
	| 'green'
	| 'blue'
	| 'red'
	| 'yellow'
	| 'purple'
	| 'indigo'
	| 'pink'
	| 'dark';

/** One field an audited action changed. `label` names it for people. */
export interface AuditHistoryChange {
	field: string;
	label?: string;
	oldValue: string;
	newValue: string;
}

/**
 * One audit entry, already labelled by the host. The table shows a summary
 * row that always fits its column; the full entry opens beneath the row.
 */
export interface AuditHistoryRow {
	id: string;
	/** ISO instant, formatted by the table's `formatTime`. */
	at: string | null;
	/** The area the entry belongs to; shown only when the table has a module column. */
	module?: { label: string; tone?: AuditTone } | null;
	action: string;
	actionTone?: AuditTone;
	/** The one-line account of what happened; clamped to two lines in the row. */
	comment: string;
	user: string | null;
	/** What the action was done to, when it is not the user. */
	record?: string | null;
	/** Further labelled facts for the detail (result, impact, request id...). */
	facts?: { label: string; value: string }[];
	changes: AuditHistoryChange[];
}

/** Turns and tokens over a window. No money: an activity view, not a bill. */
export interface AiUsageTotals {
	turns: number;
	tokens: number;
}

/** One day of a usage window (`day` is `YYYY-MM-DD`, UTC). */
export interface AiUsageDay {
	day: string;
	turns: number;
	tokens: number;
}

/** One attributed slice of a usage window, already named by the host. */
export interface AiUsageBreakdownRow {
	key: string;
	label: string;
	turns: number;
	tokens: number;
	/** A host extra shown after the numbers (a billed amount, a share). */
	note?: string | null;
}

/** One breakdown card: a dimension (by bot, by person...) and its rows. */
export interface AiUsageBreakdown {
	id: string;
	title: string;
	rows: AiUsageBreakdownRow[];
	/** A qualifier in the card header ("Top 5"), so a capped list never reads as the census. */
	caption?: string | null;
}

/** A tile the host adds after Turns and Tokens (bots on, a limit). */
export interface AiUsageTile {
	label: string;
	value: string;
	meta?: string | null;
}

/** One bot in a rail. `status` is the one state the row carries (on or off). */
export interface BotRailItem {
	id: string;
	name: string;
	/** The qualifier line under the name (its role). */
	role?: string | null;
	/** Two letters for the avatar; derived from the name when absent. */
	initials?: string | null;
	/** A background class for the avatar (`bg-sky-600`); a neutral one when absent. */
	color?: string | null;
	status?: { on: boolean; label: string } | null;
}

/** One part of a bot's composed context (a config, a skill...). */
export interface BotContextPart {
	kind: string;
	label: string;
	chars: number;
}

/** One saved tenant config, as its read view shows it. */
export interface BotConfigSummary {
	name: string;
	body: string;
	enabled: boolean;
	botIds: readonly string[];
}

/** One person holding a Role, named by the host. */
export interface RoleMemberItem {
	ref: string;
	label: string;
	/** A second line (an email, a technical ref). */
	detail?: string | null;
}
