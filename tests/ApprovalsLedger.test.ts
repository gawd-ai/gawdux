import { afterEach, describe, expect, it } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import {
	ApprovalsLedger,
	ApprovalsLedgerSignatures,
	LEDGER_PART_SEPARATOR,
	ledgerRowParts,
	ledgerRowText,
	type LedgerRow,
	type LedgerSignature,
	type LedgerView
} from '../src/lib/primitives';
import signaturesSource from '../src/lib/primitives/ApprovalsLedgerSignatures.svelte?raw';

let app: object | null = null;

afterEach(() => {
	if (app) unmount(app);
	app = null;
	document.body.innerHTML = '';
});

// Signed at 21:15 in Toronto on 1 October: 01:15 UTC on the 2nd.
const signature: LedgerSignature = {
	id: 1,
	meaning: 'Reviewed',
	signerName: 'Dana Owner',
	signerEmail: 'dana@example.test',
	signedAt: '2026-10-02T01:15:00.000Z',
	reason: null,
	intact: true,
	standing: true
};

function row(overrides: Partial<LedgerRow>): LedgerRow {
	return {
		stepCode: 'supplier',
		role: 'Supplier',
		state: 'signed',
		signer: { name: 'Dana Owner', email: 'dana@example.test' },
		meaning: 'Reviewed',
		signedAt: '2026-10-02T01:15:00.000Z',
		reason: null,
		integrity: 'intact',
		alsoSigned: [],
		note: null,
		...overrides
	};
}

const ledger: LedgerView = {
	title: 'Approvals of version 1.0',
	rows: [
		row({ alsoSigned: ['Quality'] }),
		row({
			stepCode: 'quality',
			role: 'Quality',
			meaning: 'Approved',
			alsoSigned: ['Supplier'],
			integrity: 'changed',
			note: 'Content changed since signature'
		}),
		row({
			stepCode: 'owner',
			role: 'Owner',
			state: 'awaiting',
			signer: null,
			meaning: null,
			signedAt: null,
			integrity: null,
			note: 'Awaiting System Owner'
		})
	],
	verified: false,
	integritySentence: "Not intact: the approving signature's record does not bind this text.",
	approvedWith: { title: 'Release package', href: '/documents/12' },
	signatures: [signature, { ...signature, id: 2, meaning: 'Withdrawn', standing: false }]
};

function renderLedger(view: LedgerView = ledger, timeZone = 'America/Toronto') {
	app = mount(ApprovalsLedger, { target: document.body, props: { ledger: view, timeZone } });
	flushSync();
}

function renderTable(props: Record<string, unknown>) {
	app = mount(ApprovalsLedgerSignatures, {
		target: document.body,
		props: { signatures: [signature], timeZone: 'UTC', ...props } as never
	});
	flushSync();
	return document.body.textContent?.replace(/\s+/g, ' ') ?? '';
}

function again() {
	unmount(app!);
	app = null;
	document.body.innerHTML = '';
}

describe('ApprovalsLedger', () => {
	it('marks each row with its step code and state', () => {
		renderLedger();
		const rows = [...document.querySelectorAll('[data-ledger-row]')];
		expect(rows.map((el) => el.getAttribute('data-step'))).toEqual([
			'supplier',
			'quality',
			'owner'
		]);
		expect(rows.map((el) => el.getAttribute('data-state'))).toEqual([
			'signed',
			'signed',
			'awaiting'
		]);
	});

	it('reads one line per role at the site, zone named, with the marker and integrity words', () => {
		renderLedger();
		const lines = [...document.querySelectorAll('[data-ledger-row]')].map((el) =>
			el.textContent?.replace(/\s+/g, ' ').trim()
		);
		expect(lines).toEqual([
			'Supplier · Dana Owner (dana@example.test) · Reviewed · 2026-10-01 21:15:00 EDT · Also signed Quality',
			'Quality · Dana Owner (dana@example.test) · Approved · 2026-10-01 21:15:00 EDT · Also signed Supplier · Content changed since signature',
			'Owner · Awaiting System Owner'
		]);
	});

	it('states the integrity sentence, the set it was approved with, and every signature', () => {
		renderLedger();
		const text = document.body.textContent?.replace(/\s+/g, ' ') ?? '';
		expect(document.querySelector('[data-ledger-integrity]')?.textContent?.trim()).toBe(
			"Not intact: the approving signature's record does not bind this text."
		);
		expect(text).toContain('Approved with Release package');
		expect(document.querySelector('a')?.getAttribute('href')).toBe('/documents/12');
		expect(document.querySelector('summary')?.textContent?.trim()).toBe('All signatures (2)');
		expect(document.querySelectorAll('[data-signatures] tbody tr')).toHaveLength(2);
	});

	// A stamp broken inside itself reads as two facts ("2026-11-07" over
	// "07:40:02 EST"): each part of a row is a run of its own, the moment never
	// wrapping inside, the row wrapping between its parts.
	it('wraps a row between its parts and never inside its moment', () => {
		renderLedger();
		const first = document.querySelector('[data-ledger-row]')!;
		expect(
			[...first.querySelectorAll('[data-ledger-part]')].map((el) => [
				el.getAttribute('data-ledger-part'),
				el.textContent
			])
		).toEqual([
			['role', 'Supplier'],
			['signer', 'Dana Owner (dana@example.test)'],
			['meaning', 'Reviewed'],
			['at', '2026-10-01 21:15:00 EDT'],
			['also', 'Also signed Quality']
		]);
		expect(first.querySelector('[data-ledger-part="at"]')?.className).toMatch(
			/(^|\s)whitespace-nowrap(\s|$)/
		);
		for (const kind of ['role', 'signer', 'meaning', 'also'])
			expect(first.querySelector(`[data-ledger-part="${kind}"]`)?.className ?? '').not.toMatch(
				/whitespace-nowrap/
			);
		// The separators sit outside the runs, where the row may wrap, and each
		// stays with the part before it: a no-break space before the dot, so a
		// line may end after "Approved ·" but never begin with "· 2026-11-07".
		const between = [...first.childNodes]
			.filter((node) => node.nodeType === Node.TEXT_NODE)
			.map((node) => node.textContent ?? '')
			.filter((text) => text.trim().length > 0);
		expect(between).toEqual(Array(4).fill(LEDGER_PART_SEPARATOR));
		expect(LEDGER_PART_SEPARATOR).toBe('\u00a0· ');
	});

	it('leaves out what a ledger does not carry', () => {
		renderLedger({ ...ledger, integritySentence: null, approvedWith: null, signatures: [] });
		expect(document.querySelector('[data-ledger-integrity]')).toBeNull();
		expect(document.querySelector('summary')).toBeNull();
		expect(document.body.textContent).not.toContain('Approved with');
	});
});

