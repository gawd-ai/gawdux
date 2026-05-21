<script lang="ts">
	import { Modal, Button } from 'flowbite-svelte';
	import { createEventDispatcher } from 'svelte';

	export let open = false;
	export let primaryColor: 'red' | 'green' | 'blue' = 'red';
	export let className = '';

	const dispatch = createEventDispatcher();
</script>

<Modal bind:open size="sm" class={className}>
	<div class="text-center">
		<slot name="icon" />
		<h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
			<slot name="title" />
		</h3>
		<div class="mb-5 text-sm text-gray-500 dark:text-gray-400">
			<slot name="description" />
		</div>
		<div class="flex justify-center gap-2">
			<Button outline color={primaryColor} on:click={() => dispatch('confirm')}>
				<slot name="primary" />
			</Button>
			<Button outline color="blue" on:click={() => dispatch('cancel')}>
				<slot name="cancel" />
			</Button>
		</div>
	</div>
</Modal>
