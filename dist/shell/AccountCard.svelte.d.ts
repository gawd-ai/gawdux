import type { Snippet } from 'svelte';
type $$ComponentProps = {
    /** The avatar alone at every width: the header's trail needs the room. */
    compact?: boolean;
    initials: string;
    name: string;
    email?: string;
    /** One chip per role. */
    roleLabels?: string[];
    /** The access the session has ("Member"), the chips' caption. */
    accessLabel?: string;
    /** The word before the access label when there are chips. */
    rolesLabel?: string;
    profileHref: string;
    profileLabel?: string;
    /** POST target of the sign-out form. */
    signOutAction: string;
    signOutLabel?: string;
    /**
     * The theme row in the bar's sheet: the cookie the host's server reads
     * to draw the first paint in the theme. Left out, the sheet has none.
     */
    themeCookieName?: string;
    themeLabel?: string;
    /** The version line: the mark, then `{product} {versionLabel}`. */
    product?: string;
    versionLabel?: string;
    versionTooltip?: string;
    /** The product's mark, in a 20px box before the version. */
    mark?: Snippet;
    /** More rows of the menu, after the theme, in the bar's sheet. */
    extras?: Snippet<[{
        close: () => void;
    }]>;
    /** A reading below the menu, in the bar's sheet. */
    meter?: Snippet;
    /** Prefix of the element ids; the card in the bar adds "-bar". */
    id?: string;
};
/**
 * The account card: UserMenu's other presentation, for a host that opts
 * into it by drawing this in place of UserMenu. The menu's keyboard, pointer
 * and focus behaviour is UserMenu's own (its `presentation`); only the
 * markup differs. UserMenu's default sheet stays as it is for every host
 * that does not.
 *
 * In a header it is a card that names the person and grows downward when
 * opened: the email under the name, Profile and Sign out side by side, the
 * role chips under the access label and a line with the product's mark and
 * version. `compact`, and a screen at or below the compact width, show the
 * avatar alone; the open panel then grows to the left from it. A header
 * that yields its room (ShellHeader) reads the card's full width from its
 * probe (`data-room-full`).
 *
 * In the phone shell's bar (`inShellBar()`) it is the avatar alone, a 44px
 * target, and its body rises above the bar as a sheet, never a modal: the
 * person, the two rows, the theme as a row ("Dark mode", when
 * `themeCookieName` is given: the shell's one theme control at that
 * width), the host's extra rows (`extras`: a switcher's choices), a reading
 * (`meter`), then the roles and the version.
 */
declare const AccountCard: import("svelte").Component<$$ComponentProps, {}, "">;
type AccountCard = ReturnType<typeof AccountCard>;
export default AccountCard;