describe('ledgerRowText', () => {
	const stamp = (iso: string) => `at ${iso}`;

	it("is the row's parts joined, each part named", () => {
		const signed = row({ alsoSigned: ['Quality'], note: 'Content changed since signature' });
		expect(ledgerRowParts(signed, stamp)).toEqual([
			{ kind: 'role', text: 'Supplier' },
			{ kind: 'signer', text: 'Dana Owner (dana@example.test)' },
			{ kind: 'meaning', text: 'Reviewed' },
			{ kind: 'at', text: 'at 2026-10-02T01:15:00.000Z' },
			{ kind: 'also', text: 'Also signed Quality' },
			{ kind: 'note', text: 'Content changed since signature' }
		]);
		expect(ledgerRowText(signed, stamp)).toBe(
			ledgerRowParts(signed, stamp)
				.map((part) => part.text)
				.join(' · ')
		);
		expect(
			ledgerRowParts(row({ state: 'awaiting', signer: null, note: 'Awaiting Quality' }), stamp)
		).toEqual([
			{ kind: 'role', text: 'Supplier' },
			{ kind: 'note', text: 'Awaiting Quality' }
		]);
	});

	it('reads a signed row from its composed words, and an unsigned row from its note', () => {
		expect(ledgerRowText(row({ signer: { name: 'Dana Owner', email: '' } }), stamp)).toBe(
			'Supplier · Dana Owner · Reviewed · at 2026-10-02T01:15:00.000Z'
		);
		expect(
			ledgerRowText(row({ state: 'sent', signer: null, note: 'Sent to the client' }), stamp)
		).toBe('Supplier · Sent to the client');
		expect(ledgerRowText(row({ state: 'not_required', signer: null, note: null }), stamp)).toBe(
			'Supplier'
		);
	});
});

