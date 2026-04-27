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
		toggleBar,
		initialOpen
	}: AppSidebarProps = $props();

	// Configurable widths with defaults
	const expandedWidth = $derived(config.expandedWidth ?? 256);
	const collapsedWidth = $derived(config.collapsedWidth ?? 72);

	// When `initialOpen` is provided by the host (e.g. resolved from a
	// server-side cookie read), we know the correct state at script-init
	// time — render the sidebar immediately with the right width on first
	// paint, no flash. When `initialOpen` is undefined we fall back to the
	// legacy onMount-localStorage path, which means a brief moment where
	// the sidebar is hidden until ready=true.
	let ready = $state(false);
	let sidebarOpen = $state(false);
	let sidebarBootstrapped = $state(false);

	$effect(() => {
		if (sidebarBootstrapped) return;
		ready = initialOpen !== undefined;
		sidebarOpen = initialOpen ?? !(config.defaultCollapsed ?? false);
		sidebarBootstrapped = true;
	});

	onMount(() => {
		// Legacy path: only restore from localStorage if the host did NOT
		// pre-resolve the state via `initialOpen`. Hosts that use the
		// cookie pattern keep their cookie+localStorage in sync via the
		// `ontoggle` callback, so localStorage restore would be redundant
		// (and would race with the parent's prop on hydration).
		if (initialOpen === undefined && config.storageKey) {
			const stored = getStorageItem(config.storageKey);
			if (stored !== null) {
				sidebarOpen = stored !== 'false';
			}
		}
		// Show sidebar after state is correct (no-op if initialOpen
		// already set ready=true at script init).
		ready = true;
	});

	// Persist sidebar state to localStorage (SSR-safe)
	$effect(() => {
		if (config.storageKey) {
			setStorageItem(config.storageKey, String(sidebarOpen));
		}
	});

	// Safe groups accessor
	let groups = $derived.by(() => config.groups ?? []);

	// Build dropdown keys from groups
	const dropdownKeys = $derived(groups.map((g) => g.id));

	// Initialize dropdown states with defaultOpen support
	let dropdownStates: Record<string, boolean> = $state({});

	$effect(() => {
		const nextDefaults = Object.fromEntries(
			(config.groups ?? []).map((group) => [group.id, group.defaultOpen ?? false])
		);
		const nextKeys = new Set(Object.keys(nextDefaults));
		const currentKeys = Object.keys(dropdownStates);
		const keysChanged =
			currentKeys.length !== nextKeys.size ||
			currentKeys.some((key) => !nextKeys.has(key));
		if (!keysChanged) return;
		dropdownStates = nextDefaults;
	});

	// Whether we have any navigation content to render
	let hasNavContent = $derived.by(
		() => groups.length > 0 || (config.rootItems ?? []).length > 0
	);

	// Context object passed to header/footer snippets
	let sidebarContext: SidebarContext = $derived({
		collapsed: !sidebarOpen,
		collapsedWidth,
		expandedWidth
	});

	// Track which flyout menu is open when sidebar is collapsed
	let sidebarEl: HTMLElement | null = $state(null);
	let activeFlyout: string | null = $state(null);
	let flyoutPosition = $state({ top: 0, left: 0 });
	let flyoutHeaderHeight = $state(44);
	let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

	onDestroy(() => {
		if (hoverTimeout) {
			clearTimeout(hoverTimeout);
			hoverTimeout = null;
		}
		activeFlyout = null;
	});

	function cancelFlyoutHide() {
		if (!hoverTimeout) return;
		clearTimeout(hoverTimeout);
		hoverTimeout = null;
	}

	function updateFlyoutPosition(event: MouseEvent) {
		const wrapper = event.currentTarget as HTMLElement;
		const button = wrapper.querySelector('button');
		const rect = button ? button.getBoundingClientRect() : wrapper.getBoundingClientRect();
		flyoutPosition = {
			// Shift up by 1px to compensate for the flyout's top border,
			// so the header content lines up with the button content.
			top: rect.top - 1,
			left: rect.right
		};
		flyoutHeaderHeight = rect.height;
	}

	function showCollapsedFlyout(groupId: string, event: MouseEvent) {
		if (sidebarOpen) return;
		cancelFlyoutHide();
		updateFlyoutPosition(event);
		activeFlyout = groupId;
	}

	function hideCollapsedFlyoutSoon() {
		if (sidebarOpen) return;
		cancelFlyoutHide();
		hoverTimeout = setTimeout(() => {
			activeFlyout = null;
			hoverTimeout = null;
		}, 120);
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
			cancelFlyoutHide();
		}
	}

	function handleWindowClick(event: MouseEvent) {
		if (sidebarOpen || activeFlyout === null) return;
		const target = event.target;
		if (!(target instanceof Element)) {
			activeFlyout = null;
			cancelFlyoutHide();
			return;
		}
		if (sidebarEl?.contains(target)) return;
		if (target.closest('[data-sidebar-flyout="true"]')) return;
		activeFlyout = null;
		cancelFlyoutHide();
	}

	function handleFlyoutItemClick(href: string) {
		activeFlyout = null;
		cancelFlyoutHide();
		onnavigate?.(href);
	}

	$effect(() => {
		activeUrl;
		if (!sidebarOpen) {
			activeFlyout = null;
		}
	});

	// Get active flyout group
	let activeFlyoutGroup = $derived.by(
		() => (activeFlyout ? groups.find((g) => g.id === activeFlyout) : null)
	);

	// Sort groups by order
	let sortedGroups = $derived.by(
		() => [...groups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
	);

	// Sort root items by order
	let sortedRootItems = $derived.by(
		() => [...(config.rootItems ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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

<svelte:window onkeydown={handleKeydown} onclick={handleWindowClick} />

{#if ready}
<aside
	bind:this={sidebarEl}
	class={`app-sidebar flex flex-col min-h-0 overflow-x-hidden border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${!sidebarOpen ? 'collapsed overflow-hidden' : ''} ${className}`}
	style={widthStyle}
	role="navigation"
	aria-label="Main navigation"
>
	<!-- Header lives OUTSIDE the scroll container so the brand stays
	     pinned at top and the scrollbar (if nav overflows) never extends
	     up into the brand area. -->
	{#if header}
		{@render header(sidebarContext)}
	{/if}

	<div class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
		{#if hasNavContent}
			<Sidebar asideClass="w-full" class="sidebar h-full">
				<SidebarWrapper divClass="h-full overflow-y-auto overflow-x-hidden py-4 bg-transparent rounded-none">
					<!-- Root Items (direct links, no dropdown) -->
					{#each sortedRootItems as item}
						{@const isActive = activeUrl ? item.href === activeUrl : false}
						<SidebarItem
							href={item.href}
							label={item.label}
							class={isActive ? 'bg-gray-100 dark:bg-gray-700' : ''}
						>
							<svelte:fragment slot="icon">
								{#if item.icon}
									{@const Icon = item.icon}
									<Icon class="w-8 h-8" />
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
						{#if group.items.length > 0 && dropdownStates[group.id] !== undefined}
							<SidebarDropdownGroup
								{group}
								expanded={sidebarOpen}
								bind:isOpen={dropdownStates[group.id]}
								flyoutActive={activeFlyout === group.id}
								onCollapsedTriggerClick={(e) => showCollapsedFlyout(group.id, e)}
								onCollapsedMouseEnter={(e) => showCollapsedFlyout(group.id, e)}
								onCollapsedMouseLeave={hideCollapsedFlyoutSoon}
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
					<CollapseIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
				{:else}
					<ExpandIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
				{/if}
			</Button>
			{#if sidebarOpen && showToggleAll}
				<Button
					onclick={toggleAllSubMenus}
					color="light"
					class="p-2"
					aria-label="Toggle all menu groups"
				>
					<ToggleAllIcon class="w-5 h-5 text-gray-500 dark:text-gray-400" />
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
		onMouseEnter={cancelFlyoutHide}
		onMouseLeave={hideCollapsedFlyoutSoon}
		onItemClick={handleFlyoutItemClick}
	/>
{/if}

<style>
	:global(.sidebar ul) {
		list-style: none;
		padding-left: 0;
		margin-left: 0;
	}

	/* Collapse animation: fade labels and dropdown chevrons in/out.
	   Icons themselves stay anchored at the same offset from the sidebar
	   left edge in both states, so they don't jump during the width
	   transition.

	   Asymmetric timing: on EXPAND (default rule applies), wait 200ms
	   before fading the label in so the sidebar has visibly widened
	   first — otherwise the fade-in completes while still narrow and is
	   missed entirely. On COLLAPSE (.collapsed rule applies), no delay
	   so the labels fade out promptly as the width starts shrinking. */
	:global(.app-sidebar .sidebar a > span),
	:global(.app-sidebar .sidebar button > span),
	:global(.app-sidebar .sidebar button > svg:last-child) {
		transition: opacity 150ms ease-out 200ms;
	}
	:global(.app-sidebar.collapsed .sidebar a > span),
	:global(.app-sidebar.collapsed .sidebar button > span),
	:global(.app-sidebar.collapsed .sidebar button > svg:last-child) {
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease-out;
	}

	/* Anchor every nav icon at exactly 16px from the sidebar's left edge
	   in BOTH expanded and collapsed states, so icons never move when the
	   sidebar toggles AND they line up vertically with the brand image
	   above (px-4 + w-8 → 16px from edge) and the toggle chevron below
	   (px-4 + w-8 → 16px from edge). This overrides flowbite's default
	   `p-2` on links/buttons; combined with the wrapper's `px-0`, the
	   icon's left edge is determined solely by this single 1rem value. */
	:global(.app-sidebar .sidebar a),
	:global(.app-sidebar .sidebar button) {
		padding-left: 0.5rem;
		padding-right: 0.5rem;
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
