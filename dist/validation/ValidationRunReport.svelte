<!--
    An execution's report: the cases it ran with their results, Passed,
    Failed or Not run, each in one colour; every step with its expected
    result, what was observed and its captures; the requirements each case
    covers; and the execution's identity with the SHA-256 of its content.
    A failed case opens. The host heads it (protocol, version, where and
    when) and supplies the notice that replaces observations it withholds;
    nothing here signs, completes or changes an execution.
-->
<script lang="ts">
	import type { ValidationExecutionView } from './types.js';
	import { resultCounts, resultWord } from './run-report.js';

	let {
		execution,
		heldNotice = null
	}: {
		execution: ValidationExecutionView;
		/** What a reader reads in place of observations and captures the host withholds. */
		heldNotice?: string | null;
	} = $props();

	const counts = $derived(resultCounts(execution.cases));

	function tone(result: string): string {
		return result === 'pass' ? 'pass' : result === 'fail' ? 'fail' : 'not-run';
	}

	function safeHref(value: string | undefined): string | undefined {
		if (!value || /[\x00-\x20\\]/.test(value)) return undefined;
		if (value.startsWith('/') && !value.startsWith('//')) return value;
		try {
			const url = new URL(value);
			return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
				? value
				: undefined;
		} catch {
			return undefined;
		}
	}
</script>

