<!--
	@component
	A breadcrumb trail that never clips a crumb: one line above the shell's
	compact width; at or below it, one row naming the current page, which
	opens the whole path.

	One line. Every crumb shows in full while the trail fits. When it does not,
	the trail gives way in this order, each step only when the one before is
	not enough, so the current page keeps its title readable while anything
	else can give way:
	1. the crumbs between the first and the current page fold, from the
	   inside out, into one … button;
	2. the first crumb shows as its icon alone;
	3. the first crumb folds into the … button too, which then stands first:
	   the trail reads "… › Package";
	4. the current page ellipsizes, with its full name in a tooltip, down to
	   its readable minimum: its own width up to `BREADCRUMB_LEAF_MIN_PX`
	   (64px, four or five characters), never below it.
	The current page always stays. Past the narrowest the trail can go, the
	page holds its minimum and the trail's box clips the end. The trail
	carries no status: the page's own header wears it.

	A level the page's header names. A last level marked `namedByHeader` is
	the item a page's own header names beside its status: the line leaves it
	out and ends at the item's place, every level a link and none marked as
	the current page, so the name shows once. The row at the compact width,
	where the header carries no title, names it and opens the whole path.

	The current page alone (`layout` "adaptive", the default, at or below
	`BREADCRUMB_COMPACT_QUERY`, 1024px). The row names the current page on
	one line, a name too long for it ending in an ellipsis, an identifier that
	fits never cut. With a path above the page, the name is a button with a
	chevron that opens the path under the row: every level from the top down,
	each a link to its level (words when it has none), the current page last
	and marked (`aria-current="page"`), every name whole and wrapping between
	its words (`breadcrumbWords`). A page that is its own path is its name, no
	button. The path is a menu, not a dialog: the menu button pattern below,
	Escape and a press outside close it and the focus returns to the button,
	choosing a level, the focus leaving, a new trail and the window growing
	past the compact width close it. `layout` "line" keeps one line at every
	width.

	The … button opens a small menu, not a dialog, listing in order every level
	the trail does not name: the first crumb when it shows as its icon or is
	folded, the folded crumbs, the crumb that is cut. A level with an `href` is
	a link; one without is words. Keyboard: the WAI-ARIA menu button pattern.
	Enter, Space or ArrowDown opens on the first link, ArrowUp on the last; the
	arrows wrap, Home and End jump, Escape closes and returns the focus to the
	button, Tab closes and moves on. A press outside, the focus leaving and a
	new trail close it. An Escape from anywhere closes a menu the pointer
	opened and is taken (`preventDefault`), so a page handler reading
	`defaultPrevented` leaves it alone.

	The focus follows its level when the trail re-plans. A focused menu row
	whose level comes back to the trail (the trail unfolding closes the menu)
	hands the focus to that level's crumb: its link, or the current page when
	it has none, and the menu closes behind it. A focused crumb that folds
	hands it to the … button, and the button keeps it when it moves, the
	trail narrowing or widening, its menu open or closed as it was; only the
	trail unfolding whole hands it on, to the crumb of the first level it
	stood for.

	Icons. The first crumb's `icon` stands in front of its words; on every
	later crumb `icon` is the separator before it (a chevron when it has none),
	and the … button takes the separator of the first crumb it folds, none when
	it folds the first crumb itself. The row naming the current page leads
	with the same icon, the section's, at the house size (`.gawdux-icon`),
	before the page's name and inside its target, so a phone reads where it
	is as the line's first crumb says it.

	Measurement. A hidden copy of the trail is measured once per trail, and
	again when its size changes (a web font arriving). A ResizeObserver on the
	trail's box re-plans on every resize (a sidebar or a dock opening) from
	those widths alone, so a resize reads no layout. The root grows into its
	row (`flex: 1 1 0%`), so its width never depends on what it shows.

	The room it needs. `room` (bindable) reports, once measured, the width the
	trail has and the widths it needs: `whole`, every crumb in full, and
	`page`, the current page whole with the crumbs on the way folded. The
	needs come from the measures alone, never from the room, so a host can
	give the trail room (`createRoomYield`: an account menu showing its avatar
	alone) and decide again without the decision undoing itself.

	Styling: the crumbs keep the token classes (`.breadcrumb-title`,
	`.breadcrumb-section-icon`, `.breadcrumb-chevron`, `.breadcrumb-label`);
	the layout and the menus are scoped CSS over the --gawdux-* tokens.
