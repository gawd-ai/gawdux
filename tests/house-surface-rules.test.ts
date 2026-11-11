import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	insetOverrides,
	shadowedFlowbiteImports,
	surfaceShadows
} from '../src/lib/utils/surface-rules';

// The house surface rules over this library's own markup and styles, read
// statically so a divergence cannot come back unnoticed:
// - no shadow inside the page: every shadow the library writes is one of the
//   floating set named below, file by file and counted, with its reason (a
//   ring or a hard line, a layer with no blur, is an edge and not a shadow);
// - one inset on all four sides: the content inset's knob is read only by
//   the inset hosts that own it, there is no separate bottom inset, and the
//   frame's fill-height calc lives only in tokens.css.

const ROOT = path.resolve(import.meta.dirname, '../src/lib');

function sources(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) return sources(file);
		return /\.(svelte|css|ts)$/.test(entry.name) && !/\.(test|spec)\.ts$|\.d\.ts$/.test(entry.name)
			? [file]
			: [];
	});
}

const FILES = sources(ROOT).map((file) => ({
	rel: path.relative(ROOT, file).split(path.sep).join('/'),
	source: readFileSync(file, 'utf8')
}));

type Why = 'floating' | 'elevation';

/**
 * The shadows the library may draw, by file: what floats above the page and
 * closes, and the page's one elevation (the content surface and its command
 * bar, the phone shell's bar).
 */
const ALLOWED: Record<string, { count: number; why: Why[]; what: string }> = {
	'admin/AiUsageBars.svelte': { count: 1, why: ['floating'], what: 'a bar tooltip' },
	'components/SidebarFlyout.svelte': {
		count: 2,
		why: ['floating'],
		what: "the collapsed rail's flyout menu, light and dark"
	},
	'components/UserMenu.svelte': { count: 2, why: ['floating'], what: 'the open menu, light and dark' },
	'components/UserMenuThemeRow.svelte': {
		count: 1,
		why: ['floating'],
		what: "the theme switch's knob inside the open menu"
	},
	'primitives/Breadcrumbs.svelte': {
		count: 2,
		why: ['floating'],
		what: "the trail's path menu, light and dark"
	},
	'primitives/CommandPalette.svelte': { count: 1, why: ['floating'], what: 'the command palette' },
	'primitives/MessageHost.svelte': { count: 1, why: ['floating'], what: 'a toast' },
	'styles/tokens.css': {
		count: 6,
		why: ['elevation', 'floating'],
		what:
			"the page's one elevation (the content surface, the command bar, .shadow-md), the phone shell's bar, and the bar's sheet, light and dark"
	}
};

describe('no shadow inside the page', () => {
	it('draws only the floating set, file by file, each counted', () => {
		const drawn: Record<string, number> = {};
		for (const { rel, source } of FILES) {
			const found = surfaceShadows(source);
			if (found.length > 0) drawn[rel] = found.length;
		}
		const allowed = Object.fromEntries(
			Object.entries(ALLOWED).map(([rel, entry]) => [rel, entry.count])
		);
		expect(drawn).toEqual(allowed);
	});

	it("wraps no Flowbite component that hard-codes a shadow (Card's Frame)", () => {
		const offenders = FILES.filter(({ source }) => shadowedFlowbiteImports(source).length > 0).map(
			({ rel }) => rel
		);
		expect(offenders).toEqual([]);
	});

	it('gives every allowed shadow a reason', () => {
		for (const [rel, entry] of Object.entries(ALLOWED)) {
			expect(entry.why.length, rel).toBeGreaterThan(0);
			expect(entry.what.length, rel).toBeGreaterThan(0);
		}
	});
});

describe('one inset on all four sides', () => {
	/** The inset hosts that own the knob, and the reader of the rule itself. */
	const OWNERS: Record<string, number> = {
		'styles/tokens.css': 10,
		'primitives/EditablePageScaffold.svelte': 1,
		'utils/surface-rules.ts': 1
	};

	it('reads the content inset only in the inset hosts that own it', () => {
		const read: Record<string, number> = {};
		for (const { rel, source } of FILES) {
			const found = insetOverrides(source);
			if (found.length > 0) read[rel] = found.length;
		}
		expect(read).toEqual(OWNERS);
	});

	it('has no separate bottom inset: one value on all four sides', () => {
		const bottom = FILES.filter(({ rel, source }) =>
			rel === 'utils/surface-rules.ts' ? false : /--gawdux-page-inset-bottom/.test(source)
		).map(({ rel }) => rel);
		expect(bottom).toEqual([]);
	});
});
