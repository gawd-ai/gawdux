import type { SecurityActivityEvent, SecurityActivityHeadIcons } from './types';
type $$ComponentProps = {
    events: SecurityActivityEvent[];
    title?: string;
    emptyText?: string;
    formatTime?: (iso: string) => string;
    /** A column icon before a header's word, per header; none by default. */
    headIcons?: SecurityActivityHeadIcons;
};
declare const SecurityActivityList: import("svelte").Component<$$ComponentProps, {}, "">;
type SecurityActivityList = ReturnType<typeof SecurityActivityList>;
export default SecurityActivityList;
