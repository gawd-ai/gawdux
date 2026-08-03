<script lang="ts">
	import { tick } from 'svelte';
	import { Button } from 'flowbite-svelte';
	import { ExclamationCircleOutline } from 'flowbite-svelte-icons';
	import type { DiscardNavigationRequest } from '../utils/discard-navigation.svelte';

	let {
		request,
		pending = $bindable(false),
		anchorBottom = false,
		oncancel,
		oncomplete
	}: {
		request: DiscardNavigationRequest | null;
		pending?: boolean;
		anchorBottom?: boolean;
		oncancel: (request: DiscardNavigationRequest) => void;
		oncomplete: (request: DiscardNavigationRequest) => void;
	} = $props();
	const componentId = $props.id();
	const titleId = `${componentId}-title`;
	const messageId = `${componentId}-message`;

	let stripEl = $state<HTMLElement | null>(null);
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
		void tick().then(() => {
			const confirm = stripEl?.querySelector<HTMLButtonElement>('button[data-action-confirm]');
			if (confirm && !confirm.disabled) confirm.focus();
			else stripEl?.querySelector<HTMLElement>('button[data-action-cancel]')?.focus();
		});
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

	function onKeydown(event: KeyboardEvent) {
		if (!request || pending || event.isComposing || event.key !== 'Escape') return;
		event.preventDefault();
		cancel();
	}
</script>

<svelte:window on:keydown={onKeydown} />

{#if request}
	<section
		bind:this={stripEl}
		data-workflow-role="command-drawer"
		aria-labelledby={titleId}
		aria-busy={pending}
		class:mt-auto={anchorBottom}
		class="discard-navigation-command-drawer shrink-0 border-t border-gray-200 bg-gray-50/95 px-4 py-3 shadow-[0_-8px_20px_-18px_rgba(15,23,42,0.8)] dark:border-gray-700 dark:bg-gray-900/95"
	>
		<div
			class="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
		>
			<ExclamationCircleOutline
				class="hidden h-5 w-5 shrink-0 text-amber-600 sm:block dark:text-amber-400"
			/>
			<div class="min-w-0 flex-1">
				<h3 id={titleId} class="text-sm font-semibold text-gray-900 dark:text-gray-100">
					Discard unsaved changes?
				</h3>
				<p id={messageId} class="text-xs text-gray-600 dark:text-gray-300">
					{request.message}
				</p>
				{#if request.disabledMessage}
					<p class="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300" role="status">
						{request.disabledMessage}
					</p>
				{/if}
				{#if error}
					<p class="mt-1 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
						{error}
					</p>
				{/if}
			</div>
			<div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
				<Button
					color="alternative"
					size="sm"
					data-action-cancel
					disabled={pending}
					on:click={cancel}
				>
					Keep editing
				</Button>
				<Button
					color="red"
					size="sm"
					data-action-confirm
					disabled={pending || request.disabled}
					aria-describedby={messageId}
					on:click={() => void continueAfterDiscard()}
				>
					{pending ? 'Continuing…' : request.confirmLabel}
				</Button>
			</div>
		</div>
	</section>
{/if}

<style>
	@media (max-width: 1024px) {
		.discard-navigation-command-drawer {
			max-height: min(45dvh, 20rem);
			overflow-y: auto;
		}

		:global(.discard-navigation-command-drawer button) {
			min-height: 44px;
		}
	}
</style>
