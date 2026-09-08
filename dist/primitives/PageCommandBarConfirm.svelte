<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import PageCommandBarCenter from './PageCommandBarCenter.svelte';

	/**
	 * A decision the operator makes at the command bar, the way every
	 * command surface opens: a drawer rises out of the bar and carries the
	 * question, while Cancel / Confirm take the bar's center zone in place of
	 * the page's action buttons (the newest center registration wins, so the
	 * page's buttons return the moment the decision closes). Mount it where
	 * the page's content ends, so the drawer sits between the content surface
	 * and the bar. Escape cancels; focus lands on Confirm and returns to
	 * `focusTarget` (or `focusFallback()`) when the decision closes.
	 */
	let {
		title = null,
		message,
		error = null,
		live = null,
		kind = null,
		cancelLabel = 'Cancel',
		code = null,
		confirmLabel,
		busyLabel = 'Applying…',
		confirmColor = 'red',
		busy = false,
		disabled = false,
		focusTarget = null,
		focusFallback,
		onconfirm,
		oncancel
	}: {
		// Optional props accept `undefined` explicitly so consumers compiled
		// with exactOptionalPropertyTypes can forward their own optionals.
		title?: string | null | undefined;
		message: string;
		/** Shown under the message, in the error tone, until the next attempt. */
		error?: string | null | undefined;
		/** `status` announces the message politely (a result to acknowledge). */
		live?: 'status' | null | undefined;
		/** Free-form tag for the decision (`data-kind`), for tests and styling hooks. */
		kind?: string | null | undefined;
		/** null hides Cancel: a result the operator only acknowledges. */
		cancelLabel?: string | null | undefined;
		/** A value to hand over (an access code), shown selectable under the message. */
		code?: string | null | undefined;
		confirmLabel: string;
		busyLabel?: string | undefined;
		confirmColor?: 'red' | 'green' | 'blue' | undefined;
		busy?: boolean | undefined;
		disabled?: boolean | undefined;
		focusTarget?: HTMLElement | null | undefined;
		focusFallback?: (() => HTMLElement | null) | undefined;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();

	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	const messageId = `${componentId}-message`;
	let dispatched = false;
	let priorBusy = false;
	let priorError: string | null = null;
	let focusRestored = false;
	let restoreTarget: HTMLElement | null | undefined;
	let restoreFallback: (() => HTMLElement | null) | undefined;

	// A host can clear its request before the deferred unmount callback runs.
	// Retain these inputs while mounted instead of reading its dead prop getters.
	$effect(() => {
		restoreTarget = focusTarget;
		restoreFallback = focusFallback;
	});

	function confirmButton(): HTMLButtonElement | null {
		return document.querySelector<HTMLButtonElement>(
			`button[data-action-confirm][data-confirm-for="${componentId}"]`
		);
	}

	$effect(() => {
		void tick().then(() => confirmButton()?.focus());
	});

	// A finished attempt (busy ended) or a new reason (error changed) re-arms
	// Confirm and puts focus back on it, so a retry is one keystroke away.
	$effect(() => {
		const currentBusy = busy;
		const currentError = error;
		if ((priorBusy && !currentBusy) || (currentError && currentError !== priorError)) {
			dispatched = false;
		}
		if ((priorBusy && !currentBusy) || currentError !== priorError) {
			void tick().then(() => confirmButton()?.focus());
		}
		priorBusy = currentBusy;
		priorError = currentError;
	});

	function restoreFocus() {
		if (focusRestored) return;
		focusRestored = true;
		const target = restoreTarget?.isConnected ? restoreTarget : restoreFallback?.();
		if (target?.isConnected && !target.matches(':disabled')) {
			target.focus({ preventScroll: true });
		}
	}

	onDestroy(() => {
		void tick().then(restoreFocus);
	});

	function cancel() {
		if (busy) return;
		oncancel();
		// The invoking control gets focus back at once: the host may keep the
		// decision mounted for a moment, and the operator should not wait.
		void tick().then(restoreFocus);
	}

	function confirm() {
		if (busy || disabled || dispatched) return;
		dispatched = true;
		const acknowledgement = !cancelLabel;
		onconfirm();
		// An acknowledgement (no Cancel offered) closes on Confirm, so the
		// invoking control gets focus back exactly as a cancel would give it.
		if (acknowledgement) void tick().then(restoreFocus);
	}

	function onKeydown(event: KeyboardEvent) {
		if (busy || event.isComposing || event.key !== 'Escape') return;
		event.preventDefault();
		cancel();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<section
	class="page-command-drawer"
	role="group"
	data-workflow-role="command-drawer"
	data-confirmation-command
	data-kind={kind ?? undefined}
	aria-labelledby={title ? titleId : undefined}
	aria-describedby={messageId}
	aria-busy={busy}
>
	{#if title}
		<h3 id={titleId} class="page-command-drawer-title">{title}</h3>
	{/if}
	<p id={messageId} class="page-command-drawer-message" role={live ?? undefined}>
		{message}
	</p>
	{#if code}
		<code class="page-command-drawer-code select-all" data-access-code>{code}</code>
	{/if}
	{#if error}
		<p class="page-command-drawer-error" role="alert">{error}</p>
	{/if}
	<!-- Without a bar host (tests, previews) the buttons render here. -->
	<PageCommandBarCenter>
		{#if cancelLabel}
			<Button outline color="red" data-action-cancel disabled={busy} onclick={cancel}>
				{cancelLabel}
			</Button>
		{/if}
		<Button
			outline
			color={confirmColor}
			data-action-confirm
			data-confirm-for={componentId}
			aria-describedby={messageId}
			disabled={busy || disabled}
			onclick={confirm}
		>
			{busy ? busyLabel : confirmLabel}
		</Button>
	</PageCommandBarCenter>
</section>
