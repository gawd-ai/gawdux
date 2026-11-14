import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import * as validation from '../src/lib/validation/index.js';
import { ValidationRunReport, resultCounts, resultWord } from '../src/lib/validation/index.js';
import type { ValidationExecutionView } from '../src/lib/validation/types.js';
import ValidationRunReport_0_42_0 from './fixtures/ValidationRunReport_0_42_0.svelte';

afterEach(cleanup);

const execution: ValidationExecutionView = {
	id: 'synthetic-01',
	contentHash: 'a'.repeat(64),
	evidenceHeld: false,
	traceability: [{ requirement: 'R-1', cases: ['C-1'] }],
	cases: [
		{
			id: 'C-1',
			title: 'Verify access',
			result: 'fail',
			requirements: ['R-1'],
			steps: [
				{
					number: 1,
					action: 'Read target',
					expected: 'Target responds',
					result: 'fail',
					observed: ['Sensitive fixture observation'],
					evidence: [
						{ file: 'capture.txt', label: 'Capture', sha256: 'b'.repeat(64), href: 'javascript:alert(1)' }
					]
				}
			]
		},
		{
			id: 'C-2',
			title: 'Read the list',
			result: 'pass',
			requirements: [],
			steps: [
				{
					number: 1,
					action: 'Open the list',
					expected: 'The list reads',
					result: 'pass',
					observed: [],
					evidence: [{ file: 'list.png', label: 'List', sha256: 'c'.repeat(64), href: '/evidence/c' }]
				}
			]
		},
		{ id: 'C-3', title: 'Left out', result: 'not-run', requirements: [], steps: [] }
	]
};

describe('ValidationRunReport', () => {
	it('reads results as Passed, Failed and Not run, one tone each, and counts them', () => {
		const { container } = render(ValidationRunReport, { execution });
		const counts = container.querySelector('[data-run-counts]')!;
		expect(counts.querySelector('[data-count="pass"]')?.textContent).toBe('1');
		expect(counts.querySelector('[data-count="fail"]')?.textContent).toBe('1');
		expect(counts.querySelector('[data-count="not-run"]')?.textContent).toBe('1');
		expect(counts.textContent).not.toMatch(/Awaiting/);
		const results = [...container.querySelectorAll('summary [data-result]')].map((el) => [
			el.getAttribute('data-result'),
			el.textContent
		]);
		expect(results).toEqual([
			['fail', 'Failed'],
			['pass', 'Passed'],
			['not-run', 'Not run']
		]);
	});

	it('opens a failed case and keeps an unsafe capture address inert', () => {
		const { container } = render(ValidationRunReport, { execution });
		expect(container.querySelector('[data-run-case="C-1"]')?.hasAttribute('open')).toBe(true);
		expect(container.querySelector('[data-run-case="C-2"]')?.hasAttribute('open')).toBe(false);
		expect(screen.getByText('Sensitive fixture observation')).toBeTruthy();
		expect(screen.queryByRole('link', { name: 'Capture' })).toBeNull();
		expect(screen.getByRole('link', { name: 'List' }).getAttribute('href')).toBe('/evidence/c');
		expect(screen.getByText('Requirement coverage')).toBeTruthy();
		expect(container.querySelector('[data-run-identity]')?.textContent).toContain('a'.repeat(64));
	});

	it("withholds observations and captures, reading the host's notice in their place", () => {
		const { container } = render(ValidationRunReport, {
			execution: { ...execution, evidenceHeld: true },
			heldNotice: 'Held by the host'
		});
		expect(screen.queryByText('Sensitive fixture observation')).toBeNull();
		expect(screen.queryByText('Capture')).toBeNull();
		expect(container.querySelector('[data-run-held]')?.textContent).toBe('Held by the host');
	});

	it('carries no control: nothing to complete, sign or change', () => {
		const { container } = render(ValidationRunReport, { execution });
		expect(container.querySelectorAll('button, form, input, select, textarea').length).toBe(0);
		expect(container.querySelector('.status')).toBeNull();
		expect(Object.keys(validation).sort()).toEqual([
			'ManualObservationCommandSurface',
			'SignatureCommandSurface',
			'ValidationRunReport',
			'resultCounts',
			'resultWord',
			'signatureStatement'
		]);
	});

	it('words and counts results', () => {
		expect([resultWord('pass'), resultWord('fail'), resultWord('not-run'), resultWord('x')]).toEqual([
			'Passed',
			'Failed',
			'Not run',
			'Not run'
		]);
		expect(resultCounts(execution.cases)).toEqual({ passed: 1, failed: 1, notRun: 1 });
	});
});

