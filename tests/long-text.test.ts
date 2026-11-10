import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import tokens from '../src/lib/styles/tokens.css?raw';
import { longTextRuns } from '../src/lib/primitives/long-text';
import LongText from '../src/lib/primitives/LongText.svelte';
import SurfaceFeedback from '../src/lib/primitives/SurfaceFeedback.svelte';
import PageFeedback from '../src/lib/primitives/PageFeedback.svelte';
import * as primitives from '../src/lib/primitives/index';

afterEach(() => cleanup());

// One rule for long values: an identifier never breaks inside itself, a hash
// wraps inside its own box at any character, and a moment stays whole. A
// line of free text is read into runs of those kinds and the words around
// them.
describe('longTextRuns', () => {
	const kinds = (text: string) => longTextRuns(text).map((run) => [run.kind, run.text]);

	it('keeps an identifier whole and lets a hash wrap anywhere', () => {
		const hash = '7e9f1c61e37986629ee705a8f71f1f86e3fdd44ae34555a9893bb82cfa73e12d';
		expect(kinds(`QMS-VSR-0001 · Build 161, release artifact SHA-256 ${hash}`)).toEqual([
			['whole', 'QMS-VSR-0001'],
			['text', ' · Build 161, release artifact '],
			['whole', 'SHA-256'],
			['text', ' '],
			['hash', hash]
		]);
	});

	it('reads a 40-character revision as a hash, and keeps the comma after it outside', () => {
		expect(kinds('source revision 01b9262b7180c49b78c715cc3535ccf099eabda8, done')).toEqual([
			['text', 'source revision '],
			['hash', '01b9262b7180c49b78c715cc3535ccf099eabda8'],
			['text', ', done']
		]);
	});

	it('keeps a moment whole, its zone with it', () => {
		expect(kinds('In force since 2026-11-07 21:55:42 EST · Part of the set')).toEqual([
			['text', 'In force since '],
			['whole', '2026-11-07 21:55:42 EST'],
			['text', ' · Part of the set']
		]);
	});

	it("keeps a request's reference whole, the full stop after it outside", () => {
		expect(kinds('The address was not found; quote reference 4ab67d51-0ef when reporting it.')).toEqual([
			['text', 'The address was not found; quote reference '],
			['whole', '4ab67d51-0ef'],
			['text', ' when reporting it.']
		]);
		expect(kinds('Quote reference 4ab67d51-0ef.')).toEqual([
			['text', 'Quote reference '],
			['whole', '4ab67d51-0ef'],
			['text', '.']
		]);
	});

	it('keeps a range in parentheses whole', () => {
		expect(kinds('Uppercase letter (A–Z) · Digit (0–9)')).toEqual([
			['text', 'Uppercase letter '],
			['whole', '(A–Z)'],
			['text', ' · Digit '],
			['whole', '(0–9)']
		]);
	});

	it('leaves plain words alone', () => {
		expect(kinds('Approved for laboratory use.')).toEqual([['text', 'Approved for laboratory use.']]);
		expect(longTextRuns('')).toEqual([]);
	});
});

describe('LongText', () => {
	it('draws each run as a span of its own, the line reading as written', () => {
		const hash = '30b4dcf4310d6a55c4550855d80bfb6d8534dc46236285c06b20ceceea766b0b';
		const text = `QMS-VSR-0001 · Completed by OQ QA · 2026-11-07 23:38:52 EST · SHA-256 ${hash}`;
		const { container } = render(LongText, { props: { text } });
		expect(container.textContent).toBe(text);
		const runs = [...container.querySelectorAll<HTMLElement>('[data-long-text]')].map((el) => [
			el.dataset['longText'],
			el.className,
			el.textContent
		]);
		expect(runs).toEqual([
			['whole', 'gawdux-long-text-whole', 'QMS-VSR-0001'],
			['whole', 'gawdux-long-text-whole', '2026-11-07 23:38:52 EST'],
			['whole', 'gawdux-long-text-whole', 'SHA-256'],
			['hash', 'gawdux-long-text-hash', hash]
		]);
	});

	it('names in the stylesheet what each run does: a whole run never wraps, a hash breaks anywhere', () => {
		expect(tokens).toMatch(/\.gawdux-long-text-whole \{\s*white-space: nowrap;\s*\}/);
		expect(tokens).toMatch(/\.gawdux-long-text-hash \{\s*word-break: break-all;\s*\}/);
	});
});

describe("a strip's message", () => {
	it('is drawn by the one rule, so a reference in it never breaks, and reads as written', () => {
		const message =
			'This document does not exist or is not shared with you. The address was not found; quote reference 4ab67d51-0ef when reporting it.';
		const { container } = render(SurfaceFeedback, {
			props: { loadError: message, loadErrorAction: { label: 'Back', href: '/back' } }
		});
		const line = container.querySelector('.page-feedback-message')!;
		expect(line.textContent?.trim()).toBe(message);
		expect(
			[...line.querySelectorAll('.gawdux-long-text-whole')].map((el) => el.textContent)
		).toEqual(['4ab67d51-0ef']);
	});

	it("leaves a card's message as it was: a card breaks an unbroken token anywhere", () => {
		const { container } = render(PageFeedback, {
			props: { message: 'Quote reference 4ab67d51-0ef.', compact: true, title: null }
		});
		expect(container.querySelector('.page-feedback-message .gawdux-long-text-whole')).toBeNull();
	});
});

describe('the public surface', () => {
	it('exports the rule and its component from primitives', () => {
		expect(primitives.LongText).toBe(LongText);
		expect(primitives.longTextRuns).toBe(longTextRuns);
	});
});
