import type { SecurityActivityEvent } from './types';
type $$ComponentProps = {
    events: SecurityActivityEvent[];
    title?: string;
    emptyText?: string;
    formatTime?: (iso: string) => string;
};
declare const SecurityActivityList: import("svelte").Component<$$ComponentProps, {}, "">;
type SecurityActivityList = ReturnType<typeof SecurityActivityList>;
export default SecurityActivityList;
