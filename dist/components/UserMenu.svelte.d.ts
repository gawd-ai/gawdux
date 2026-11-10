import type { UserMenuProps } from '../types/user-menu.types';
/**
 * The account menu of an app shell's top bar. Closed, it is a card showing who
 * is signed in: an avatar, the name and the email on two lines, a chevron.
 * Open, the same card grows downward over the page to show the tenant and the
 * access chips, the account's rows, sign-out and the product's version.
 *
 * Geometry. The root is its own spacer, 44px tall, as wide as the trigger's
 * content between `--gawdux-user-menu-min-width` and `--gawdux-user-menu-width`,
 * so the toolbar never reflows and the card holds no dead space. The open body
 * never widens the card (`contain: inline-size`): a long tenant truncates. The
 * trigger is identical open and closed (same colours, same boxes), so opening
 * never moves or recolours the avatar or the text; the card lifts (border,
 * shadow, the raised menu surface) on hover and while open. Below
 * `compactBelow` the closed card is the avatar alone; open, the panel grows to
 * the left from the avatar, which stays where it was (the trigger row is
 * mirrored), and never past the 16px gutter on the left. `compact` gives the
 * same avatar at every width, for a header whose trail needs the room
 * (`createRoomYield`), which reads the menu's full width from an invisible
 * probe (`data-room-full`) laid out at full size whatever the menu shows. The
 * closed card names the person in its tooltip at every size.
 *
 * In a ShellBar (`inShellBar()`, the phone shell's bar along the bottom of
 * the screen) the closed card is the avatar alone and the open body rises
 * above the bar as its sheet (`.gawdux-shell-bar-sheet`), never a modal.
 *
 * The theme. `theme` adds the theme row after the rows (UserMenuThemeRow):
 * the dark theme's switch with its label, a `menuitemcheckbox` the arrows
 * reach, which turns the theme over and leaves the menu open. A host passes
 * it where the menu is the theme's one control (the phone shell's bar, where
 * the toggle a header carries beside the menu has no room).
 *
 * Keyboard: the WAI-ARIA menu button pattern. Enter, Space or ArrowDown on the
 * trigger opens and focuses the first row, ArrowUp the last; in the menu the
 * arrows wrap, Home and End jump, Escape closes and returns focus to the
 * trigger, Tab closes and lets focus move on. Pointer: click toggles, the row
 * under the pointer takes the focus (one highlighted row, never two), an
 * outside press closes, leaving the card closes after a short grace when the
 * pointer opened it. The menu also closes when the focus leaves it and on a
 * history navigation (popstate).
 *
 * Styling is scoped CSS over the --gawdux-* tokens, never Tailwind utilities,
 * so a host whose Tailwind does not scan this package still renders it styled.
 */
declare const UserMenu: import("svelte").Component<UserMenuProps, {}, "open">;
type UserMenu = ReturnType<typeof UserMenu>;
export default UserMenu;
