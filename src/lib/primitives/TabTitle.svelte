<script lang="ts">
	import type { Component } from 'svelte';

	/**
	 * Optional. A tab set that carries no icons is a legitimate design, and
	 * reserving the 20×20 box for one anyway pushes every label out by
	 * `w-5` plus the flex gap — a visible indent around nothing. Rendering the
	 * wrapper only when there is something to put in it lets an icon-less tab
	 * set sit flush, while a mixed set still aligns its labels, because every
	 * icon that does exist occupies the same fixed box.
	 */
	export let icon: Component | null = null;
	export let label: string;
	export let className = '';
</script>

<div class="flex items-center gap-2 {className}">
	{#if icon}
		<span class="inline-flex items-center justify-center w-5 h-5">
			<svelte:component this={icon} size="lg" />
		</span>
	{/if}
	<span>{label}</span>
</div>
