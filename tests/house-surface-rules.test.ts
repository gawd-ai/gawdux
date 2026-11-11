import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	insetOverrides,
	shadowedFlowbiteImports,
	surfaceShadows,
	vanishingDarkEdges
} from '../src/lib/utils/surface-rules';

// The house surface rules over this library's own markup and styles, read
// statically so a divergence cannot come back unnoticed:
// - no shadow inside the page: every shadow the library writes is one of the
//   floating set named below, file by file and counted, with its reason (a
//   ring or a hard line, a layer with no blur, is an edge and not a shadow);
// - one inset on all four sides: the content inset's knob is read only by
//   the inset hosts that own it, there is no separate bottom inset, and the
//   frame's fill-height calc lives only in tokens.css;
// - light and dark draw the same lines: an edge drawn in light in a colour
//   of its own is never, in dark, transparent, of no width, or the colour of
//   the dark surface it is drawn on.

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
	/** The inset hosts that own the knob (the filter bar at a list's top among
	 * them), and the reader of the rule itself. */
	const OWNERS: Record<string, number> = {
		'styles/tokens.css': 11,
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

describe('light and dark draw the same lines', () => {
	it('draws in dark every edge it draws in light', () => {
		const vanishing: Record<string, string[]> = {};
		for (const { rel, source } of FILES) {
			if (rel === 'utils/surface-rules.ts') continue;
			const found = vanishingDarkEdges(source, rel);
			if (found.length > 0) vanishing[rel] = found;
		}
		expect(vanishing).toEqual({});
	});

	it('reads the edge a theme removes, and the surface each edge is drawn on', () => {
		const card = (inner: string) =>
			`<CardContainer title="T"><div slot="content">${inner}</div></CardContainer>`;
		// The line between rows in the card's own dark colour is not drawn.
		expect(
			vanishingDarkEdges(card('<div class="divide-y divide-gray-100 dark:divide-gray-800"></div>'))
		).toHaveLength(1);
		expect(
			vanishingDarkEdges(card('<div class="border border-gray-100 dark:border-gray-800"></div>'))
		).toHaveLength(1);
		// The page's content surface is the card surface in dark: where a file
		// states no surface, a gray-800 line is not drawn and a gray-900 one is.
		expect(vanishingDarkEdges('<div class="border border-gray-200 dark:border-gray-800"></div>')).toHaveLength(1);
		expect(vanishingDarkEdges('<div class="divide-y divide-gray-100 dark:divide-gray-800"></div>')).toHaveLength(1);
		expect(vanishingDarkEdges('<div class="border border-gray-200 dark:border-gray-900"></div>')).toEqual([]);
		// A surface the markup states holds the edges drawn on it.
		expect(
			vanishingDarkEdges('<div class="dark:bg-gray-900"><p class="border-b border-gray-100 dark:border-gray-800"></p></div>')
		).toEqual([]);
		expect(vanishingDarkEdges('<ul class="divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800"></ul>')).toEqual([]);
		// A ring is an edge: drawn in light, it is drawn in dark.
		expect(vanishingDarkEdges('<div class="ring-1 ring-gray-200 dark:ring-gray-800"></div>')).toHaveLength(1);
		expect(vanishingDarkEdges('<div class="ring-1 ring-gray-200 dark:ring-0"></div>')).toHaveLength(1);
		expect(vanishingDarkEdges('<div class="ring-1 ring-gray-200 dark:ring-gray-700"></div>')).toEqual([]);
		// An element's own dark surface holds its rows' line.
		expect(
			vanishingDarkEdges('<ul class="divide-y divide-gray-100 dark:bg-gray-700 dark:divide-gray-700"></ul>')
		).toHaveLength(1);
		// A theme that removes the edge, in markup or in a module's class string.
		expect(vanishingDarkEdges('<div class="border border-gray-200 dark:border-transparent"></div>')).toHaveLength(1);
		expect(vanishingDarkEdges('<div class="border-b border-gray-200 dark:border-0"></div>')).toHaveLength(1);
		expect(vanishingDarkEdges("const c = 'border border-gray-200 dark:border-transparent';", 'x.ts')).toHaveLength(1);
		// The house edge in dark, a cut-out in the surface's colour in both themes, and no light edge.
		expect(vanishingDarkEdges(card('<div class="border border-gray-100 dark:border-gray-700"></div>'))).toEqual([]);
		expect(vanishingDarkEdges('<span class="ring-2 ring-white dark:ring-gray-900 border-white dark:border-gray-900"></span>')).toEqual([]);
		expect(vanishingDarkEdges('<div class="border-transparent dark:border-gray-900"></div>')).toEqual([]);
		// An expression's arrow is not a tag's end.
		expect(
			vanishingDarkEdges(
				card('<button onclick={() => go()} class="border border-gray-100 dark:border-gray-800">x</button>')
			)
		).toHaveLength(1);
	});
});
