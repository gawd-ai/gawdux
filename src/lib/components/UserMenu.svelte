<!--
	@component
	The account menu of an app shell's top bar. Closed, it is a card showing who
	is signed in: an avatar, the name and the email on two lines, a chevron.
	Open, the same card grows downward over the page to show the tenant and the
	access chips, the account's rows, sign-out and the product's version.

	Geometry. The root is its own spacer, 44px tall, as wide as the trigger's
	content between `--gawdux-user-menu-min-width` and `--gawdux-user-menu-width`,
	so the toolbar never reflows and the card holds no dead space. The open body
	never widens the card (`contain: inline-size`): a long tenant truncates. The
	trigger is identical open and closed (same colours, same boxes), so opening
	never moves or recolours the avatar or the text; the card lifts (border,
	shadow, the raised menu surface) on hover and while open. Below
	`compactBelow` the closed card is the avatar alone; open, the panel grows to
	the left from the avatar, which stays where it was (the trigger row is
	mirrored), and never past the 16px gutter on the left.

	Keyboard: the WAI-ARIA menu button pattern. Enter, Space or ArrowDown on the
	trigger opens and focuses the first row, ArrowUp the last; in the menu the
	arrows wrap, Home and End jump, Escape closes and returns focus to the
	trigger, Tab closes and lets focus move on. Pointer: click toggles, the row
	under the pointer takes the focus (one highlighted row, never two), an
	outside press closes, leaving the card closes after a short grace when the
	pointer opened it. The menu also closes when the focus leaves it and on a
	history navigation (popstate).

	Styling is scoped CSS over the --gawdux-* tokens, never Tailwind utilities,
	so a host whose Tailwind does not scan this package still renders it styled.
