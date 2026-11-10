<!--
	@component
	The account menu's theme row: one control that turns the dark theme on and
	off, its label and its state read together. It is a menu row
	(`role="menuitemcheckbox"`, `tabindex="-1"`, the class
	`gawdux-user-menu-item`), so the menu's arrows reach it and it takes the
	menu's row style; its state is `aria-checked` and the house switch drawn
	at the row's end, on while the theme is dark. Choosing it turns the theme
	over and leaves the menu open, the switch showing the new state.

	The theme is set and kept as DarkModeToggle keeps it (`setColorTheme`:
	the `dark` class, storage and the host's cookie), and the row follows a
	flip made anywhere else while it shows (`watchColorTheme`).

	UserMenu draws it from its `theme` prop; a host drawing its own menu
	(`presentation`) places it inside the element that carries the menu role.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { setColorTheme, watchColorTheme, isDarkTheme } from '../utils/color-theme';

	let {
		cookieName,
		label = 'Dark mode',
		class: className = ''
	}: {
		/** The cookie the host's server reads to draw the first paint in the theme. */
		cookieName: string;
		/** The row's label; the switch carries the state. */
		label?: string | undefined;
		class?: string;
	} = $props();

	let dark = $state(false);

	onMount(() => {
		dark = isDarkTheme();
		return watchColorTheme(cookieName, (next) => (dark = next));
	});

	function turn() {
		dark = !dark;
		setColorTheme(dark, cookieName);
	}
</script>

<button
	type="button"
	class="gawdux-user-menu-item gawdux-user-menu-theme-row {className}"
	role="menuitemcheckbox"
	aria-checked={dark}
	tabindex="-1"
	data-theme-row
	onclick={turn}
>
	<span class="gawdux-user-menu-icon" aria-hidden="true">
		<svg viewBox="0 0 20 20" fill="currentColor">
			<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
		</svg>
	</span>
	<span class="gawdux-user-menu-label">{label}</span>
	<span class="switch" class:on={dark} aria-hidden="true"><span class="knob"></span></span>
</button>

<style>
	.gawdux-user-menu-theme-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
	}

	.gawdux-user-menu-theme-row .gawdux-user-menu-icon {
		display: inline-flex;
		flex: 0 0 auto;
		width: 1rem;
		height: 1rem;
	}
	.gawdux-user-menu-theme-row .gawdux-user-menu-icon svg {
		width: 100%;
		height: 100%;
	}

	.gawdux-user-menu-theme-row .gawdux-user-menu-label {
		flex: 1 1 auto;
		min-width: 0;
		text-align: left;
	}

	/* The house switch, at its small size: a 36 by 20 track, a 16px knob. */
	.switch {
		position: relative;
		flex: 0 0 auto;
		box-sizing: border-box;
		width: 2.25rem;
		height: 1.25rem;
		border-radius: 9999px;
		background-color: var(--color-gray-200, rgb(229 231 235));
		transition: background-color 150ms ease-out;
	}
	:global(.dark) .switch {
		background-color: var(--color-gray-700, rgb(55 65 81));
	}
	.switch.on,
	:global(.dark) .switch.on {
		background-color: var(--color-blue-600, rgb(37 99 235));
	}
	.knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 1rem;
		height: 1rem;
		border-radius: 9999px;
		background-color: #fff;
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
		transition: transform 150ms ease-out;
	}
	.switch.on .knob {
		transform: translateX(1rem);
	}
	@media (prefers-reduced-motion: reduce) {
		.switch,
		.knob {
			transition: none;
		}
	}
</style>