-->
<script lang="ts">
	import { tick, untrack, type Component } from 'svelte';
	import { ChevronDownOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import type { BreadcrumbCrumb } from '../utils/url-breadcrumb';
	import { createDisclosureController } from '../utils/disclosure';
	import {
		BREADCRUMB_COMPACT_QUERY,
		breadcrumbLeafMin,
		breadcrumbNeed,
		breadcrumbWords,
		planBreadcrumbOverflow,
		type BreadcrumbOverflowPlan,
		type BreadcrumbRoom
	} from './breadcrumb-overflow';

	let {
		items = [],
		layout = 'adaptive',
		label = 'Breadcrumb',
		moreLabel = 'Show the hidden levels',
		className = '',
		room = $bindable(null)
	}: {
		/** The trail, first crumb first; the last is the current page. */
		items?: BreadcrumbCrumb[];
		/**
		 * "adaptive": one line above `BREADCRUMB_COMPACT_QUERY`; at or below it,
		 * one row naming the current page, which opens the whole path. "line":
		 * one line at every width.
		 */
		layout?: 'adaptive' | 'line';
		/** The navigation landmark's name. */
		label?: string;
		/** The … button's name and tooltip. */
		moreLabel?: string;
		className?: string;
		/**
		 * Bindable. The width the trail has and the widths it needs (`whole`,
		 * `page`); null until it is measured, then the last report while a new
		 * trail is measured.
		 */
		room?: BreadcrumbRoom | null;
	} = $props();

	type Measured = {
		items: BreadcrumbCrumb[];
		crumbs: number[];
		more: number;
		moreLead: number;
		firstCompact: number | null;
	};

	const NOTHING: BreadcrumbOverflowPlan = {
		hidden: [],
		compactFirst: false,
		leafCut: false
	};
	/** The menu's gap below the button. */
	const MENU_OFFSET_PX = 4;

	const componentId = $props.id();
	const buttonId = `${componentId}-more`;
	const menuId = `${componentId}-menu`;
	const pageButtonId = `${componentId}-page`;
	const pathId = `${componentId}-path`;

	let root = $state<HTMLElement>();
	let ruler = $state<HTMLElement>();
	let button = $state<HTMLButtonElement>();
	let menu = $state<HTMLElement>();
	let measured = $state.raw<Measured | null>(null);
	let available = $state<number | null>(null);
	let open = $state(false);
	/** The menu's last input was the pointer: the focused row shows no ring. */
	let pointerInput = $state(false);
	let menuPosition = $state<{ top: number; left: number } | null>(null);

	/** The current page's button at the compact width, and the path it opens. */
	let pageButton = $state<HTMLButtonElement>();
	let pathMenu = $state<HTMLElement>();
	let pathOpen = $state(false);
	let pathPointerInput = $state(false);
	let pathTop = $state<number | null>(null);

	/**
	 * The line's levels: the trail, less a last level the page's own header
	 * names (`namedByHeader`), so above the compact width the line ends at
	 * the item's place; the page's row at the compact width names it.
	 */
	const line = $derived(
		items.length > 1 && items[items.length - 1]?.namedByHeader ? items.slice(0, -1) : items
	);
	/** The line ends on the current page, not on its place. */
	const lineEndsOnPage = $derived(line === items);
	const last = $derived(line.length - 1);
	/** The current page at the compact width, and in its path. */
	const pageLevel = $derived(items.length - 1);
	/** The crumb that ellipsizes last: the line's last. */
	const cutLevel = $derived(last);
	/** The current page has a path above it to open. */
	const hasPath = $derived(items.length > 1);
	const plan = $derived.by<BreadcrumbOverflowPlan>(() => {
		// Until this trail is measured it shows whole: a plan from another
		// trail's widths would fold the wrong crumbs.
		if (available === null || !measured || measured.items !== line) return NOTHING;
		const crumbs = measured.crumbs;
		if (crumbs.length === 0) return NOTHING;
		return planBreadcrumbOverflow({
			available,
			crumbs,
			more: measured.more,
			moreLead: measured.moreLead,
			firstCompact: measured.firstCompact
		});
	});
	const hidden = $derived(new Set(plan.hidden));
	const folded = $derived(plan.hidden.length > 0);
	const menuOpen = $derived(open && folded);
	/** The narrowest the crumb that is cut last goes; null until measured. */
	const cutMinWidth = $derived(
		measured && measured.items === line && cutLevel >= 0
			? breadcrumbLeafMin(measured.crumbs[cutLevel] ?? 0)
			: null
	);

	/** This trail's report, once it is measured and has a box. */
	const report = $derived.by<BreadcrumbRoom | null>(() => {
		if (available === null || !measured || measured.items !== line) return null;
		return {
			available,
			...breadcrumbNeed({
				crumbs: measured.crumbs,
				more: measured.more,
				moreLead: measured.moreLead,
				firstCompact: measured.firstCompact
			})
		};
	});

	// The host reads the last report while a new trail is measured: the room
	// it gave never flickers back for a frame.
	$effect(() => {
		const next = report;
		if (!next) return;
		const last = untrack(() => room);
		if (
			last &&
			last.available === next.available &&
			last.whole === next.whole &&
			last.page === next.page
		) {
			return;
		}
		room = next;
	});

	// The trail unfolding closes the menu. Hidden while `open` held, it came
	// back by itself, its listeners with it, the next time the trail folded.
	$effect(() => {
		if (!folded) open = false;
	});
	/** Every level the trail does not name, in order. */
	const menuEntries = $derived([
		...(plan.compactFirst ? [0] : []),
		...plan.hidden,
		...(plan.leafCut && folded ? [cutLevel] : [])
	]);

	// The path is the compact row's: the window growing past the compact
	// width, where the row is not drawn, closes it.
	$effect(() => {
		if (layout !== 'adaptive' || typeof window.matchMedia !== 'function') return;
		const query = window.matchMedia(BREADCRUMB_COMPACT_QUERY);
		const sync = () => {
			if (!query.matches) pathOpen = false;
		};
		query.addEventListener?.('change', sync);
		return () => query.removeEventListener?.('change', sync);
	});

	const widthOf = (el: Element | null | undefined) => (el ? el.getBoundingClientRect().width : 0);

	/** Reads the hidden copy in one pass. */
	function measure() {
		const list = ruler;
		if (!list) return;
		const compact = list.querySelector('[data-measure="first-compact"]');
		measured = {
			items: line,
			crumbs: Array.from(list.querySelectorAll('[data-measure="crumb"]'), widthOf),
			more: widthOf(list.querySelector('[data-measure="more"]')),
			moreLead: widthOf(list.querySelector('[data-measure="more-lead"]')),
			firstCompact: compact ? widthOf(compact) : null
		};
	}

	// A new trail: measured as soon as its copy is in the DOM (before it
	// paints), and a menu or a path that listed the old one closes.
	$effect(() => {
		void line;
		measure();
		open = false;
		pathOpen = false;
	});

	$effect(() => {
		const box = root;
		const list = ruler;
		if (!box || !list || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === box) available = entry.contentRect.width;
				else measure();
			}
		});
		observer.observe(box);
		observer.observe(list);
		return () => observer.disconnect();
	});

	const disclosure = createDisclosureController({
		isOpen: () => menuOpen,
		setOpen: (next) => (open = next),
		root: () => root,
		trigger: () => button
	});

	// A press outside and Escape from anywhere close it, while it is open.
	$effect(() => {
		if (!menuOpen) return;
		return disclosure.bind(document);
	});

	/** The menu hangs under the button; it is fixed, so no clipping box cuts it. */
	function place() {
		if (!button) return;
		const rect = button.getBoundingClientRect();
		menuPosition = { top: rect.bottom + MENU_OFFSET_PX, left: rect.left };
	}

	$effect(() => {
		if (!menuOpen) return;
		// The button moves with the trail.
		void plan;
		void available;
		place();
		window.addEventListener('resize', place);
		window.addEventListener('scroll', place, true);
		return () => {
			window.removeEventListener('resize', place);
			window.removeEventListener('scroll', place, true);
		};
	});

	// The focus follows its level when the trail re-plans. A focused row,
	// crumb or … button the new plan unmounts would take the focus to the
	// page's body with it: read where it stands before the DOM updates, and
	// hand it on after.
	$effect.pre(() => {
		void plan;
		const trail = line;
		const box = untrack(() => root);
		const focused = document.activeElement;
		if (!box || !(focused instanceof HTMLElement) || !box.contains(focused)) return;
		const holder = focused.closest<HTMLElement>('[data-level]');
		// The menu itself (no row to focus) stands for the current page.
		const level = holder && box.contains(holder) ? Number(holder.dataset.level) : last;
		// The … button stands for no level of its own: it keeps the focus
		// wherever it moves, the trail narrowing or widening, while it shows.
		const onButton = focused === untrack(() => button);
		void tick().then(() => {
			if (focused.isConnected || line !== trail) return;
			const active = document.activeElement;
			if (active && active !== document.body && active.isConnected) return;
			if (onButton && button?.isConnected) button.focus({ preventScroll: true });
			else handFocus(level);
		});
	});

	/** A level the trail shows takes the focus on its link, else the current page; a folded one on the … button. */
	function handFocus(level: number) {
		const list = root?.querySelector<HTMLElement>(':scope > ol');
		if (!list) return;
		const crumb = list.querySelector<HTMLElement>(`:scope > li[data-level="${level}"]:not(.more)`);
		if (crumb) {
			const target =
				crumb.querySelector<HTMLElement>('a.breadcrumb-title') ??
				list.querySelector<HTMLElement>(':scope > li.leaf .breadcrumb-title');
			// The focus leaves the menu for the trail: the menu closes behind it.
			open = false;
			target?.focus({ preventScroll: true });
		} else if (hidden.has(level)) {
			button?.focus({ preventScroll: true });
		}
	}

	function rows(): HTMLElement[] {
		if (!menu) return [];
		return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
			(row) => row.getAttribute('aria-disabled') !== 'true'
		);
	}

	function focusRow(index: number) {
		const list = rows();
		if (list.length === 0) {
			menu?.focus({ preventScroll: true });
			return;
		}
		const wrapped = ((index % list.length) + list.length) % list.length;
		list[wrapped]?.focus({ preventScroll: true });
	}

	function close(focusButton = false) {
		open = false;
		if (focusButton) button?.focus({ preventScroll: true });
	}

	async function openFromKeyboard(target: 'first' | 'last') {
		pointerInput = false;
		open = true;
		await tick();
		focusRow(target === 'first' ? 0 : -1);
	}

	function onButtonClick(event: MouseEvent) {
		// detail 0 is a click the keyboard (Enter, Space) or assistive technology
		// produced: open into the rows. A pointer click toggles and leaves the focus.
		if (event.detail === 0) {
			if (menuOpen) close();
			else void openFromKeyboard('first');
			return;
		}
		pointerInput = true;
		open = !menuOpen;
	}

	function onButtonKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			void openFromKeyboard(event.key === 'ArrowDown' ? 'first' : 'last');
		} else if (event.key === 'Escape' && menuOpen) {
			event.preventDefault();
			close(true);
		}
	}

	function onMenuKeydown(event: KeyboardEvent) {
		const list = rows();
		const current = list.indexOf(document.activeElement as HTMLElement);
		pointerInput = false;
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				focusRow(current + 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusRow(current < 0 ? -1 : current - 1);
				break;
			case 'Home':
				event.preventDefault();
				focusRow(0);
				break;
			case 'End':
				event.preventDefault();
				focusRow(-1);
				break;
			case 'Escape':
				event.preventDefault();
				close(true);
				break;
			case 'Tab':
				close();
				break;
			case ' ':
				// A link row activates on Space as a button row would.
				if (document.activeElement instanceof HTMLAnchorElement) {
					event.preventDefault();
					document.activeElement.click();
				}
				break;
		}
	}

	/** The link under the pointer takes the focus: one highlighted row, never two. */
	function onMenuPointerMove(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		pointerInput = true;
		const target = event.target instanceof Element ? event.target : null;
		const row = target?.closest<HTMLElement>('[role="menuitem"]');
		if (row && document.activeElement !== row && rows().includes(row)) {
			row.focus({ preventScroll: true });
		}
	}

	/** The focus moving out of the trail closes its menu or its path (Tab, a script). */
	function onRootFocusOut(event: FocusEvent) {
		if (!menuOpen && !pathOpen) return;
		const next = event.relatedTarget;
		// null is the window losing focus, or a press on nothing focusable,
		// which the outside press handles.
		if (!(next instanceof Node) || root?.contains(next)) return;
		close();
		pathOpen = false;
	}

	// ── The path, opened from the current page at the compact width ─────────

	/** The path hangs under the row; it is fixed, so no clipping box cuts it. */
	function placePath() {
		if (!pageButton) return;
		pathTop = pageButton.getBoundingClientRect().bottom + MENU_OFFSET_PX;
	}

	// Escape from anywhere and a press outside close it, while it is open. The
	// focus returns to the button when it was in the trail or nowhere: never
	// pulled back from a control the press moved it to.
	$effect(() => {
		if (!pathOpen) return;
		placePath();
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
			// The Escape that closes it is taken: a dock or a drawer leaves it alone.
			event.preventDefault();
			closePath(true);
		};
		const onClick = (event: MouseEvent) => {
			const target = event.target;
			if (target instanceof Node && root?.contains(target)) return;
			const active = document.activeElement;
			closePath(!active || active === document.body || Boolean(root?.contains(active)));
		};
		document.addEventListener('keydown', onKeydown);
		document.addEventListener('click', onClick);
		window.addEventListener('resize', placePath);
		window.addEventListener('scroll', placePath, true);
		return () => {
			document.removeEventListener('keydown', onKeydown);
			document.removeEventListener('click', onClick);
			window.removeEventListener('resize', placePath);
			window.removeEventListener('scroll', placePath, true);
		};
	});

	function pathRows(): HTMLElement[] {
		if (!pathMenu) return [];
		return Array.from(pathMenu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
			(row) => row.getAttribute('aria-disabled') !== 'true'
		);
	}

	function focusPathRow(index: number) {
		const list = pathRows();
		if (list.length === 0) {
			pathMenu?.focus({ preventScroll: true });
			return;
		}
		const wrapped = ((index % list.length) + list.length) % list.length;
		list[wrapped]?.focus({ preventScroll: true });
	}

	function closePath(focusButton = false) {
		pathOpen = false;
		if (focusButton) pageButton?.focus({ preventScroll: true });
	}

	async function openPathFromKeyboard(target: 'first' | 'last') {
		pathPointerInput = false;
		pathOpen = true;
		await tick();
		focusPathRow(target === 'first' ? 0 : -1);
	}

	function onPageButtonClick(event: MouseEvent) {
		// detail 0 is a click the keyboard (Enter, Space) or assistive technology
		// produced: open into the rows. A pointer click toggles and leaves the focus.
		if (event.detail === 0) {
			if (pathOpen) closePath();
			else void openPathFromKeyboard('first');
			return;
		}
		pathPointerInput = true;
		pathOpen = !pathOpen;
	}

	function onPageButtonKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			void openPathFromKeyboard(event.key === 'ArrowDown' ? 'first' : 'last');
		}
	}

	function onPathKeydown(event: KeyboardEvent) {
		const list = pathRows();
		const current = list.indexOf(document.activeElement as HTMLElement);
		pathPointerInput = false;
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				focusPathRow(current + 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				focusPathRow(current < 0 ? -1 : current - 1);
				break;
			case 'Home':
				event.preventDefault();
				focusPathRow(0);
				break;
			case 'End':
				event.preventDefault();
				focusPathRow(-1);
				break;
			case 'Tab':
				closePath();
				break;
			case ' ':
				// A link row activates on Space as a button row would.
				if (document.activeElement instanceof HTMLAnchorElement) {
					event.preventDefault();
					document.activeElement.click();
				}
				break;
		}
	}

	/** The link under the pointer takes the focus: one highlighted row, never two. */
	function onPathPointerMove(event: PointerEvent) {
		if (event.pointerType === 'touch') return;
		pathPointerInput = true;
		const target = event.target instanceof Element ? event.target : null;
		const row = target?.closest<HTMLElement>('[role="menuitem"]');
		if (row && document.activeElement !== row && pathRows().includes(row)) {
			row.focus({ preventScroll: true });
		}
	}
