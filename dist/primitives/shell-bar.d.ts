/**
 * The phone shell's one bar along the bottom of the screen (ShellBar). At or
 * below the shell's compact width the controls a desktop header carries at
 * its end (the notices, the theme, the account) leave the top and sit in it,
 * after an occupant's own controls (a chat rail), so a phone has one bar, never
 * two stacked. Menus and panels open upward out of it (`.gawdux-shell-bar-sheet`).
 */
/** The width at or below which the bar shows. */
export declare const SHELL_BAR_QUERY = "(max-width: 1024px)";
/**
 * The room a host leaves under its page while the bar shows: the bar's height
 * and the safe-area inset below it, defined on the document root by the
 * Gawdux stylesheet (tokens.css).
 */
export declare const SHELL_BAR_SPACE_VAR = "--gawdux-shell-bar-space";
/** Set by ShellBar for what it holds. */
export declare const SHELL_BAR_CONTEXT: unique symbol;
/**
 * Whether the calling component sits in a ShellBar, read at its
 * initialisation: a menu there opens upward, as a sheet above the bar.
 */
export declare function inShellBar(): boolean;
