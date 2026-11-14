import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ManualObservationCommandSurface from '../src/lib/validation/ManualObservationCommandSurface.svelte';
import * as validation from '../src/lib/validation/index.js';
import type { ManualObservationInput } from '../src/lib/validation/types';
import ManualObservationHarness from './fixtures/ManualObservationHarness.svelte';

// The manual observation drawer: a manual case's observation and its result,
// entered at the command bar. The drawer holds the form, the bar holds
// Cancel and Save observation; nothing is recorded until the person has
// written what they observed and chosen Pass or Fail, and the host records
// it from what the drawer hands it.

afterEach(() => cleanup());

function renderDrawer(props: Record<string, unknown> = {}) {
	const oncomplete = vi.fn<(input: ManualObservationInput) => Promise<void> | void>();
	const oncancel = vi.fn();
	const view = render(ManualObservationCommandSurface, {
		props: {
			open: true,
			caseId: 'C-4',
			title: 'Inspect the label',
			expectedRevision: '7',
			oncomplete,
			oncancel,
			...props
		}
	});
	return { ...view, oncomplete: (props['oncomplete'] as typeof oncomplete) ?? oncomplete, oncancel };
}

const drawer = () => document.querySelector<HTMLElement>('[data-manual-observation-drawer]');
const save = () => document.querySelector<HTMLButtonElement>('button[data-action-confirm]')!;
const cancel = () => document.querySelector<HTMLButtonElement>('button[data-action-cancel]')!;
const observation = () =>
	document.querySelector<HTMLTextAreaElement>('textarea[name="manual-observation"]')!;
const result = () => document.querySelector<HTMLSelectElement>('select[name="manual-result"]')!;

async function enter(observed: string, choice: '' | 'pass' | 'fail') {
	await fireEvent.input(observation(), { target: { value: observed } });
	result().value = choice;
	await fireEvent.change(result());
}

