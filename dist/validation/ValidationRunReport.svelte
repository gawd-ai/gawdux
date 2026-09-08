<script lang="ts">
	import type { ValidationExecutionView } from './types.js';
	let { execution, onmanual }: { execution: ValidationExecutionView; onmanual?: (caseId: string) => void } = $props();
	let counts = $derived({ pass: execution.cases.filter(item => item.result === 'pass').length,
		fail: execution.cases.filter(item => item.result === 'fail').length,
		pending: execution.cases.filter(item => !['pass', 'fail'].includes(item.result)).length });
	function safeHref(value: string | undefined): string | undefined {
		if (!value || /[\x00-\x20\\]/.test(value)) return undefined;
		if (value.startsWith('/') && !value.startsWith('//')) return value;
		try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? value : undefined; } catch { return undefined; }
	}
</script>

<article aria-label="Execution report">
	<header>
		<div><p class="eyebrow">{execution.protocol} · Revision {execution.protocolRevision}</p><h2>{execution.title}</h2><p class="muted">{execution.environment} · <time datetime={execution.startedAt}>{execution.startedAt}</time></p></div>
		<span class="status">{execution.status}</span>
	</header>
	<dl class="counts"><div><dt>Passed</dt><dd class="pass">{counts.pass}</dd></div><div><dt>Failed</dt><dd class:fail={counts.fail > 0}>{counts.fail}</dd></div><div><dt>Awaiting completion</dt><dd>{counts.pending}</dd></div></dl>
	{#if execution.evidenceHeld}<p class="notice">Evidence and detailed observations are restricted for this account.</p>{/if}
	<div class="cases">
		{#each execution.cases as item (item.id)}
			<details class="case" open={item.result === 'fail'}>
				<summary><span class="case-title"><span class="identifier">{item.id}</span><strong>{item.title}</strong></span><span class="result" class:fail={item.result === 'fail'} class:pass={item.result === 'pass'}>{item.result === 'not-run' ? 'Awaiting completion' : item.result}</span></summary>
				<div class="case-body">
					<p class="muted">{item.mode}{item.requirements.length ? ` · ${item.requirements.join(', ')}` : ''}</p>
					{#if !execution.evidenceHeld}
						{#each item.steps as step (step.number)}
							<section class="step"><h4>{step.number}. {step.action} <span class:fail={step.result === 'fail'} class="step-result">{step.result}</span></h4><p class="expected">Expected: {step.expected}</p>
								{#each step.observed as observation}<p class="observation">{observation}</p>{/each}
								{#if step.evidence.length}<ul class="captures">{#each step.evidence as capture}<li>{#if safeHref(capture.href)}<a href={safeHref(capture.href)}>{capture.label || capture.file}</a>{:else}<span>{capture.label || capture.file}</span>{/if}<details><summary>SHA-256</summary><code>{capture.sha256}</code></details></li>{/each}</ul>{/if}
							</section>
						{/each}
						{#if item.manual}<div class="manual"><p class="observation">{item.manual.observed}</p><p class="muted">Recorded by {item.manual.enteredBy} · {item.manual.enteredAt}</p></div>{/if}
					{/if}
					{#if item.canComplete && onmanual}<button type="button" onclick={() => onmanual?.(item.id)}>Record manual observation</button>{/if}
				</div>
			</details>
		{/each}
	</div>
	{#if execution.traceability.length}<section class="traceability"><h3>Requirement coverage</h3><dl>{#each execution.traceability as row}<div><dt>{row.requirement}</dt><dd>{row.cases.join(', ')}</dd></div>{/each}</dl></section>{/if}
	<details class="identity"><summary>Execution identity and retained content</summary><dl><dt>Execution</dt><dd><code>{execution.id}</code></dd><dt>Content hash</dt><dd><code>{execution.contentHash}</code></dd></dl></details>
</article>

<style>
	article { color: var(--gawdux-text-primary, #1f2937); display: grid; gap: 1.25rem; min-width: 0; }
	header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
	h2 { font-size: 1.4rem; line-height: 1.3; margin: .25rem 0 .5rem; font-weight: 650; }
	h3 { font-size: 1rem; margin: 0 0 .8rem; } h4 { font-size: .875rem; margin: 0; }
	p { margin: .35rem 0; font-size: .875rem; } .eyebrow { font-size: .75rem; font-weight: 600; } .muted, .expected { color: var(--gawdux-text-secondary, #526070); }
	.status { font-size: .75rem; padding: .35rem .65rem; border: 1px solid var(--gawdux-border, #dce1e7); border-radius: 999px; text-transform: capitalize; }
	.counts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0; border: 1px solid var(--gawdux-border, #dce1e7); border-radius: .75rem; background: var(--gawdux-surface-card, white); }
	.counts > div { padding: 1rem; } .counts > div + div { border-left: 1px solid var(--gawdux-border, #dce1e7); }
	.counts dt { font-size: .75rem; color: var(--gawdux-text-secondary, #526070); } .counts dd { font-size: 1.7rem; font-weight: 600; margin: .2rem 0 0; }
	.pass { color: var(--gawdux-text-success, #168044); } .fail { color: var(--gawdux-text-error, #b91c1c); }
	.notice { margin: 0; padding: .85rem 1rem; border-radius: .5rem; background: var(--gawdux-surface-subtle, #f1f5f9); }
	.cases { display: grid; gap: .65rem; } .case { border: 1px solid var(--gawdux-border, #dce1e7); border-radius: .65rem; overflow: hidden; background: var(--gawdux-surface-card, white); }
	.case > summary { display: flex; gap: 1rem; justify-content: space-between; padding: 1rem; cursor: pointer; align-items: baseline; }
	.case-title { display: flex; gap: .6rem; flex-wrap: wrap; align-items: baseline; font-size: .875rem; } .case-title::before { content: '›'; font-size: 1.1rem; } .case[open] .case-title::before { content: '⌄'; }
	.identifier { color: var(--gawdux-text-muted, #64748b); font-size: .75rem; } .result { text-transform: capitalize; font-size: .75rem; flex-shrink: 0; }
	.case-body { padding: 0 1rem 1rem; border-top: 1px solid var(--gawdux-border, #dce1e7); } .case-body > p { margin: .85rem 0; }
	.step { border-left: 2px solid var(--gawdux-border, #dce1e7); padding-left: 1rem; margin-top: 1.25rem; } .step-result { font-size: .7rem; margin-left: .5rem; text-transform: uppercase; }
	.observation { white-space: pre-wrap; overflow-wrap: anywhere; } .captures { display: grid; gap: .5rem; list-style: none; padding: 0; font-size: .8125rem; }
	.captures li { padding: .6rem .75rem; border-radius: .4rem; background: var(--gawdux-surface-subtle, #f1f5f9); } a { color: var(--gawdux-text-accent, #2563eb); text-decoration: underline; }
	.captures summary, .identity summary { font-size: .75rem; cursor: pointer; margin-top: .4rem; }
	code { font-size: .75rem; overflow-wrap: anywhere; } button { margin-top: .7rem; padding: .55rem .8rem; color: var(--gawdux-text-accent, #2563eb); border: 1px solid var(--gawdux-border-input, #b9c2cc); border-radius: .4rem; background: transparent; font: inherit; font-size: .8125rem; cursor: pointer; }
	.traceability dl { margin: 0; font-size: .8125rem; } .traceability dl > div { display: grid; grid-template-columns: minmax(6rem, 1fr) 2fr; gap: 1rem; border-top: 1px solid var(--gawdux-border, #dce1e7); padding: .6rem 0; } dd { margin: 0; overflow-wrap: anywhere; }
	.identity dl { display: grid; gap: .4rem; font-size: .75rem; } .identity dt { font-weight: 600; margin-top: .4rem; }
	@media(max-width: 480px) { .counts > div { padding: .75rem .6rem; } .counts dt { min-height: 2.2em; } .case > summary { flex-wrap: wrap; gap: .4rem; } .result { margin-left: 1.2rem; } }
</style>
