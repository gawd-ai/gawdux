type $$ComponentProps = {
    /** The cookie the host's server reads to draw the first paint in the theme. */
    cookieName: string;
    /** The row's label; the switch carries the state. */
    label?: string | undefined;
    class?: string;
};
/**
 * The account menu's theme row: one control that turns the dark theme on and
 * off, its label and its state read together. It is a menu row
 * (`role="menuitemcheckbox"`, `tabindex="-1"`, the class
 * `gawdux-user-menu-item`), so the menu's arrows reach it and it takes the
 * menu's row style; its state is `aria-checked` and the house switch drawn
 * at the row's end, on while the theme is dark. Choosing it turns the theme
 * over and leaves the menu open, the switch showing the new state.
 *
 * The theme is set and kept as DarkModeToggle keeps it (`setColorTheme`:
 * the `dark` class, storage and the host's cookie), and the row follows a
 * flip made anywhere else while it shows (`watchColorTheme`).
 *
 * UserMenu draws it from its `theme` prop; a host drawing its own menu
 * (`presentation`) places it inside the element that carries the menu role.
 */
declare const UserMenuThemeRow: import("svelte").Component<$$ComponentProps, {}, "">;
type UserMenuThemeRow = ReturnType<typeof UserMenuThemeRow>;
export default UserMenuThemeRow;
