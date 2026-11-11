<!-- An action with an icon and no words, for a place where a labelled button
     would shout (a row detail's Remove, a card's quiet edit, a pane header's
     close). The label is the accessible name and the tooltip. `danger` stays
     grey at rest and turns red only on hover and focus: the colour warns at
     the moment of intent, not on every row. The action itself still confirms
     where the product confirms. It is the house's one icon button, flat in
     light and dark alike: no border and no shadow at rest, a quiet fill on
     hover. `size="md"` is a header's (32px, a 44px target at or below the
     compact width), its icon the house icon (`--gawdux-icon-size`, 20px,
     tokens.css "The house icon"); a glyph that is no icon (a channel's #)
     is its children, read at the same size. `size="sm"` is a row's, its
     icon the row's 16px. -->
<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		icon: Icon,
		children,
		label,
		onclick,
		tone = 'neutral',
		size = 'sm',
		disabled = false,
		className = ''
	}: {
		/** The icon; or `children` for a glyph that is no icon. */
		icon?: Component;
		children?: Snippet;
		/** What it does ("Remove Camera 3"), for the screen reader and the tooltip. */
		label: string;
		onclick?: (event: MouseEvent) => void;
		tone?: 'neutral' | 'danger';
		/** `sm` (28px) in a row or a card; `md` (32px, 44px at the compact width) in a header. */
		size?: 'sm' | 'md';
		disabled?: boolean;
		className?: string;
	} = $props();

	const TONE = {
		neutral:
			'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
		danger:
			'text-gray-500 hover:bg-red-50 hover:text-red-600 focus-visible:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400'
	} as const;

	const classes = $derived(
		[
			'icon-button inline-flex shrink-0 items-center justify-center rounded-md transition-colors',
			size === 'sm' ? 'h-7 w-7' : '',
			'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
			'disabled:pointer-events-none disabled:opacity-40',
			TONE[tone],
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

<button
	type="button"
	class={classes}
	{onclick}
	{disabled}
	aria-label={label}
	title={label}
	data-tone={tone}
	data-size={size}
	>{#if Icon}<Icon
			class={size === 'md' ? 'gawdux-icon' : 'h-4 w-4'}
			aria-hidden="true"
		/>{:else if children}<span
			class="icon-button-glyph"
			aria-hidden="true">{@render children()}</span
		>{/if}</button
>
