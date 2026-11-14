import path from 'node:path';
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import FilterBar from '../src/lib/primitives/FilterBar.svelte';
import ListQueryBar from '../src/lib/primitives/ListQueryBar.svelte';
import {
	listSortKeyFaults,
	listSortOptions,
	listSortWords,
	type ListSort,
	type ListSortKey
} from '../src/lib/primitives/list-query';
import { unwordedSequenceSorts } from '../src/lib/utils/surface-rules';
import { createHouseRules } from '../src/lib/test-support/house-rules';

// A sort key says its own orders. A sequence is the host's own order (a
// health from worst to best), so its key gives the words of its two orders
// and the phone sort reads them; a key that gives none keeps its kind's
// words, and a sequence key with none is reported.

afterEach(() => cleanup());

const health: ListSortKey = {
	key: 'health',
	label: 'Health',
	order: 'sequence',
	words: { asc: 'best first', desc: 'worst first', first: 'desc' }
};
const labels = (keys: readonly ListSortKey[]) => listSortOptions(keys).map((option) => option.label);

describe("a sort key's own words", () => {
	it('reads them in place of its kind\'s, the order it names first leading', () => {
		expect(listSortOptions([health])).toEqual([
			{ value: 'health:desc', label: 'Health: worst first', field: 'health', direction: 'desc' },
			{ value: 'health:asc', label: 'Health: best first', field: 'health', direction: 'asc' }
		]);
	});

	it("leads with its kind's first order when it names none", () => {
		const words = { asc: 'oldest first', desc: 'newest first' };
		expect(labels([{ key: 'step', label: 'Step', order: 'sequence', words }])).toEqual([
			'Step: oldest first',
			'Step: newest first'
		]);
		expect(labels([{ key: 'seen', label: 'Seen', order: 'date', words }])).toEqual([
			'Seen: newest first',
			'Seen: oldest first'
		]);
		expect(labels([{ key: 'size', label: 'Size', order: 'number', words: { asc: 'smallest first', desc: 'largest first' } }])).toEqual([
			'Size: largest first',
			'Size: smallest first'
		]);
		expect(labels([{ key: 'name', label: 'Name', words: { asc: 'first name first', desc: 'last name first' } }])).toEqual([
			'Name: first name first',
			'Name: last name first'
		]);
	});

	it("keeps each kind's words for a key that gives none, and no default reads 'in reverse order'", () => {
		expect(
			labels([
				{ key: 'name', label: 'Name' },
				{ key: 'issued', label: 'Issued', order: 'date' },
				{ key: 'total', label: 'Total', order: 'number' },
				{ key: 'state', label: 'State', order: 'sequence' }
			])
		).toEqual([
			'Name: A to Z',
			'Name: Z to A',
			'Issued: latest first',
			'Issued: earliest first',
			'Total: highest first',
			'Total: lowest first',
			'State: first to last',
			'State: last to first'
		]);
	});

	it("falls back to the kind's word for an order left blank, so no choice ends at its colon", () => {
		expect(labels([{ key: 'state', label: 'State', order: 'sequence', words: { asc: ' ', desc: 'worst first' } }])).toEqual([
			'State: first to last',
			'State: worst first'
		]);
	});

	it('gives the words of one order, for a line that says how a register is sorted', () => {
		expect(listSortWords([health], 'health', 'desc')).toBe('worst first');
		expect(listSortWords([health], 'health', 'asc')).toBe('best first');
		expect(listSortWords([{ key: 'name', label: 'Name' }], 'name', 'desc')).toBe('Z to A');
		expect(listSortWords([health], 'other', 'asc')).toBeNull();
	});

	it("is what both phone sorts offer: the list toolbar's and the query bar's", () => {
		const sort: ListSort = {
			keys: [health, { key: 'name', label: 'Name' }],
			field: 'health',
			direction: 'desc',
			onsort: () => {}
		};
		const expected = ['Health: worst first', 'Health: best first', 'Name: A to Z', 'Name: Z to A'];
		render(FilterBar, { props: { sort } });
		let select = screen.getByLabelText('Sort by') as HTMLSelectElement;
		expect([...select.options].map((option) => option.textContent)).toEqual(expected);
		expect(select.value).toBe('health:desc');
		cleanup();
		render(ListQueryBar, { props: { sort, filtersOpen: true } });
		select = screen.getByLabelText('Sort by') as HTMLSelectElement;
		expect([...select.options].map((option) => option.textContent)).toEqual(expected);
		expect(select.value).toBe('health:desc');
	});
});

