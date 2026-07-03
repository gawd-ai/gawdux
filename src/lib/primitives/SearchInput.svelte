<!-- Compact search input (the "pro" density): leading looking-glass, trailing
     clear ×, Escape clears. The house search control for rails, list headers,
     and toolbars. Denser than form-input on purpose — pair it with compact
     chrome, not inside FilterBar rows (those align to form-input height). -->
<script lang="ts">
	import { CloseOutline, SearchOutline } from 'flowbite-svelte-icons';

	let {
		value = $bindable(''),
		placeholder = 'Search',
		ariaLabel,
		id,
		oninput,
		onclear,
		inputEl = $bindable(null)
	}: {
		value?: string;
		placeholder?: string;
		ariaLabel?: string;
		id?: string;
		/** Fires on typed input (not on clear — wire `onclear` for that). */
		oninput?: () => void;
		/** Fires when the × button or Escape clears the field. */
		onclear?: () => void;
		inputEl?: HTMLInputElement | null;
	} = $props();

	function clear() {
		value = '';
		onclear?.();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && value) {
			event.preventDefault();
			clear();
		}
	}
</script>

<div class="relative w-full">
	<SearchOutline
		class="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
	/>
	<input
		{id}
		type="text"
		bind:value
		bind:this={inputEl}
		{placeholder}
		aria-label={ariaLabel ?? placeholder}
		class="h-7 w-full rounded border border-gray-200 bg-white pl-7 pr-7 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
		oninput={() => oninput?.()}
		onkeydown={onKeydown}
	/>
	{#if value}
		<button
			type="button"
			class="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
			aria-label="Clear search"
			onclick={clear}
		>
			<CloseOutline class="h-3.5 w-3.5" />
		</button>
	{/if}
</div>
