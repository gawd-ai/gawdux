<!-- A pane header's state: the status chip, in the header's density, always
     shown; beside it a lock while the viewer cannot edit, the reason in its
     tooltip and as its accessible name, at the house icon size every icon in
     a header shows (`.gawdux-icon`). The lock carries no words of its
     own: the chip names the state, the tooltip says why it is read-only. The
     colour and the word are the host's vocabulary, as with StatusBadge. -->
<script lang="ts">
	import { LockOutline } from 'flowbite-svelte-icons';
	import StatusBadge, { type StatusBadgeColor } from './StatusBadge.svelte';

	let {
		color,
		label,
		lockReason = null,
		className = ''
	}: {
		color: StatusBadgeColor;
		label: string;
		/** Why the viewer cannot edit. Set, the lock shows with it as its
		    tooltip; empty or absent, no lock. */
		lockReason?: string | null | undefined;
		/** Extra chip classes, merged over the header density. */
		className?: string;
	} = $props();

	const reason = $derived(lockReason?.trim() ? lockReason : null);
</script>

<span class="inline-flex shrink-0 items-center gap-1.5" data-header-status>
	<StatusBadge
		{color}
		{label}
		class={className ? `px-1.5 py-0 text-[10px] ${className}` : 'px-1.5 py-0 text-[10px]'}
	/>
	{#if reason}
		<span
			class="inline-flex shrink-0 items-center text-gray-500 dark:text-gray-400"
			role="img"
			aria-label={reason}
			title={reason}
			data-header-status-lock
		>
			<LockOutline class="gawdux-icon" aria-hidden="true" />
		</span>
	{/if}
</span>
