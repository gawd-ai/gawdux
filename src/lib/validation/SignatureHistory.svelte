<script lang="ts">
	import type { SignatureHistoryEntry } from './types.js';
	let { entries, title = 'Signatures' }: { entries: SignatureHistoryEntry[]; title?: string } = $props();
</script>

<section aria-label={title}>
	<h3>{title}</h3>
	{#if entries.length === 0}<p class="muted">No signatures have been recorded.</p>{/if}
	<ol>
		{#each entries as entry (entry.id)}
			<li>
				<div class="heading"><strong>{entry.meaning}</strong><span>{entry.withdrawnAt ? 'Withdrawn' : 'Recorded'}</span></div>
				<p>{entry.signer} · <time datetime={entry.signedAt}>{entry.signedAt}</time></p>
				{#if entry.withdrawnAt}<p class="muted">Withdrawn <time datetime={entry.withdrawnAt}>{entry.withdrawnAt}</time>{entry.withdrawalReason ? ` — ${entry.withdrawalReason}` : ''}</p>{/if}
				<p class:error={entry.integrity === false} class="muted">{entry.integrity === true ? 'Content verified' : entry.integrity === false ? 'Content verification failed' : 'Historical content verification unavailable'}</p>
				<details><summary>Signed content hash</summary><code>{entry.contentHash}</code></details>
			</li>
		{/each}
	</ol>
</section>

<style>
	section { color: var(--gawdux-text-primary, #1f2937); }
	h3 { font-size: 1rem; font-weight: 650; margin: 0 0 .75rem; }
	ol { list-style: none; padding: 0; margin: 0; display: grid; gap: .75rem; }
	li { padding: 1rem; border: 1px solid var(--gawdux-border, #dce1e7); border-radius: .6rem; }
	.heading { display: flex; justify-content: space-between; flex-wrap: wrap; gap: .5rem; }
	.heading span, p, summary { font-size: .8125rem; }
	p { margin: .4rem 0; overflow-wrap: anywhere; }
	.muted { color: var(--gawdux-text-secondary, #526070); }
	.error { color: var(--gawdux-text-error, #b91c1c); }
	summary { cursor: pointer; margin-top: .7rem; }
	code { display: block; overflow-wrap: anywhere; font-size: .75rem; margin-top: .5rem; }
</style>
