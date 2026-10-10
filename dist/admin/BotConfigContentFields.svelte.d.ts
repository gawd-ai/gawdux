import type { Snippet } from 'svelte';
type $$ComponentProps = {
    name: string;
    body: string;
    enabled: boolean;
    maxBodyChars?: number;
    maxNameChars?: number;
    disabled?: boolean;
    idPrefix?: string;
    /** Already classified and worded by the host; no error inference. */
    nameError?: string | null;
    namePlaceholder?: string;
    bodyPlaceholder?: string;
    bodyLabel?: string;
    enabledLabel?: string;
    enabledAriaLabel?: string;
    bodyRows?: number;
    bodyClass?: string;
    nameRowClass?: string;
    enabledClass?: string;
    labelClass?: string;
    bodyCounter?: Snippet<[used: number, maximum: number]>;
    bodyHelp?: Snippet;
};
declare const BotConfigContentFields: import("svelte").Component<$$ComponentProps, {}, "body" | "name" | "enabled">;
type BotConfigContentFields = ReturnType<typeof BotConfigContentFields>;
export default BotConfigContentFields;
