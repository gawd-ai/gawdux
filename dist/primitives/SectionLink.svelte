<!-- The go-to-section affordance: one arrow icon, no words, at the top right
     of the thing it leads from (a card header, a stat tile's label row).
     The destination is the accessible name and the tooltip, so the label
     names where it goes ("Open Network"), not what it is. Renders a link
     with `href`, a button with `onclick`. -->
<script lang="ts">
	import { ArrowRightOutline } from 'flowbite-svelte-icons';

	let {
		label,
		href,
		onclick,
		className = ''
	}: {
		/** Where it goes, for the screen reader and the tooltip. */
		label: string;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		className?: string;
	} = $props();

	const classes = $derived(
		[
			'section-link inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md',
			'text-gray-400 transition-colors hover:bg-gray-100 hover:text-blue-600',
			'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
			'dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-blue-400',
			className
		]
			.filter(Boolean)
			.join(' ')
	);
</script>

{#if href}
	<a class={classes} {href} aria-label={label} title={label} data-section-link
		><ArrowRightOutline class="h-3.5 w-3.5" aria-hidden="true" /></a
	>
{:else if onclick}
	<button type="button" class={classes} {onclick} aria-label={label} title={label} data-section-link
		><ArrowRightOutline class="h-3.5 w-3.5" aria-hidden="true" /></button
	>
{/if}
