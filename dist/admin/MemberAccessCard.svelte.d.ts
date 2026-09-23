import { type MemberAccessCopy, type MemberCapabilityGroup, type MemberRole } from './types';
type $$ComponentProps = {
    roles: MemberRole[];
    /** Roles this member could be added to. */
    candidates?: MemberRole[];
    capabilityGroups?: MemberCapabilityGroup[];
    /** Replaces the capability list, e.g. for a grade that holds everything. */
    capabilityNote?: string | null;
    canEdit?: boolean;
    /** A write is in flight: every control is inert. */
    busy?: boolean;
    roleHref?: (id: number) => string;
    onadd?: (roleId: number) => void;
    onremove?: (roleId: number) => void;
    copy?: Partial<MemberAccessCopy>;
};
declare const MemberAccessCard: import("svelte").Component<$$ComponentProps, {}, "">;
type MemberAccessCard = ReturnType<typeof MemberAccessCard>;
export default MemberAccessCard;