describe('ManualObservationCommandSurface', () => {
	it('names the case and what is saved with the result, the form in the drawer and the pair in the bar', () => {
		renderDrawer();
		expect(drawer()).not.toBeNull();
		expect(drawer()!.querySelector('.page-command-drawer-title')?.textContent).toBe(
			'Record manual observation: Inspect the label'
		);
		expect(drawer()!.querySelector('[data-manual-statement]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
			'Record what you observed in C-4. Your name and the time are saved with the result.'
		);
		expect(drawer()!.querySelectorAll('button')).toHaveLength(0);
		expect(drawer()!.contains(save())).toBe(false);
		expect(drawer()!.contains(cancel())).toBe(false);
		expect(save().textContent?.trim()).toBe('Save observation');
		expect(cancel().textContent?.trim()).toBe('Cancel');
	});

	it('chooses no result for the person: Pass or Fail, after "Select a result"', () => {
		renderDrawer();
		const options = [...result().options].map((option) => [option.textContent, option.value, option.disabled]);
		expect(options).toEqual([
			['Select a result', '', true],
			['Pass', 'pass', false],
			['Fail', 'fail', false]
		]);
		expect(result().value).toBe('');
	});

	it('holds Save until an observation is written and a result chosen', async () => {
		renderDrawer();
		expect(save().disabled).toBe(true);
		await enter('Label reads lot 42', '');
		expect(save().disabled).toBe(true);
		await enter('   ', 'pass');
		expect(save().disabled).toBe(true);
		await enter('Label reads lot 42', 'fail');
		expect(save().disabled).toBe(false);
	});

	it('hands the case, the revision read, the observation and the result to the host', async () => {
		const { oncomplete } = renderDrawer();
		await enter('  Label reads lot 42  ', 'pass');
		await fireEvent.click(save());
		expect(oncomplete).toHaveBeenCalledTimes(1);
		expect(oncomplete).toHaveBeenCalledWith({
			caseId: 'C-4',
			expectedRevision: '7',
			observed: 'Label reads lot 42',
			result: 'pass'
		});
	});

	it('holds still while the host records it: one save, nothing closes it, Save says it is saving', async () => {
		let settle!: () => void;
		const oncomplete = vi.fn(() => new Promise<void>((resolve) => (settle = resolve)));
		const { oncancel } = renderDrawer({ oncomplete });
		await enter('Label reads lot 42', 'pass');
		await fireEvent.click(save());
		await tick();
		expect(save().textContent?.trim()).toBe('Saving…');
		expect(save().disabled).toBe(true);
		expect(cancel().disabled).toBe(true);
		expect(observation().disabled).toBe(true);
		await fireEvent.click(save());
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
		expect(oncomplete).toHaveBeenCalledTimes(1);
		expect(oncancel).not.toHaveBeenCalled();
		settle();
		await waitFor(() => expect(save().textContent?.trim()).toBe('Save observation'));
	});

	it('shows a refused save inside the drawer, which stays open with what was typed', async () => {
		const oncomplete = vi.fn(() => Promise.reject(new Error('refused')));
		renderDrawer({ oncomplete });
		await enter('Label reads lot 42', 'fail');
		await fireEvent.click(save());
		const alert = await waitFor(() => {
			const found = drawer()!.querySelector('[role="alert"]');
			expect(found).not.toBeNull();
			return found!;
		});
		expect(alert.textContent).toBe(
			'The observation was not saved. Reload the page and check your access, then try again.'
		);
		expect(observation().value).toBe('Label reads lot 42');
		expect(result().value).toBe('fail');
		expect(save().disabled).toBe(false);
	});

	it("shows the host's own refusal, and holds still while the host says a write is in flight", () => {
		renderDrawer({ error: 'The execution changed since you opened it.', busy: true });
		expect(drawer()!.querySelector('[role="alert"]')?.textContent).toBe(
			'The execution changed since you opened it.'
		);
		expect(cancel().disabled).toBe(true);
		expect(save().disabled).toBe(true);
		expect(save().textContent?.trim()).toBe('Saving…');
	});

	it('turns Cancel red only while typed input would be lost', async () => {
		renderDrawer();
		expect(cancel().getAttribute('data-discards')).toBe('false');
		expect(cancel().getAttribute('data-tone')).toBe('neutral');
		await enter('Label', '');
		expect(cancel().getAttribute('data-discards')).toBe('true');
		await enter('', '');
		expect(cancel().getAttribute('data-discards')).toBe('false');
		await enter('', 'pass');
		expect(cancel().getAttribute('data-discards')).toBe('true');
	});

	it('closes on Cancel and on Escape', async () => {
		const { oncancel } = renderDrawer();
		await fireEvent.click(cancel());
		expect(oncancel).toHaveBeenCalledTimes(1);
		await fireEvent.keyDown(window, { key: 'Escape' });
		expect(oncancel).toHaveBeenCalledTimes(2);
	});

	it('draws nothing while closed', () => {
		renderDrawer({ open: false });
		expect(drawer()).toBeNull();
		expect(document.querySelector('button[data-action-confirm]')).toBeNull();
	});

	it('clears what was typed on every close, and when the host opens it for another case', async () => {
		const record = vi.fn(async () => {});
		const { container } = render(ManualObservationHarness, { props: { record } });
		const toggle = container.querySelector<HTMLButtonElement>('[data-harness-toggle]')!;
		await enter('Label reads lot 42', 'pass');
		await fireEvent.click(toggle);
		expect(drawer()).toBeNull();
		await fireEvent.click(toggle);
		expect(observation().value).toBe('');
		expect(result().value).toBe('');

		await enter('Label reads lot 42', 'pass');
		await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-harness-other]')!);
		expect(drawer()!.querySelector('.page-command-drawer-title')?.textContent).toBe(
			'Record manual observation: Inspect the seal'
		);
		expect(observation().value).toBe('');
		expect(result().value).toBe('');
		expect(save().disabled).toBe(true);
	});

	it('is closed by its host once the observation is recorded', async () => {
		const record = vi.fn(async () => {});
		render(ManualObservationHarness, { props: { record } });
		await enter('Seal intact', 'pass');
		await fireEvent.click(save());
		await waitFor(() => expect(drawer()).toBeNull());
		expect(record).toHaveBeenCalledWith({
			caseId: 'C-4',
			expectedRevision: '7',
			observed: 'Seal intact',
			result: 'pass'
		});
	});

	it('is exported from gawdux/validation', () => {
		expect(validation.ManualObservationCommandSurface).toBe(ManualObservationCommandSurface);
	});
});
