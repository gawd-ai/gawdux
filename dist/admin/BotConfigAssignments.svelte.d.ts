import type { Snippet } from 'svelte';
import type { BotOption } from './types';
type $$ComponentProps = {
    botIds: string[];
    bots: BotOption[];
    disabled?: boolean;
    class?: string;
    optionClass?: string;
    optionLabel?: Snippet<[bot: BotOption]>;
};
declare const BotConfigAssignments: import("svelte").Component<$$ComponentProps, {}, "botIds">;
type BotConfigAssignments = ReturnType<typeof BotConfigAssignments>;
export default BotConfigAssignments;
