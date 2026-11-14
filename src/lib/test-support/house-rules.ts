/**
 * The house rule runner: walk a tree's sources, apply a reader to each file
 * and answer what it found by file, with the exceptions a host allows named
 * file by file, each with its reason. Node only.
 *
 * A host's guard is then one line a rule:
 *
 *     const rules = createHouseRules(path.resolve('src'));
 *     expect(rules.findings(vanishingDarkEdges)).toEqual({});
 *
 * The readers are `gawdux/utils`' (`surfaceShadows`, `plainLanguageFaults`
 * and the rest); the runner reads nothing of its own into a source. An
 * exception that no longer excepts anything, names a file that is not read
 * or gives no reason is itself a finding, so an allowlist never outlives
 * what it allowed.
 *
 * Every reader of `gawdux/utils` whose second argument is the file's path
 * is passed as it stands; one that takes options is wrapped
 * (`(source) => tabIconFaults(source, { meanings })`).
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { registersWithoutPhoneSort, takesPhoneSort } from '../utils/surface-rules.js';

/** A source the runner read: its path from the root, with forward slashes, and its text. */
export interface HouseRuleFile {
	rel: string;
	source: string;
}

/** A reader: what it finds in a source, the file's path given for the readers that ask. */
export type HouseRuleReader = (source: string, rel: string) => string[];

export interface HouseRuleWalkOptions {
	/** The file endings read. Default: `.svelte`, `.css` and `.ts`. */
	extensions?: readonly string[];
	/** Paths from the root left out (a part of the tree outside the rules). */
	exclude?: readonly RegExp[];
	/** Read tests and fixtures too (`.test.ts`, `.spec.ts`, `.test.svelte`). Default false. */
	tests?: boolean;
}

/** An exception: the findings it allows in its file (all of them with no `finding`) and why. */
export interface HouseRuleAllowance {
	finding?: RegExp;
	why: string;
}

/** Exceptions by file: a reason alone allows every finding of the file. */
export type HouseRuleAllowlist = Record<
	string,
	string | HouseRuleAllowance | readonly HouseRuleAllowance[]
>;

/** What a file may hold of something counted (a shadow), and what it is. */
export interface HouseRuleCount {
	count: number;
	what: string;
}

/** Sortable heads that need no phone sort in their own file, with why, and the file whose toolbar sorts them. */
export interface HeadsElsewhere {
	why: string;
	bar?: string;
}

export interface HouseRuleFindingOptions {
	/** The files the rule reads: a test on the path. Default: every file. */
	only?: RegExp | ((rel: string) => boolean);
	/** The exceptions, by file, each with its reason. */
	allow?: HouseRuleAllowlist;
}

/** Findings by file; a file with none is left out, so a clean tree is `{}`. */
export type HouseRuleFindings = Record<string, string[]>;

/** The shortest reason that says something. */
const SHORTEST_REASON = 10;

/** The findings a file of heads sorted elsewhere has: heads, or a table's own heads read as
 *  cards on a phone, and no toolbar of its own. */
const HEADS_WITH_NO_TOOLBAR =
	/^(?:sortable heads with no toolbar of its own|a DataTable read as cards on a phone with no sort)\b/;

const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]s$|\.test\.svelte$/;

/**
 * The sources under a root, in path order: every file of the endings asked
 * for, declaration files (`.d.ts`), `node_modules` and, unless asked for,
 * tests left out.
 */
export function houseRuleFiles(root: string, options: HouseRuleWalkOptions = {}): HouseRuleFile[] {
	const endings = options.extensions ?? ['.svelte', '.css', '.ts'];
	const exclude = options.exclude ?? [];
	const walk = (dir: string): string[] =>
		readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
			const file = path.join(dir, entry.name);
			if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : walk(file);
			if (!endings.some((ending) => entry.name.endsWith(ending))) return [];
			if (entry.name.endsWith('.d.ts')) return [];
			if (!options.tests && TEST_FILE.test(entry.name)) return [];
			return [file];
		});
	return walk(root)
		.map((file) => ({ file, rel: path.relative(root, file).split(path.sep).join('/') }))
		.filter(({ rel }) => !exclude.some((pattern) => matches(pattern, rel)))
		.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0))
		.map(({ file, rel }) => ({ rel, source: readFileSync(file, 'utf8') }));
}

/** A pattern's answer on a text, whatever flags it carries. */
function matches(pattern: RegExp, text: string): boolean {
	pattern.lastIndex = 0;
	return pattern.test(text);
}

function allowancesOf(entry: HouseRuleAllowlist[string]): readonly HouseRuleAllowance[] {
	if (typeof entry === 'string') return [{ why: entry }];
	return Array.isArray(entry) ? entry : [entry as HouseRuleAllowance];
}

function saysWhy(why: string | undefined): boolean {
	return typeof why === 'string' && why.trim().length >= SHORTEST_REASON;
}