-->
<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { ArrowRightToBracketOutline } from 'flowbite-svelte-icons';
	import type { UserMenuProps } from '../types/user-menu.types';

	let {
		name,
		email = '',
		initials,
		avatarSrc,
		tenant,
		access = [],
		accessLabel,
		items = [],
		extraItems,
		signOutAction,
		signOutEnhance,
		onsignout,
		signOutLabel = 'Sign out',
		product,
		version,
		versionTitle,
		mark,
		footer,
		label,
		compactBelow = 768,
		id = 'gawdux-user-menu',
		open = $bindable(false),
		onopenchange
	}: UserMenuProps = $props();

	/** Grace before a pointer that left the card closes it; re-entering cancels. */
	const LEAVE_GRACE_MS = 150;
	/** The open compact panel stops this far from the viewport's left edge. */
	const GUTTER_PX = 16;

	let root = $state<HTMLElement>();
	let trigger = $state<HTMLButtonElement>();
	let menu = $state<HTMLElement>();
	let body = $state<HTMLElement>();
	let failedAvatar = $state<string>();
	/** The room to the left of the root's right edge, for the open compact panel. */
	let room = $state<number>();
	/** The menu's last input was the pointer: the focused row shows no ring. */
	let pointerInput = $state(false);
	/** How the menu was opened: only a pointer-opened menu closes when the pointer leaves. */
	let openedBy: 'pointer' | 'keyboard' = 'pointer';
	let leaveTimer: ReturnType<typeof setTimeout> | undefined;

	function deriveInitials(value: string): string {
		const words = value.trim().split(/\s+/).filter(Boolean);
		const first = words[0];
		if (!first) return '';
		const letter = (word: string) => (Array.from(word)[0] ?? '').toUpperCase();
		if (words.length === 1) return letter(first);
		return letter(first) + letter(words[words.length - 1] ?? first);
	}

	const avatarText = $derived(initials?.trim() || deriveInitials(name));
	const showImage = $derived(Boolean(avatarSrc) && failedAvatar !== avatarSrc);
	/** A host without a name passes the email as the name: never show it twice. */
	const secondLine = $derived(email && email.trim() !== name.trim() ? email : '');
	const hasSignOut = $derived(Boolean(signOutAction || onsignout));
	const hasRows = $derived(items.length > 0 || Boolean(extraItems));
	const hasMenu = $derived(hasRows || hasSignOut);
	const hasContext = $derived(Boolean(tenant) || access.length > 0);
	const hasFooter = $derived(Boolean(footer || mark || product || version));
	const triggerLabel = $derived(label ?? `Account menu for ${name}`);
	const compactClass = $derived(
		compactBelow === 1024 ? 'compact-1024' : compactBelow === 768 ? 'compact-768' : ''
	);

	function clearLeave() {
		if (leaveTimer !== undefined) clearTimeout(leaveTimer);
		leaveTimer = undefined;
	}

	function setOpen(next: boolean) {
		clearLeave();
		if (open === next) return;
		open = next;
		onopenchange?.(next);
	}

	function focusInBody(): boolean {
		return Boolean(body?.contains(document.activeElement));
	}

	/**
	 * Closes the menu. `focusTrigger` returns the focus to the trigger (Escape, a
	 * button row, a pointer leaving the rows it focused): the closed body is
	 * inert, so focus left in it would fall to the document.
	 */
	function close(focusTrigger = false) {
		setOpen(false);
		if (focusTrigger) trigger?.focus({ preventScroll: true });
	}

	function rows(): HTMLElement[] {
		if (!menu) return [];
		return Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]')).filter(
			(row) => !row.hasAttribute('disabled') && row.getAttribute('aria-disabled') !== 'true'
		);
	}

	function focusRow(index: number) {
		const list = rows();
		if (list.length === 0) return;
		const wrapped = ((index % list.length) + list.length) % list.length;
		// preventScroll: the rows sit in a clipped box that is still growing, and a
		// scrolled-into-view focus would shift its content for the whole animation.
		list[wrapped]?.focus({ preventScroll: true });
	}

	function measureRoom() {
		if (!root) return;
		const right = root.getBoundingClientRect().right;
		// A layout-less environment (no right edge) keeps the CSS fallback.
		room = right > GUTTER_PX ? Math.floor(right - GUTTER_PX) : undefined;
	}

	async function openFromKeyboard(target: 'first' | 'last') {
		openedBy = 'keyboard';
		pointerInput = false;
		setOpen(true);
		// The body is inert until the open state reaches the DOM.
		await tick();
		focusRow(target === 'first' ? 0 : -1);
	}

	function onTriggerClick(event: MouseEvent) {
		// detail 0 is a click the keyboard (Enter, Space) or assistive technology
		// produced: open into the rows. A pointer click toggles and leaves the focus.
		if (event.detail === 0) {
			if (open) close();
			else void openFromKeyboard('first');
			return;
		}
		openedBy = 'pointer';
		pointerInput = true;
		setOpen(!open);
	}

	function onTriggerKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			void openFromKeyboard('first');
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			void openFromKeyboard('last');
		}
	}

	function onMenuKeydown(event: KeyboardEvent) {
		const list = rows();
		const current = list.indexOf(document.activeElement as HTMLElement);
		// Any key hands the menu to the keyboard: the ring returns, and the pointer
		// leaving no longer closes it.
		openedBy = 'keyboard';
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
			case ' ':
				// A link row activates on Space like a button row does.
				if (document.activeElement instanceof HTMLAnchorElement) {
					event.preventDefault();
					document.activeElement.click();
				}
				break;
			case 'Tab':
				close();
				break;
		}
	}

	/**
	 * The row under the pointer takes the focus, so the hover and the keyboard
	 * share one highlighted row; between rows the menu itself holds the focus.
	 */
	function onMenuPointerMove(event: PointerEvent) {
		if (event.pointerType === 'touch' || !menu) return;
		pointerInput = true;
		const target = event.target instanceof Element ? event.target : null;
		const row = target?.closest<HTMLElement>('[role="menuitem"]');
		if (row && rows().includes(row)) {
			if (document.activeElement !== row) row.focus({ preventScroll: true });
		} else if (focusInBody() && document.activeElement !== menu) {
			menu.focus({ preventScroll: true });
		}
	}

	function onMenuPointerLeave(event: PointerEvent) {
		if (event.pointerType === 'touch' || !menu) return;
		if (focusInBody() && document.activeElement !== menu) menu.focus({ preventScroll: true });
	}

	/** A link row closes the menu and lets the navigation take the focus. */
	function chooseLink(event: MouseEvent, handler: ((event: MouseEvent) => void) | undefined) {
		handler?.(event);
		close();
	}

	/**
	 * A button row closes first and puts the focus back on the trigger when it
	 * was in the rows, so a handler that opens a dialog can still take the focus.
	 */
	function chooseButton(event: MouseEvent, handler: ((event: MouseEvent) => void) | undefined) {
		close(focusInBody());
		handler?.(event);
	}

	function onPanelPointerLeave(event: PointerEvent) {
		if (event.pointerType === 'touch' || !open || openedBy !== 'pointer') return;
		clearLeave();
		leaveTimer = setTimeout(() => close(focusInBody()), LEAVE_GRACE_MS);
	}

	/** The focus moving to something outside the menu closes it (Tab, a script). */
	function onRootFocusOut(event: FocusEvent) {
		if (!open) return;
		const next = event.relatedTarget;
		// null is the window losing focus, or a press on nothing focusable, which
		// the outside press handles.
		if (!(next instanceof Node) || root?.contains(next)) return;
		close();
	}

	function enhanceSignOut(form: HTMLFormElement) {
		return signOutEnhance?.(form);
	}

	// Escape, the outside press, a history navigation and a resize are listened
	// for only while the menu is open.
	$effect(() => {
		if (!open) return;
		measureRoom();
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape' || event.defaultPrevented) return;
			event.preventDefault();
			// Return the focus only when it was ours or nobody's: never pull it
			// back from a control the person moved to.
			const active = document.activeElement;
			const ours = !active || active === document.body || Boolean(root?.contains(active));
			close(ours);
		};
		const onPointerdown = (event: PointerEvent) => {
			if (root && !root.contains(event.target as Node)) close();
		};
		const onPopstate = () => close();
		const onResize = () => measureRoom();
		window.addEventListener('keydown', onKeydown);
		window.addEventListener('popstate', onPopstate);
		window.addEventListener('resize', onResize);
		document.addEventListener('pointerdown', onPointerdown, true);
		return () => {
			window.removeEventListener('keydown', onKeydown);
			window.removeEventListener('popstate', onPopstate);
			window.removeEventListener('resize', onResize);
			document.removeEventListener('pointerdown', onPointerdown, true);
		};
	});

	onDestroy(clearLeave);
