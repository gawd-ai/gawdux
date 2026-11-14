/**
 * The rulebook (docs/UI_UX_PRINCIPLES.md) states each house rule in plain
 * words and says how it is held: by a guard, by its owner or by review. This
 * holds the document to the code: every section says which, every reader
 * the library exports is named in it, every token and class it names is one
 * the stylesheet defines, every export it names exists, and it keeps its own
 * rule on dashes.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as components from '../src/lib/components/index';
import * as primitives from '../src/lib/primitives/index';
import * as shell from '../src/lib/shell/index';
import * as support from '../src/lib/test-support/index';
import * as utils from '../src/lib/utils/index';
import * as validation from '../src/lib/validation/index';

const ROOT = path.resolve(import.meta.dirname, '..');
const book = readFileSync(path.join(ROOT, 'docs/UI_UX_PRINCIPLES.md'), 'utf8');
const tokens = readFileSync(path.join(ROOT, 'src/lib/styles/tokens.css'), 'utf8');
const readers = readFileSync(path.join(ROOT, 'src/lib/utils/surface-rules.ts'), 'utf8');
/** What the rulebook sets in code type. */
const named = [...book.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]!);

describe('the rulebook', () => {
	it('names every reader the library exports', () => {
		const exported = [...readers.matchAll(/^export function (\w+)/gm)].map((match) => match[1]!);
		expect(exported.length).toBeGreaterThan(25);
		expect(exported.filter((name) => !named.includes(name))).toEqual([]);
		for (const name of exported) expect(utils, name).toHaveProperty(name);
	});

	it("names the runner, and the phone sort a list's toolbar takes beside the query bar's", () => {
		expect(named).toContain('createHouseRules');
		expect(named).toContain('rules.phoneSorts');
		const sort = book.slice(
			book.indexOf('### A phone sort on every sorted register'),
			book.indexOf('### One scroller per list')
		);
		expect(sort).toContain("`ListQueryBar`'s `sort`");
		expect(sort).toContain("`FilterBar`'s `sort`, which `ListSurface` and `ListPageScaffold` pass on");
		// A register in a card draws the sort itself.
		expect(sort).toContain('`ListPhoneSort`');
		expect(sort).toContain("`DataTable`'s `sort`");
		expect(sort).toContain('`registersWithoutPhoneSort`');
		expect(sort).toContain('`takesPhoneSort`');
		// A key says its own orders, and a sequence key with none is reported.
		expect(sort).toContain('`words`');
		expect(sort).toContain('`unwordedSequenceSorts`');
		expect(sort).toContain('`listSortKeyFaults`');
		expect(sort).not.toContain('in reverse order');
	});

	it("says a card's cell is as tall as what it holds, whatever the table's row height", () => {
		const register = book.slice(
			book.indexOf('### A register on a phone'),
			book.indexOf('### A phone sort on every sorted register')
		);
		expect(register).toContain('`--gawdux-table-row-height`');
		expect(register).toContain('as tall as what it holds');
	});

	it('names only tokens and classes the stylesheet defines', () => {
		const properties = named.filter((name) => /^--gawdux-[\w-]+$/.test(name));
		expect(properties.length).toBeGreaterThan(10);
		expect(properties.filter((name) => !tokens.includes(`${name}:`))).toEqual([]);
		const classes = named.filter((name) => /^\.[a-z][\w-]*$/.test(name));
		expect(classes.length).toBeGreaterThan(15);
		expect(classes.filter((name) => !new RegExp(`\\${name}(?![\\w-])`).test(tokens))).toEqual([]);
	});

	it('names only exports that exist', () => {
		const exports = new Set(
			[components, primitives, shell, support, utils, validation].flatMap((module) => Object.keys(module))
		);
		// A component or a constant in code type: a capitalised name, or one in capitals.
		const names = named.filter((name) => /^(?:[A-Z][a-z]\w*|[A-Z][A-Z_]+)$/.test(name));
		expect(names.length).toBeGreaterThan(40);
		// A type has no value to import.
		const types = new Set(['ListSort', 'ListSortWords']);
		expect([...new Set(names)].filter((name) => !exports.has(name) && !types.has(name))).toEqual([]);
		// The helpers it names.
		for (const name of [
			'extendTabIcons',
			'createHouseRules',
			'createGeometry',
			'createEditMode',
			'editSnapshot',
			'sameEditValue',
			'createPageTabHost',
			'createRoomYield',
			'createMessageCenter',
			'savedViewsRailShows',
			'listSortOptions',
			'listSortWords',
			'listSortKeyFaults',
			'fitLabels',
			'scrollEdges',
			'breadcrumbWords',
			'longTextRuns',
			'resolveRailPlace',
			'activateRowLink',
			'isRowClickTarget',
			'formatCalendarDate',
			'formatAuditDateTimeText',
			'todayInZone'
		]) {
			expect(named, name).toContain(name);
			expect(exports.has(name), name).toBe(true);
		}
	});

	it('says at the end of every section how its rule is held: a guard, an owner or review', () => {
		const exported = new Set([...readers.matchAll(/^export function (\w+)/gm)].map((match) => match[1]!));
		// What the sections are for: how to read the others, and the questions that sum them up.
		const about = new Set(['UI and UX principles', 'How the rules are held', 'Review checklist']);
		const heads = [...book.matchAll(/^#{1,3} (.+)$/gm)];
		const sections = heads.map((head, index) => ({
			title: head[1]!,
			body: book.slice(head.index! + head[0].length, heads[index + 1]?.index ?? book.length).trim()
		}));
		expect(sections.length).toBeGreaterThan(40);
		const held = /^(Guard|Owner|Guidance): /m;
		// A heading over its sub-sections alone states no rule.
		const rules = sections.filter(({ title, body }) => body !== '' && !about.has(title));
		expect(rules.length).toBeGreaterThan(35);
		expect(rules.filter(({ body }) => !held.test(body)).map(({ title }) => title)).toEqual([]);
		for (const { title, body } of rules) {
			// The line that says how the rule is held is the section's last paragraph.
			const last = body.split(/\n\s*\n/).at(-1)!;
			expect(held.test(last), title).toBe(true);
			const names = [...last.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]!);
			// A guard is a reader the library exports, and nothing less.
			const guards = /(?:^|\. )Guard: /.test(last) ? names.filter((name) => exported.has(name)) : null;
			if (guards) expect(guards.length, title).toBeGreaterThan(0);
			// A section with no guard says so: its owner holds it, or review does.
			if (!guards && !/^Owner: /.test(last)) expect(last, title).toContain('held by review');
			// A test it names is one the library has.
			for (const name of names.filter((name) => name.startsWith('tests/')))
				expect(existsSync(path.join(ROOT, name)), `${title}: ${name}`).toBe(true);
		}
		// The book says which of the three a host may take as checked.
		expect(book).toContain('does not take a section with no "Guard:" line as checked');
	});

	it('keeps its own rules: no em dash and no en dash', () => {
		for (const dash of [String.fromCodePoint(0x2013), String.fromCodePoint(0x2014)]) expect(book).not.toContain(dash);
		// Every line of prose fits the page.
		expect(book.split('\n').filter((line) => line.length > 100)).toEqual([]);
	});
});
