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
    system: string;
}
export declare const DEFAULT_MEMBER_ACCESS_COPY: MemberAccessCopy;
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
export type AuditTone = 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'indigo' | 'pink' | 'dark';
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
    module?: {
        label: string;
        tone?: AuditTone;
    } | null;
    action: string;
    actionTone?: AuditTone;
    /** The one-line account of what happened; clamped to two lines in the row. */
    comment: string;
    user: string | null;
    /** What the action was done to, when it is not the user. */
    record?: string | null;
    /** Further labelled facts for the detail (result, impact, request id...). */
    facts?: {
        label: string;
        value: string;
    }[];
    changes: AuditHistoryChange[];
}
