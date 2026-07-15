<script lang="ts">
	import { onMount } from 'svelte';
	import { SidebarDropdownWrapper, SidebarDropdownItem } from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';
	import type { SidebarMenuGroup } from '../types/sidebar.types';

	interface Props {
		group: SidebarMenuGroup;
		expanded: boolean;
		isOpen: boolean;
		flyoutActive: boolean;
		activeUrl?: string;
		onCollapsedTriggerClick?: (event: MouseEvent) => void;
		onCollapsedMouseEnter?: (event: MouseEvent) => void;
		onCollapsedMouseLeave?: () => void;
	}

	let {
		group,
		expanded,
		isOpen = $bindable(false),
		flyoutActive = false,
		activeUrl,
		onCollapsedTriggerClick,
		onCollapsedMouseEnter,
		onCollapsedMouseLeave
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

	// True when the active page belongs to this group — drives the
	// `has-active-child` wrapper class so the consuming app can highlight
	// the parent icon/label. Matches either an exact URL OR a path prefix
	// (so detail pages like `/app/equipment/inventory/123` still light up
	// their parent group).
	let hasActiveChild = $derived(
		!!activeUrl &&
			sortedItems.some(
				(item) => item.href === activeUrl || activeUrl.startsWith(item.href + '/')
			)
	);

	// Prevent dropdown toggle when sidebar is collapsed - use capture phase
	function handleClickCapture(e: MouseEvent) {
		if (!expanded) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			onCollapsedTriggerClick?.(e);
		}
	}

	function handleMouseEnter(e: MouseEvent) {
		if (!expanded) {
			onCollapsedMouseEnter?.(e);
		}
	}

	function handleMouseLeave() {
		if (!expanded) {
			onCollapsedMouseLeave?.();
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
	class:open={isOpen}
	class:has-active-child={hasActiveChild}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onclickcapture={handleClickCapture}
>
	<SidebarDropdownWrapper
		label={group.label}
		bind:isOpen
		transitionType="fade"
		transitionParams={{ duration: 120 }}
	>
		<svelte:fragment slot="icon">
			{@const GroupIcon = group.icon}
			<GroupIcon class="w-8 h-8" />
		</svelte:fragment>
		{#each sortedItems as item}
			<SidebarDropdownItem
				href={item.href}
				label={item.label}
				active={!!activeUrl && (item.href === activeUrl || activeUrl.startsWith(item.href + '/'))}
			/>
		{/each}
	</SidebarDropdownWrapper>
	<!-- Persistent chevron — flowbite swaps its built-in chevron between
	     two if-block branches when isOpen toggles, which destroys the DOM
	     element and prevents transform transitions from playing. We
	     suppress flowbite's chevron via CSS and render our own here so the
	     same element stays in the tree and rotates smoothly in both
	     directions. -->
	<ChevronDownOutline class="dropdown-chevron" />
</div>

<style>
	/* Label opacity is owned by the consuming app (which controls the
	   fade timing globally on .app-sidebar). Don't apply our own
	   opacity/transition here — they compete with the consumer's rules
	   and flip on a different class (.dropdown-wrapper.collapsed,
	   driven by the `expanded` prop) than the consumer's selector
	   (.app-sidebar.collapsed), which races and causes some labels to
	   skip the fade. */

	/* Let button height come from its padding + content so root items
	   (links) and dropdown items (buttons) share the exact same metrics —
	   no forced height that would make them differ. */
	.dropdown-wrapper :global(button) {
		box-shadow: none;
	}

	/* Highlight icon background when flyout is active. Square off the
	   right corners so the icon BG flows continuously into the flyout
	   header (which sits flush against the right edge of the icon). */
	.dropdown-wrapper.flyout-active :global(button) {
		background-color: var(--color-gray-100) !important;
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
		transition: background-color 0ms;
	}

	:global(.dark) .dropdown-wrapper.flyout-active :global(button) {
		background-color: var(--color-gray-700) !important;
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
