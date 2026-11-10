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
export const COLOR_THEME_STORAGE_KEY = 'color-theme';

/** Whether the document is in its dark theme now. */
export function isDarkTheme(): boolean {
	return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

function writeCookie(cookieName: string, dark: boolean): void {
	try {
		document.cookie = `${cookieName}=${dark ? 'dark' : 'light'}; path=/; max-age=${365 * 86400}; SameSite=Lax`;
	} catch {
		// Cookies disabled: the theme still changes for this page.
	}
}

/** Sets the theme and keeps it, in storage and in the host's cookie. */
export function setColorTheme(dark: boolean, cookieName: string): void {
	document.documentElement.classList.toggle('dark', dark);
	try {
		localStorage.setItem(COLOR_THEME_STORAGE_KEY, dark ? 'dark' : 'light');
	} catch {
		// Storage disabled: the cookie still carries it.
	}
	writeCookie(cookieName, dark);
}

/** Turns the theme over and keeps it; returns whether it is now dark. */
export function toggleColorTheme(cookieName: string): boolean {
	const dark = !isDarkTheme();
	setColorTheme(dark, cookieName);
	return dark;
}

/**
 * Follows the theme while a control shows it: the cookie is written once now
 * and again on every flip, wherever it came from (another control, devtools,
 * an inline script), so the server's first paint matches; `onchange` hears
 * each flip. Returns the stop.
 */
export function watchColorTheme(
	cookieName: string,
	onchange?: (dark: boolean) => void
): () => void {
	const html = document.documentElement;
	const sync = () => {
		const dark = html.classList.contains('dark');
		writeCookie(cookieName, dark);
		onchange?.(dark);
	};
	sync();
	if (typeof MutationObserver === 'undefined') return () => {};
	const observer = new MutationObserver(sync);
	observer.observe(html, { attributes: true, attributeFilter: ['class'] });
	return () => observer.disconnect();
}
