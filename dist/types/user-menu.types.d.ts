import type { Component, Snippet } from 'svelte';
import type { Action } from 'svelte/action';
/**
 * One row of the account menu: a link with `href`, a button with `onclick`.
 * A row with both is a link whose handler runs before the navigation.
 */
export interface UserMenuItem {
    label: string;
    href?: string;
    onclick?: (event: MouseEvent) => void;
    /** A 16px icon in the row's leading column. */
    icon?: Component;
    /** Stable key for the row; defaults to the label. */
    id?: string;
}
export interface UserMenuProps {
    /** The signed-in person's name: the trigger's first line. */
    name: string;
    /** The trigger's second line, shown open and closed; left out when it repeats `name`. */
    email?: string;
    /** Overrides the initials derived from `name` (first and last word). */
    initials?: string;
    /** A 28px image in place of the initials; the initials return if it fails to load. */
    avatarSrc?: string;
    /**
     * The tenant this session acts in: the open menu's first line, on the text
     * column with the access chips after it, never the trigger. It describes
     * the menu (`aria-describedby`), so a person who opens into the rows hears it.
     */
    tenant?: string;
    /** Chips right after the tenant: a grade, or one per role. */
    access?: string[];
    /** A caption before the chips ("Roles"), for a host whose chips need naming. */
    accessLabel?: string;
    /** The menu's rows, in order, above sign-out. */
    items?: UserMenuItem[];
    /**
     * Rows the data shape cannot express, rendered after `items`. Each row must
     * carry `role="menuitem"`, `tabindex="-1"` and the class
     * `gawdux-user-menu-item` (a `gawdux-user-menu-icon` span holds its icon) so
     * the arrow keys reach it and it takes the menu's row style.
     */
    extraItems?: Snippet<[{
        close: () => void;
    }]>;
    /** POST target of the sign-out form. */
    signOutAction?: string;
    /** Applied to the sign-out form, for a host's progressive enhancement. */
    signOutEnhance?: Action<HTMLFormElement>;
    /** Sign-out as a handler, when the host has no form action. */
    onsignout?: (event: MouseEvent) => void;
    signOutLabel?: string;
    /** Footer text: `{product} {version}`. */
    product?: string;
    /** Shown verbatim after `product`, in tabular figures. */
    version?: string;
    /** The footer's tooltip (a build sha, a build time). */
    versionTitle?: string;
    /** The product mark, drawn in a 16px box in the footer's leading column. */
    mark?: Snippet;
    /** Replaces the footer's content inside the same 32px row. */
    footer?: Snippet;
    /** The trigger's accessible name; defaults to "Account menu for {name}". */
    label?: string;
    /**
     * Below this viewport width the closed menu is the avatar alone (44 by 44);
     * open, the panel grows to the left and the avatar stays put. 0 never.
     */
    compactBelow?: 0 | 768 | 1024;
    /** Prefix of the element ids (trigger, body, context, menu); unique per page. */
    id?: string;
    /**
     * Bindable. A host closes the menu on its own navigations by binding this
     * (`bind:open`) and setting it false; the menu closes itself on popstate.
     */
    open?: boolean;
    onopenchange?: (open: boolean) => void;
}
