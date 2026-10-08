import type { BotRailItem as Item } from './types';
/** Two letters from the name when the host gives none. */
export declare function botInitials(bot: Pick<Item, 'name' | 'initials'>): string;
import type { BotRailItem } from './types';
type $$ComponentProps = {
    bots?: BotRailItem[];
    /** Lanes, drawn with a rule between them; overrides `bots`. */
    groups?: BotRailItem[][];
    selected?: string | null;
    onselect: (id: string) => void;
    /** A search field in the rail (worth it past a handful of bots). */
    search?: boolean;
    disabled?: boolean;
    emptyText?: string;
};
declare const BotRail: import("svelte").Component<$$ComponentProps, {}, "">;
type BotRail = ReturnType<typeof BotRail>;
export default BotRail;
