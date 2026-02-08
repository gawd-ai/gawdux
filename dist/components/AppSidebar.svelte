<script lang="ts">
	import { tick, onDestroy, onMount } from 'svelte';
	import {
		Sidebar,
		SidebarWrapper,
		SidebarItem,
		Button,
		Badge
	} from 'flowbite-svelte';
	import {
		ChevronDoubleLeftOutline,
		ChevronDoubleRightOutline,
		AdjustmentsVerticalOutline,
		ChartOutline
	} from 'flowbite-svelte-icons';
	import type { SidebarConfig, SidebarMenuGroup, SidebarContext, AppSidebarProps } from '../types/sidebar.types';
	import { isBrowser, getStorageItem, setStorageItem } from '../utils/browser';
	import SidebarFlyout from './SidebarFlyout.svelte';
	import SidebarDropdownGroup from './SidebarDropdownGroup.svelte';

	let {
		config,
		activeUrl = '',
		class: className = '',
		ontoggle,
		onnavigate,
		header,
		footer,
		toggleBar
	}: AppSidebarProps = $props();

	// Configurable widths with defaults
	const expandedWidth = $derived(config.expandedWidth ?? 256);
	const collapsedWidth = $derived(config.collapsedWidth ?? 72);

	// Track ready state - sidebar hidden until we know correct state
	let ready = $state(false);

	// Start with default, will be updated on mount from localStorage
	// svelte-ignore state_referenced_locally
	const initialOpen = $derived(!(config.defaultCollapsed ?? false));
	// svelte-ignore state_referenced_locally
	let sidebarOpen = $state(initialOpen);

	onMount(() => {
		// Read actual state from localStorage on client
		if (config.storageKey) {
			const stored = getStorageItem(config.storageKey);
			if (stored !== null) {
				sidebarOpen = stored !== 'false';
			}
		}
		// Show sidebar after state is correct
		ready = true;
	});

	// Persist sidebar state to localStorage (SSR-safe)
	$effect(() => {
		if (config.storageKey) {
			setStorageItem(config.storageKey, String(sidebarOpen));
		}
	});

	// Safe groups accessor
	let groups = $derived(config.groups ?? []);

	// Build dropdown keys from groups
	const dropdownKeys = $derived(groups.map((g) => g.id));

	// Initialize dropdown states with defaultOpen support
	// svelte-ignore state_referenced_locally
	const initialDropdownStates = $derived(Object.fromEntries((config.groups ?? []).map((g) => [g.id, g.defaultOpen ?? false])));
	// svelte-ignore state_referenced_locally
	let dropdownStates: Record<string, boolean> = $state(initialDropdownStates);

	// Whether we have any navigation content to render
	let hasNavContent = $derived(groups.length > 0 || (config.rootItems ?? []).length > 0);

	// Context object passed to header/footer snippets
	let sidebarContext: SidebarContext = $derived({
		collapsed: !sidebarOpen,
		collapsedWidth,
		expandedWidth
	});

	// Track which flyout menu is open when sidebar is collapsed
	let activeFlyout: string | null = $state(null);
	let flyoutPosition = $state({ top: 0, left: 0 });
	let flyoutHeaderHeight = $state(44);
	let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

	// Cleanup timeout on destroy
	onDestroy(() => {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
	});

	function showFlyout(groupId: string, event: MouseEvent) {
		if (sidebarOpen) return;
		if (hoverTimeout) clearTimeout(hoverTimeout);
		const wrapper = event.currentTarget as HTMLElement;
		const button = wrapper.querySelector('button');
		const rect = button ? button.getBoundingClientRect() : wrapper.getBoundingClientRect();
		flyoutPosition = {
			top: rect.top,
			left: collapsedWidth
		};
		flyoutHeaderHeight = rect.height;
		activeFlyout = groupId;
	}

	function hideFlyout() {
		hoverTimeout = setTimeout(() => {
			activeFlyout = null;
		}, 50);
	}

	function keepFlyoutOpen() {
		if (hoverTimeout) clearTimeout(hoverTimeout);
	}

	function resetDropdowns() {
		dropdownStates = Object.fromEntries(dropdownKeys.map((key) => [key, false]));
	}

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
		if (!sidebarOpen) {
			resetDropdowns();
			activeFlyout = null;
		}
		ontoggle?.(!sidebarOpen);
	}

	async function toggleAllSubMenus(): Promise<void> {
		await tick();
		const anyOpen = Object.values(dropdownStates).some(Boolean);
		dropdownStates = Object.fromEntries(dropdownKeys.map((key) => [key, !anyOpen]));
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			activeFlyout = null;
		}
	}

	function handleFlyoutItemClick(href: string) {
		activeFlyout = null;
		onnavigate?.(href);
	}

	// Get active flyout group
	let activeFlyoutGroup = $derived(
		activeFlyout ? groups.find((g) => g.id === activeFlyout) : null
	);

	// Sort groups by order
	let sortedGroups = $derived(
		[...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);

	// Sort root items by order
	let sortedRootItems = $derived(
		[...(config.rootItems ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);

	// Show toggle all button (only when groups exist)
	let showToggleAll = $derived((config.showToggleAll ?? true) && groups.length > 0);

	// Custom icons with fallbacks
	let CollapseIcon = $derived(config.collapseIcon ?? ChevronDoubleLeftOutline);
	let ExpandIcon = $derived(config.expandIcon ?? ChevronDoubleRightOutline);
	let ToggleAllIcon = $derived(config.toggleAllIcon ?? AdjustmentsVerticalOutline);

	// Width style
	let widthStyle = $derived(sidebarOpen ? `width: ${expandedWidth}px` : `width: ${collapsedWidth}px`);
</script>

<svelte:window onkeydown={handleKeydown} />

{#if ready}
<aside
	class={`app-sidebar flex flex-col min-h-0 overflow-y-auto overflow-x-hidden border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${!sidebarOpen ? 'overflow-hidden' : ''} ${className}`}
	style={widthStyle}
	role="navigation"
	aria-label="Main navigation"
>
	<div class="flex-1 overflow-y-auto overflow-x-hidden">
		{#if header}
			{@render header(sidebarContext)}
		{/if}

		{#if hasNavContent}
			<Sidebar class="sidebar h-full">
				<SidebarWrapper class="h-full">
					<!-- Root Items (direct links, no dropdown) -->
					{#each sortedRootItems as item}
						{@const isActive = activeUrl ? item.href === activeUrl : false}
						<SidebarItem
							href={item.href}
							label={sidebarOpen ? item.label : ''}
							class={isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}
						>
							<svelte:fragment slot="icon">
								{#if item.icon}
									<Component this={item.icon} class="w-8 h-8" />
								{:else}
									<ChartOutline class="w-8 h-8" />
								{/if}
							</svelte:fragment>
							{#if item.badge && sidebarOpen}
								<Badge color={item.badgeColor ?? 'blue' as any} class="ml-auto">{item.badge}</Badge>
							{/if}
						</SidebarItem>
					{/each}

					<!-- Groups (dropdown menus with flyouts when collapsed) -->
					{#each sortedGroups as group}
						{#if group.items.length > 0}
							<SidebarDropdownGroup
								{group}
								expanded={sidebarOpen}
								bind:isOpen={dropdownStates[group.id]}
								flyoutActive={activeFlyout === group.id}
								onMouseEnter={(e) => showFlyout(group.id, e)}
								onMouseLeave={hideFlyout}
							/>
						{/if}
					{/each}
				</SidebarWrapper>
			</Sidebar>
		{/if}

		{#if footer}
			{@render footer(sidebarContext)}
		{/if}
	</div>

	<!-- Icon Bar: Collapse Sidebar and Toggle All Submenus -->
	{#if toggleBar}
		{@render toggleBar({ collapsed: !sidebarOpen, toggle: toggleSidebar })}
	{:else}
		<div
			class="flex items-center justify-between p-2 border-t bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
		>
			<Button
				onclick={toggleSidebar}
				color="light"
				class="ms-2 p-2"
				aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
			>
				{#if sidebarOpen}
					<Component this={CollapseIcon} class="w-5 h-5 text-gray-500 dark:text-gray-400" />
				{:else}
					<Component this={ExpandIcon} class="w-5 h-5 text-gray-500 dark:text-gray-400" />
				{/if}
			</Button>
			{#if sidebarOpen && showToggleAll}
				<Button
					onclick={toggleAllSubMenus}
					color="light"
					class="p-2"
					aria-label="Toggle all menu groups"
				>
					<Component this={ToggleAllIcon} class="w-5 h-5 text-gray-500 dark:text-gray-400" />
				</Button>
			{/if}
		</div>
	{/if}
</aside>
{/if}

<!-- Flyout menu portal - rendered outside sidebar to avoid overflow clipping -->
{#if ready && activeFlyout && !sidebarOpen && activeFlyoutGroup}
	<SidebarFlyout
		label={activeFlyoutGroup.label}
		items={activeFlyoutGroup.items}
		top={flyoutPosition.top}
		left={flyoutPosition.left}
		headerHeight={flyoutHeaderHeight}
		duration={config.flyoutDuration ?? 200}
		onMouseEnter={keepFlyoutOpen}
		onMouseLeave={hideFlyout}
		onItemClick={handleFlyoutItemClick}
	/>
{/if}

<style>
	:global(.sidebar ul) {
		list-style: none;
		padding-left: 0;
		margin-left: 0;
	}

	/* Ensure smooth width transitions */
	.app-sidebar {
		will-change: width;
		overflow-x: hidden !important;
	}

	/* Hide horizontal scrollbar on inner container too */
	.app-sidebar > div {
		overflow-x: hidden !important;
	}

	/* Scrollbar styling - light theme */
	.app-sidebar::-webkit-scrollbar,
	.app-sidebar > div::-webkit-scrollbar {
		width: 6px;
	}

	.app-sidebar::-webkit-scrollbar-track,
	.app-sidebar > div::-webkit-scrollbar-track {
		background: rgb(243 244 246);
	}

	.app-sidebar::-webkit-scrollbar-thumb,
	.app-sidebar > div::-webkit-scrollbar-thumb {
		background: rgb(209 213 219);
		border-radius: 3px;
	}

	.app-sidebar::-webkit-scrollbar-thumb:hover,
	.app-sidebar > div::-webkit-scrollbar-thumb:hover {
		background: rgb(156 163 175);
	}

	/* Scrollbar styling - dark theme */
	:global(.dark) .app-sidebar::-webkit-scrollbar-track,
	:global(.dark) .app-sidebar > div::-webkit-scrollbar-track {
		background: rgb(31 41 55);
	}

	:global(.dark) .app-sidebar::-webkit-scrollbar-thumb,
	:global(.dark) .app-sidebar > div::-webkit-scrollbar-thumb {
		background: rgb(75 85 99);
		border-radius: 3px;
	}

	:global(.dark) .app-sidebar::-webkit-scrollbar-thumb:hover,
	:global(.dark) .app-sidebar > div::-webkit-scrollbar-thumb:hover {
		background: rgb(107 114 128);
	}
</style>
