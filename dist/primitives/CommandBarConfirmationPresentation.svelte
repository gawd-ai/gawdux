<script lang="ts">
	import PageCommandBarConfirm from './PageCommandBarConfirm.svelte';
	import type { ConfirmationCommandPresentationProps } from './confirmation-command';

	let { request, busy, error, onconfirm, oncancel }: ConfirmationCommandPresentationProps = $props();
</script>

<PageCommandBarConfirm
	title={request.title}
	message={request.message}
	{error}
	confirmLabel={request.confirmLabel}
	busyLabel={request.busyLabel ?? 'Applying…'}
	confirmColor={request.confirmColor ?? 'red'}
	{busy}
	focusTarget={request.focusTarget}
	focusFallback={request.focusFallback}
	{onconfirm}
	{oncancel}
/>
