<!-- An icon and a word, aligned: the shared shape of a cue (a severity, a
     status, a link or device type). The word carries the meaning, so the
     icon is decorative. Colour is the host's vocabulary: pass it through
     `iconClass` (and `labelClass` when the word is tinted too). Text size is
     inherited; `size` sets the icon box to match it. -->
<script module lang="ts">
	export type IconLabelSize = 'xs' | 'sm' | 'md' | 'lg';

	const ICON_SIZE: Record<IconLabelSize, string> = {
		xs: 'h-3 w-3',
		sm: 'h-3.5 w-3.5',
		md: 'h-4 w-4',
		lg: 'h-5 w-5'
	};

	const GAP: Record<IconLabelSize, string> = {
		xs: 'gap-1',
		sm: 'gap-1.5',
		md: 'gap-1.5',
		lg: 'gap-2'
	};
</script>

<script lang="ts">
	import type { Component } from 'svelte';

	let {
		icon: Icon = null,
		label,
		size = 'md',
		iconClass = '',
		labelClass = '',
		truncate = false,
		title,
		className = ''
	}: {
		/** An icon component (e.g. from flowbite-svelte-icons). Optional: a cue
		    without an icon renders the word alone, at the same baseline. */
		icon?: Component | null;
		label: string;
		/** Icon box: xs 12px, sm 14px, md 16px (text-sm), lg 20px. */
		size?: IconLabelSize;
		iconClass?: string;
		labelClass?: string;
		/** Clip a long word with an ellipsis inside a constrained parent. */
		truncate?: boolean;
		title?: string;
		className?: string;
	} = $props();
</script>

<span
	class={`icon-label inline-flex min-w-0 max-w-full items-center align-middle ${GAP[size]} ${className}`}
	{title}
>
	{#if Icon}
		<Icon class={`${ICON_SIZE[size]} shrink-0 ${iconClass}`} aria-hidden="true" />
	{/if}
	<span class={`${truncate ? 'min-w-0 truncate' : ''} ${labelClass}`.trim() || undefined}
		>{label}</span
	>
</span>
