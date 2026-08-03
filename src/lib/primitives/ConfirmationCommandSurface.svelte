<script lang="ts">
	import { tick } from 'svelte';
	import { Button } from 'flowbite-svelte';
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

	function onKeydown(event: KeyboardEvent) {
		if (!request || busy || event.isComposing || event.key !== 'Escape') return;
		event.preventDefault();
		cancel();
	}
</script>

<svelte:window onkeydown={onKeydown} />

{#if request}
	<section
		bind:this={surfaceEl}
		data-workflow-role="command-drawer"
		data-confirmation-command
		aria-labelledby={titleId}
		aria-describedby={messageId}
		aria-busy={busy}
		class="confirmation-command-surface shrink-0 border border-gray-200 bg-gray-50/95 px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900/95"
	>
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
	</section>
{/if}

<style>
	.confirmation-command-surface {
		border-radius: 0.5rem;
	}

	@media (max-width: 1024px) {
		.confirmation-command-surface {
			max-height: min(45dvh, 20rem);
			overflow-y: auto;
			overscroll-behavior: contain;
			padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
		}

		:global(.confirmation-command-surface button) {
			min-height: 44px;
		}
	}
</style>
