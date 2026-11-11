<!-- A tab's title: its icon and its label. A strip whose labels do not fit
     shows each tab's icon alone (fitLabels, tokens.css "Icons alone while the
     labels do not fit"), the label kept in the tab as its accessible name and
     marked to hide (`.gawdux-control-label`). The icon is the house icon
     (`.gawdux-icon`, 20px), the size a header's and a rail's icons show. The
     icon is optional: a tab set that carries no icons is a legitimate design,
     and reserving the icon's box for one anyway would indent every label by
     the box and the gap. A tab
     with no icon never hides its label, which would leave it empty, so its
     label carries no mark. Its root is a span, so a tab's button holds
     phrasing content only.

     A count. While something on the tab waits on the reader (a signature,
     a decision), `count` draws the house counted-icon pill on the tab's
     icon (`.gawdux-icon-count`, the bell's and the chat views'), the count
     read with the label ("Workflow (1)"); zero or none draws nothing. -->
<script lang="ts">
	import type { Component } from 'svelte';

	let {
		icon = null,
		label,
		count = 0,
		className = ''
	}: {
		/** The tab's icon, from the house set: one meaning, one icon. */
		icon?: Component | null;
		label: string;
		/** What on the tab waits on the reader; above zero, the pill on the icon. */
		count?: number | null;
		className?: string;
	} = $props();

	const counted = $derived(icon && count && count > 0 ? count : 0);
</script>

<span class="gawdux-tab-title flex items-center gap-2 {className}">
	{#if icon}
		{@const Icon = icon}
		<span class="gawdux-control-icon gawdux-icon relative inline-flex items-center justify-center" aria-hidden="true">
			<Icon class="gawdux-icon" />
			{#if counted}
				<span class="gawdux-icon-count" data-surface="card" data-tab-count>{counted > 9 ? '9+' : counted}</span>
			{/if}
		</span>
		<span class="gawdux-control-label">{label}{#if counted}<span class="sr-only">{` (${counted})`}</span>{/if}</span>
	{:else}
		<span>{label}</span>
	{/if}
</span>
