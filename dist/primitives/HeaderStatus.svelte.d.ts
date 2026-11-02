import { type StatusBadgeColor } from './StatusBadge.svelte';
type $$ComponentProps = {
    color: StatusBadgeColor;
    label: string;
    /** Why the viewer cannot edit. Set, the lock shows with it as its
        tooltip; empty or absent, no lock. */
    lockReason?: string | null | undefined;
    /** Extra chip classes, merged over the header density. */
    className?: string;
};
declare const HeaderStatus: import("svelte").Component<$$ComponentProps, {}, "">;
type HeaderStatus = ReturnType<typeof HeaderStatus>;
export default HeaderStatus;
