import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import BotConfigFieldsHarness from './fixtures/BotConfigFieldsHarness.svelte';
import { BotConfigContentFields, BotConfigAssignments } from '../src/lib/admin/index';

afterEach(cleanup);

function workingCopy(container: HTMLElement) {
	return JSON.parse(container.querySelector('[data-working-copy]')!.textContent!);
}

describe('composable bot config fields', () => {
	it('preserves the composite API, native field names and neutral defaults', () => {
		const { container } = render(BotConfigFieldsHarness);
		const name = screen.getByLabelText('Name') as HTMLInputElement;
		const body = screen.getByLabelText(/Instructions/) as HTMLTextAreaElement;
		expect(name.id).toBe('bot-config-name');
		expect(name.name).toBe('name');
		expect(name.required).toBe(true);
		expect(name.maxLength).toBe(120);
		expect(body.id).toBe('bot-config-body');
		expect(body.name).toBe('body');
		expect(body.rows).toBe(10);
		expect(screen.getByText('3993 characters left')).toBeTruthy();
		expect(container.querySelector('input[name="enabled"]')?.getAttribute('value')).toBe('true');
		expect(screen.getByRole('checkbox', { name: 'Enabled' })).toBeTruthy();
		expect(screen.getByRole('checkbox', { name: 'Operations' })).toBeTruthy();
		expect(container.querySelectorAll('input[name="botIds"]')).toHaveLength(2);
		expect(container.querySelector('form')).toBeNull();
		expect(BotConfigContentFields).toBeDefined();
		expect(BotConfigAssignments).toBeDefined();
	});

	it('keeps every composite value bound to the host working copy without trimming', async () => {
		const { container } = render(BotConfigFieldsHarness);
		await fireEvent.input(screen.getByLabelText('Name'), { target: { value: ' New name ' } });
		await fireEvent.input(screen.getByLabelText(/Instructions/), { target: { value: 'Line one.\n\n Line two. ' } });
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Enabled' }));
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Review' }));
		expect(workingCopy(container)).toEqual({
			name: ' New name ', body: 'Line one.\n\n Line two. ', enabled: false, botIds: ['ops', 'review']
		});
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Operations' }));
		expect(workingCopy(container).botIds).toEqual(['review']);
	});

	it.each(['composite', 'leaves'] as const)('renders a replacement working copy through %s bindings', async (mode) => {
		render(BotConfigFieldsHarness, { props: { mode } });
		await fireEvent.click(screen.getByRole('button', { name: 'Replace working copy' }));
		expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Replacement');
		const body = screen.getByLabelText(mode === 'composite' ? /Instructions/ : /Context/) as HTMLTextAreaElement;
		expect(body.value).toBe('Replaced');
		const enabled = screen.getByRole('checkbox', { name: mode === 'composite' ? 'Enabled' : 'Config enabled' }) as HTMLInputElement;
		expect(enabled.checked).toBe(false);
		expect((screen.getByRole('checkbox', { name: /Review/ }) as HTMLInputElement).checked).toBe(true);
		expect((screen.getByRole('checkbox', { name: /Operations/ }) as HTMLInputElement).checked).toBe(false);
	});

	it.each(['composite', 'leaves'] as const)('disables all editable fields and assignments in %s', (mode) => {
		const { container } = render(BotConfigFieldsHarness, { props: { mode, disabled: true } });
		const inputs = [...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea')];
		expect(inputs).toHaveLength(5);
		expect(inputs.every((input) => input.disabled)).toBe(true);
	});

	it('keeps accessible validation host-controlled until the host clears it', async () => {
		render(BotConfigFieldsHarness, { props: { mode: 'leaves' } });
		const name = screen.getByLabelText('Name') as HTMLInputElement;
		expect(name.getAttribute('aria-invalid')).toBe('true');
		expect(name.getAttribute('aria-describedby')).toBe('custom-name-error');
		expect(document.getElementById('custom-name-error')?.textContent).toContain('A name is required.');
		await fireEvent.input(name, { target: { value: 'Valid now' } });
		expect(name.getAttribute('aria-invalid')).toBe('true');
		await fireEvent.click(screen.getByRole('button', { name: 'Clear validation' }));
		expect(name.hasAttribute('aria-invalid')).toBe(false);
		expect(name.hasAttribute('aria-describedby')).toBe(false);
		expect(document.getElementById('custom-name-error')).toBeNull();
	});

	it('supports host editor sizing, copy and counter/help without local field duplication', () => {
		const { container } = render(BotConfigFieldsHarness, { props: { mode: 'leaves' } });
		const body = screen.getByLabelText(/Context/) as HTMLTextAreaElement;
		expect(body.rows).toBe(18);
		expect(body.classList.contains('long-editor')).toBe(true);
		expect(body.classList.contains('min-h-[22rem]')).toBe(true);
		expect(body.placeholder).toBe('Context goes here');
		expect((screen.getByLabelText('Name') as HTMLInputElement).placeholder).toBe('Organization vocabulary');
		expect(container.querySelector('[data-host-counter]')?.textContent).toBe('7 of 40');
		expect(screen.queryByText(/characters left/)).toBeNull();
		expect(container.querySelector('[data-host-help]')).not.toBeNull();
		expect(screen.getByText('On')).toBeTruthy();
	});

	it('keeps custom assignment labels, native keyboard focus and aggregate policy with the host', async () => {
		const { container } = render(BotConfigFieldsHarness, { props: { mode: 'leaves' } });
		const operations = screen.getByRole('checkbox', { name: 'Operations / Agent' }) as HTMLInputElement;
		operations.focus();
		expect(document.activeElement).toBe(operations);
		expect(operations.tabIndex).toBe(0);
		expect(container.querySelector('[data-bot-config-assignments]')?.classList.contains('grid-cols-2')).toBe(true);
		expect(container.querySelectorAll('.assignment-choice')).toHaveLength(2);
		await fireEvent.click(screen.getByRole('button', { name: 'Assign all' }));
		expect(workingCopy(container).botIds).toEqual(['ops', 'review']);
		expect((screen.getByRole('checkbox', { name: 'Review / Agent' }) as HTMLInputElement).checked).toBe(true);
	});
});
