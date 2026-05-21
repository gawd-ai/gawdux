<script lang="ts">
	import type { Component } from 'svelte';
	export let icon: Component;
	export let label: string;
	export let className = '';
</script>

<div class="flex items-center gap-2 {className}">
	<span class="inline-flex items-center justify-center w-5 h-5">
		<svelte:component this={icon} size="lg" />
	</span>
	<span>{label}</span>
</div>
