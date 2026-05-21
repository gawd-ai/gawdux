<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CloseOutline } from 'flowbite-svelte-icons';

	export let value: string = '';
	export let id: string = '';
	export let placeholder: string = '';
	export let className = '';

	const dispatch = createEventDispatcher<{ input: void; focus: void; clear: void; submit: void }>();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			dispatch('submit');
		}
	}

	function clear() {
		value = '';
		dispatch('clear');
	}
</script>

<div class="relative {className}">
	<input
		{id}
		type="text"
		{placeholder}
		bind:value
		class="form-input w-full !pr-7 rounded-lg"
		on:input={() => dispatch('input')}
		on:focus={() => dispatch('focus')}
		on:keydown={handleKeydown}
		on:blur
	/>
	{#if value}
		<button
			type="button"
			class="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
			on:click={clear}
			tabindex="-1"
		>
			<CloseOutline class="w-3.5 h-3.5" />
		</button>
	{/if}
</div>
