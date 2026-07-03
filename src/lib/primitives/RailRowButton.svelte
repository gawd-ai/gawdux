<!-- Rail row button: the house master-detail rail row. Quiet at rest,
     outlined on hover, white card + blue border when selected — the ONE
     selection vocabulary for every rail (admin tabs, doc history, …).
     Content is free-form; pair inner text blocks with min-w-0/truncate. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		selected = false,
		class: extraClass = '',
		children,
		...rest
	}: {
		selected?: boolean;
		class?: string;
		children: Snippet;
	} & HTMLButtonAttributes = $props();
</script>

<button
	type="button"
	aria-current={selected ? 'true' : undefined}
	{...rest}
	class={`flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left transition-colors ${
		selected
			? 'border-blue-300 bg-white shadow-sm dark:border-blue-800 dark:bg-gray-900'
			: 'border-transparent hover:border-gray-200 hover:bg-white dark:hover:border-gray-800 dark:hover:bg-gray-900'
	} ${extraClass}`}
>
	{@render children()}
</button>
