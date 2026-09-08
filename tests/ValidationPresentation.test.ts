import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { ValidationRunReport, SignatureHistory, ManualObservationForm } from '../src/lib/validation/index.js';
import type { ValidationExecutionView } from '../src/lib/validation/types.js';

afterEach(cleanup);
const execution: ValidationExecutionView = {
	id: 'synthetic-01', title: 'Isolated access change', protocol: 'ENG-001', protocolRevision: '1',
	status: 'uploaded', startedAt: '2026-09-08T00:00:00Z', environment: 'Disposable fixture', revision: 'revision-1', contentHash: 'a'.repeat(64), evidenceHeld: false,
	traceability: [{ requirement: 'R-1', cases: ['C-1'] }], cases: [{ id: 'C-1', title: 'Verify access', mode: 'automated', result: 'fail', requirements: ['R-1'], steps: [{ number: 1, action: 'Read target', expected: 'Target responds', result: 'fail', observed: ['Sensitive fixture observation'], evidence: [{ file: 'capture.txt', label: 'Capture', sha256: 'b'.repeat(64), href: 'javascript:alert(1)' }] }] }]
};
describe('validation presentation', () => {
	it('shows a failure expanded and renders unsafe evidence URLs as inert text', () => {
		const { container } = render(ValidationRunReport, { execution });
		expect(container.querySelector('details.case')?.hasAttribute('open')).toBe(true);
		expect(screen.getByText('Sensitive fixture observation')).toBeTruthy();
		expect(screen.queryByRole('link', { name: 'Capture' })).toBeNull();
		expect(screen.getByText('Requirement coverage')).toBeTruthy();
	});
	it('withholds observations and capture metadata even if the host mistakenly includes them', () => {
		render(ValidationRunReport, { execution: { ...execution, evidenceHeld: true } });
		expect(screen.queryByText('Sensitive fixture observation')).toBeNull();
		expect(screen.queryByText('Capture')).toBeNull();
		expect(screen.getByText(/restricted for this account/)).toBeTruthy();
	});
	it('distinguishes unknown historical integrity, failed integrity and withdrawn signatures', () => {
		render(SignatureHistory, { entries: [
			{ id: '1', signer: 'Synthetic reviewer', signedAt: '2026-09-08', meaning: 'Review', contentHash: 'a', integrity: null },
			{ id: '2', signer: 'Synthetic approver', signedAt: '2026-09-08', meaning: 'Approval', contentHash: 'b', integrity: false, withdrawnAt: '2026-09-09', withdrawalReason: 'Superseded' }
		] });
		expect(screen.getByText('Historical content verification unavailable')).toBeTruthy();
		expect(screen.getByText('Content verification failed')).toBeTruthy();
		expect(screen.getByText('Withdrawn')).toBeTruthy();
	});
	it('requires an explicit result, sends revision and blocks duplicate saves while pending', async () => {
		let resolve!: () => void;
		const oncomplete = vi.fn(() => new Promise<void>(done => { resolve = done; }));
		render(ManualObservationForm, { caseId: 'M-1', title: 'Review output', expectedRevision: 'revision-1', oncomplete });
		const save = screen.getByRole('button', { name: 'Save observation' }) as HTMLButtonElement;
		expect(save.disabled).toBe(true);
		await fireEvent.input(screen.getByLabelText('Observation'), { target: { value: 'Independent observation' } });
		expect(save.disabled).toBe(true);
		await fireEvent.change(screen.getByLabelText('Result'), { target: { value: 'fail' } });
		await fireEvent.submit(screen.getByRole('form'));
		await fireEvent.submit(screen.getByRole('form'));
		expect(oncomplete).toHaveBeenCalledTimes(1);
		expect(oncomplete).toHaveBeenCalledWith({ caseId: 'M-1', expectedRevision: 'revision-1', observed: 'Independent observation', result: 'fail' });
		resolve(); await tick();
	});
	it('retains a failed manual entry without exposing arbitrary server errors', async () => {
		render(ManualObservationForm, { caseId: 'M-1', title: 'Review output', expectedRevision: 'revision-1', oncomplete: async () => { throw new Error('secret database detail'); } });
		await fireEvent.input(screen.getByLabelText('Observation'), { target: { value: 'Observed output' } });
		await fireEvent.change(screen.getByLabelText('Result'), { target: { value: 'pass' } });
		await fireEvent.submit(screen.getByRole('form'));
		expect(await screen.findByRole('alert')).toBeTruthy();
		expect((screen.getByLabelText('Observation') as HTMLTextAreaElement).value).toBe('Observed output');
		expect(screen.queryByText('secret database detail')).toBeNull();
	});
});
