<!-- Rail row button: the house master-detail rail row. Quiet at rest,
     outlined on hover, the card surface and the accent's edge when selected:
     the one selection vocabulary for every rail (the admin tabs, a document's
     history, the Control tabs).

     The row owns its layout; a host passes what it says and draws no row of
     its own:
     - the title line: the icon (`icon`, or `leading` for a mark that is no
       icon, such as a bot's initials) in a box the house icon size and the
       title line's height (`.gawdux-icon`, 20px, the 14px title's line), the
       title (`title`, truncated), then `trailing` (a badge, a count, a state
       dot) at the line's end;
     - the meta line under it (`meta`, a string truncated on one line, or a
       snippet for meta that carries its own marks), starting at the row's
       left edge under the icon and running the row's full width, so it
       truncates as little as it can. -->
<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	let {
		selected = false,
		title,
		meta,
		icon: Icon,
		leading,
		trailing,
		class: extraClass = '',
		...rest
	}: {
		selected?: boolean;
		/** The row's name, on the title line. */
		title: string;
		/** The line under the title: a string, or a snippet for meta with marks of its own. */
		meta?: string | Snippet;
		/** The row's icon, on the title line at the house icon size. */
		icon?: Component;
		/** A mark that is no icon (a bot's initials), in the icon's box. */
		leading?: Snippet;
		/** At the title line's end: a badge, a count, a state dot. */
		trailing?: Snippet;
		class?: string;
	} & Omit<HTMLButtonAttributes, 'title' | 'children'> = $props();
</script>

<button
	type="button"
	data-master-detail-row
	aria-current={selected ? 'true' : undefined}
	{...rest}
	class={`rail-row flex w-full flex-col items-stretch rounded-md border px-2.5 py-2 text-left transition-colors ${
		selected
			? 'border-blue-300 bg-white dark:border-blue-800 dark:bg-gray-900'
			: 'border-transparent hover:border-gray-200 hover:bg-white dark:hover:border-gray-800 dark:hover:bg-gray-900'
	} ${extraClass}`}
>
	<span class="rail-row-line flex min-w-0 items-center gap-2">
		{#if Icon}
			<span
				class="rail-row-icon gawdux-icon inline-flex items-center justify-center text-gray-500 dark:text-gray-400"
				aria-hidden="true"><Icon class="gawdux-icon" /></span
			>
		{:else if leading}
			<span class="rail-row-icon gawdux-icon inline-flex items-center justify-center" aria-hidden="true"
				>{@render leading()}</span
			>
		{/if}
		<span class="rail-row-title min-w-0 flex-1 truncate text-sm font-medium text-gray-900 dark:text-gray-100"
			>{title}</span
		>
		{#if trailing}
			<span class="rail-row-trailing inline-flex shrink-0 items-center gap-1.5">{@render trailing()}</span>
		{/if}
	</span>
	{#if typeof meta === 'string'}
		<span class="rail-row-meta mt-0.5 block min-w-0 truncate text-[11px] leading-4 text-gray-500 dark:text-gray-400"
			>{meta}</span
		>
	{:else if meta}
		<span class="rail-row-meta mt-0.5 block min-w-0 text-[11px] leading-4 text-gray-500 dark:text-gray-400"
			>{@render meta()}</span
		>
	{/if}
</button>
