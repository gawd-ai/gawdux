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
export type HouseRuleAllowlist = Record<string, string | HouseRuleAllowance | readonly HouseRuleAllowance[]>;
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
/**
 * The sources under a root, in path order: every file of the endings asked
 * for, declaration files (`.d.ts`), `node_modules` and, unless asked for,
 * tests left out.
 */
export declare function houseRuleFiles(root: string, options?: HouseRuleWalkOptions): HouseRuleFile[];
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
export declare function createHouseRules(from: string | readonly HouseRuleFile[], options?: HouseRuleWalkOptions): HouseRules;
