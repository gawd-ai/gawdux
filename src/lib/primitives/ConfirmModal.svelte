<script lang="ts">
	import { Modal, Button } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let primaryColor: 'red' | 'green' | 'blue' = 'red';
	export let className = '';

	const dispatch = createEventDispatcher();
</script>

<Modal bind:open size="sm" class={`gawdux-confirm-modal ${className}`}>
	<div class="text-center">
		<slot name="icon" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			<slot name="title" />
		</h3>
		<div class="mb-5 text-sm text-gray-500 dark:text-gray-400">
			<slot name="description" />
		</div>
		<div class="confirm-modal-actions flex flex-wrap justify-center gap-2">
			<Button outline color={primaryColor} on:click={() => dispatch('confirm')}>
				<slot name="primary" />
			</Button>
			<Button outline color="blue" on:click={() => dispatch('cancel')}>
				<slot name="cancel" />
			</Button>
		</div>
	</div>
</Modal>

<style>
	@media (max-width: 1024px) {
		.confirm-modal-actions :global(button),
		:global(.gawdux-confirm-modal button[aria-label^='Close']) {
			min-width: 44px;
			min-height: 44px;
			touch-action: manipulation;
		}
	}
</style>
