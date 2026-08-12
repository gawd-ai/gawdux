<script lang="ts">
	import { tick } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import CommandDrawer from './CommandDrawer.svelte';
	import { CheckCircleOutline, ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import type { ConfirmationCommandRequest } from './confirmation-command';

	let {
		request,
		busy = false,
		error = null,
		onconfirm,
		oncancel
	}: {
		request: ConfirmationCommandRequest | null;
		busy?: boolean;
		error?: string | null;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();

	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	const messageId = `${componentId}-message`;
	let surfaceEl = $state<HTMLElement | null>(null);
	let openRequest = $state<ConfirmationCommandRequest | null>(null);
	let priorBusy = false;
	let priorError: string | null = null;
	let dispatchedRequestId: number | null = null;
	let restoredRequestId: number | null = null;

	const confirmColor = $derived(request?.confirmColor ?? 'red');
	const StatusIcon = $derived(
		confirmColor === 'green' ? CheckCircleOutline : ExclamationCircleOutline
	);
	const iconClass = $derived(
		confirmColor === 'green'
			? 'text-green-600 dark:text-green-400'
			: confirmColor === 'blue'
				? 'text-blue-600 dark:text-blue-400'
				: 'text-red-600 dark:text-red-400'
	);

	function confirmButton(): HTMLButtonElement | null {
		return surfaceEl?.querySelector<HTMLButtonElement>('button[data-action-confirm]') ?? null;
	}

	/**
	 * Focus restore is kept HERE rather than delegated to CommandDrawer, and the
	 * distinction is real: the drawer restores to whatever happened to have focus
	 * when it opened, while a confirmation restores to the request's OWN
	 * `focusTarget`/`focusFallback`. Those differ whenever a request is raised
	 * programmatically rather than by a click — a keyboard shortcut, or a
	 * confirmation that replaces another.
	 */
	function restoreRequestFocus(requestToRestore: ConfirmationCommandRequest) {
		if (restoredRequestId === requestToRestore.id) return;
		restoredRequestId = requestToRestore.id;
		void tick().then(() => {
			const target = requestToRestore.focusTarget?.isConnected
				? requestToRestore.focusTarget
				: requestToRestore.focusFallback?.();
			if (target?.isConnected && !target.matches(':disabled')) {
				target.focus({ preventScroll: true });
			}
		});
	}

	$effect(() => {
		const current = request;
		if (current && current.id !== openRequest?.id) {
			openRequest = current;
			dispatchedRequestId = null;
			restoredRequestId = null;
			void tick().then(() => confirmButton()?.focus());
			return;
		}
		if (!current && openRequest) {
			const requestToRestore = openRequest;
			openRequest = null;
			restoreRequestFocus(requestToRestore);
		}
	});

	$effect(() => {
		const currentBusy = busy;
		const currentError = error;
		if ((priorBusy && !currentBusy) || (currentError && currentError !== priorError)) {
			dispatchedRequestId = null;
		}
		if (((priorBusy && !currentBusy) || currentError !== priorError) && request) {
			void tick().then(() => confirmButton()?.focus());
		}
		priorBusy = currentBusy;
		priorError = currentError;
	});

	function cancel() {
		if (!request || busy) return;
		const requestToRestore = request;
		oncancel();
		restoreRequestFocus(requestToRestore);
	}

	function confirm() {
		if (!request || busy || dispatchedRequestId === request.id) return;
		dispatchedRequestId = request.id;
		onconfirm();
	}

</script>

<CommandDrawer
	open={request !== null}
	{busy}
	variant="card"
	labelledBy={titleId}
	describedBy={messageId}
	class="confirmation-command-surface"
	data-confirmation-command
	onclose={cancel}
>
	<!--
		The inner `{#if request}` is not redundant with the drawer's `open`.
		CommandDrawer owns MOUNTING; this narrows the TYPE, which the old
		`{#if request}` used to do as a side effect of guarding the markup.
	-->
	{#if request}
		<div bind:this={surfaceEl}>
			<div class="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
				<StatusIcon class={`hidden h-5 w-5 shrink-0 sm:block ${iconClass}`} />
				<div class="min-w-0 flex-1">
					<h3 id={titleId} class="text-sm font-semibold text-gray-900 dark:text-gray-100">
						{request.title}
					</h3>
					<p id={messageId} class="text-xs text-gray-600 dark:text-gray-300">
						{request.message}
					</p>
					{#if error}
						<p class="mt-1 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
							{error}
						</p>
				{/if}
			</div>
			<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
				<Button color="alternative" size="sm" data-action-cancel disabled={busy} onclick={cancel}>
					Cancel
				</Button>
				<Button
					color={confirmColor}
					size="sm"
					data-action-confirm
					aria-describedby={messageId}
					disabled={busy}
					onclick={confirm}
				>
					{busy ? (request.busyLabel ?? 'Applying…') : request.confirmLabel}
				</Button>
				</div>
			</div>
		</div>
	{/if}
</CommandDrawer>
