<!--
	@component
	A line of text drawn by the one rule for long values (`longTextRuns`): an
	identifier and a moment never break inside themselves, a hash wraps inside
	its own box at any character, the words around them wrap between words.
	Each run is a span of its own (`.gawdux-long-text-whole`,
	`.gawdux-long-text-hash`, tokens.css), so the line wraps between them and
	copying it gives the text as written.
-->
<script lang="ts">
	import { longTextRuns } from './long-text';

	let { text }: { text: string } = $props();

	const runs = $derived(longTextRuns(text));
</script>

{#each runs as run, index (index)}{#if run.kind === 'whole'}<span
			class="gawdux-long-text-whole"
			data-long-text={run.kind}>{run.text}</span
		>{:else if run.kind === 'hash'}<span class="gawdux-long-text-hash" data-long-text={run.kind}
			>{run.text}</span
		>{:else}{run.text}{/if}{/each}
