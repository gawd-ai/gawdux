import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PasswordWithRequirements, {
	type PasswordRequirementRule
} from '../src/lib/primitives/PasswordWithRequirements.svelte';

afterEach(() => cleanup());

const rules: readonly PasswordRequirementRule[] = [
	{ label: 'At least 8 characters', test: (s) => s.length >= 8 },
	{ label: 'Uppercase letter (A–Z)', test: (s) => /[A-Z]/.test(s) },
	{ label: 'Digit (0–9)', test: (s) => /[0-9]/.test(s) }
];

function metCount(container: HTMLElement): number {
	return container.querySelectorAll('li .bg-green-500').length;
}

describe('PasswordWithRequirements', () => {
	it('derives its checklist from consumer-supplied rules plus the confirmation rule', () => {
		const { container } = render(PasswordWithRequirements, {
			props: { value: '', rules }
		});

		expect(screen.getByText('Requirements')).toBeTruthy();
		for (const rule of rules) expect(screen.getByText(rule.label)).toBeTruthy();
		expect(screen.getByText('Both passwords match')).toBeTruthy();
		expect(container.querySelectorAll('li')).toHaveLength(rules.length + 1);
		expect(metCount(container)).toBe(0);
	});

	it('checks rules live as the password and confirmation change', async () => {
		const { container } = render(PasswordWithRequirements, {
			props: { value: '', rules }
		});

		const password = container.querySelector<HTMLInputElement>('input[name="password"]')!;
		const confirm = container.querySelector<HTMLInputElement>('input[name="confirm"]')!;

		await fireEvent.input(password, { target: { value: 'Str0ngpass' } });
		expect(metCount(container)).toBe(3); // all rules, confirmation still pending

		await fireEvent.input(confirm, { target: { value: 'Str0ngpass' } });
		expect(metCount(container)).toBe(4);
	});

	it('omits the confirmation field and rule when showConfirm is false', () => {
		const { container } = render(PasswordWithRequirements, {
			props: { value: '', rules, showConfirm: false }
		});

		expect(container.querySelector('input[name="confirm"]')).toBeNull();
		expect(screen.queryByText('Both passwords match')).toBeNull();
		expect(container.querySelectorAll('li')).toHaveLength(rules.length);
	});

	it('overrides rule labels by index and toggles field visibility accessibly', async () => {
		const { container } = render(PasswordWithRequirements, {
			props: {
				value: '',
				rules,
				ruleLabels: ['Mindestens 8 Zeichen'],
				showConfirm: false
			}
		});

		expect(screen.getByText('Mindestens 8 Zeichen')).toBeTruthy();
		expect(screen.queryByText('At least 8 characters')).toBeNull();

		const password = container.querySelector<HTMLInputElement>('input[name="password"]')!;
		const toggle = screen.getByRole('button', { name: 'Show password' });
		expect(password.type).toBe('password');
		await fireEvent.click(toggle);
		expect(password.type).toBe('text');
		expect(toggle.getAttribute('aria-pressed')).toBe('true');
	});
});
