import type { Snippet } from 'svelte';
import type { BotContextPart } from './types';
type $$ComponentProps = {
    /** The composed block, exactly as the bot receives it. */
    block: string;
    parts?: BotContextPart[];
    /** The tenant's share of the budget, in characters. */
    maxChars?: number;
    /** A content hash, shown for verification. */
    version?: string | null;
    title?: string;
    /** Where the parts are written. */
    link?: {
        label: string;
        href?: string;
        onclick?: (event: MouseEvent) => void;
    } | null;
    /** A delivery line (pulled, lagging, never pulled) from the host. */
    status?: Snippet;
    emptyText?: string;
};
declare const BotContextCard: import("svelte").Component<$$ComponentProps, {}, "">;
type BotContextCard = ReturnType<typeof BotContextCard>;
export default BotContextCard;
