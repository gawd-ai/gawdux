<!--
	@component
	A command that opens the item in another place of the app (its history,
	its records, where it is written). Its caption is the place alone, beside
	the place's icon; its accessible name says what it does and holds the
	caption: "Open in History".
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import { Button } from 'flowbite-svelte';

	let {
		place,
		href,
		icon: Icon,
		size = 'sm',
		label,
		hook
	}: {
		/** The place it opens, its caption. */
		place: string;
		href: string;
		icon: Component<{ class?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
		size?: 'xs' | 'sm';
		/** The accessible name; "Open in {place}" by default. It holds the caption. */
		label?: string;
		/** The data attribute a test or a runner finds it by. */
		hook?: `data-${string}`;
	} = $props();
</script>

<Button
	outline
	{size}
	color="blue"
	{href}
	aria-label={label ?? `Open in ${place}`}
	data-place-door
	{...hook ? { [hook]: '' } : {}}
>
	<Icon class="mr-1.5 h-4 w-4" aria-hidden="true" />{place}
</Button>