</script>

{#snippet separator(icon: Component | undefined)}
	{@const Separator = icon ?? ChevronRightOutline}
	<Separator class="breadcrumb-chevron" aria-hidden="true" />
{/snippet}

<!-- No whitespace between the icon and the words: it would lead the name. -->
{#snippet words(item: BreadcrumbCrumb, index: number, compact: boolean)}
	{#if index === 0 && item.icon}<item.icon
			class="breadcrumb-section-icon"
			aria-hidden="true"
		/>{/if}<span class="breadcrumb-label" class:visually-hidden={compact}>{item.label}</span>
{/snippet}

<!-- The section's icon, the line's first crumb's, leading the page's row. -->
{#snippet sectionIcon()}
	{@const Section = items[0]?.icon}
	{#if Section}<Section class="gawdux-icon page-section-icon" aria-hidden="true" data-trail-icon />{/if}
{/snippet}

<!-- A level's name read in full: runs that never break inside themselves,
     so it wraps only between its words. -->
{#snippet levelWords(label: string)}
	{#each breadcrumbWords(label) as word, i}{#if i > 0}{' '}{/if}<span class="word">{word}</span
		>{/each}
{/snippet}

<nav
	class="gawdux-breadcrumbs {className}"
	data-layout={layout}
	aria-label={label}
	bind:this={root}
	onfocusout={onRootFocusOut}
>
	<ol class="trail">
		{#each line as item, index}
			{#if hidden.has(index)}
				{#if index === plan.hidden[0]}
					<li class="crumb more" data-level={index}>
						{#if index > 0}{@render separator(item.icon)}{/if}
						<button
							type="button"
							id={buttonId}
							class="breadcrumb-title more-button"
							bind:this={button}
							aria-haspopup="menu"
							aria-expanded={menuOpen}
							aria-controls={menuOpen ? menuId : undefined}
							aria-label={moreLabel}
							title={moreLabel}
							onclick={onButtonClick}
							onkeydown={onButtonKeydown}>…</button
						>
					</li>
				{/if}
			{:else}
				{@const compact = index === 0 && index !== last && plan.compactFirst}
				{@const named = compact || (index === cutLevel && plan.leafCut) ? item.label : undefined}
				{@const current = index === last && lineEndsOnPage ? 'page' : undefined}
				<li
					class="crumb"
					class:leaf={index === last}
					class:cuts={index === cutLevel}
					data-level={index}
					style:--gawdux-breadcrumb-leaf-min={index === cutLevel && cutMinWidth !== null
						? `${cutMinWidth}px`
						: undefined}
				>
					{#if index > 0}{@render separator(item.icon)}{/if}
					{#if item.href}
						<a class="breadcrumb-title" href={item.href} title={named} aria-current={current}
							>{@render words(item, index, compact)}</a
						>
					{:else if index === last}
						<!-- The current page without a link can take the focus a re-plan hands it. -->
						<span class="breadcrumb-title" title={named} aria-current={current} tabindex="-1"
							>{@render words(item, index, compact)}</span
						>
					{:else}
						<span class="breadcrumb-title" title={named}>{@render words(item, index, compact)}</span>
					{/if}
				</li>
			{/if}
		{/each}
	</ol>

	<!-- At the compact width: the current page alone, which opens its path. -->
	{#if layout === 'adaptive' && items.length > 0}
		{@const page = items[pageLevel]!}
		<div class="page-row">
			{#if hasPath}
				<button
					type="button"
					id={pageButtonId}
					class="breadcrumb-title page-button"
					bind:this={pageButton}
					aria-haspopup="menu"
					aria-expanded={pathOpen}
					aria-controls={pathOpen ? pathId : undefined}
					aria-current="page"
					onclick={onPageButtonClick}
					onkeydown={onPageButtonKeydown}
					>{@render sectionIcon()}<span class="breadcrumb-label page-name">{page.label}</span
					><ChevronDownOutline
						class="page-chevron"
						aria-hidden="true"
					/></button
				>
			{:else}
				<span class="breadcrumb-title page-button" aria-current="page"
					>{@render sectionIcon()}<span class="breadcrumb-label page-name">{page.label}</span></span
				>
			{/if}
		</div>
	{/if}

	{#if pathOpen && hasPath}
		<div
			class="menu path"
			role="menu"
			id={pathId}
			aria-labelledby={pageButtonId}
			tabindex="-1"
			bind:this={pathMenu}
			data-input={pathPointerInput ? 'pointer' : 'keyboard'}
			style:top={pathTop === null ? undefined : `${pathTop}px`}
			onkeydown={onPathKeydown}
			onpointermove={onPathPointerMove}
		>
			{#each items as item, index (index)}
				{@const current = index === pageLevel ? 'page' : undefined}
				{#if item.href}
					<a
						class="row"
						role="menuitem"
						tabindex="-1"
						data-path-level={index}
						href={item.href}
						aria-current={current}
						onclick={() => closePath()}>{@render levelWords(item.label)}</a
					>
				{:else}
					<span
						class="row"
						role="menuitem"
						tabindex="-1"
						aria-disabled="true"
						aria-current={current}
						data-path-level={index}>{@render levelWords(item.label)}</span
					>
				{/if}
			{/each}
		</div>
	{/if}

	{#if menuOpen}
		<div
			class="menu"
			role="menu"
			id={menuId}
			aria-labelledby={buttonId}
			tabindex="-1"
			bind:this={menu}
			data-input={pointerInput ? 'pointer' : 'keyboard'}
			style:top={menuPosition ? `${menuPosition.top}px` : undefined}
			style:left={menuPosition ? `${menuPosition.left}px` : undefined}
			onkeydown={onMenuKeydown}
			onpointermove={onMenuPointerMove}
		>
			{#each menuEntries as index (index)}
				{@const item = line[index]!}
				{@const current = index === last && lineEndsOnPage ? 'page' : undefined}
				{#if item.href}
					<a
						class="row"
						role="menuitem"
						tabindex="-1"
						data-level={index}
						href={item.href}
						aria-current={current}
						onclick={() => close()}>{item.label}</a
					>
				{:else}
					<span
						class="row"
						role="menuitem"
						tabindex="-1"
						aria-disabled="true"
						aria-current={current}
						data-level={index}>{item.label}</span
					>
				{/if}
			{/each}
		</div>
	{/if}

	<!-- The ruler: every crumb at its natural width, the … button with its
	     separator and alone, and the first crumb as its icon, out of sight. -->
	<div class="ruler" aria-hidden="true" inert>
		<ol class="trail" bind:this={ruler}>
			{#each line as item, index}
				<li class="crumb" data-measure="crumb" data-index={index}>
					{#if index > 0}{@render separator(item.icon)}{/if}
					<span class="breadcrumb-title">{@render words(item, index, false)}</span>
				</li>
			{/each}
			<li class="crumb" data-measure="more">
				{@render separator(line[1]?.icon)}
				<span class="breadcrumb-title more-button">…</span>
			</li>
			<li class="crumb" data-measure="more-lead">
				<span class="breadcrumb-title more-button">…</span>
			</li>
			{#if line[0]?.icon}
				{@const Icon = line[0].icon}
				<li class="crumb" data-measure="first-compact">
					<span class="breadcrumb-title"
						><Icon class="breadcrumb-section-icon" aria-hidden="true" /></span
					>
				</li>
			{/if}
		</ol>
	</div>
</nav>

<style>
	.gawdux-breadcrumbs {
		position: relative;
		display: flex;
		flex: 1 1 0%;
		align-items: center;
		min-width: 0;
	}

	/* One line: the trail never wraps, and a crumb's words never break. */
	.trail {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		min-width: 0;
		margin: 0;
		padding: 0;
		list-style: none;
		white-space: nowrap;
		/* A last guard: the plan keeps the trail inside its box, and past the
		   narrowest it can go the overflow stops at the box's edge instead of
		   running under the controls beside it. Clip, not hidden: no scroll
		   container, and nothing is cut above or below. */
		overflow-x: clip;
	}

	.crumb {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		min-width: 0;
	}

	/* The crumb the plan cuts last (the current page on one line, its parent
	   on two) alone gives up width, never below its readable minimum (its own
	   width up to 64px), which the plan sets. Past it the trail's box clips
	   the end. */
	.crumb.cuts {
		flex: 0 1 auto;
		min-width: var(--gawdux-breadcrumb-leaf-min, 0px);
	}

	.breadcrumb-title {
		display: inline-flex;
		align-items: center;
		min-width: 0;
		max-width: 100%;
		text-decoration: none;
	}

	.breadcrumb-label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* A word of the current page never breaks inside itself. */
	.word {
		white-space: nowrap;
	}

	/* The … button reads as a crumb (the title's type and ink) and lifts on
	   hover and while its menu is open, the way a menu row does. */
	.more-button {
		box-sizing: border-box;
		justify-content: center;
		min-width: 1.75rem;
		height: 1.75rem;
		margin: 0;
		padding: 0 0.375rem;
		border: 0;
		border-radius: 6px;
		background: none;
		font-family: inherit;
		cursor: pointer;
		appearance: none;
		transition: background-color 100ms ease-out;
	}
	.more-button:hover,
	.more-button[aria-expanded='true'] {
		background-color: var(--gawdux-menu-item-hover);
	}
	.more-button:focus {
		outline: none;
	}
	.more-button:focus-visible {
		outline: 2px solid var(--gawdux-focus-ring);
		outline-offset: -2px;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	/* ── The current page alone at the compact width (layout "adaptive") ────
	   The row is a 44px target naming the page on one line; the one-line
	   trail is not drawn there, and above the compact width the row is not. */
	.page-row {
		display: none;
	}
	.page-button {
		box-sizing: border-box;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		min-width: 0;
		max-width: 100%;
		min-height: 44px;
		margin: 0;
		padding: 0 0.5rem 0 0;
		border: 0;
		border-radius: 6px;
		background: none;
		font-family: inherit;
		font-size: 1rem;
		line-height: 1.5rem;
		text-align: left;
		appearance: none;
	}
	button.page-button {
		cursor: pointer;
	}
	/* The section's icon before the page's name, 8px from it, in the colour
	   the line's first crumb draws it. */
	.page-button :global(.page-section-icon) {
		flex: 0 0 auto;
		margin-inline-end: 0.25rem;
		color: var(--gawdux-text-heading);
	}
	:global(.dark) .page-button :global(.page-section-icon) {
		color: var(--gawdux-text-secondary);
	}
	button.page-button:focus {
		outline: none;
	}
	button.page-button:focus-visible {
		outline: 2px solid var(--gawdux-focus-ring);
		outline-offset: -2px;
	}
	/* One line: a name too long for the row ends in an ellipsis. */
	.page-name {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.page-button :global(.page-chevron) {
		flex: 0 0 auto;
		width: 1rem;
		height: 1rem;
		color: var(--gawdux-text-muted);
		transition: transform 150ms ease-out;
	}
	.page-button[aria-expanded='true'] :global(.page-chevron) {
		transform: rotate(180deg);
	}
	@media (max-width: 1024px) {
		.gawdux-breadcrumbs[data-layout='adaptive'] > .trail {
			display: none;
		}
		.gawdux-breadcrumbs[data-layout='adaptive'] > .page-row {
			display: flex;
			align-items: center;
			min-width: 0;
			max-width: 100%;
		}
	}

	/* The path: the house dropdown under the row, inside the screen's gutter,
	   scrolling inside itself. Every name reads whole, wrapping between its
	   words. */
	.menu.path {
		left: 0.5rem;
		right: 0.5rem;
		max-width: none;
		max-height: calc(100dvh - 8rem);
		overflow-y: auto;
	}
	/* A phone's target: every level is 44px tall at least. */
	.menu.path .row {
		display: block;
		min-height: 44px;
		padding-block: 12px;
		overflow-wrap: normal;
	}

	/* ── The menu: the house dropdown (UserMenu's surface and rows) ────────── */
	.menu {
		position: fixed;
		z-index: 60;
		box-sizing: border-box;
		min-width: 12rem;
		max-width: min(24rem, calc(100vw - 2rem));
		padding: 4px;
		border: 1px solid var(--gawdux-border);
		border-radius: 8px;
		background-color: var(--gawdux-menu-surface);
		box-shadow:
			0 10px 24px -6px rgb(0 0 0 / 0.14),
			0 2px 4px rgb(0 0 0 / 0.05);
		text-align: left;
		white-space: normal;
	}
	:global(.dark) .menu {
		box-shadow:
			0 12px 28px -6px rgb(0 0 0 / 0.65),
			0 2px 4px rgb(0 0 0 / 0.4);
	}
	.menu:focus {
		outline: none;
	}

	/* A long name wraps inside its row: the menu is where it reads in full. */
	.row {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 32px;
		padding: 6px 8px;
		border-radius: 6px;
		color: var(--gawdux-text-primary);
		font-size: 13px;
		font-weight: 500;
		line-height: 20px;
		text-decoration: none;
		overflow-wrap: anywhere;
		transition: background-color 100ms ease-out;
	}
	a.row {
		cursor: pointer;
	}
	/* One highlighted row: the focused one, which the pointer moves. */
	a.row:focus {
		outline: none;
		background-color: var(--gawdux-menu-item-hover);
	}
	/* The keyboard's ring; a pointer-driven focus shows the fill alone. */
	.menu[data-input='keyboard'] a.row:focus-visible {
		outline: 2px solid var(--gawdux-focus-ring);
		outline-offset: -2px;
	}
	.row[aria-disabled='true'] {
		color: var(--gawdux-text-muted);
		cursor: default;
	}
	.row[aria-disabled='true']:focus {
		outline: none;
	}
	/* The current level carries the house's selected row (the tint and the
	   accent's text), as a sidebar's current page does, focused or not. */
	.row[aria-current='page'],
	a.row[aria-current='page']:focus {
		color: var(--gawdux-row-selected-text);
		background-color: var(--gawdux-row-selected-surface);
	}

	/* ── The ruler: laid out, never painted, never in the page's size ──────── */
	.ruler {
		position: absolute;
		top: 0;
		left: 0;
		width: 0;
		height: 0;
		overflow: hidden;
		visibility: hidden;
		pointer-events: none;
	}
	.ruler .trail {
		width: max-content;
	}
</style>
