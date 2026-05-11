<script lang="ts">
	/**
	 * Sun/moon toggle that flips the `dark` class on <html>.
	 *
	 * Persistence: writes `localStorage['color-theme']` (the de-facto
	 * Flowbite key) AND a cookie under whatever name the consumer
	 * passes via `cookieName`. The cookie path is hardcoded to `/` and
	 * lifetime to one year.
	 *
	 * On mount the component installs a MutationObserver on the
	 * <html> element that mirrors any `dark` class flip back to the
	 * cookie. This means flips originating from devtools, an inline
	 * script, another tab, or any third-party toggle stay in sync
	 * with the SSR cookie — there's no wrong-color flash on next
	 * reload. Without the observer, only clicks on this button would
	 * persist.
	 *
	 * The initial dark class must still be resolved by the consumer's
	 * app shell (typically an inline script in the HTML template that
	 * reads cookie → localStorage → OS preference) to avoid a flash
	 * on first hydration.
	 *
	 * The consumer's server-side cookie reader (e.g. SvelteKit
	 * +layout.server.ts) is responsible for reading the same
	 * `cookieName` to inject the right class on first paint.
	 */
	import { onMount } from 'svelte';
	export let cookieName: string;
	export let ariaLabel = 'Toggle dark mode';

	let className = '';
	export { className as class };

	function writeCookie(isDark: boolean) {
		try {
			document.cookie = `${cookieName}=${isDark ? 'dark' : 'light'}; path=/; max-age=${365 * 86400}; SameSite=Lax`;
		} catch {
			// Cookies disabled — non-fatal.
		}
	}

	function toggleTheme() {
		const html = document.documentElement;
		const isDark = html.classList.toggle('dark');
		try {
			localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
		} catch {
			// localStorage disabled — non-fatal.
		}
		writeCookie(isDark);
	}

	onMount(() => {
		const html = document.documentElement;
		const sync = () => writeCookie(html.classList.contains('dark'));
		// Sync once on mount in case the inline script in app.html didn't
		// run (JS-disabled fallback) or another tab changed the class
		// since last visit.
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(html, { attributes: true, attributeFilter: ['class'] });
		return () => observer.disconnect();
	});
</script>

<button
	type="button"
	on:click={toggleTheme}
	aria-label={ariaLabel}
	class="inline-flex h-10 w-10 items-center justify-center text-gray-500 dark:text-gray-400 focus:outline-none rounded-lg text-sm {className}"
>
	<!-- Sun (visible in dark mode, indicating "click to go light") -->
	<span class="hidden dark:block">
		<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
				fill-rule="evenodd"
				clip-rule="evenodd"
			/>
		</svg>
	</span>
	<!-- Moon (visible in light mode, indicating "click to go dark") -->
	<span class="block dark:hidden">
		<svg
			class="w-5 h-5 translate-x-0.5"
			fill="currentColor"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
		</svg>
	</span>
</button>
