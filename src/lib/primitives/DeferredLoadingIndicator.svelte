<script module lang="ts">
	export const DEFERRED_LOADING_DELAY_MS = 300;
</script>

<script lang="ts">
	import { Spinner } from 'flowbite-svelte';

	let {
		active = false,
		label = 'Loading',
		className = 'min-h-32',
		delayMs = DEFERRED_LOADING_DELAY_MS
	}: {
		active?: boolean;
		label?: string;
		className?: string;
		delayMs?: number;
	} = $props();

	let visible = $state(false);

	// Client-only by construction ($effect never runs during SSR), which
	// preserves the source's mounted-gating: fast loads never flash a spinner.
	$effect(() => {
		visible = false;
		if (!active) return;
		const timer = setTimeout(
			() => {
				visible = true;
			},
			Math.max(0, delayMs)
		);
		return () => clearTimeout(timer);
	});
</script>

{#if active && visible}
	<div class={`flex items-center justify-center ${className}`} data-deferred-loading>
		<Spinner size="6" aria-label={label} />
	</div>
{/if}
