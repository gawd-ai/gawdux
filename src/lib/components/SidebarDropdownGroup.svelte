<script lang="ts">
	import { onMount } from 'svelte';
	import { SidebarDropdownWrapper, SidebarDropdownItem } from 'flowbite-svelte';
	import type { SidebarMenuGroup } from '../types/sidebar.types';

	interface Props {
		group: SidebarMenuGroup;
		expanded: boolean;
		isOpen: boolean;
		flyoutActive: boolean;
		onMouseEnter?: (event: MouseEvent) => void;
		onMouseLeave?: () => void;
	}

	let {
		group,
		expanded,
		isOpen = $bindable(false),
		flyoutActive = false,
		onMouseEnter,
		onMouseLeave
	}: Props = $props();

	let wrapperEl: HTMLDivElement;

	// Remove tabindex from all links to prevent keyboard focus
	onMount(() => {
		const links = wrapperEl?.querySelectorAll('a');
		links?.forEach(link => link.setAttribute('tabindex', '-1'));
	});

	// Sort items by order
	let sortedItems = $derived(
		[...group.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);

	// Prevent dropdown toggle when sidebar is collapsed - use capture phase
	function handleClickCapture(e: MouseEvent) {
		if (!expanded) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
		}
	}

	function handleMouseEnter(e: MouseEvent) {
		if (!expanded) {
			onMouseEnter?.(e);
		}
	}

	function handleMouseLeave() {
		if (!expanded) {
			onMouseLeave?.();
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={wrapperEl}
	class="dropdown-wrapper"
	class:collapsed={!expanded}
	class:flyout-active={flyoutActive}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onclickcapture={handleClickCapture}
>
	<SidebarDropdownWrapper label={group.label} bind:isOpen>
		<svelte:fragment slot="icon">
			<svelte:component this={group.icon} class="w-8 h-8" />
		</svelte:fragment>
		{#each sortedItems as item}
			<SidebarDropdownItem href={item.href} label={item.label} />
		{/each}
	</SidebarDropdownWrapper>
</div>

<style>
	/* Dropdown wrapper - fade labels when collapsed */
	.dropdown-wrapper :global(span) {
		transition: opacity 0.2s ease-in-out;
	}

	.dropdown-wrapper.collapsed :global(button > span) {
		opacity: 0;
	}

	/* Force consistent button height for all dropdowns */
	.dropdown-wrapper :global(button) {
		height: 44px;
		transition: background-color 0ms;
	}

	/* Highlight icon background when flyout is active */
	.dropdown-wrapper.flyout-active :global(button) {
		background-color: rgb(243 244 246);
		transition: background-color 200ms ease-out;
	}

	:global(.dark) .dropdown-wrapper.flyout-active :global(button) {
		background-color: rgb(55 65 81);
	}

	/* Remove all focus styling from dropdown items */
	.dropdown-wrapper :global(a),
	.dropdown-wrapper :global(a:focus),
	.dropdown-wrapper :global(a:focus-visible),
	.dropdown-wrapper :global(a:focus-within) {
		outline: none !important;
		box-shadow: none !important;
		--tw-ring-offset-shadow: 0 0 #0000 !important;
		--tw-ring-shadow: 0 0 #0000 !important;
		background-color: transparent;
	}
	.dropdown-wrapper :global(a:hover) {
		background-color: rgb(243 244 246);
	}
	:global(.dark) .dropdown-wrapper :global(a:hover) {
		background-color: rgb(55 65 81);
	}
</style>
