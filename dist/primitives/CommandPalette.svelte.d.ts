export interface CommandPaletteItem {
    label: string;
    hint?: string;
    href: string;
    /** Optional 24×24 outline SVG path drawn beside the label; falls back
     * to a generic page icon. */
    iconPath?: string;
}
type $$ComponentProps = {
    open?: boolean;
    items?: readonly CommandPaletteItem[];
    search?: (query: string) => Promise<readonly CommandPaletteItem[]>;
    placeholder?: string;
    label?: string;
    globalShortcut?: boolean;
    maxResults?: number;
    searchDebounceMs?: number;
    minSearchLength?: number;
    onnavigate?: (item: CommandPaletteItem) => void;
};
declare const CommandPalette: import("svelte").Component<$$ComponentProps, {}, "open">;
type CommandPalette = ReturnType<typeof CommandPalette>;
export default CommandPalette;
