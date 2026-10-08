import type { UserMenuProps } from '../types/user-menu.types';
/**
 * The account menu of an app shell's top bar. Closed, it is a card showing who
 * is signed in: an avatar, the name and the email on two lines, a chevron.
 * Open, the same card grows downward over the page to show the tenant and the
 * access chips, the account's rows, sign-out and the product's version.
 *
 * Geometry. The root is its own spacer, 272 by 44 (`--gawdux-user-menu-width`),
 * so the toolbar never reflows and the card sits on an integer offset in a
 * 56px bar. The panel is absolutely positioned and takes its natural height
 * (a 0fr to 1fr grid row, no guessed max-height). Nothing in the trigger
 * depends on the open state, so opening never moves the avatar or the text.
 * Every row shares one left grid: a 28px leading column (avatar, row icons,
 * tenant icon, product mark) and a text column after it.
 *
 * Keyboard: the WAI-ARIA menu button pattern. Enter, Space or ArrowDown on the
 * trigger opens and focuses the first row, ArrowUp the last; in the menu the
 * arrows wrap, Home and End jump, Escape closes and returns focus to the
 * trigger, Tab closes and lets focus move on. Pointer: click toggles, an
 * outside press closes, leaving the card closes after a short grace when it
 * was opened by the pointer and the focus is not in its rows.
 *
 * Styling is scoped CSS over the --gawdux-* tokens, never Tailwind utilities,
 * so a host whose Tailwind does not scan this package still renders it styled.
 */
declare const UserMenu: import("svelte").Component<UserMenuProps, {}, "open">;
type UserMenu = ReturnType<typeof UserMenu>;
export default UserMenu;
