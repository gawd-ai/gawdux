/**
 * The sign drawer, lifted from a consuming product with its tests. These
 * pin what the signer reads (the statement, the consequence, the signer
 * line, the reason rule), the confirm gated on a password and the rule, a
 * refused password marked on its field, Escape closing the drawer and
 * nothing behind it and never while a write is in flight, the fields
 * cleared on every close, the `fields` slot, the `data-sign-drawer` marker
 * and the house shape: the drawer holds the form, the bar holds Cancel and
 * the confirm.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createRawSnippet, flushSync, mount, unmount } from 'svelte';
import SignatureCommandSurface from '../src/lib/validation/SignatureCommandSurface.svelte';
import { signatureStatement } from '../src/lib/validation/signature-statement';
import * as validation from '../src/lib/validation/index.js';

const signer = { name: 'Jane Doe', email: 'jane@example.test' };

let app: ReturnType<typeof mount> | null = null;
afterEach(() => {
	if (app) unmount(app);
	app = null;
	document.body.innerHTML = '';
});

type Props = Record<string, unknown>;

function render(over: Props = {}) {
	const props = {
		open: true,
		title: 'Sign: QA review',
		statement: signatureStatement({ step: 'QA review', subject: 'TRF-0007', meaning: 'Approved' }),
		consequence: 'This is the last required signature: the record completes.',
		signer,
		confirmLabel: 'Sign QA review',
		onclose: vi.fn(),
		onconfirm: vi.fn(),
		...over
	};
	app = mount(SignatureCommandSurface, { target: document.body, props: props as never });
	flushSync();
	return props;
}

function type(el: HTMLInputElement, value: string) {
	el.value = value;
	el.dispatchEvent(new Event('input', { bubbles: true }));
	flushSync();
}

const text = () => (document.body.textContent ?? '').replace(/\s+/g, ' ');
const drawer = () => document.querySelector<HTMLElement>('[data-sign-drawer]');
const confirm = () => document.querySelector<HTMLButtonElement>('button[data-action-confirm]')!;
const cancel = () => document.querySelector<HTMLButtonElement>('button[data-action-cancel]')!;
const password = () =>
	document.querySelector<HTMLInputElement>('input[name="signature-password"]')!;
const reason = () => document.querySelector<HTMLInputElement>('input[name="signature-reason"]')!;

describe('signatureStatement', () => {
	it('names the step, what is signed and the meaning', () => {
		expect(
			signatureStatement({ step: 'QA review', subject: 'TRF-0007', meaning: 'Approved' })
		).toBe('You are about to sign step QA review on TRF-0007 with the meaning Approved.');
	});
});

describe('SignatureCommandSurface', () => {
	it('reads what is signed, its consequence and who signs, and nothing that states the obvious', () => {
		// The drawer keeps what the signer needs before acting: the statement
		// and its meaning, the consequence they cannot see otherwise, and who
		// signs. A wrong password's refusal says it is recorded when it
		// happens; the rest stated the obvious.
		render();
		const body = text();
		expect(body).toContain(
			'You are about to sign step QA review on TRF-0007 with the meaning Approved.'
		);
		expect(body).toContain('This is the last required signature: the record completes.');
		expect(
			document.querySelector('[data-sign-signer]')?.textContent?.replace(/\s+/g, ' ').trim()
		).toBe('Signing as Jane Doe · jane@example.test');
		expect(body).not.toContain('Your password confirms the signature');
		expect(body).not.toContain('counts toward the sign-in lock');
		expect(body).not.toContain('Re-enter your password');
		expect(body).not.toContain('The signature records your name');
		expect(drawer()).not.toBeNull();
		expect(drawer()!.querySelector('.page-command-drawer-title')?.textContent).toBe(
			'Sign: QA review'
		);
	});

	it('states the reason rule before the button refuses, and confirms once both are entered', () => {
		const props = render();
		expect(confirm().disabled).toBe(true);
		expect(document.querySelector('[data-reason-rule]')?.textContent?.trim()).toBe(
			'At least 10 characters.'
		);
		type(reason(), 'Checked');
		expect(text()).toContain('At least 10 characters (7 so far).');
		type(reason(), 'All entries checked');
		expect(confirm().disabled).toBe(true);
		type(password(), 'secret');
		expect(confirm().disabled).toBe(false);
		confirm().click();
		expect(props['onconfirm']).toHaveBeenCalledWith({
			password: 'secret',
			reason: 'All entries checked'
		});
	});

	it('takes an optional reason when its minimum is 0', () => {
		render({ reasonMin: 0, reasonLabel: 'Reason' });
		expect(text()).toContain('(optional)');
		type(password(), 'secret');
		expect(confirm().disabled).toBe(false);
	});

	it('says to a screen reader that the password and a required reason are required, the mark hidden from it', () => {
		const mark = () =>
			[...drawer()!.querySelectorAll('label span')].filter((span) => span.textContent === '*');
		for (const reasonMin of [10, 1]) {
			render({ reasonMin });
			expect(password().getAttribute('aria-required')).toBe('true');
			expect(reason().getAttribute('aria-required')).toBe('true');
			expect(mark()).toHaveLength(1);
			expect(mark()[0]!.getAttribute('aria-hidden')).toBe('true');
			unmount(app!);
			app = null;
			document.body.innerHTML = '';
		}
		render({ reasonMin: 0 });
		expect(password().getAttribute('aria-required')).toBe('true');
		expect(reason().hasAttribute('aria-required')).toBe(false);
		expect(mark()).toHaveLength(0);
	});

	it('holds the form in the drawer and Cancel and the confirm in the bar', () => {
		render();
		expect(drawer()!.querySelectorAll('button')).toHaveLength(0);
		expect(drawer()!.contains(cancel())).toBe(false);
		expect(drawer()!.contains(confirm())).toBe(false);
		expect(confirm().textContent?.trim()).toBe('Sign QA review');
	});

	it('keeps a read-only username companion before the password, for the password manager', () => {
		render();
		const username = document.querySelector<HTMLInputElement>('input[autocomplete="username"]')!;
		expect(username.value).toBe(signer.email);
		expect(username.readOnly).toBe(true);
		expect(username.tabIndex).toBe(-1);
		expect(username.hidden).toBe(false);
		expect(
			username.compareDocumentPosition(password()) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(password().getAttribute('autocomplete')).toBe('current-password');
	});

	it('marks the password after a refused password, and only then', () => {
		render({
			error:
				'The password is incorrect, and the attempt is recorded. Enter your password again, then sign.',
			errorReason: 'password_incorrect'
		});
		expect(password().getAttribute('aria-invalid')).toBe('true');
		// The field is described by the refusal alone: it carries no hint.
		const errorId = password().getAttribute('aria-describedby') ?? '';
		expect(document.getElementById(errorId)?.getAttribute('role')).toBe('alert');
		unmount(app!);
		app = null;
		document.body.innerHTML = '';
		render({ error: 'The record changed since you opened it.', errorReason: 'conflict' });
		expect(password().hasAttribute('aria-invalid')).toBe(false);
		expect(password().hasAttribute('aria-describedby')).toBe(false);
		expect(text()).toContain('The record changed since you opened it.');
	});

	it('returns focus to the password after a refusal, so the mark shows and a retry is one keystroke away', async () => {
		const { createClassComponent } = await import('svelte/legacy');
		const { tick } = await import('svelte');
		const surface = createClassComponent({
			component: SignatureCommandSurface,
			target: document.body,
			props: {
				open: true,
				title: 'Sign: QA review',
				statement: signatureStatement({
					step: 'QA review',
					subject: 'TRF-0007',
					meaning: 'Approved'
				}),
				signer,
				confirmLabel: 'Sign QA review',
				onclose: vi.fn(),
				onconfirm: vi.fn()
			}
		}) as unknown as { $set(props: Record<string, unknown>): void; $destroy(): void };
		try {
			flushSync();
			// The drawer's own focus on open lands first.
			await new Promise((resolve) => setTimeout(resolve, 0));
			// A browser drops focus from a field that is disabled while the request runs.
			(document.activeElement as HTMLElement | null)?.blur();
			expect(document.activeElement).toBe(document.body);
			surface.$set({ busy: true });
			flushSync();
			surface.$set({
				busy: false,
				error:
					'The password is incorrect, and the attempt is recorded. Enter your password again, then sign.',
				errorReason: 'password_incorrect'
			});
			flushSync();
			await tick();
			expect(document.activeElement).toBe(password());
			expect(password().getAttribute('aria-invalid')).toBe('true');
		} finally {
			surface.$destroy();
		}
	});

	it('closes on Escape and stops it there, so the page behind never sees it', () => {
		const props = render();
		const behind = vi.fn();
		window.addEventListener('keydown', behind);
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
		window.removeEventListener('keydown', behind);
		expect(props['onclose']).toHaveBeenCalledTimes(1);
		expect(behind).not.toHaveBeenCalled();
	});

	it('does nothing on Escape while a signature is in flight', () => {
		const props = render({ busy: true });
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
		expect(props['onclose']).not.toHaveBeenCalled();
		expect(cancel().disabled).toBe(true);
		expect(confirm().textContent?.trim()).toBe('Signing…');
	});

	it('holds only the confirm on a result it could not confirm, and stays closable', () => {
		// A signature whose answer was lost: the write is no longer in flight,
		// and the page tells the signer to close the drawer and verify.
		const props = render({
			confirmDisabled: true,
			error:
				'Signature could not be confirmed. The record has been reloaded. Close this panel and check its status before you try again.'
		});
		type(password(), 'secret');
		type(reason(), 'All entries checked');
		expect(confirm().disabled).toBe(true);
		expect(confirm().textContent?.trim()).toBe('Sign QA review');
		expect(password().disabled).toBe(false);
		expect(reason().disabled).toBe(false);
		expect(cancel().disabled).toBe(false);
		confirm().click();
		expect(props['onconfirm']).not.toHaveBeenCalled();
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
		expect(props['onclose']).toHaveBeenCalledTimes(1);
		cancel().click();
		expect(props['onclose']).toHaveBeenCalledTimes(2);
	});

	it('clears the password and the reason on every close', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const { default: Harness } = await import('./fixtures/SignatureCommandSurfaceHarness.svelte');
		app = mount(Harness, { target: host, props: { signer } as never });
		flushSync();
		type(password(), 'secret');
		type(reason(), 'All entries checked');
		host.querySelector<HTMLButtonElement>('[data-harness-toggle]')!.click();
		flushSync();
		expect(document.querySelector('input[name="signature-password"]')).toBeNull();
		host.querySelector<HTMLButtonElement>('[data-harness-toggle]')!.click();
		flushSync();
		expect(password().value).toBe('');
		expect(reason().value).toBe('');
	});

	it('renders a field the signature carries before the password and the reason', () => {
		const fields = createRawSnippet(() => ({
			render: () => '<fieldset data-extra-field><legend>Version on approval</legend></fieldset>'
		}));
		render({ fields });
		const field = drawer()!.querySelector('[data-extra-field]')!;
		expect(field).not.toBeNull();
		expect(
			field.compareDocumentPosition(password()) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(field.compareDocumentPosition(reason()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
		// Nothing is drawn under the fields but the reason's rule.
		const form = drawer()!.querySelector('[data-sign-form]')!;
		expect(form.lastElementChild?.contains(reason())).toBe(true);
	});

	it('confirms a withdrawal in red', () => {
		render({ tone: 'red', confirmLabel: 'Withdraw signature' });
		expect(confirm().className).toMatch(/red/);
	});
});

/**
 * One sign drawer: every signature in the library is entered in
 * SignatureCommandSurface, and no other component carries a
 * `signature-password` input of its own. A second password field is a
 * second ceremony, with its own wording, focus and refusal handling.
 */
