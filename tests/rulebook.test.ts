/**
 * The rulebook (docs/UI_UX_PRINCIPLES.md) states each house rule in plain
 * words with its owner and its guard. This holds the document to the code:
 * every reader the library exports is named in it, every token and class it
 * names is one the stylesheet defines, every export it names exists, and it
 * keeps its own rule on dashes.
 */
import { readFileSync } from 'node:fs';
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
		expect(sort).toContain('`registersWithoutPhoneSort`');
		expect(sort).toContain('`takesPhoneSort`');
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
		const types = new Set(['ListSort']);
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

	it('keeps its own rules: no em dash and no en dash', () => {
		for (const dash of [String.fromCodePoint(0x2013), String.fromCodePoint(0x2014)]) expect(book).not.toContain(dash);
		// Every line of prose fits the page.
		expect(book.split('\n').filter((line) => line.length > 100)).toEqual([]);
	});
});