</script>

<div
	class="gawdux-user-menu {compactClass}"
	data-user-menu
	data-state={open ? 'open' : 'closed'}
	style:--gawdux-user-menu-room={room === undefined ? undefined : `${room}px`}
	bind:this={root}
	onfocusout={onRootFocusOut}
>
	<div
		class="panel"
		class:open
		role="presentation"
		onpointerenter={clearLeave}
		onpointerleave={onPanelPointerLeave}
	>
		<button
			type="button"
			class="trigger"
			id="{id}-trigger"
			bind:this={trigger}
			aria-haspopup="menu"
			aria-expanded={open}
			aria-controls={hasMenu ? `${id}-menu` : `${id}-body`}
			aria-label={triggerLabel}
			onclick={onTriggerClick}
			onkeydown={onTriggerKeydown}
		>
			<span class="avatar" aria-hidden="true">
				{#if showImage}
					<img src={avatarSrc} alt="" onerror={() => (failedAvatar = avatarSrc)} />
				{:else}
					{avatarText}
				{/if}
			</span>
			<span class="identity">
				<span class="name">{name}</span>
				{#if secondLine}<span class="email">{secondLine}</span>{/if}
			</span>
			<svg class="chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
				<path
					fill-rule="evenodd"
					d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>

		<div class="body" id="{id}-body" inert={!open} bind:this={body}>
			<div class="body-inner">
				<div class="rule" aria-hidden="true"></div>

				{#if hasContext}
					<!-- Who you are here: a statement, not a row. It sits on the text
					     column with no icon and no hover, the access chips right after
					     the tenant they qualify; the menu is described by it. -->
					<div class="context" id="{id}-context" data-user-menu-context>
						<!-- The spaces and the hidden comma are for the description a screen
						     reader reads ("Concord, Owner"); a flex box ignores them. -->
						{#if tenant}<span class="tenant" title={tenant}>{tenant}</span
							>{#if access.length > 0}<span class="visually-hidden">,</span>{/if}{/if}
						{#if access.length > 0}
							<span class="access">
								{#if accessLabel}<span class="access-label">{accessLabel}</span>{' '}{/if}
								{#each access as chip, index (`${index}:${chip}`)}<span class="chip">{chip}</span
									>{' '}{/each}
							</span>
						{/if}
					</div>
					{#if hasMenu}<div class="rule" aria-hidden="true"></div>{/if}
				{/if}

				{#if hasMenu}
					<div
						class="menu"
						id="{id}-menu"
						role="menu"
						tabindex="-1"
						aria-labelledby="{id}-trigger"
						aria-describedby={hasContext ? `${id}-context` : undefined}
						data-input={pointerInput ? 'pointer' : 'keyboard'}
						bind:this={menu}
						onkeydown={onMenuKeydown}
						onpointermove={onMenuPointerMove}
						onpointerleave={onMenuPointerLeave}
					>
						{#each items as item (item.id ?? item.label)}
							{@const Icon = item.icon}
							{#if item.href}
								<a
									class="gawdux-user-menu-item"
									href={item.href}
									role="menuitem"
									tabindex="-1"
									onclick={(event) => chooseLink(event, item.onclick)}
								>
									<span class="gawdux-user-menu-icon" aria-hidden="true">
										{#if Icon}<Icon />{/if}
									</span>
									<span class="gawdux-user-menu-label">{item.label}</span>
								</a>
							{:else}
								<button
									type="button"
									class="gawdux-user-menu-item"
									role="menuitem"
									tabindex="-1"
									onclick={(event) => chooseButton(event, item.onclick)}
								>
									<span class="gawdux-user-menu-icon" aria-hidden="true">
										{#if Icon}<Icon />{/if}
									</span>
									<span class="gawdux-user-menu-label">{item.label}</span>
								</button>
							{/if}
						{/each}

						{@render extraItems?.({ close })}

						{#if hasSignOut}
							{#if hasRows}<div class="separator" role="separator"></div>{/if}
							{#if signOutAction}
								<form
									class="sign-out"
									method="POST"
									action={signOutAction}
									role="none"
									use:enhanceSignOut
								>
									<button
										type="submit"
										class="gawdux-user-menu-item"
										data-tone="danger"
										role="menuitem"
										tabindex="-1"
									>
										<span class="gawdux-user-menu-icon" aria-hidden="true">
											<ArrowRightToBracketOutline />
										</span>
										<span class="gawdux-user-menu-label">{signOutLabel}</span>
									</button>
								</form>
							{:else}
								<button
									type="button"
									class="gawdux-user-menu-item"
									data-tone="danger"
									role="menuitem"
									tabindex="-1"
									onclick={(event) => chooseButton(event, onsignout)}
								>
									<span class="gawdux-user-menu-icon" aria-hidden="true">
										<ArrowRightToBracketOutline />
									</span>
									<span class="gawdux-user-menu-label">{signOutLabel}</span>
								</button>
							{/if}
						{/if}
					</div>
				{/if}

				{#if hasFooter}
					<div class="rule" aria-hidden="true"></div>
					<div class="footer" data-user-menu-footer title={versionTitle}>
						{#if footer}
							{@render footer()}
						{:else}
							<span class="lead" aria-hidden="true">
								{#if mark}<span class="mark">{@render mark()}</span>{/if}
							</span>
							<!-- One text run, one line box: the mark and the version share a centre line. -->
							<span class="footer-text"
								>{#if product}{product}{/if}{#if product && version}{' '}{/if}{#if version}<span class="version">{version}</span>{/if}</span
							>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	/* ── Root: the spacer, as wide as the trigger's content ─────────────── */
	.gawdux-user-menu {
		position: relative;
		display: flex;
		flex-shrink: 0;
		align-items: flex-start;
		box-sizing: border-box;
		width: max-content;
		min-width: var(--gawdux-user-menu-min-width, 208px);
		max-width: var(--gawdux-user-menu-width, 272px);
		height: 44px;
		text-align: left;
	}

	.panel {
		position: relative;
		z-index: 60;
		box-sizing: border-box;
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
		overflow: clip;
		border: 1px solid transparent;
		border-radius: 8px;
		background-color: var(--gawdux-surface);
		transition:
			border-color 150ms ease-out,
			box-shadow 150ms ease-out,
			background-color 150ms ease-out;
	}
	/* The lift: hover and open alike, so a click never changes the trigger. */
	.panel:hover,
	.panel.open {
		border-color: var(--gawdux-border);
		background-color: var(--gawdux-menu-surface);
		box-shadow:
			0 10px 24px -6px rgb(0 0 0 / 0.14),
			0 2px 4px rgb(0 0 0 / 0.05);
	}
	:global(.dark) .panel:hover,
	:global(.dark) .panel.open {
		box-shadow:
			0 12px 28px -6px rgb(0 0 0 / 0.65),
			0 2px 4px rgb(0 0 0 / 0.4);
	}

	/* ── Trigger: identical open and closed ─────────────────────────────── */
	.trigger {
		box-sizing: border-box;
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 10px;
		width: 100%;
		height: 42px;
		margin: 0;
		padding: 0 10px 0 7px;
		border: 0;
		border-radius: 7px;
		background: none;
		color: inherit;
		font: inherit;
		text-align: left;
		cursor: pointer;
		appearance: none;
	}
	.trigger:focus {
		outline: none;
	}
	.trigger:focus-visible {
		outline: 2px solid var(--gawdux-focus-ring);
		outline-offset: -2px;
	}

	.avatar {
		box-sizing: border-box;
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 28px;
		height: 28px;
		overflow: hidden;
		border-radius: 6px;
		background-color: var(--gawdux-avatar-surface);
		color: var(--gawdux-avatar-text);
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.02em;
	}
	.avatar img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.identity {
		display: flex;
		flex: 1 1 auto;
		flex-direction: column;
		min-width: 0;
	}
	.name,
	.email,
	.tenant,
	.footer-text,
	.menu :global(.gawdux-user-menu-label) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.name {
		color: var(--gawdux-text-primary);
		font-size: 13px;
		font-weight: 600;
		line-height: 16px;
	}
	.email {
		color: var(--gawdux-text-muted);
		font-size: 11px;
		line-height: 14px;
	}

	.chevron {
		flex-shrink: 0;
		width: 20px;
		height: 20px;
		color: var(--gawdux-text-muted);
		transition: transform 200ms ease-out;
	}
	.panel.open .chevron {
		transform: rotate(180deg);
	}

	/* ── Body: natural height through a 0fr to 1fr row ──────────────────── */
	.body {
		display: grid;
		grid-template-rows: 0fr;
		/* The open body never widens the card: the trigger alone sizes it. */
		contain: inline-size;
		transition: grid-template-rows 200ms ease-out;
	}
	.panel.open .body {
		grid-template-rows: 1fr;
	}
	/* Every divider is its own element: a border on this 0fr child would leak
	   one pixel into the closed card. */
	.body-inner {
		min-height: 0;
		overflow: hidden;
		overflow: clip;
		opacity: 0;
		transition: opacity 150ms ease-out;
	}
	.panel.open .body-inner {
		opacity: 1;
		transition: opacity 200ms ease-out 40ms;
	}

	/* One divider: full width, one quiet colour, everywhere in the panel. */
	.rule,
	.separator {
		height: 1px;
		background-color: var(--gawdux-menu-divider);
	}

	/* ── Context: the tenant and the access, on the text column ─────────── */
	.context {
		box-sizing: border-box;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px 8px;
		min-height: 36px;
		/* 45px: the text column of the trigger (7 + 28 + 10) and of the rows
		   (4 + 3 + 28 + 10), so the tenant sits under the name. */
		padding: 8px 10px 8px 45px;
		cursor: default;
	}
	.tenant {
		min-width: 0;
		max-width: 100%;
		color: var(--gawdux-text-secondary);
		font-size: 12px;
		font-weight: 500;
		line-height: 20px;
	}
	.access {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		min-width: 0;
	}
	.access-label {
		color: var(--gawdux-text-muted);
		font-size: 11px;
		line-height: 20px;
	}
	.chip {
		flex-shrink: 0;
		padding: 2px 6px;
		border-radius: 4px;
		background-color: var(--gawdux-chip-surface);
		color: var(--gawdux-text-secondary);
		font-size: 11px;
		font-weight: 500;
		line-height: 16px;
		white-space: nowrap;
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

	/* ── Rows ───────────────────────────────────────────────────────────── */
	.menu {
		padding: 4px;
	}
	.menu:focus {
		outline: none;
	}
	.sign-out {
		display: contents;
	}
	.menu :global(.gawdux-user-menu-item) {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		height: 32px;
		margin: 0;
		padding: 0 8px 0 3px;
		border: 0;
		border-radius: 6px;
		background: none;
		color: var(--gawdux-text-primary);
		font: inherit;
		font-size: 13px;
		font-weight: 500;
		line-height: 16px;
		text-align: left;
		text-decoration: none;
		cursor: pointer;
		appearance: none;
		transition: background-color 100ms ease-out;
	}
	/* One highlighted row: the focused one. The pointer moves the focus, so a
	   hovered row and a focused row are the same row. */
	.menu :global(.gawdux-user-menu-item:focus) {
		outline: none;
		background-color: var(--gawdux-menu-item-hover);
	}
	/* The keyboard's ring; a pointer-driven focus shows the fill alone. */
	.menu[data-input='keyboard'] :global(.gawdux-user-menu-item:focus-visible) {
		outline: 2px solid var(--gawdux-focus-ring);
		outline-offset: -2px;
	}
	.menu :global(.gawdux-user-menu-icon) {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 28px;
		height: 16px;
		color: var(--gawdux-text-muted);
		transition: color 100ms ease-out;
	}
	.menu :global(.gawdux-user-menu-icon svg) {
		width: 16px;
		height: 16px;
	}
	.menu :global(.gawdux-user-menu-item:focus .gawdux-user-menu-icon) {
		color: var(--gawdux-text-primary);
	}
	/* Sign-out: red on its icon and its word only; the highlight stays neutral. */
	.menu :global(.gawdux-user-menu-item[data-tone='danger']),
	.menu :global(.gawdux-user-menu-item[data-tone='danger'] .gawdux-user-menu-icon) {
		color: var(--gawdux-text-danger);
	}
	.menu :global(.gawdux-user-menu-label) {
		flex: 1 1 auto;
		min-width: 0;
	}
	/* Full width like every other divider: it cancels the menu's 4px inset. */
	.separator {
		margin: 4px -4px;
	}

	/* ── Footer: the mark and the version on one centre line ────────────── */
	.footer {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 10px;
		height: 32px;
		padding: 0 10px 0 7px;
		color: var(--gawdux-text-muted);
		font-size: 11px;
		font-weight: 500;
		line-height: 16px;
	}
	/* The leading column the avatar and the row icons share: 28px. */
	.lead {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		width: 28px;
		height: 16px;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 16px;
		height: 16px;
		overflow: hidden;
	}
	.footer-text {
		min-width: 0;
	}
	.version {
		font-variant-numeric: tabular-nums;
	}

	/* ── Compact: the avatar alone while closed, and it never moves ─────── */
	@media (max-width: 1023.98px) {
		.compact-1024 {
			width: 44px;
			min-width: 0;
			max-width: none;
		}
		.compact-1024 .panel {
			position: absolute;
			top: 0;
			right: 0;
			width: 100%;
		}
		/* Mirrored: the avatar keeps the right end, where it sat closed, and the
		   panel grows to the left of it. */
		.compact-1024 .trigger {
			flex-direction: row-reverse;
			padding: 0 7px 0 10px;
		}
		.compact-1024 .identity {
			text-align: right;
		}
		.compact-1024 .panel:not(.open) .identity,
		.compact-1024 .chevron {
			display: none;
		}
		.compact-1024 .panel.open {
			width: min(
				var(--gawdux-user-menu-width, 272px),
				var(--gawdux-user-menu-room, calc(100vw - 32px))
			);
		}
	}
	@media (max-width: 767.98px) {
		.compact-768 {
			width: 44px;
			min-width: 0;
			max-width: none;
		}
		.compact-768 .panel {
			position: absolute;
			top: 0;
			right: 0;
			width: 100%;
		}
		.compact-768 .trigger {
			flex-direction: row-reverse;
			padding: 0 7px 0 10px;
		}
		.compact-768 .identity {
			text-align: right;
		}
		.compact-768 .panel:not(.open) .identity,
		.compact-768 .chevron {
			display: none;
		}
		.compact-768 .panel.open {
			width: min(
				var(--gawdux-user-menu-width, 272px),
				var(--gawdux-user-menu-room, calc(100vw - 32px))
			);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.panel,
		.chevron,
		.body,
		.body-inner,
		.panel.open .body-inner,
		.menu :global(.gawdux-user-menu-item),
		.menu :global(.gawdux-user-menu-icon) {
			transition: none;
		}
	}
</style>
