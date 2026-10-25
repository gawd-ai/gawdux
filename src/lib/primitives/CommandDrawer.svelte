<!--
	CommandDrawer — the strip that opens against the bottom command bar.

	## What this is, and why it exists

	Consuming apps kept re-writing the same drawer. At the time this was lifted,
	FIVE components across two products carried a byte-identical copy of the
	chrome and the focus discipline below:

	  ConfirmationCommandSurface        (this library)
	  DiscardNavigationCommandSurface   (this library)
	  MemberInviteCommandSurface        (product)
	  UserDetailCommandSurface          (product)
	  RoleConfirmationCommandSurface    (product)

	Each repeated the same class string, the same `data-workflow-role`, the same
	Escape handler, the same focus-in / restore-out dance, and the same
	narrow-viewport height cap. Only the BODY ever differed. So the body is the
	snippet and everything else lives here.

	## The layout contract (the part that is easy to get wrong)

	This renders an ordinary `shrink-0` element wherever the consumer puts it.
	It is NOT portaled and it does NOT position itself. It looks welded to the
	command bar because of how the app shell is built:

	  <main> is a flex column; the page's own column stretches (flex: 1);
	  the drawer is a `shrink-0` sibling AFTER that column;
	  `.page-command-bar` is the LAST child of <main> with `margin-top: auto`.

	Render it inside a scrolling container instead and it will scroll away from
	the bar it belongs to. If a host needs it elsewhere, fix the shell — do not
	reach for a portal.

	The `attached` variant renders the house `.page-command-drawer` (tokens.css),
	the same element `PageCommandBarConfirm` renders: the bar loses its top edge
	while one is open, so drawer and bar read as one panel that opened up out of
	the bar. Its text is centred like every bar decision; a form body sets
	`text-left` on itself. Titles, messages and errors inside it use
	`.page-command-drawer-title`, `-message` and `-error`. The `card` variant
	keeps its own rounded panel floating just above the bar.

	## Focus

	On open: remember whatever had focus, then move focus into the drawer
	(`autoFocusSelector`, defaulting to the primary action). On close: give it
	back — but only if that element is still connected and still enabled, since
	the usual opener is a bar trigger that goes `disabled` while the drawer is
	up and is re-enabled by the same state flip that closed it.

	`open` is owned by the CONSUMER and never written here. A local write to a
	one-way prop is reverted by the parent's next render, which fails silently:
	the drawer opens and then cannot be dismissed, with no console error.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import type { Snippet } from 'svelte';

	let {
		open = false,
		labelledBy = undefined,
		describedBy = undefined,
		busy = false,
		/** Focused on open. Defaults to the primary action, per the shared attribute convention. */
		autoFocusSelector = 'button[data-action-confirm]',
		/** Narrow-viewport height cap. Bodies with a form want more room than a confirmation. */
		maxHeight = '20rem',
		/**
		 * `attached` — the house `.page-command-drawer`, fused with the bar.
		 * `card`     — a rounded panel floating just above it.
		 */
		variant = 'attached',
		/** Escape closes unless this is false — a busy surface should not vanish mid-write. */
		dismissible = true,
		class: className = '',
		onclose,
		children,
		/**
		 * Everything else lands on the <section>. Consumers identify their own
		 * surface with a data attribute (`data-confirmation-command`), and that
		 * marker must sit on the SAME element as the aria wiring — a test caught
		 * them drifting onto different nodes when this was first extracted.
		 */
		...rest
	}: {
		open?: boolean;
		labelledBy?: string | undefined;
		describedBy?: string | undefined;
		busy?: boolean;
		autoFocusSelector?: string;
		maxHeight?: string;
		variant?: 'attached' | 'card';
		dismissible?: boolean;
		class?: string;
		onclose?: (() => void) | undefined;
		children: Snippet;
		[key: string]: unknown;
	} = $props();

	let drawerEl = $state<HTMLElement | null>(null);
	let restoreFocusTo: HTMLElement | null = null;
	let wasOpen = false;

	function focusInside() {
		const target =
			drawerEl?.querySelector<HTMLElement>(autoFocusSelector) ??
			drawerEl?.querySelector<HTMLElement>(
				'input, select, textarea, button:not([data-action-cancel])'
			);
		target?.focus();
	}

	$effect(() => {
		if (open && !wasOpen) {
			wasOpen = true;
			if (document.activeElement instanceof HTMLElement) {
				restoreFocusTo = document.activeElement;
			}
			void tick().then(focusInside);
			return;
		}
		if (!open && wasOpen) {
			wasOpen = false;
			const target = restoreFocusTo;
			restoreFocusTo = null;
			void tick().then(() => {
				if (target?.isConnected && !target.matches(':disabled')) {
					target.focus({ preventScroll: true });
				}
			});
		}
	});

	function onKeydown(event: KeyboardEvent) {
		if (!open || !dismissible || busy || event.isComposing || event.key !== 'Escape') return;
		event.preventDefault();
		onclose?.();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<section
		bind:this={drawerEl}
		{...rest}
		data-workflow-role="command-drawer"
		aria-labelledby={labelledBy}
		aria-describedby={describedBy}
		aria-busy={busy || undefined}
		style:--command-drawer-max-height={maxHeight}
		class="command-drawer command-drawer--{variant} {variant === 'card'
			? 'shrink-0 border border-gray-200 bg-gray-50/95 px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/95'
			: 'page-command-drawer'} {className}"
	>
		{@render children()}
	</section>
{/if}

<style>
	.command-drawer--card {
		border-radius: 0.5rem;
	}

	/*
	  Narrow viewports: cap the height and let the body scroll inside itself, so
	  a drawer with a form can never push the command bar off-screen — the bar is
	  where its own confirm/cancel live. `overscroll-behavior` stops the scroll
	  chaining out to the page behind it.
	*/
	@media (max-width: 1024px) {
		.command-drawer {
			max-height: min(45dvh, var(--command-drawer-max-height, 20rem));
			overflow-y: auto;
			overscroll-behavior: contain;
			padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
		}

		.command-drawer :global(button) {
			min-height: 44px;
		}
	}
</style>