describe('a sequence key with no words is reported', () => {
	it('over the keys a host hands a sort', () => {
		expect(listSortKeyFaults([health, { key: 'name', label: 'Name' }, { key: 'due', label: 'Due', order: 'date' }])).toEqual([]);
		expect(listSortKeyFaults([{ key: 'state', label: 'State', order: 'sequence' }])).toEqual([
			`sort key "state" (State) orders as a sequence and names neither order: give it words, for example { asc: 'best first', desc: 'worst first' }`
		]);
		expect(
			listSortKeyFaults([
				{ key: 'a', label: 'A', order: 'sequence', words: { asc: '', desc: 'worst first' } },
				{ key: 'b', label: 'B', words: { asc: 'Up', desc: ' up ' } }
			])
		).toEqual([
			'sort key "a" (A) has no word for its ascending order',
			'sort key "b" (B) reads the same in both orders: "Up"'
		]);
	});

	it('over a source that writes one, by its line', () => {
		const source = [
			'<script lang="ts">',
			'	// A comment naming { order: \'sequence\' } is no key.',
			'	const keys = [',
			"		{ key: 'name', label: 'Name' },",
			"		{ key: 'state', label: 'State', order: 'sequence' },",
			"		{ key: 'health', label: 'Health', order: 'sequence', words: { asc: 'best first', desc: 'worst first' } },",
			'		{ key: "step", label: "Step", order: "sequence", words },',
			"		{ ...base, order: 'sequence' },",
			"		{ label: 'Rank', meta: { words: 1 }, order: `sequence` }",
			'	];',
			'</script>',
			"<p>It's sorted {keys.length} ways</p>"
		].join('\n');
		expect(unwordedSequenceSorts(source, 'List.svelte')).toEqual([
			'a sequence sort key "state" that names neither order: give it words (line 5)',
			'a sequence sort key that names neither order: give it words (line 9)'
		]);
		expect(unwordedSequenceSorts("export const KEYS = [{ key: 'state', label: 'State', order: 'sequence' }];", 'keys.ts')).toHaveLength(1);
		expect(unwordedSequenceSorts("const a = { order: 'date' }; const reorder = 'sequence';", 'keys.ts')).toEqual([]);
	});

	it("over a sort written in a toolbar's own attribute", () => {
		expect(
			unwordedSequenceSorts(
				`<ListPageScaffold sort={{ keys: [{ key: 'state', label: 'State', order: 'sequence' }], field, direction, onsort }} />`
			)
		).toEqual(['a sequence sort key "state" that names neither order: give it words (line 1)']);
	});

	const KEY = "{ key: 'state', label: 'State', order: 'sequence' }";
	const reported = (line: number) => [`a sequence sort key "state" that names neither order: give it words (line ${line})`];

	it("on what a key writes out, never on a string's words", () => {
		for (const label of ['In other words, state', 'Key words: all', 'More ...', '...', 'words', "a 'words': b"])
			expect(
				unwordedSequenceSorts(`const keys = [{ key: 'state', label: ${JSON.stringify(label)}, order: 'sequence' }];`, 'keys.ts'),
				label
			).toEqual(reported(1));
		// A key's name is the one it writes, not one a string holds.
		expect(unwordedSequenceSorts(`const keys = [{ label: "say key: 'x' here", order: 'sequence' }];`, 'keys.ts')).toEqual([
			'a sequence sort key that names neither order: give it words (line 1)'
		]);
		expect(unwordedSequenceSorts(`const keys = [{ label: "key: 'x'", key: 'state', order: 'sequence' }];`, 'keys.ts')).toEqual(reported(1));
		// A string that only holds the kind's words is no key.
		expect(unwordedSequenceSorts(`const note = { hint: "write order: 'sequence' here" };`, 'keys.ts')).toEqual([]);
	});

	it('with its properties quoted', () => {
		expect(unwordedSequenceSorts(`const keys = [{ 'key': 'state', label: 'State', 'order': 'sequence' }];`, 'keys.ts')).toEqual(reported(1));
		expect(unwordedSequenceSorts(`const keys = [{ key: 'state', "order": "sequence" }];`, 'keys.ts')).toEqual(reported(1));
		expect(
			unwordedSequenceSorts(`const keys = [{ key: 'state', 'order': 'sequence', 'words': { asc: 'a', desc: 'b' } }];`, 'keys.ts')
		).toEqual([]);
		expect(unwordedSequenceSorts(`const keys = [{ key: 'state', order: 'sequence', get words() { return w; } }];`, 'keys.ts')).toEqual([]);
		// A value named words is not the property.
		expect(unwordedSequenceSorts(`const keys = [{ key: 'state', label: words, order: 'sequence' }];`, 'keys.ts')).toEqual(reported(1));
	});

	it("after a quote in a page's words, a tag's value or a regular expression", () => {
		const sort = `<X sort={{ keys: [${KEY}], field, direction, onsort }} />`;
		expect(unwordedSequenceSorts(`<p>Don't</p> ${sort}`, 'Page.svelte')).toEqual(reported(1));
		expect(unwordedSequenceSorts(`<p>It's here ${sort}</p>`, 'Page.svelte')).toEqual(reported(1));
		expect(unwordedSequenceSorts(`<p title="Don't">a</p> ${sort}`, 'Page.svelte')).toEqual(reported(1));
		expect(unwordedSequenceSorts(`<p>a \` b</p>\n<p>more</p>\n${sort}`, 'Page.svelte')).toEqual(reported(3));
		expect(unwordedSequenceSorts(`<p>a { b</p>\n${sort}`, 'Page.svelte')).toHaveLength(1);
		expect(unwordedSequenceSorts(`const r = /'/; const keys = [${KEY}];`, 'keys.ts')).toEqual(reported(1));
		expect(unwordedSequenceSorts(`const r = /[{"]/; const keys = [${KEY}];`, 'keys.ts')).toEqual(reported(1));
		expect(unwordedSequenceSorts(`const t = \`it's \${n} {\`; const keys = [${KEY}];`, 'keys.ts')).toEqual(reported(1));
		// A page's words that read like a key are words.
		expect(unwordedSequenceSorts(`<p>Write { order: 'sequence' } for a sequence</p>`, 'Page.svelte')).toEqual([]);
	});

	it('never over a type', () => {
		for (const source of [
			"type StateKey = { key: string; label: string; order: 'sequence' };",
			"type StateKey = { key: string, label: string, order: 'sequence' }",
			"interface K { key: string; order: 'sequence' }",
			"interface K { order: 'sequence' }",
			"export interface K<T> extends ListSortKey { order: 'sequence' }",
			"type T = { order: 'sequence' | 'text' };",
			"type Seq = ListSortKey & { order: 'sequence' };",
			"type Seq = { order: 'sequence' } | ListSortKey;",
			"type Keys = Array<{ key: string, order: 'sequence' }>;",
			"type Page = { sort: { keys: { key: string, order: 'sequence' }[] } };",
			"function sorted(key: ListSortKey & { order: 'sequence' }) {}",
			"const keys: { key: string; order: 'sequence' }[] = [];"
		]) {
			expect(unwordedSequenceSorts(source, 'keys.ts'), source).toEqual([]);
			expect(unwordedSequenceSorts(`<script lang="ts">\n${source}\n</script>\n<p>a</p>`, 'Page.svelte'), source).toEqual([]);
		}
		// A key written after a type is still read.
		expect(unwordedSequenceSorts(`type Seq = ListSortKey & { order: 'sequence' };\nconst keys: Seq[] = [${KEY}];`, 'keys.ts')).toEqual(
			reported(2)
		);
		expect(unwordedSequenceSorts(`interface K { order: 'sequence' }\nexport const keys = [${KEY}];`, 'keys.ts')).toEqual(reported(2));
	});

	it('over any other object written as a sequence, which a host allows with its reason', () => {
		expect(unwordedSequenceSorts("const step = { id: 1, order: 'sequence' };", 'steps.ts')).toEqual([
			'a sequence sort key that names neither order: give it words (line 1)'
		]);
	});

	it("finds none in the library's own sources", () => {
		const rules = createHouseRules(path.resolve(import.meta.dirname, '../src/lib'));
		expect(rules.findings((source, rel) => unwordedSequenceSorts(source, rel))).toEqual({});
	});
});
