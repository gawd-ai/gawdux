<script lang="ts">
	import { tick } from 'svelte';
	import PageCommandBarConfirm from './PageCommandBarConfirm.svelte';
	import type { DiscardNavigationRequest } from '../utils/discard-navigation.svelte';
	import type { DiscardNavigationCommandSurfaceProps } from './discard-navigation-command';

	let {
		request,
		pending = $bindable(false),
		oncancel,
		oncomplete
	}: DiscardNavigationCommandSurfaceProps = $props();

	let error = $state<string | null>(null);
	let restoreFocusTo: HTMLElement | null = null;
	let focusedRequest: DiscardNavigationRequest | number | null = null;
	let autoAttemptedRequest: DiscardNavigationRequest | number | null = null;

	$effect(() => {
		const current = request;
		const identity = current?.id ?? current;
		if (!current || identity === focusedRequest) return;
		focusedRequest = identity;
		error = null;
		restoreFocusTo =
			current.focusOnCancel?.() ??
			(document.activeElement instanceof HTMLElement ? document.activeElement : null);
	});

	$effect(() => {
		const current = request;
		const identity = current?.id ?? current;
		if (
			!current?.autoContinue ||
			current.disabled ||
			pending ||
			identity === autoAttemptedRequest
		) {
			return;
		}
		autoAttemptedRequest = identity;
		void tick().then(() => {
			const latest = request;
			if (
				(latest?.id ?? latest) !== identity ||
				!latest?.autoContinue ||
				latest.disabled ||
				pending
			) {
				return;
			}
			void continueAfterDiscard();
		});
	});

	function cancel() {
		const current = request;
		if (!current || pending) return;
		const focusTarget = restoreFocusTo;
		focusedRequest = null;
		restoreFocusTo = null;
		error = null;
		oncancel(current);
		void tick().then(() => {
			if (focusTarget?.isConnected && !focusTarget.matches(':disabled')) focusTarget.focus();
		});
	}

	async function continueAfterDiscard() {
		const current = request;
		if (!current || pending || current.disabled) return;
		pending = true;
		error = null;
		try {
			await current.continue();
			// Re-enable destination content before restoring focus. The app
			// freezes the prior page only while the continuation is in flight.
			pending = false;
			await tick();
			const focusTarget = current.focusAfter?.();
			if (focusTarget?.isConnected && !focusTarget.matches(':disabled')) {
				focusTarget.focus({ preventScroll: true });
			}
			focusedRequest = null;
			restoreFocusTo = null;
			oncomplete(current);
		} catch {
			error = 'Could not continue. Try again.';
		} finally {
			pending = false;
		}
	}
</script>

<!--
	Discarding unsaved changes is a decision at the command bar like every
	other: the house drawer (PageCommandBarConfirm) rises out of the bar with
	the words, and Keep editing / the destination's confirm take the bar's
	center zone. One presentation, with no chrome of its own. Escape keeps
	editing; focus returns to the control that asked.
-->
{#if request}
	{#key request.id ?? request}
		<PageCommandBarConfirm
			title="Discard unsaved changes?"
			message={request.message}
			error={error ?? request.disabledMessage ?? null}
			cancelLabel="Keep editing"
			confirmLabel={request.confirmLabel}
			busyLabel="Continuing…"
			confirmColor="red"
			busy={pending}
			disabled={request.disabled}
			onconfirm={() => void continueAfterDiscard()}
			oncancel={cancel}
		/>
	{/key}
{/if}
