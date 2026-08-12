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

	The upward shadow is deliberate: light from below reads as "belongs to the
	bar", which is what distinguishes this from a card floating over the list.

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
		 * `attached` — a lip on the bar: top border only, shadow cast upward.
		 * `card`     — a rounded panel floating just above it.
		 *
		 * Both shipped before this was lifted; neither is wrong. Confirmations
		 * use `card`, input drawers use `attached`, and preserving that split is
		 * what let existing surfaces adopt this with no visual change.
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
		class="command-drawer command-drawer--{variant} shrink-0 border-gray-200 bg-gray-50/95 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/95 {variant ===
		'card'
			? 'border shadow-sm'
			: 'border-t'} {className}"
	>
		{@render children()}
	</section>
{/if}

<style>
	.command-drawer--attached {
		box-shadow: 0 -8px 20px -18px rgba(15, 23, 42, 0.8);
	}

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
