<script lang="ts">
	import type { Component } from 'svelte';

	type CollectionEmptyStateProps = {
		title: string;
		message?: string | undefined;
		icon?: Component | undefined;
		variant?: 'empty' | 'no-results' | undefined;
		actionLabel?: string | undefined;
		actionHref?: string | undefined;
		onaction?: (() => void) | undefined;
		state?: string | undefined;
		className?: string | undefined;
	};

	let {
		title,
		message = '',
		icon: Icon,
		variant = 'empty',
		actionLabel,
		actionHref,
		onaction,
		state = variant,
		className = ''
	}: CollectionEmptyStateProps = $props();

	const isNoResults = $derived(variant === 'no-results');
	const containerClass = $derived(
		isNoResults
			? 'flex min-h-[240px] flex-col items-center justify-center px-6 py-12 text-center text-gray-500 dark:text-gray-400'
			: 'flex min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center text-gray-500 dark:text-gray-400'
	);
	const titleClass = $derived(
		isNoResults
			? 'text-sm font-semibold text-gray-700 dark:text-gray-200'
			: 'mt-4 text-[1.1rem] font-semibold text-gray-700 dark:text-gray-200'
	);
	const actionClass = $derived(
		isNoResults
			? 'mt-3 inline-flex min-h-9 items-center rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'
			: 'mt-5 inline-flex min-h-10 items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800'
	);
</script>

<div
	class={`${containerClass} ${className}`}
	data-collection-state={state}
	role="status"
	aria-live="polite"
	aria-atomic="true"
>
	{#if Icon && !isNoResults}
		<div
			class="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
			aria-hidden="true"
		>
			<Icon class="h-7 w-7 text-gray-400 dark:text-gray-500" />
		</div>
	{/if}

	<h3 class={titleClass}>{title}</h3>
	{#if message}
		<p class="my-2 max-w-md text-sm leading-6">{message}</p>
	{/if}

	{#if actionLabel && actionHref}
		<a class={actionClass} href={actionHref}>{actionLabel}</a>
	{:else if actionLabel && onaction}
		<button type="button" class={actionClass} onclick={onaction}>{actionLabel}</button>
	{/if}
</div>
