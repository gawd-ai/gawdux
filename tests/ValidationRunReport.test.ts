import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import * as validation from '../src/lib/validation/index.js';
import { ValidationRunReport, resultCounts, resultWord } from '../src/lib/validation/index.js';
import type { ValidationExecutionView } from '../src/lib/validation/types.js';

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
			'ValidationRunReport',
			'resultCounts',
			'resultWord'
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
