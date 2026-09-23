import type { BotConfigDraft, BotOption } from './types';
type $$ComponentProps = {
    draft: BotConfigDraft;
    bots: BotOption[];
    maxBodyChars?: number;
    maxNameChars?: number;
    disabled?: boolean;
    idPrefix?: string;
};
declare const BotConfigFields: import("svelte").Component<$$ComponentProps, {}, "draft">;
type BotConfigFields = ReturnType<typeof BotConfigFields>;
export default BotConfigFields;
