<script lang="ts">
	import type { Component } from 'svelte';
	import { Breadcrumb, BreadcrumbItem } from 'flowbite-svelte';
	type Crumb = { label: string; href?: string; icon?: Component };
	export let items: Crumb[] = [];
	export let className: string = 'h-12';

	/* A label a consumer has ellipsized shows its full text on hover; a label
	   that fits shows nothing. Re-checked as the label's box changes size. */
	function hintWhenTruncated(node: HTMLElement, label: string) {
		let current = label;
		const update = () => {
			node.title = node.scrollWidth > node.clientWidth ? current : '';
		};
		update();
		const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
		observer?.observe(node);
		return {
			update(next: string) {
				current = next;
				update();
			},
			destroy() {
				observer?.disconnect();
			}
		};
	}
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
			<!-- The label is its own element so a consumer can keep the trail on
			     one line and ellipsize a long name without clipping whatever
			     follows it (a status chip). -->
			<span class="breadcrumb-label" use:hintWhenTruncated={item.label}>{item.label}</span>
			{#if i === items.length - 1}
				<!-- Lift slot content (status badges, etc.) so they read as visually
				     centered with the larger breadcrumb text/icons instead of sitting
				     on the text baseline. -->
				<span class="breadcrumb-after-last inline-flex -translate-y-[3px] items-center">
					<slot name="afterLast" />
				</span>
			{/if}
		</BreadcrumbItem>
	{/each}
</Breadcrumb>
