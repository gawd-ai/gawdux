import type { BotConfigSummary, BotOption } from './types';
type $$ComponentProps = {
    config: BotConfigSummary;
    bots: BotOption[];
    /** The body's budget, shown beside its length when given. */
    maxBodyChars?: number;
};
declare const BotConfigView: import("svelte").Component<$$ComponentProps, {}, "">;
type BotConfigView = ReturnType<typeof BotConfigView>;
export default BotConfigView;
