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
	import type { SidebarConfig, SidebarMenuGroup, SidebarMenuItem, SidebarContext, AppSidebarProps } from '../types/sidebar.types';
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
		// One-shot label fade animation. Static opacity (set by the .collapsed
		// class on the sidebar) handles the resting state; the animation only
		// runs during the toggle so we don't rely on transition-property swaps
		// mid-frame, which were dropping the fade for some labels.
		runLabelToggleAnim(sidebarOpen ? 'in' : 'out');
		ontoggle?.(!sidebarOpen);
	}

	let labelAnimTimer: ReturnType<typeof setTimeout> | null = null;
	function runLabelToggleAnim(dir: 'in' | 'out') {
		if (!isBrowser() || !sidebarEl) return;
		if (labelAnimTimer) {
			clearTimeout(labelAnimTimer);
			labelAnimTimer = null;
		}
		// Synchronously: clear, force reflow, re-set. Setting via rAF would
		// queue the animation for the *next* frame, by which time the
		// .collapsed class flip has already triggered the static opacity
		// rule for one paint — causing a snap that the animation then has
		// to undo (visible as a flash). Setting synchronously puts the
		// animation rule in effect at the SAME paint as the class flip, so
		// the animation overrides the static rule with no intermediate snap.
		sidebarEl.removeAttribute('data-label-anim');
		void sidebarEl.offsetWidth;
		sidebarEl.setAttribute('data-label-anim', dir);
		const ms = dir === 'in' ? 700 : 200;
		labelAnimTimer = setTimeout(() => {
			labelAnimTimer = null;
			sidebarEl?.removeAttribute('data-label-anim');
		}, ms + 50);
	}

	onDestroy(() => {
		if (labelAnimTimer) {
			clearTimeout(labelAnimTimer);
			labelAnimTimer = null;
		}
	});

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

	// Merge root items + groups into a single ordered list so a high-order
	// root item (e.g. order 90) can sit BELOW a low-order group (order 1)
	// instead of being forced to the top of the sidebar. Each entry is
	// tagged so the template can render the right primitive.
	type NavEntry =
		| { kind: 'item'; order: number; key: string; item: SidebarMenuItem }
		| { kind: 'group'; order: number; key: string; group: SidebarMenuGroup };
	let mergedNav = $derived.by<NavEntry[]>(() => {
		const entries: NavEntry[] = [
			...sortedRootItems.map<NavEntry>((item) => ({
				kind: 'item',
				order: item.order ?? 0,
				key: `item:${item.id ?? item.href}`,
				item
			})),
			...sortedGroups.map<NavEntry>((group) => ({
				kind: 'group',
				order: group.order ?? 0,
				key: `group:${group.id}`,
				group
			}))
		];
		return entries.sort((a, b) => a.order - b.order);
	});

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
					<!--
					  Root items and groups are merged into a single ordered
					  list so a high-order root item can render BELOW low-order
					  groups (e.g. a footer-like nav link sorted last).
					-->
					{#each mergedNav as entry (entry.key)}
						{#if entry.kind === 'item'}
							{@const item = entry.item}
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
						{:else}
							{@const group = entry.group}
							{#if group.items.length > 0 && dropdownStates[group.id] !== undefined}
								<SidebarDropdownGroup
									{group}
									expanded={sidebarOpen}
									bind:isOpen={dropdownStates[group.id]}
									flyoutActive={activeFlyout === group.id}
									{activeUrl}
									onCollapsedTriggerClick={(e) => showCollapsedFlyout(group.id, e)}
									onCollapsedMouseEnter={(e) => showCollapsedFlyout(group.id, e)}
									onCollapsedMouseLeave={hideCollapsedFlyoutSoon}
								/>
							{/if}
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

	/* ---------- Sidebar surface chrome (lifted from SIMS app layout) ---------- */
	/* The outer <aside> is transparent so a brand cap can sit on the body
	   canvas. The white panel begins below with a 1px top margin and rounds
	   only its top-right corner against whatever middle panel sits next. */
	:global(.app-sidebar) {
		border-right-width: 0;
	}
	:global(.app-sidebar > div.flex-1) {
		margin-top: 1px;
		background-color: rgb(255 255 255);
		border-top-right-radius: 0.5rem;
	}
	:global(.app-sidebar .sidebar),
	:global(.app-sidebar .sidebar > div) {
		box-sizing: border-box;
		width: 100% !important;
		min-width: 0 !important;
		max-width: 100% !important;
		overflow-x: hidden !important;
	}
	:global(.app-sidebar .sidebar > div) {
		padding: 0.5rem !important;
	}
	:global(.app-sidebar .sidebar a),
	:global(.app-sidebar .dropdown-wrapper button) {
		width: 100%;
		padding-top: 7px !important;
		padding-bottom: 7px !important;
		margin-top: 1px;
		margin-bottom: 1px;
		color: rgb(107 114 128) !important; /* gray-500 — match icon */
		/* No transition on background-color in either direction — when
		   the sidebar is collapsed, the flyout appears instantly on
		   hover, and a 200ms BG fade on the icon button visibly drifts
		   out of sync with it. Color (label text) and box-shadow get
		   a smooth fade so hover/active states ease in and out. */
		transition:
			background-color 0ms,
			color 500ms ease-out,
			box-shadow 500ms ease-out !important;
		box-shadow: none !important;
	}
	:global(.dark .app-sidebar .sidebar a),
	:global(.dark .app-sidebar .dropdown-wrapper button) {
		color: rgb(156 163 175) !important; /* gray-400 — match icon */
	}

	/* Label spans + sub-item links: static opacity per resting state.
	   Optional one-shot animation triggered when consumer sets the
	   `data-label-anim='in'|'out'` attribute on .app-sidebar (SIMS does
	   this from its layout JS on sidebar toggle). Without the attribute
	   the spans just respect the .collapsed → opacity 0 baseline. */
	:global(.app-sidebar .dropdown-wrapper button > span),
	:global(.app-sidebar .sidebar a > span),
	:global(.app-sidebar .dropdown-wrapper ul a) {
		contain: paint;
		opacity: 1;
	}
	:global(.app-sidebar.collapsed .dropdown-wrapper button > span),
	:global(.app-sidebar.collapsed .sidebar a > span),
	:global(.app-sidebar.collapsed .dropdown-wrapper ul a) {
		opacity: 0;
	}
	:global(.app-sidebar[data-label-anim='in'] .dropdown-wrapper button > span),
	:global(.app-sidebar[data-label-anim='in'] .sidebar a > span),
	:global(.app-sidebar[data-label-anim='in'] .dropdown-wrapper ul a) {
		animation: gawdux-sidebar-label-in 700ms ease-in-out forwards;
	}
	:global(.app-sidebar[data-label-anim='out'] .dropdown-wrapper button > span),
	:global(.app-sidebar[data-label-anim='out'] .sidebar a > span),
	:global(.app-sidebar[data-label-anim='out'] .dropdown-wrapper ul a) {
		animation: gawdux-sidebar-label-out 200ms ease-in-out forwards;
	}
	@keyframes gawdux-sidebar-label-in {
		0%,
		28.5% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
	@keyframes gawdux-sidebar-label-out {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	/* Icon (svg): own color transition independent of the parent button. */
	:global(.app-sidebar .sidebar a svg),
	:global(.app-sidebar .sidebar button svg) {
		color: rgb(107 114 128); /* gray-500 */
		transition: color 500ms ease-out !important;
	}
	:global(.app-sidebar .sidebar a:hover),
	:global(.app-sidebar .sidebar button:hover),
	:global(.app-sidebar .dropdown-wrapper.flyout-active button) {
		color: rgb(37 99 235) !important; /* blue-600 — brand */
	}
	:global(.app-sidebar .sidebar a:hover svg),
	:global(.app-sidebar .sidebar button:hover svg),
	:global(.app-sidebar .dropdown-wrapper.flyout-active button svg) {
		color: rgb(37 99 235); /* blue-600 — brand */
	}
	:global(.dark .app-sidebar .sidebar a svg),
	:global(.dark .app-sidebar .sidebar button svg) {
		color: rgb(156 163 175); /* gray-400 */
	}
	:global(.dark .app-sidebar .sidebar a:hover),
	:global(.dark .app-sidebar .sidebar button:hover),
	:global(.dark .app-sidebar .dropdown-wrapper.flyout-active button) {
		color: rgb(96 165 250) !important; /* blue-400 */
	}
	:global(.dark .app-sidebar .sidebar a:hover svg),
	:global(.dark .app-sidebar .sidebar button:hover svg),
	:global(.dark .app-sidebar .dropdown-wrapper.flyout-active button svg) {
		color: rgb(96 165 250); /* blue-400 — brand, lighter for dark mode */
	}

	/* Active (selected) top-level item: 2px inset blue border (no fill),
	   blue label + icon. AppSidebar tags the active <a> with `bg-gray-100
	   dark:bg-gray-700`; we hijack those classes to apply the selected
	   look in both light and dark modes. Inset box-shadow avoids the
	   layout shift a real border would cause. */
	:global(.app-sidebar .sidebar a.bg-gray-100) {
		background-color: transparent !important;
		color: rgb(37 99 235) !important; /* blue-600 */
		box-shadow: inset 0 0 0 2px rgb(191 219 254) !important; /* blue-200 */
	}
	:global(.app-sidebar .sidebar a.bg-gray-100 svg) {
		color: rgb(37 99 235) !important;
	}
	:global(.dark .app-sidebar .sidebar a.bg-gray-100) {
		color: rgb(96 165 250) !important; /* blue-400 */
		box-shadow: inset 0 0 0 2px rgb(30 58 138) !important; /* blue-900 */
	}
	:global(.dark .app-sidebar .sidebar a.bg-gray-100 svg) {
		color: rgb(96 165 250) !important;
	}
	:global(.app-sidebar .sidebar a.bg-gray-100:hover) {
		background-color: rgb(239 246 255) !important; /* blue-50 */
	}
	:global(.dark .app-sidebar .sidebar a.bg-gray-100:hover) {
		background-color: rgb(30 58 138 / 0.25) !important; /* blue-900/25 */
	}

	/* Active-child highlight on parent group when one of its sub-items is
	   the active page. Mirrors the rootItem active styling on the parent
	   button + tints the chevron and vertical guide line. */
	:global(.app-sidebar .dropdown-wrapper.has-active-child button) {
		color: rgb(37 99 235) !important; /* blue-600 */
		box-shadow: inset 0 0 0 2px rgb(191 219 254) !important; /* blue-200 */
	}
	:global(.app-sidebar .dropdown-wrapper.has-active-child button svg) {
		color: rgb(37 99 235) !important;
	}
	:global(.dark .app-sidebar .dropdown-wrapper.has-active-child button) {
		color: rgb(96 165 250) !important; /* blue-400 */
		box-shadow: inset 0 0 0 2px rgb(30 58 138) !important; /* blue-900 */
	}
	:global(.dark .app-sidebar .dropdown-wrapper.has-active-child button svg) {
		color: rgb(96 165 250) !important;
	}
	:global(.app-sidebar .dropdown-wrapper.has-active-child .dropdown-chevron) {
		color: rgb(37 99 235) !important;
	}
	:global(.dark .app-sidebar .dropdown-wrapper.has-active-child .dropdown-chevron) {
		color: rgb(96 165 250) !important;
	}
	:global(.app-sidebar .dropdown-wrapper.has-active-child::before) {
		background: rgb(191 219 254) !important; /* blue-200 */
	}
	:global(.dark .app-sidebar .dropdown-wrapper.has-active-child::before) {
		background: rgb(30 58 138) !important; /* blue-900 */
	}

	/* Hide flowbite's built-in chevron — it lives in an if-block keyed on
	   isOpen, so its DOM node is destroyed each toggle and CSS transitions
	   on it never play. The visible chevron is `.dropdown-chevron`,
	   rendered persistently by SidebarDropdownGroup just outside the
	   button. Without this CSS the persistent chevron renders as a stray
	   row below each parent group — visible regression any consumer would
	   hit without lifting these rules. */
	:global(.app-sidebar .dropdown-wrapper button > svg:last-child) {
		display: none;
	}
	:global(.app-sidebar .dropdown-wrapper .dropdown-chevron) {
		position: absolute;
		right: 12px;
		top: 14px;
		width: 20px;
		height: 20px;
		color: rgb(107 114 128); /* gray-500 */
		pointer-events: none;
		transition:
			transform 200ms ease-out,
			color 150ms ease-out,
			opacity 200ms ease-out 250ms;
	}
	:global(.app-sidebar .dropdown-wrapper.open .dropdown-chevron) {
		transform: rotate(180deg);
	}
	:global(.app-sidebar .dropdown-wrapper:hover .dropdown-chevron),
	:global(.app-sidebar .dropdown-wrapper.flyout-active .dropdown-chevron) {
		color: rgb(17 24 39); /* gray-900 */
	}
	:global(.dark .app-sidebar .dropdown-wrapper .dropdown-chevron) {
		color: rgb(156 163 175); /* gray-400 */
	}
	:global(.dark .app-sidebar .dropdown-wrapper:hover .dropdown-chevron),
	:global(.dark .app-sidebar .dropdown-wrapper.flyout-active .dropdown-chevron) {
		color: rgb(255 255 255);
	}
	:global(.app-sidebar.collapsed .dropdown-wrapper .dropdown-chevron) {
		opacity: 0;
		pointer-events: none;
		transition:
			transform 200ms ease-out,
			color 150ms ease-out,
			opacity 0ms;
	}

	/* Flowbite's default dropdown UL has py-2; the slide transition would
	   animate that 8px on each side — visible as inner items shifting
	   vertically while the panel opens/closes. Zero-out the animated
	   padding so items stay anchored. */
	:global(.app-sidebar .dropdown-wrapper ul) {
		padding-top: 0 !important;
		padding-bottom: 0 !important;
	}
	:global(.app-sidebar .dropdown-wrapper ul > li + li) {
		margin-top: -5px !important;
	}

	/* Sub-item links: shifted right of the vertical guide line, tightened
	   vertical rhythm, left corners squared so the 4px hover tab sits
	   flush. */
	:global(.app-sidebar .dropdown-wrapper ul a) {
		position: relative;
		margin-left: 24px;
		width: calc(100% - 24px);
		padding-left: 1.75rem !important;
		padding-top: 6px !important;
		padding-bottom: 6px !important;
		margin-top: 0 !important;
		margin-bottom: 0 !important;
		font-size: 0.875rem;
		line-height: 1.2 !important;
		border-top-left-radius: 0 !important;
		border-bottom-left-radius: 0 !important;
	}
	:global(.app-sidebar .dropdown-wrapper ul a::before) {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: var(--color-gray-200);
		opacity: 0;
	}
	:global(.app-sidebar .dropdown-wrapper ul a:hover::before) {
		opacity: 1;
	}
	:global(.dark .app-sidebar .dropdown-wrapper ul a::before) {
		background: var(--color-gray-600);
	}

	/* Vertical guide line from the section icon down to the bottom of the
	   expanded section. Fades in/out with the .open class. */
	:global(.app-sidebar .dropdown-wrapper) {
		position: relative;
	}
	:global(.app-sidebar .dropdown-wrapper::before) {
		content: '';
		position: absolute;
		left: 24px;
		top: 48px;
		bottom: 0;
		width: 1px;
		background: var(--color-gray-200);
		opacity: 0;
		transition: opacity 200ms ease-out;
		pointer-events: none;
	}
	:global(.app-sidebar .dropdown-wrapper.open::before) {
		opacity: 1;
	}
	:global(.dark .app-sidebar .dropdown-wrapper::before) {
		background: var(--color-gray-700);
	}
	:global(.app-sidebar > div.bg-gray-50) {
		background-color: rgb(255 255 255);
	}
	:global(.dark .app-sidebar > div.flex-1),
	:global(.dark .app-sidebar > div.bg-gray-50) {
		background-color: var(--color-gray-900);
	}
</style>
