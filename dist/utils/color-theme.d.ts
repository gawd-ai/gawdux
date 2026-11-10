/**
 * The colour theme: the `dark` class on <html>, which every themed rule reads.
 * One place sets it, for every control that changes it (DarkModeToggle, the
 * account menu's theme row), so each persists it the same way:
 * `localStorage['color-theme']` (the Flowbite key) and a cookie under the
 * name the host passes, path `/`, one year, which the host's server reads to
 * draw the first paint in the right theme.
 *
 * The first paint's class is the host's to resolve (an inline script reading
 * cookie, then storage, then the system preference); these functions only
 * change and follow it.
 */
/** The storage key the theme is kept under (Flowbite's). */
export declare const COLOR_THEME_STORAGE_KEY = "color-theme";
/** Whether the document is in its dark theme now. */
export declare function isDarkTheme(): boolean;
/** Sets the theme and keeps it, in storage and in the host's cookie. */
export declare function setColorTheme(dark: boolean, cookieName: string): void;
/** Turns the theme over and keeps it; returns whether it is now dark. */
export declare function toggleColorTheme(cookieName: string): boolean;
/**
 * Follows the theme while a control shows it: the cookie is written once now
 * and again on every flip, wherever it came from (another control, devtools,
 * an inline script), so the server's first paint matches; `onchange` hears
 * each flip. Returns the stop.
 */
export declare function watchColorTheme(cookieName: string, onchange?: (dark: boolean) => void): () => void;
