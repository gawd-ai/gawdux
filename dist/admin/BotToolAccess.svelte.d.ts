import type { BotToolGroup } from './types';
type $$ComponentProps = {
    groups: BotToolGroup[];
    canEdit?: boolean;
    busy?: boolean;
    ontoggle?: (toolId: string, allowed: boolean) => void;
    /** The badge on a tool that changes something rather than reading. */
    changesLabel?: string;
};
declare const BotToolAccess: import("svelte").Component<$$ComponentProps, {}, "">;
type BotToolAccess = ReturnType<typeof BotToolAccess>;
export default BotToolAccess;
