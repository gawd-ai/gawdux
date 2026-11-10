<script lang="ts">
	/**
	 * Sun/moon toggle that flips the `dark` class on <html>.
	 *
	 * The theme is set and kept by `setColorTheme` (utils/color-theme), the
	 * one place every theme control goes through: `localStorage['color-theme']`
	 * (the de-facto Flowbite key) and a cookie under whatever name the
	 * consumer passes via `cookieName`, path `/`, one year.
	 *
	 * While mounted it follows the `dark` class (`watchColorTheme`), so a flip
	 * from devtools, an inline script, another tab or another control writes
	 * the cookie too and the SSR theme matches on the next reload.
	 *
	 * The initial dark class must still be resolved by the consumer's app
	 * shell (typically an inline script in the HTML template that reads
	 * cookie, then localStorage, then the OS preference) to avoid a flash on
	 * first hydration, and its server reads the same `cookieName` to inject
	 * the right class on first paint.
	 */
	import { onMount } from 'svelte';
	import { toggleColorTheme, watchColorTheme } from '../utils/color-theme';
	export let cookieName: string;
	export let ariaLabel = 'Toggle dark mode';

	let className = '';
	export { className as class };

	function toggleTheme() {
		toggleColorTheme(cookieName);
	}

	onMount(() => watchColorTheme(cookieName));
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
