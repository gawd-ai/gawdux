<script lang="ts">
	import type { ManualObservationInput } from './types.js';
	let { caseId, title, expectedRevision, oncomplete, oncancel }: {
		caseId: string; title: string; expectedRevision: string;
		oncomplete: (input: ManualObservationInput) => Promise<void>;
		oncancel?: () => void;
	} = $props();
	let observed = $state('');
	let result = $state<'' | 'pass' | 'fail'>('');
	let pending = $state(false);
	let error = $state('');
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (pending || !observed.trim() || !result) return;
		pending = true; error = '';
		try { await oncomplete({ caseId, expectedRevision, observed: observed.trim(), result }); }
		catch { error = 'The observation was not saved. Reload the record and check your access before trying again.'; }
		finally { pending = false; }
	}
</script>

<form onsubmit={submit} aria-label={`Complete ${title}`}>
	<h3>{title}</h3>
	<p>Record what you observed. Your identity and the time of entry are retained with the result.</p>
	<label>Observation<textarea required maxlength="100000" rows="5" bind:value={observed} disabled={pending}></textarea></label>
	<label>Result<select required bind:value={result} disabled={pending}><option value="" disabled>Select a result</option><option value="pass">Pass</option><option value="fail">Fail</option></select></label>
	{#if error}<p role="alert" class="error">{error}</p>{/if}
	<div class="actions"><button type="submit" disabled={pending || !observed.trim() || !result}>{pending ? 'Saving…' : 'Save observation'}</button>{#if oncancel}<button type="button" class="secondary" onclick={oncancel} disabled={pending}>Cancel</button>{/if}</div>
</form>

<style>
	form { display: grid; gap: 1rem; padding: 1.25rem; border: 1px solid var(--gawdux-border, #dce1e7); border-radius: .75rem; color: var(--gawdux-text-primary, #1f2937); background: var(--gawdux-surface-card, white); }
	h3, p { margin: 0; } h3 { font-size: 1rem; } p { font-size: .875rem; color: var(--gawdux-text-secondary, #526070); }
	label { display: grid; gap: .4rem; font-size: .875rem; font-weight: 550; }
	textarea, select { box-sizing: border-box; width: 100%; padding: .65rem; border: 1px solid var(--gawdux-border-input, #b9c2cc); border-radius: .4rem; color: inherit; background: var(--gawdux-surface-input, #f8fafc); font: inherit; }
	textarea { resize: vertical; }
	.actions { display: flex; gap: .6rem; flex-wrap: wrap; }
	button { padding: .55rem .9rem; border: 1px solid transparent; border-radius: .4rem; background: var(--gawdux-text-accent, #2563eb); color: white; font: inherit; font-size: .875rem; cursor: pointer; }
	button:disabled { opacity: .55; cursor: default; } .secondary { border-color: var(--gawdux-border-input, #b9c2cc); color: inherit; background: transparent; }
	.error { color: var(--gawdux-text-error, #b91c1c); }
</style>