/** The markup as a reader meets it: no comment anchors, no scoped style hash. */
function markup(container: HTMLElement): string {
	return container.innerHTML
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\s*\bsvelte-[a-z0-9]+\b/g, '')
		.replace(/ class=""/g, '');
}

/** A run with two manual cases: one recorded, one the reader may complete. */
const manualRun: ValidationExecutionView = {
	...execution,
	cases: [
		...execution.cases,
		{
			id: 'C-4',
			title: 'Inspect the label',
			result: 'pass',
			requirements: ['R-2'],
			steps: [],
			manual: { observed: 'Label reads lot 42', enteredBy: 'Jane Doe', enteredAt: '2026-11-14 09:12' }
		},
		{ id: 'C-5', title: 'Inspect the seal', result: 'not-run', requirements: [], steps: [], canComplete: true }
	]
};

describe('ValidationRunReport manual cases', () => {
	it('reads exactly as 0.42.0 read a report with no manual parts', () => {
		for (const props of [
			{ execution },
			{ execution: { ...execution, evidenceHeld: true }, heldNotice: 'Held by the host' },
			{ execution: { ...execution, traceability: [] } }
		]) {
			const now = render(ValidationRunReport, props);
			const before = render(ValidationRunReport_0_42_0, props);
			expect(markup(now.container)).toBe(markup(before.container));
			cleanup();
		}
	});

	it("draws neither part while the host passes neither: no action without onmanual, no block without manual", () => {
		const { container } = render(ValidationRunReport, {
			execution: { ...execution, cases: execution.cases.map((item) => ({ ...item, canComplete: true })) }
		});
		expect(container.querySelectorAll('button').length).toBe(0);
		expect(container.querySelector('[data-run-manual]')).toBeNull();
	});

	it("shows a case's recorded observation: what was observed, by whom, when", () => {
		const { container } = render(ValidationRunReport, { execution: manualRun });
		const recorded = container.querySelector('[data-run-case="C-4"] [data-run-manual]')!;
		expect(recorded).not.toBeNull();
		expect(recorded.querySelector('.observation')?.textContent).toBe('Label reads lot 42');
		expect(recorded.querySelector('.muted')?.textContent).toBe('Recorded by Jane Doe · 2026-11-14 09:12');
		expect(container.querySelector('[data-run-case="C-5"] [data-run-manual]')).toBeNull();
	});

	it('offers "Record manual observation" on a case the host lets the reader complete, and hands its id over', async () => {
		const onmanual = vi.fn();
		const { container } = render(ValidationRunReport, { execution: manualRun, onmanual });
		const actions = [...container.querySelectorAll<HTMLButtonElement>('[data-run-record]')];
		expect(actions.map((button) => [button.closest('[data-run-case]')?.getAttribute('data-run-case'), button.textContent])).toEqual([
			['C-5', 'Record manual observation']
		]);
		await fireEvent.click(actions[0]!);
		expect(onmanual).toHaveBeenCalledWith('C-5');
	});

	it('withholds a recorded observation with the steps, and still offers the action', () => {
		const { container } = render(ValidationRunReport, {
			execution: { ...manualRun, evidenceHeld: true },
			heldNotice: 'Held by the host',
			onmanual: () => {}
		});
		expect(screen.queryByText('Label reads lot 42')).toBeNull();
		expect(container.querySelector('[data-run-manual]')).toBeNull();
		expect(container.querySelector('[data-run-record="C-5"]')).not.toBeNull();
	});
});