describe('ApprovalsLedgerSignatures', () => {
	it('states integrity only where the content was compared', () => {
		expect(renderTable({})).toContain('Intact');
		again();
		const text = renderTable({ integrity: false });
		expect(text).not.toContain('Integrity');
		expect(text).not.toContain('Intact');
		expect(text).toContain('Dana Owner');
	});

	it('reads a signature it cannot check as Not verified, never Intact', () => {
		const text = renderTable({ signatures: [{ ...signature, intact: null }] });
		expect(text).toContain('Not verified');
		expect(text).not.toContain('Intact');
		expect(text).not.toContain('Content changed');
		again();
		expect(renderTable({ signatures: [{ ...signature, intact: false }] })).toContain(
			'Content changed since signature'
		);
	});

	it('reads a withdrawn signature as Withdrawn after the record changed, never as broken', () => {
		// An approver withdraws, then the record changes, so its content no
		// longer equals what either of that approver's rows bound.
		const approval = { ...signature, id: 1, meaning: 'Approved' as const };
		const withdrawal = { ...signature, id: 2, meaning: 'Withdrawn' as const };
		const cell = (n: number) =>
			document.querySelectorAll('tbody tr')[n - 1]!.querySelectorAll('td')[4]!.textContent?.trim();
		renderTable({
			signatures: [
				{ ...approval, intact: false, standing: false },
				{ ...withdrawal, intact: false, standing: false }
			]
		});
		expect(cell(1)).toBe('Withdrawn');
		// The withdrawal states the change it made way for, without the alarm.
		expect(cell(2)).toBe('Content changed since signature');
		expect(document.querySelectorAll('.text-red-600')).toHaveLength(0);
		again();
		// A standing signature whose content changed keeps the alarm.
		renderTable({ signatures: [{ ...approval, intact: false, standing: true }] });
		expect(cell(1)).toBe('Content changed since signature');
		expect(document.querySelectorAll('.text-red-600')).toHaveLength(1);
		again();
		// A withdrawn signature that cannot be checked reads Withdrawn too.
		renderTable({ signatures: [{ ...approval, intact: null, standing: false }] });
		expect(cell(1)).toBe('Withdrawn');
	});

	it('shows each moment at the zone given, named', () => {
		expect(renderTable({})).toContain('2026-10-02 01:15:00 UTC');
		again();
		expect(renderTable({ timeZone: 'America/Toronto' })).toContain('2026-10-01 21:15:00 EDT');
	});

	// The table sits inside a document that has one scroller, so it never
	// scrolls sideways on its own; and a moment is never broken inside
	// itself ("2026-10-02" over "01:15:00 UTC").
	it('keeps no scroller of its own and never breaks a moment inside itself', () => {
		renderTable({});
		const own = [...document.body.querySelectorAll('*')].filter((el) =>
			/\boverflow(?:-[xy])?-(?:auto|scroll)\b/.test(el.getAttribute('class') ?? '')
		);
		expect(own.map((el) => el.outerHTML.slice(0, 80))).toEqual([]);
		const table = document.querySelector('table[data-signatures]')!;
		const frame = table.parentElement!;
		expect(frame.hasAttribute('data-signatures-frame')).toBe(true);
		expect(frame.parentElement).toBe(document.body);
		// The moment is the one run that never wraps; every other cell wraps.
		const nowrap = [...table.querySelectorAll('.whitespace-nowrap')];
		expect(nowrap.map((el) => [el.getAttribute('data-signature-at'), el.textContent])).toEqual([
			['', '2026-10-02 01:15:00 UTC']
		]);
		// An address has no space to break at: it breaks anywhere.
		const email = [...table.querySelectorAll('td span')].find((el) =>
			el.textContent?.includes('dana@example.test')
		);
		expect(email?.className).toMatch(/\[overflow-wrap:anywhere\]/);
	});

	// Five columns with an unbroken moment need about 26rem, more than a
	// card holds at 390 px: below 32rem of its own width the table reads as
	// one block per signature, each fact under its column's name, rather than
	// breaking the moment or scrolling sideways.
	it('names each fact by its column, for the rows a narrow container stacks', () => {
		renderTable({ signatures: [signature, { ...signature, id: 2, reason: 'Checked.' }] });
		const heads = [...document.querySelectorAll('[data-signatures] thead th')].map((th) =>
			th.textContent?.trim()
		);
		expect(heads).toEqual(['Meaning', 'Signed by', 'Signed at', 'Reason', 'Integrity']);
		for (const tr of document.querySelectorAll('[data-signatures] tbody tr'))
			expect([...tr.querySelectorAll('td')].map((td) => td.getAttribute('data-label'))).toEqual(
				heads
			);
		// Each cell holds one block beside its name: the signer's name and
		// address read as one fact.
		const signer = document.querySelector('[data-signatures] td[data-label="Signed by"]')!;
		expect(signer.children).toHaveLength(1);
		expect(signer.children[0]!.textContent?.replace(/\s+/g, ' ').trim()).toBe(
			'Dana Owner dana@example.test'
		);
		// A reason not given is left out of the block, never a name over nothing.
		const reasons = [...document.querySelectorAll('[data-signatures] td[data-label="Reason"]')];
		expect(reasons.map((td) => td.hasAttribute('data-empty'))).toEqual([true, false]);
		again();
		renderTable({ integrity: false });
		expect(
			[...document.querySelectorAll('[data-signatures] tbody td')].map((td) =>
				td.getAttribute('data-label')
			)
		).toEqual(['Meaning', 'Signed by', 'Signed at', 'Reason']);
	});

	it('stacks its rows below 32rem of its own width, from its own frame', () => {
		const style = signaturesSource.slice(signaturesSource.indexOf('<style>'));
		expect(style).toMatch(/\.ledger-signatures\s*\{[^}]*container-type:\s*inline-size/);
		const at = style.indexOf('@container (max-width: 32rem)');
		expect(at).toBeGreaterThan(-1);
		const narrow = style.slice(at);
		expect(narrow).toMatch(/thead\s*\{\s*display:\s*none/);
		expect(narrow).toMatch(/td::before\s*\{[^}]*content:\s*attr\(data-label\)/);
		expect(narrow).toMatch(/td\[data-empty\]\s*\{\s*display:\s*none/);
		expect(style).not.toMatch(/overflow(?:-x)?:\s*(?:auto|scroll)/);
	});

	it('marks each row with its meaning for the cases that read it', () => {
		renderTable({ signatures: [signature, { ...signature, id: 2, meaning: 'Approved' }] });
		expect(
			[...document.querySelectorAll('[data-signatures] [data-signature-meaning]')].map((el) =>
				el.getAttribute('data-signature-meaning')
			)
		).toEqual(['Reviewed', 'Approved']);
	});
});