export interface HouseRules {
	/** The sources read, in path order. */
	readonly files: readonly HouseRuleFile[];
	/** Whether a path was read. */
	has(rel: string): boolean;
	/** A file's text; throws, naming the path, when it was not read. */
	source(rel: string): string;
	/**
	 * What a reader finds, by file. An allowed finding is left out; an
	 * exception that gives no reason, allows nothing the reader found, or
	 * names a file that was not read is a finding under its file.
	 */
	findings(read: HouseRuleReader, options?: HouseRuleFindingOptions): HouseRuleFindings;
	/**
	 * What a reader finds, counted against what each file may hold: a file
	 * that holds another number than it is allowed, a file allowed that holds
	 * none or was not read, and an entry that does not say what it is.
	 */
	counted(read: HouseRuleReader, allowed: Record<string, HouseRuleCount>): HouseRuleFindings;
	/**
	 * The phone sort rule over the tree: every component that sorts by its
	 * heads hands a toolbar the house phone sort (`registersWithoutPhoneSort`),
	 * but the files listed, each with why. A listed file must still need its
	 * exception and hold nothing else: heads with no toolbar of its own (a
	 * `DataTable`'s, read as cards on a phone with no sort, among them) is
	 * all the list allows, so a listed file whose own toolbar takes no
	 * sort, or that draws a phone sort of its own, is still reported. The file
	 * named as its `bar` must be clean and take the
	 * sort: a `ListQueryBar`'s, or a list toolbar's (`FilterBar`'s, through
	 * `ListSurface` or `ListPageScaffold`).
	 */
	phoneSorts(headsElsewhere?: Record<string, HeadsElsewhere>): HouseRuleFindings;
	/** The routes that leave their layout (`+page@`, `+layout@`), which a host lists with why. */
	layoutResets(): string[];
}

/** The runner over a root's sources, or over sources already read. */
export function createHouseRules(
	from: string | readonly HouseRuleFile[],
	options: HouseRuleWalkOptions = {}
): HouseRules {
	const files: readonly HouseRuleFile[] =
		typeof from === 'string' ? houseRuleFiles(from, options) : [...from];
	const byRel = new Map(files.map((file) => [file.rel, file.source]));
	const add = (out: HouseRuleFindings, rel: string, found: string[]) => {
		if (found.length > 0) out[rel] = [...(out[rel] ?? []), ...found];
	};

	const findings: HouseRules['findings'] = (read, { only, allow = {} } = {}) => {
		const reads = (rel: string) =>
			!only || (typeof only === 'function' ? only(rel) : matches(only, rel));
		const out: HouseRuleFindings = {};
		for (const { rel, source } of files) {
			if (!reads(rel)) continue;
			let found = read(source, rel);
			const faults: string[] = [];
			if (rel in allow) {
				const allowances = allowancesOf(allow[rel]!);
				if (allowances.length === 0) faults.push('an exception that allows nothing: no exception is listed');
				for (const allowance of allowances) {
					const { finding, why } = allowance;
					const named = finding ? ` (${finding})` : '';
					if (!saysWhy(why)) faults.push(`an exception with no reason${named}`);
					const kept = finding ? found.filter((entry) => !matches(finding, entry)) : [];
					if (kept.length === found.length)
						faults.push(`an exception that allows nothing${named}: ${why}`);
					found = kept;
				}
			}
			add(out, rel, [...found, ...faults]);
		}
		for (const rel of Object.keys(allow))
			if (!byRel.has(rel)) add(out, rel, ['an exception for a file that is not read']);
			else if (!reads(rel)) add(out, rel, ['an exception for a file the rule does not read']);
		return out;
	};

	const counted: HouseRules['counted'] = (read, allowed) => {
		const out: HouseRuleFindings = {};
		for (const { rel, source } of files) {
			const count = read(source, rel).length;
			const entry = allowed[rel];
			if (!entry) {
				if (count > 0) add(out, rel, [`${count} found, none allowed`]);
				continue;
			}
			const faults: string[] = [];
			if (count !== entry.count) faults.push(`${count} found, ${entry.count} allowed: ${entry.what}`);
			if (entry.count < 1) faults.push('an entry that allows none');
			if (!entry.what?.trim()) faults.push('an entry that does not say what it is');
			add(out, rel, faults);
		}
		for (const rel of Object.keys(allowed))
			if (!byRel.has(rel)) add(out, rel, ['an entry for a file that is not read']);
		return out;
	};

	const phoneSorts: HouseRules['phoneSorts'] = (headsElsewhere = {}) => {
		const component = (rel: string) => rel.endsWith('.svelte');
		const out = findings((source) => registersWithoutPhoneSort(source), {
			only: (rel) => component(rel) && !(rel in headsElsewhere)
		});
		for (const [rel, { why, bar }] of Object.entries(headsElsewhere)) {
			const source = byRel.get(rel);
			if (source === undefined) {
				add(out, rel, ['listed as heads sorted elsewhere, and not read']);
				continue;
			}
			const faults: string[] = [];
			if (!saysWhy(why)) faults.push('listed as heads sorted elsewhere with no reason');
			const own = registersWithoutPhoneSort(source);
			if (own.length === 0) faults.push('listed as heads sorted elsewhere, and needs no exception');
			for (const found of own)
				if (!HEADS_WITH_NO_TOOLBAR.test(found))
					faults.push(`listed as heads sorted elsewhere, and its own toolbar takes no sort: ${found}`);
			if (bar !== undefined) {
				const barSource = byRel.get(bar);
				if (barSource === undefined) faults.push(`its bar is not read: ${bar}`);
				else {
					for (const found of registersWithoutPhoneSort(barSource)) faults.push(`its bar ${bar}: ${found}`);
					if (!takesPhoneSort(barSource)) faults.push(`its bar takes no sort: ${bar}`);
				}
			}
			add(out, rel, faults);
		}
		return out;
	};

	return {
		files,
		has: (rel) => byRel.has(rel),
		source(rel) {
			const source = byRel.get(rel);
			if (source === undefined) throw new Error(`house rules: ${rel} is not among the sources read`);
			return source;
		},
		findings,
		counted,
		phoneSorts,
		layoutResets: () =>
			files.map(({ rel }) => rel).filter((rel) => /(?:^|\/)\+(?:layout|page)@[^/]*$/.test(rel))
	};
}