describe('the one sign drawer', () => {
	const ROOT = path.resolve(import.meta.dirname, '../src/lib');
	const SURFACE = 'validation/SignatureCommandSurface.svelte';
	function svelteFiles(dir: string): string[] {
		return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
			const file = path.join(dir, entry.name);
			if (entry.isDirectory()) return svelteFiles(file);
			return entry.name.endsWith('.svelte') ? [file] : [];
		});
	}
	const files = svelteFiles(ROOT).map((file) => ({
		rel: path.relative(ROOT, file).split(path.sep).join('/'),
		text: readFileSync(file, 'utf8')
	}));

	it('is the only component with a signature-password input', () => {
		expect(files.filter(({ text }) => /signature-password/.test(text)).map(({ rel }) => rel)).toEqual([
			SURFACE
		]);
	});

	it('marks its drawer and keeps one password field', () => {
		const text = files.find((file) => file.rel === SURFACE)!.text;
		expect(text).toContain('data-sign-drawer');
		expect(text.match(/name="signature-password"/g)).toHaveLength(1);
	});

	it('is exported from gawdux/validation with its statement', () => {
		expect(validation.SignatureCommandSurface).toBe(SignatureCommandSurface);
		expect(validation.signatureStatement).toBe(signatureStatement);
	});
});
