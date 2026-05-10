<script lang="ts">
	import type { Component } from 'svelte';
	import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	type Crumb = { label: string; href?: string; icon?: Component };
	export let items: Crumb[] = [];
	export let className: string = 'h-12';
</script>

<Breadcrumb class={className}>
	{#each items as item, i}
		<BreadcrumbItem
			class="m-0"
			href={item.href ?? ''}
			linkClass="breadcrumb-title"
			spanClass="breadcrumb-title"
		>
			<svelte:fragment slot="icon">
				{#if item.icon}
					<svelte:component
						this={item.icon}
						class={i === 0 ? 'breadcrumb-section-icon' : 'breadcrumb-chevron'}
					/>
				{/if}
			</svelte:fragment>
			{item.label}
			{#if i === items.length - 1}
				<!-- Lift slot content (status badges, etc.) so they read as visually
				     centered with the larger breadcrumb text/icons instead of sitting
				     on the text baseline. -->
				<span class="inline-flex -translate-y-[3px] items-center">
					<slot name="afterLast" />
				</span>
			{/if}
		</BreadcrumbItem>
	{/each}
</Breadcrumb>
