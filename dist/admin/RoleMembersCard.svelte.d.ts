import type { RoleMemberItem } from './types';
type $$ComponentProps = {
    roleName: string;
    members: RoleMemberItem[];
    /** People who may be added (members of the tenant not holding it). */
    candidates?: RoleMemberItem[];
    editable?: boolean;
    busy?: boolean;
    onremove?: (member: RoleMemberItem) => void;
    onadd?: (ref: string) => void;
    title?: string;
    emptyText?: string;
    addPlaceholder?: string;
    addLabel?: string;
};
declare const RoleMembersCard: import("svelte").Component<$$ComponentProps, {}, "">;
type RoleMembersCard = ReturnType<typeof RoleMembersCard>;
export default RoleMembersCard;
