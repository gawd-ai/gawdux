<script lang="ts">
	import { Card } from 'flowbite-svelte';
	export let title: string;
	export let invalid = false;
	export let className = '';
	export let contentClass = '';
</script>

<Card
	class={`max-w-none !p-0 overflow-hidden ${className} ${invalid ? 'card-invalid' : ''}`}
>
	<div
		class={`card-container-header flex items-center justify-between gap-3 px-6 py-3 text-left ${invalid ? 'bg-red-50 dark:bg-red-950/40' : 'bg-gray-50 dark:bg-gray-700'}`}
	>
		<h3
			class={`text-xs font-bold uppercase ${invalid ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'}`}
		>
			{title}
		</h3>
		<!-- Optional right-aligned header content (metadata, hints) -->
		<slot name="header" />
	</div>
	<div class={`card-container-content p-3 px-6 ${contentClass}`}>
		<slot name="content" />
	</div>
</Card>

<style>
	:global(.card-invalid) {
		border-color: rgb(248 113 113) !important;
		box-shadow: 0 0 0 1px rgb(248 113 113 / 0.35) !important;
	}

	:global(.dark .card-invalid) {
		border-color: rgb(185 28 28) !important;
		box-shadow: 0 0 0 1px rgb(185 28 28 / 0.6) !important;
	}

	@media (max-width: 1024px) {
		.card-container-header,
		.card-container-content {
			padding-inline: 1rem;
		}
	}

	@media (max-width: 640px) {
		.card-container-header,
		.card-container-content {
			padding-inline: 0.75rem;
		}
	}
</style>