<article class="run-report" aria-label="Execution report" data-validation-run-report>
	<dl class="counts" data-run-counts>
		<div><dt>Passed</dt><dd class="pass" data-count="pass">{counts.passed}</dd></div>
		<div><dt>Failed</dt><dd class="fail" data-count="fail">{counts.failed}</dd></div>
		<div><dt>Not run</dt><dd class="not-run" data-count="not-run">{counts.notRun}</dd></div>
	</dl>
	{#if execution.evidenceHeld && heldNotice}
		<p class="notice" data-run-held>{heldNotice}</p>
	{/if}
	<div class="cases">
		{#each execution.cases as item (item.id)}
			<details class="case" open={item.result === 'fail'} data-run-case={item.id}>
				<summary>
					<span class="case-title"
						><span class="identifier">{item.id}</span><span class="name">{item.title}</span></span
					>
					<span class="result {tone(item.result)}" data-result={tone(item.result)}
						>{resultWord(item.result)}</span
					>
				</summary>
				<div class="case-body">
					{#if item.requirements.length}
						<p class="muted">{item.requirements.join(', ')}</p>
					{/if}
					{#if !execution.evidenceHeld}
						{#each item.steps as step (step.number)}
							<section class="step" data-run-step={step.number}>
								<p class="step-head">
									<span>{step.number}. {step.action}</span>
									<span class="step-result {tone(step.result)}">{resultWord(step.result)}</span>
								</p>
								<p class="muted">Expected: {step.expected}</p>
								{#each step.observed as observation, index (index)}
									<p class="observation">{observation}</p>
								{/each}
								{#if step.evidence.length}
									<ul class="captures">
										{#each step.evidence as capture (capture.file)}
											<li>
												{#if safeHref(capture.href)}<a href={safeHref(capture.href)}
														>{capture.label || capture.file}</a
													>{:else}<span>{capture.label || capture.file}</span>{/if}
												<code class="hash">SHA-256 {capture.sha256}</code>
											</li>
										{/each}
									</ul>
								{/if}
							</section>
						{/each}
					{/if}
				</div>
			</details>
		{/each}
	</div>
	{#if execution.traceability.length}
		<section class="traceability">
			<h3>Requirement coverage</h3>
			<dl>
				{#each execution.traceability as row (row.requirement)}
					<div><dt>{row.requirement}</dt><dd>{row.cases.join(', ')}</dd></div>
				{/each}
			</dl>
		</section>
	{/if}
	<dl class="identity" data-run-identity>
		<div><dt>Execution</dt><dd><code>{execution.id}</code></dd></div>
		<div><dt>Content SHA-256</dt><dd><code>{execution.contentHash}</code></dd></div>
	</dl>
</article>

<style>
	.run-report {
		color: var(--gawdux-text-primary);
		display: grid;
		gap: 1rem;
		min-width: 0;
	}
	p {
		margin: 0.25rem 0;
		font-size: 0.8125rem;
		line-height: 1.45;
	}
	.muted {
		color: var(--gawdux-text-secondary);
	}
	.pass {
		color: var(--gawdux-text-success);
	}
	.fail {
		color: var(--gawdux-text-error);
	}
	.not-run {
		color: var(--gawdux-text-muted);
	}
	.counts {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		margin: 0;
		border: 1px solid var(--gawdux-border);
		border-radius: 0.5rem;
		background: var(--gawdux-surface-card);
	}
	.counts > div {
		padding: 0.75rem 1rem;
		min-width: 0;
	}
	.counts > div + div {
		border-left: 1px solid var(--gawdux-border);
	}
	.counts dt {
		font-size: 0.75rem;
		color: var(--gawdux-text-secondary);
	}
	.counts dd {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.15rem 0 0;
		font-variant-numeric: tabular-nums;
	}
	.notice {
		margin: 0;
		padding: 0.6rem 0.85rem;
		border-radius: 0.4rem;
		background: var(--gawdux-surface-subtle);
		color: var(--gawdux-text-secondary);
	}
	.cases {
		display: grid;
		gap: 0.5rem;
	}
	.case {
		border: 1px solid var(--gawdux-border);
		border-radius: 0.5rem;
		background: var(--gawdux-surface-card);
		min-width: 0;
	}
	.case > summary {
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
		align-items: baseline;
		padding: 0.65rem 0.85rem;
		cursor: pointer;
		list-style: none;
	}
	.case > summary::-webkit-details-marker {
		display: none;
	}
	.case-title {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: baseline;
		min-width: 0;
		font-size: 0.8125rem;
	}
	.identifier {
		color: var(--gawdux-text-muted);
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.name {
		font-weight: 600;
		overflow-wrap: anywhere;
	}
	.result {
		font-size: 0.75rem;
		font-weight: 600;
		flex-shrink: 0;
		white-space: nowrap;
	}
	.case-body {
		padding: 0.25rem 0.85rem 0.85rem;
		border-top: 1px solid var(--gawdux-border);
	}
	.step {
		border-left: 2px solid var(--gawdux-border);
		padding-left: 0.75rem;
		margin-top: 0.75rem;
	}
	.step-head {
		display: flex;
		gap: 0.75rem;
		justify-content: space-between;
		font-weight: 600;
	}
	.step-result {
		font-size: 0.75rem;
		white-space: nowrap;
	}
	.observation {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.captures {
		display: grid;
		gap: 0.35rem;
		list-style: none;
		padding: 0;
		margin: 0.4rem 0 0;
		font-size: 0.8125rem;
	}
	.captures li {
		display: grid;
		gap: 0.15rem;
		padding: 0.45rem 0.6rem;
		border-radius: 0.35rem;
		background: var(--gawdux-surface-subtle);
		min-width: 0;
	}
	a {
		color: var(--gawdux-text-accent);
		text-decoration: underline;
	}
	code {
		font-size: 0.75rem;
		overflow-wrap: anywhere;
	}
	.hash {
		color: var(--gawdux-text-muted);
	}
	h3 {
		font-size: 0.75rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		color: var(--gawdux-text-secondary);
	}
	.traceability dl {
		margin: 0;
		font-size: 0.8125rem;
	}
	.traceability dl > div {
		display: grid;
		grid-template-columns: minmax(6rem, 1fr) 2fr;
		gap: 1rem;
		border-top: 1px solid var(--gawdux-border);
		padding: 0.5rem 0;
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
	.identity {
		display: grid;
		gap: 0.35rem;
		margin: 0;
		font-size: 0.75rem;
		color: var(--gawdux-text-secondary);
	}
	.identity dt {
		font-weight: 600;
	}
	@media (max-width: 480px) {
		.counts > div {
			padding: 0.6rem;
		}
		.case > summary {
			flex-wrap: wrap;
			gap: 0.35rem;
		}
	}
</style>
