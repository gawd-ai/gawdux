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
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { registersWithoutPhoneSort, takesPhoneSort } from '../utils/surface-rules.js';
/** The shortest reason that says something. */
const SHORTEST_REASON = 10;
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]s$|\.test\.svelte$/;
/**
 * The sources under a root, in path order: every file of the endings asked
 * for, declaration files (`.d.ts`), `node_modules` and, unless asked for,
 * tests left out.
 */
export function houseRuleFiles(root, options = {}) {
    const endings = options.extensions ?? ['.svelte', '.css', '.ts'];
    const exclude = options.exclude ?? [];
    const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory())
            return entry.name === 'node_modules' ? [] : walk(file);
        if (!endings.some((ending) => entry.name.endsWith(ending)))
            return [];
        if (entry.name.endsWith('.d.ts'))
            return [];
        if (!options.tests && TEST_FILE.test(entry.name))
            return [];
        return [file];
    });
    return walk(root)
        .map((file) => ({ file, rel: path.relative(root, file).split(path.sep).join('/') }))
        .filter(({ rel }) => !exclude.some((pattern) => matches(pattern, rel)))
        .sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0))
        .map(({ file, rel }) => ({ rel, source: readFileSync(file, 'utf8') }));
}
/** A pattern's answer on a text, whatever flags it carries. */
function matches(pattern, text) {
    pattern.lastIndex = 0;
    return pattern.test(text);
}
function allowancesOf(entry) {
    if (typeof entry === 'string')
        return [{ why: entry }];
    return Array.isArray(entry) ? entry : [entry];
}
function saysWhy(why) {
    return typeof why === 'string' && why.trim().length >= SHORTEST_REASON;
}
/** The runner over a root's sources, or over sources already read. */
export function createHouseRules(from, options = {}) {
    const files = typeof from === 'string' ? houseRuleFiles(from, options) : [...from];
    const byRel = new Map(files.map((file) => [file.rel, file.source]));
    const add = (out, rel, found) => {
        if (found.length > 0)
            out[rel] = [...(out[rel] ?? []), ...found];
    };
    const findings = (read, { only, allow = {} } = {}) => {
        const reads = (rel) => !only || (typeof only === 'function' ? only(rel) : matches(only, rel));
        const out = {};
        for (const { rel, source } of files) {
            if (!reads(rel))
                continue;
            let found = read(source, rel);
            const faults = [];
            if (rel in allow) {
                for (const allowance of allowancesOf(allow[rel])) {
                    const { finding, why } = allowance;
                    const named = finding ? ` (${finding})` : '';
                    if (!saysWhy(why))
                        faults.push(`an exception with no reason${named}`);
                    const kept = finding ? found.filter((entry) => !matches(finding, entry)) : [];
                    if (kept.length === found.length)
                        faults.push(`an exception that allows nothing${named}: ${why}`);
                    found = kept;
                }
            }
            add(out, rel, [...found, ...faults]);
        }
        for (const rel of Object.keys(allow))
            if (!byRel.has(rel))
                add(out, rel, ['an exception for a file that is not read']);
            else if (!reads(rel))
                add(out, rel, ['an exception for a file the rule does not read']);
        return out;
    };
    const counted = (read, allowed) => {
        const out = {};
        for (const { rel, source } of files) {
            const count = read(source, rel).length;
            const entry = allowed[rel];
            if (!entry) {
                if (count > 0)
                    add(out, rel, [`${count} found, none allowed`]);
                continue;
            }
            const faults = [];
            if (count !== entry.count)
                faults.push(`${count} found, ${entry.count} allowed: ${entry.what}`);
            if (entry.count < 1)
                faults.push('an entry that allows none');
            if (!entry.what?.trim())
                faults.push('an entry that does not say what it is');
            add(out, rel, faults);
        }
        for (const rel of Object.keys(allowed))
            if (!byRel.has(rel))
                add(out, rel, ['an entry for a file that is not read']);
        return out;
    };
    const phoneSorts = (headsElsewhere = {}) => {
        const component = (rel) => rel.endsWith('.svelte');
        const out = findings((source) => registersWithoutPhoneSort(source), {
            only: (rel) => component(rel) && !(rel in headsElsewhere)
        });
        for (const [rel, { why, bar }] of Object.entries(headsElsewhere)) {
            const source = byRel.get(rel);
            if (source === undefined) {
                add(out, rel, ['listed as heads sorted elsewhere, and not read']);
                continue;
            }
            const faults = [];
            if (!saysWhy(why))
                faults.push('listed as heads sorted elsewhere with no reason');
            if (registersWithoutPhoneSort(source).length === 0)
                faults.push('listed as heads sorted elsewhere, and needs no exception');
            if (bar !== undefined) {
                const barSource = byRel.get(bar);
                if (barSource === undefined)
                    faults.push(`its bar is not read: ${bar}`);
                else {
                    for (const found of registersWithoutPhoneSort(barSource))
                        faults.push(`its bar ${bar}: ${found}`);
                    if (!takesPhoneSort(barSource))
                        faults.push(`its bar takes no sort: ${bar}`);
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
            if (source === undefined)
                throw new Error(`house rules: ${rel} is not among the sources read`);
            return source;
        },
        findings,
        counted,
        phoneSorts,
        layoutResets: () => files.map(({ rel }) => rel).filter((rel) => /(?:^|\/)\+(?:layout|page)@[^/]*$/.test(rel))
    };
}
