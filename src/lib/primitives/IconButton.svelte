<!-- An action with an icon and no words, for a place where a labelled button
     would shout (a row detail's Remove, a card's quiet edit). The label is the
     accessible name and the tooltip. `danger` stays grey at rest and turns red
     only on hover and focus: the colour warns at the moment of intent, not on
     every row. The action itself still confirms where the product confirms. -->
<script lang="ts">
	import type { Component } from 'svelte';

	let {
		icon: Icon,
		label,
		onclick,
		tone = 'neutral',
		disabled = false,
		className = ''
	}: {
		icon: Component;
		/** What it does ("Remove Camera 3"), for the screen reader and the tooltip. */
		label: string;
		onclick?: (event: MouseEvent) => void;
		tone?: 'neutral' | 'danger';
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
			'icon-button inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors',
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
	><Icon class="h-4 w-4" aria-hidden="true" /></button
>
