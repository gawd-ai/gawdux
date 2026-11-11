<!--
	A yes / no decision at the command bar: the house drawer rises out of the
	bar with the request's words, and Cancel / Confirm take the bar's center
	zone in place of the page's actions (CommandBarConfirmationPresentation,
	PageCommandBarConfirm). One presentation: the drawer is the house
	`.page-command-drawer`, fused with the bar, with no chrome of its own.

	The surface guards a request against a second dispatch until the host
	settles it (busy ends or a new error arrives), and refuses to cancel while
	a write is in flight. Focus lands on Confirm and returns to the request's
	`focusTarget` (or `focusFallback()`) when the decision closes.
-->
<script lang="ts">
	import CommandBarConfirmationPresentation from './CommandBarConfirmationPresentation.svelte';
	import type { ConfirmationCommandSurfaceProps } from './confirmation-command';

	let {
		request,
		busy = false,
		error = null,
		onconfirm,
		oncancel
	}: ConfirmationCommandSurfaceProps = $props();

	let openRequestId: number | null = null;
	let dispatchedRequestId: number | null = null;
	let priorBusy = false;
	let priorError: string | null = null;

	$effect(() => {
		const current = request;
		if (current && current.id !== openRequestId) {
			openRequestId = current.id;
			dispatchedRequestId = null;
		} else if (!current) {
			openRequestId = null;
		}
	});

	$effect(() => {
		const currentBusy = busy;
		const currentError = error;
		if ((priorBusy && !currentBusy) || (currentError && currentError !== priorError)) {
			dispatchedRequestId = null;
		}
		priorBusy = currentBusy;
		priorError = currentError;
	});

	function cancel() {
		if (!request || busy) return;
		oncancel();
	}

	function confirm() {
		if (!request || busy || dispatchedRequestId === request.id) return;
		dispatchedRequestId = request.id;
		onconfirm();
	}
</script>

{#if request}
	{#key request.id}
		<CommandBarConfirmationPresentation
			{request}
			{busy}
			{error}
			onconfirm={confirm}
			oncancel={cancel}
		/>
	{/key}
{/if}
