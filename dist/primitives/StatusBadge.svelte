<!--
    Presentation-only status badge. Consumers compute the {color, label}
    pair from their own domain status taxonomy and pass it in. This
    keeps gawdux free of any caller's status vocabulary.
-->
<script context="module" lang="ts">
	export type StatusBadgeColor =
		| 'green'
		| 'red'
		| 'dark'
		| 'blue'
		| 'yellow'
		| 'indigo'
		| 'purple';
</script>

<script lang="ts">
	import { Badge } from 'flowbite-svelte';

	export let color: StatusBadgeColor;
	export let label: string;
	export let rounded: boolean = true;

	let className: string = '';
	export { className as class };
</script>

<Badge {color} {rounded} class={className}>
	{label}
</Badge>
