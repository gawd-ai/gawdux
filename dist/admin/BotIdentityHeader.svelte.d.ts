import type { Snippet } from 'svelte';
import type { BotRailItem } from './types';
type $$ComponentProps = {
    bot: BotRailItem;
    /** What it does, in one line. */
    tagline?: string | null;
    /** Extra pills or a version after the state pill. */
    meta?: Snippet;
};
declare const BotIdentityHeader: import("svelte").Component<$$ComponentProps, {}, "">;
type BotIdentityHeader = ReturnType<typeof BotIdentityHeader>;
export default BotIdentityHeader;
