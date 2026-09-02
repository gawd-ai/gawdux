<script lang="ts">
	import { getContext, onDestroy, tick } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import { PAGE_COMMAND_BAR_CONTEXT, type PageCommandBarContext } from './page-chrome';

	/**
	 * A decision the operator makes IN the command bar. While it is mounted
	 * the bar shows only this: the question, centered where the eyes already
	 * are, and Cancel / Confirm where the action buttons were. It is the same
	 * move as Edit swapping to Cancel / Save, so every confirmation in the
	 * app opens the same way. Escape cancels; focus lands on Confirm and
	 * returns to `focusTarget` (or `focusFallback()`) when the decision closes.
	 */
	let {
		title = null,
		message,
		error = null,
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
		title?: string | null;
		message: string;
		/** Replaces the message, in the error tone, until the next attempt. */
		error?: string | null;
		/** null hides Cancel: a result the operator only acknowledges. */
		cancelLabel?: string | null;
		/** A value to hand over (an access code), shown selectable beside the message. */
		code?: string | null;
		confirmLabel: string;
		busyLabel?: string;
		confirmColor?: 'red' | 'green' | 'blue';
		busy?: boolean;
		disabled?: boolean;
		focusTarget?: HTMLElement | null;
		focusFallback?: () => HTMLElement | null;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();

	const bar = getContext<PageCommandBarContext | undefined>(PAGE_COMMAND_BAR_CONTEXT);
	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	const messageId = `${componentId}-message`;
	let zoneEl = $state<HTMLElement | null>(null);
	let dispatched = false;
	let priorBusy = false;
	let priorError: string | null = null;

	// Registered WITH the snippet so the bar swaps in the same render batch
	// (see PageCommandBarCenter).
	// svelte-ignore state_referenced_locally
	const registrationId = bar?.register('confirm', confirmZone);
	$effect(() => {
		if (registrationId) bar?.update(registrationId, confirmZone);
	});

	function confirmButton(): HTMLButtonElement | null {
		return zoneEl?.querySelector<HTMLButtonElement>('button[data-action-confirm]') ?? null;
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
		const target = focusTarget?.isConnected ? focusTarget : focusFallback?.();
		if (target?.isConnected && !target.matches(':disabled')) {
			target.focus({ preventScroll: true });
		}
	}

	onDestroy(() => {
		if (registrationId) bar?.clear(registrationId);
		void tick().then(restoreFocus);
	});

	function cancel() {
		if (busy) return;
		oncancel();
	}

	function confirm() {
		if (busy || disabled || dispatched) return;
		dispatched = true;
		onconfirm();
	}

	function onKeydown(event: KeyboardEvent) {
		if (busy || event.isComposing || event.key !== 'Escape') return;
		event.preventDefault();
		cancel();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#snippet confirmZone()}
	<div
		bind:this={zoneEl}
		class="cmd-bar-zone cmd-bar-confirm"
		role="group"
		data-workflow-role="command-drawer"
		data-confirmation-command
		aria-labelledby={title ? titleId : undefined}
		aria-describedby={messageId}
		aria-busy={busy}
	>
		<div class="cmd-bar-confirm-text">
			{#if title}
				<span id={titleId} class="cmd-bar-confirm-title">{title}</span>
			{/if}
			<span
				id={messageId}
				class="cmd-bar-confirm-message"
				class:is-error={Boolean(error)}
				role={error ? 'alert' : undefined}
			>
				{error ?? message}
			</span>
			{#if code}
				<code class="cmd-bar-confirm-code" data-access-code>{code}</code>
			{/if}
		</div>
		{#if cancelLabel}
			<Button outline color="red" data-action-cancel disabled={busy} onclick={cancel}>
				{cancelLabel}
			</Button>
		{/if}
		<Button
			outline
			color={confirmColor}
			data-action-confirm
			aria-describedby={messageId}
			disabled={busy || disabled}
			onclick={confirm}
		>
			{busy ? busyLabel : confirmLabel}
		</Button>
	</div>
{/snippet}

{#if !bar}
	{@render confirmZone()}
{/if}
