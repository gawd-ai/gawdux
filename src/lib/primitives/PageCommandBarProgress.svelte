<!--
    A determinate count in a command bar's status zone: the words small, on
    one line, above a thin track as wide as they are, the pair inside the
    bar's height at every width. The track is drawn only when there is a
    count (a total above zero); words without a count read alone. The track
    is the progress bar of assistive technology, its value the count and its
    value text the words.
-->
<script lang="ts">
	let {
		label,
		value = null,
		total = null,
		name = undefined
	}: {
		/** The words, read whole above the track ("2 of 5 signatures · Awaiting Quality"). */
		label: string;
		/** How many are done. */
		value?: number | null;
		/** How many in all. No track unless it is a number above zero. */
		total?: number | null;
		/** The track's accessible name ("Signatures"); the words when absent. */
		name?: string;
	} = $props();

	const counted = $derived(
		typeof value === 'number' &&
			Number.isFinite(value) &&
			typeof total === 'number' &&
			Number.isFinite(total) &&
			total > 0
	);
	const done = $derived(counted ? Math.min(Math.max(value as number, 0), total as number) : 0);
	const percent = $derived(counted ? Math.round((done / (total as number)) * 100) : 0);
</script>

<span class="gawdux-bar-progress" data-bar-progress title={label}>
	<span class="gawdux-bar-progress-words" data-bar-progress-words>{label}</span>
	{#if counted}
		<span
			class="gawdux-bar-progress-track"
			role="progressbar"
			aria-valuemin={0}
			aria-valuemax={total}
			aria-valuenow={done}
			aria-valuetext={label}
			aria-label={name ?? label}
			data-bar-progress-track
		>
			<span class="gawdux-bar-progress-fill" style:width={`${percent}%`}></span>
		</span>
	{/if}
</span>

<style>
	/* As wide as its words, never wider than the zone: the words keep one line
	   and yield with an ellipsis, the whole in their tooltip. Words, gap and
	   track stand 16px, the height of one line of the bar's status words, so
	   the count makes no bar taller than its words alone would. */
	.gawdux-bar-progress {
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		gap: 1px;
		align-self: center;
		min-width: 0;
		max-width: 100%;
	}
	.gawdux-bar-progress-words {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 0.6875rem;
		line-height: 12px;
		font-weight: 500;
		color: rgb(75 85 99);
	}
	.gawdux-bar-progress-track {
		display: block;
		width: 100%;
		height: 3px;
		overflow: hidden;
		border-radius: 9999px;
		background: rgb(229 231 235);
	}
	.gawdux-bar-progress-fill {
		display: block;
		height: 100%;
		border-radius: 9999px;
		background: rgb(37 99 235);
	}
	:global(.dark) .gawdux-bar-progress-words {
		color: rgb(209 213 219);
	}
	:global(.dark) .gawdux-bar-progress-track {
		background: rgb(55 65 81);
	}
	:global(.dark) .gawdux-bar-progress-fill {
		background: rgb(59 130 246);
	}
</style>
