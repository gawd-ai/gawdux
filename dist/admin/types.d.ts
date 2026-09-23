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
