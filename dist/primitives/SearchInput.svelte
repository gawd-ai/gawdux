<!-- House search control for list headers, rails, and query bars. The compact
     default preserves the original API and desktop density; standard is the
     persistent primary-search size used by ListQueryBar. -->
<script module lang="ts">
	export type SearchInputSize = 'compact' | 'standard';
</script>

<script lang="ts">
	import { CloseOutline, SearchOutline } from 'flowbite-svelte-icons';

	let {
		value = $bindable(''),
		placeholder = 'Search',
		ariaLabel,
		id,
		size = 'compact',
		busy = false,
		busyLabel = 'Searching',
		disabled = false,
		className = '',
		oninput,
		onclear,
		onsubmit,
		onfocus,
		onblur,
		inputEl = $bindable(null)
	}: {
		value?: string;
		placeholder?: string;
		ariaLabel?: string;
		id?: string;
		size?: SearchInputSize;
		busy?: boolean;
		busyLabel?: string;
		disabled?: boolean;
		className?: string;
		/** Fires on typed input (not on clear; wire `onclear` for that). */
		oninput?: () => void;
		/** Fires when the clear button or Escape clears the field. */
		onclear?: () => void;
		/** Fires on Enter. Native form submission is preserved when omitted. */
		onsubmit?: (value: string) => void;
		onfocus?: (event: FocusEvent) => void;
		onblur?: (event: FocusEvent) => void;
		inputEl?: HTMLInputElement | null;
	} = $props();

	const inputSizeClass = $derived(
		size === 'standard' ? 'h-10 pl-9 pr-10 text-sm' : 'h-7 pl-7 pr-7 text-xs'
	);
	const iconPositionClass = $derived(size === 'standard' ? 'left-3 h-4 w-4' : 'left-2 h-3.5 w-3.5');
	const clearSizeClass = $derived(size === 'standard' ? 'h-10 w-10' : 'h-7 w-7');

	function clear(options: { restoreFocus?: boolean } = {}) {
		if (!value || disabled) return;
		value = '';
		onclear?.();
		if (options.restoreFocus) inputEl?.focus({ preventScroll: true });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && value) {
			event.preventDefault();
			clear();
			return;
		}
		if (event.key === 'Enter' && onsubmit) {
			event.preventDefault();
			onsubmit(value);
		}
	}
</script>

<div class={`gawdux-search-input relative w-full ${className}`}>
	{#if busy}
		<span
			class={`search-input-icon pointer-events-none absolute top-1/2 -translate-y-1/2 text-blue-500 ${iconPositionClass}`}
			role="status"
			aria-label={busyLabel}
		>
			<svg class="h-full w-full animate-spin" viewBox="0 0 24 24" aria-hidden="true">
				<circle
					class="opacity-25"
					cx="12"
					cy="12"
					r="9"
					fill="none"
					stroke="currentColor"
					stroke-width="3"
				/>
				<path class="opacity-80" fill="currentColor" d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3Z" />
			</svg>
			<span class="sr-only">{busyLabel}</span>
		</span>
	{:else}
		<SearchOutline
			class={`search-input-icon pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${iconPositionClass}`}
			aria-hidden="true"
		/>
	{/if}
	<input
		{id}
		type="text"
		bind:value
		bind:this={inputEl}
		{placeholder}
		{disabled}
		aria-label={ariaLabel ?? placeholder}
		aria-busy={busy}
		enterkeyhint="search"
		class={`search-input-control w-full rounded border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 ${inputSizeClass}`}
		oninput={() => oninput?.()}
		onkeydown={handleKeydown}
		onfocus={(event) => onfocus?.(event)}
		onblur={(event) => onblur?.(event)}
	/>
	{#if value && !disabled}
		<button
			type="button"
			class={`search-input-clear absolute right-0 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-gray-300 ${clearSizeClass}`}
			aria-label="Clear search"
			onclick={() => clear({ restoreFocus: true })}
		>
			<CloseOutline class="h-3.5 w-3.5" aria-hidden="true" />
		</button>
	{/if}
</div>

<style>
	@media (max-width: 1024px) {
		.search-input-control {
			height: 44px;
			min-height: 44px;
		}

		.search-input-clear {
			width: 44px;
			height: 44px;
			min-width: 44px;
			min-height: 44px;
		}

		.search-input-icon {
			left: 0.75rem;
			width: 1rem;
			height: 1rem;
		}
	}
</style>
