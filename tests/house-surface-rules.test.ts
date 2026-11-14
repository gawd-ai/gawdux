import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
	drawsTabs,
	elevationReads,
	handDrawnCancels,
	handDrawnIconCounts,
	handRolledRailRows,
	handSetCardPadding,
	handSizedIcons,
	insetOverrides,
	itemActsInCards,
	miscasedActionLabels,
	pageSurfacesOutsideFrame,
	plainLanguageFaults,
	questioningConfirmations,
	readableDashes,
	registersWithoutPhoneSort,
	shadowedFlowbiteImports,
	statusAmongControls,
	surfaceShadows,
	tabsAfterHistory,
	untabbedBarActs,
	unlabelledRegisterCells,
	vanishingDarkEdges,
	withoutComments
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
//   the dark surface it is drawn on;
// - one icon size in a header: the icons a header, a tab and a rail row show
//   are the house icon, sized by nothing of their own;
// - a rail row is RailRowButton's: no caller draws a row of its own;
// - one padding inside a card: no bordered, rounded box is padded at the
//   card's size by hand, the card padding being CardContainer's and
//   `.card-content`'s;
// - a register reads on a phone: every register body cell names its column
//   or its place in the card;
// - one question in a confirmation: the line under a confirmation's title
//   never asks again;
// - one case for action labels: every action's label is sentence case;
// - an item's acts sit in the command bar: no act on the selected item is a
//   button in its card;
// - a phone sort on every sorted register: a register that sorts by its
//   heads gives its query bar the sort, and no host draws a phone sort;
// - the bar holds the open tab's acts: every act a tabbed component puts in
//   the command bar names its tab;
// - History is the last tab;
// - the state beside the title: no chip among a pane header's controls;
// - one page frame: PageFrame owns the page's panel and its seam with the
//   command bar; no source draws a page-level surface, a frame part or a bar
//   of its own, and the page's elevation is read only by the frame and the
//   floating frames;
// - one action pair in a drawer: a decision's Cancel and act are
//   PageCommandBarPair's, Cancel neutral and red only while it would discard
//   input;
// - plain everyday language: no string a person reads uses a phrase a plain
//   rewrite removed (a backstop; it does not prove the copy is plain);
// - no em dash or en dash in what a person reads, but the mark for an empty
//   value the library declares, one em dash alone.
// Every reader leaves comments out, found in one pass in source order, so a
// `//` comment holding `/*` hides nothing after its line.

// The tree read; another tree's src/lib (an archive of an earlier tag) can be
// read for a fail-first run.
const ROOT = process.env['HOUSE_RULES_SRC'] ?? path.resolve(import.meta.dirname, '../src/lib');

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
			"the page's one elevation (the page frame's panel, the content's elevation on the bar at the seam, .shadow-md for Flowbite's floating frames), the phone shell's bar, and the bar's sheet, light and dark"
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

describe('one icon size in a header', () => {
	/** The library's own header, tab and rail row icons. */
	const HEADER_FILES = [
		'primitives/HeaderStatus.svelte',
		'primitives/TabTitle.svelte',
		'primitives/RailRowButton.svelte'
	];

	it('sizes no header, tab or rail row icon of its own: each is the house icon', () => {
		const sized = Object.fromEntries(
			FILES.filter(({ rel }) => HEADER_FILES.includes(rel))
				.map(({ rel, source }) => [rel, handSizedIcons(source)])
				.filter(([, found]) => found.length > 0)
		);
		expect(sized).toEqual({});
		for (const rel of HEADER_FILES) {
			const source = FILES.find((file) => file.rel === rel)!.source;
			expect(source, rel).toContain('gawdux-icon');
		}
	});

	it("gives a header's icon button the house icon, a row's its 16px", () => {
		const source = FILES.find((file) => file.rel === 'primitives/IconButton.svelte')!.source;
		expect(source).toContain("size === 'md' ? 'gawdux-icon' : 'h-4 w-4'");
	});

	it('reads an icon a source sizes itself', () => {
		expect(handSizedIcons('<LockOutline class="h-3.5 w-3.5" />')).toHaveLength(1);
		expect(handSizedIcons('<FileOutline class="h-4 w-4 shrink-0 text-blue-500" />')).toHaveLength(1);
		expect(handSizedIcons('<svg class="size-5" viewBox="0 0 24 24"></svg>')).toHaveLength(1);
		expect(handSizedIcons('<Icon class={open ? "h-5 w-5" : "h-4 w-4"} />')).toHaveLength(1);
		expect(handSizedIcons('<LockOutline class="gawdux-icon text-gray-500" />')).toEqual([]);
		expect(handSizedIcons('<div class="h-8 w-8"><LockOutline class="gawdux-icon" /></div>')).toEqual([]);
	});
});

describe('a rail row is RailRowButton\'s', () => {
	it('draws no rail row of its own', () => {
		const rows = Object.fromEntries(
			FILES.map(({ rel, source }) => [rel, handRolledRailRows(source)]).filter(
				([, found]) => found.length > 0
			)
		);
		expect(rows).toEqual({});
	});

	it('reads a row a caller draws itself', () => {
		expect(
			handRolledRailRows(
				'<RailRowButton selected><span class="min-w-0 flex-1"><span class="text-sm">A</span></span></RailRowButton>'
			)
		).toHaveLength(2);
		expect(handRolledRailRows('<RailRowButton title="A" meta="B" />')).toEqual([]);
		expect(
			handRolledRailRows(
				'<RailRowButton title="A">{#snippet trailing()}<Badge>Default</Badge>{/snippet}</RailRowButton>'
			)
		).toEqual([]);
	});
});

describe('one padding inside a card', () => {
	/** What floats above the page and closes: a panel of its own, no card in the page. */
	const FLOATING_PANELS: Record<string, string> = {
		'primitives/CommandPalette.svelte': 'the command palette, its search row and its results'
	};

	it('pads no bordered, rounded box at the card\'s size by hand', () => {
		const padded = Object.fromEntries(
			FILES.filter(({ rel }) => !(rel in FLOATING_PANELS))
				.map(({ rel, source }) => [rel, handSetCardPadding(source)])
				.filter(([, found]) => found.length > 0)
		);
		expect(padded).toEqual({});
		for (const rel of Object.keys(FLOATING_PANELS)) expect(ALLOWED[rel]?.why, rel).toContain('floating');
	});

	it('reads a hand-set card padding, each class string of a tag on its own', () => {
		expect(handSetCardPadding('<div class="rounded-lg border bg-white p-4"></div>')).toHaveLength(1);
		expect(handSetCardPadding('<section class="rounded-xl border px-6 py-4"></section>')).toHaveLength(1);
		expect(handSetCardPadding("<div class={open ? 'rounded-lg border p-6' : 'hidden'}></div>")).toHaveLength(1);
		expect(handSetCardPadding('<div class="rounded-xl border p-3 min-[1025px]:p-4"></div>')).toHaveLength(1);
		// A nested box's own row padding, a card's body class, a button.
		expect(handSetCardPadding('<div class="rounded-md border p-3"></div>')).toEqual([]);
		expect(handSetCardPadding('<div class="card-content rounded-lg border"></div>')).toEqual([]);
		expect(handSetCardPadding('<button class="rounded-lg border px-4 py-2"></button>')).toEqual([]);
		expect(handSetCardPadding('<div class="border-b px-6 py-4"></div>')).toEqual([]);
	});
});

describe('a register reads on a phone', () => {
	it('names every register body cell\'s column or its place in the card', () => {
		const unlabelled = Object.fromEntries(
			FILES.map(({ rel, source }) => [rel, unlabelledRegisterCells(source)]).filter(
				([, found]) => found.length > 0
			)
		);
		expect(unlabelled).toEqual({});
	});

	it('reads a register cell that names nothing', () => {
		const register = (cell: string) => `<ListSurface><Table><TableBody><TableBodyRow>${cell}</TableBodyRow></TableBody></Table></ListSurface>`;
		expect(unlabelledRegisterCells(register('<TableBodyCell>Alpha</TableBodyCell>'))).toHaveLength(1);
		expect(unlabelledRegisterCells(register('<TableBodyCell data-label="Due">2026</TableBodyCell>'))).toEqual([]);
		expect(unlabelledRegisterCells(register('<TableBodyCell data-card="title">A</TableBodyCell>'))).toEqual([]);
		expect(unlabelledRegisterCells(register('<td colspan={6}>None</td>'))).toEqual([]);
		expect(unlabelledRegisterCells('<Table><TableBodyCell>A</TableBodyCell></Table>')).toEqual([]);
		// A register that draws a list's scroller of its own is a register.
		expect(
			unlabelledRegisterCells('<div class="list-table-scroll"><Table><TableBodyCell>A</TableBodyCell></Table></div>')
		).toHaveLength(1);
	});
});

/** Every file's findings by a reader, the files with none left out. */
function findings(read: (source: string, rel: string) => string[], skip: Record<string, string> = {}) {
	return Object.fromEntries(
		FILES.filter(({ rel }) => !(rel in skip))
			.map(({ rel, source }) => [rel, read(source, rel)])
			.filter(([, found]) => found.length > 0)
	);
}

describe('one question in a confirmation', () => {
	it('asks no question under a confirmation\'s title', () => {
		expect(findings((source, rel) => questioningConfirmations(source, rel))).toEqual({});
	});

	it('reads a line under the title that is or opens with a question', () => {
		const request = (message: string) =>
			`const r = { title: 'Archive role?', message: ${message}, confirmLabel: 'Archive role' };`;
		expect(questioningConfirmations(request("`Archive “${name}”? Its members keep access.`"), 'a.ts')).toHaveLength(1);
		expect(questioningConfirmations(request("'Remove this member?'"), 'a.ts')).toHaveLength(1);
		expect(questioningConfirmations(request("'Its members keep access.'"), 'a.ts')).toEqual([]);
		expect(questioningConfirmations(request("'Version 1.0 stays. Continue?'"), 'a.ts')).toEqual([]);
		expect(
			questioningConfirmations("submit({ confirmTitle: 'A?', confirm: `Remove ${m} from this role?`, confirmLabel: 'Remove' })", 'a.ts')
		).toHaveLength(1);
		expect(
			questioningConfirmations('<PageCommandBarConfirm title="Delete it?" message="Delete it?" confirmLabel="Delete" />')
		).toHaveLength(1);
		expect(
			questioningConfirmations("const g = { label: 'Draft', isDirty: () => true, message: 'Leave without saving?' };", 'a.ts')
		).toHaveLength(1);
	});
});

describe('one case for action labels', () => {
	it('writes every action label in sentence case', () => {
		expect(findings((source, rel) => miscasedActionLabels(source, { file: rel }))).toEqual({});
	});

	it('reads a label in title case, keeping acronyms, proper nouns and an item\'s name', () => {
		const read = (source: string, words: string[] = []) => miscasedActionLabels(source, { words });
		expect(read('<Button>Save as Draft</Button>')).toHaveLength(1);
		expect(read("<script>const a = [{ kind: 'add', label: 'New Role', onClick }];</script>")).toHaveLength(1);
		expect(read("<script>const a = { label: 'List Roles', execute };</script>")).toHaveLength(1);
		expect(read('<X confirmLabel="Archive Role" />')).toHaveLength(1);
		expect(read('<IconButton label="Open Channel" />')).toHaveLength(1);
		expect(read('<button>show more</button>')).toHaveLength(1);
		expect(read('<Button>{busy ? \'Saving…\' : \'Save Changes\'}</Button>')).toHaveLength(1);
		expect(read('<Button>Export CSV</Button>')).toEqual([]);
		expect(read('<Button>Download PDF</Button>')).toEqual([]);
		expect(read('<Button>Revoke System key</Button>', ['System'])).toEqual([]);
		expect(read('<Button>Archive {role.name}</Button>')).toEqual([]);
		expect(read('<Button>{#if archived}Restore{:else}Archive{/if}</Button>')).toEqual([]);
		expect(read("<script>const a = { label: `Sign ${step}`, onClick };</script>")).toEqual([]);
		expect(read("<script>const nav = { label: 'Work Orders', href: '/w' };</script>")).toEqual([]);
		expect(read('<button><span class="font-bold">B</span></button>')).toEqual([]);
	});
});

describe('an item\'s acts sit in the command bar', () => {
	it('draws no act on a selected item as a button in its card', () => {
		expect(findings((source, rel) => (rel.endsWith('.svelte') ? itemActsInCards(source) : []))).toEqual({});
	});

	it('reads a delete in a card or a detail, and leaves a row\'s own act on its row', () => {
		expect(itemActsInCards('<div class="card-content"><Button color="red">Delete</Button></div>')).toHaveLength(1);
		expect(
			itemActsInCards('<MasterDetailShell>{#snippet detail()}<Button>Archive workspace</Button>{/snippet}</MasterDetailShell>')
		).toHaveLength(1);
		expect(
			itemActsInCards('<CardContainer>{#each members as m}<Button>Remove</Button><Button>Delete</Button>{/each}</CardContainer>')
		).toEqual([]);
		expect(itemActsInCards('<div class="card-content"><Button>Save changes</Button></div>')).toEqual([]);
	});
});

describe('a phone sort on every sorted register', () => {
	/** Tables whose heads stay drawn: no register's cards, so the heads sort on a phone. */
	const HEADS_DRAWN: Record<string, string> = {
		'primitives/DataTable.svelte':
			"a card's or a panel's table, whose heads stay drawn; a register drawing it gives its own query bar the sort"
	};

	it('gives every register that sorts by its heads the house phone sort', () => {
		expect(
			findings((source, rel) => (rel.endsWith('.svelte') ? registersWithoutPhoneSort(source) : []), HEADS_DRAWN)
		).toEqual({});
		for (const rel of Object.keys(HEADS_DRAWN))
			expect(registersWithoutPhoneSort(FILES.find((file) => file.rel === rel)!.source), rel).not.toEqual([]);
	});

	it('reads sortable heads with a query bar that takes no sort, and a phone sort of its own', () => {
		const heads = '<SortableHeadCell field="name" label="Name" {sortField} onSort={toggle} />';
		expect(registersWithoutPhoneSort(`<ListQueryBar value="" />${heads}`)).toHaveLength(1);
		expect(registersWithoutPhoneSort(`<ListQueryBar value="" sort={sort} />${heads}`)).toEqual([]);
		expect(registersWithoutPhoneSort(heads)).toHaveLength(1);
		expect(
			registersWithoutPhoneSort('<ListQueryBar>{#snippet mobileSort()}<select></select>{/snippet}</ListQueryBar>')
		).toHaveLength(1);
	});
});

describe("the bar holds the open tab's acts", () => {
	it('names the tab of every act a tabbed component of the library puts in the bar', () => {
		expect(
			findings(
				(source, rel) =>
					rel.endsWith('.svelte') && drawsTabs(source) ? untabbedBarActs(source) : [],
				{}
			)
		).toEqual({});
	});

	it('reads a bar act with no tab, and leaves a decision’s Cancel and confirm', () => {
		expect(
			untabbedBarActs(
				'<PageCommandBarCenter><Button>Submit for review</Button></PageCommandBarCenter>'
			)
		).toEqual(['PageCommandBarCenter with no tab (line 1)']);
		expect(
			untabbedBarActs(
				'<PageCommandBarCenter tab="workflow"><Button>Sign</Button></PageCommandBarCenter>'
			)
		).toEqual([]);
		expect(
			untabbedBarActs('<PageCommandBar tab={["content"]}><span>3 of 5</span></PageCommandBar>')
		).toEqual([]);
		expect(
			untabbedBarActs(
				'<PageCommandBarCenter><Button data-action-cancel>Cancel</Button><Button data-action-confirm>Sign</Button></PageCommandBarCenter>'
			)
		).toEqual([]);
		expect(
			untabbedBarActs(
				"<EditablePageScaffold editMode={{ isEditing: false, canEdit: true }} lifecycle={[{ kind: 'add', label: 'Add spec', href: x }, { kind: 'pdf', href: y, tab: 'details' }]}></EditablePageScaffold>"
			)
		).toEqual([
			'an edit mode with no tab (line 1)',
			'a lifecycle add "Add spec" with no tab (line 1)'
		]);
		expect(
			untabbedBarActs(
				"<EditablePageScaffold editMode={{ tab: 'details', isEditing: false }} lifecycle={[{ kind: 'add', label: 'Add spec', tab: 'details' }]}></EditablePageScaffold>"
			)
		).toEqual([]);
		expect(
			untabbedBarActs(
				'<EditablePageScaffold><svelte:fragment slot="actions"><Button>Edit</Button></svelte:fragment></EditablePageScaffold>'
			)
		).toEqual(["the scaffold's actions with no tab (line 1)"]);
		expect(
			untabbedBarActs(
				'<EditablePageScaffold actionsTab="overview"><svelte:fragment slot="actions"><Button>Edit</Button></svelte:fragment></EditablePageScaffold>'
			)
		).toEqual([]);
		// A scaffold that holds no actions of its own (a load error's) has no
		// act, though another scaffold in the source holds some.
		expect(
			untabbedBarActs(
				'{#if !item}<EditablePageScaffold surface loadError="Not found." />{:else}<EditablePageScaffold actionsTab="overview"><svelte:fragment slot="actions"><Button>Edit</Button></svelte:fragment></EditablePageScaffold>{/if}'
			)
		).toEqual([]);
	});

	it('knows a tabbed source', () => {
		expect(drawsTabs('<PageTabs><TabItem /></PageTabs>')).toBe(true);
		expect(drawsTabs('<ArtifactViewer extraTabs={tabs} />')).toBe(true);
		expect(drawsTabs('<div></div>')).toBe(false);
	});
});

describe('History is the last tab', () => {
	it('draws no tab after History in the library', () => {
		expect(
			findings((source, rel) => (rel.endsWith('.svelte') ? tabsAfterHistory(source) : []), {})
		).toEqual({});
	});

	it('reads a tab after History, and a viewer’s History before its Versions', () => {
		expect(
			tabsAfterHistory(
				'<TabTitle label="Details" /><TabTitle label="History" /><TabTitle label="Training" />'
			)
		).toEqual(['Training after History (line 1)']);
		expect(tabsAfterHistory('<TabTitle label="Details" /><TabTitle label="History" />')).toEqual(
			[]
		);
		const viewer = (tab: string, markup = '<ArtifactViewer extraTabs={tabs} />') =>
			`<script lang="ts">const tabs = [viewerTab('workflow', 'Workflow'), ${tab}];</script>${markup}`;
		expect(tabsAfterHistory(viewer("viewerTab('audit', 'History')"))).toHaveLength(1);
		expect(
			tabsAfterHistory(viewer("viewerTab('audit', 'History', { afterVersions: true })"))
		).toEqual([]);
		expect(tabsAfterHistory(viewer("{ id: 'audit', label: 'History' }"))).toHaveLength(1);
		expect(
			tabsAfterHistory(
				viewer(
					"viewerTab('audit', 'History')",
					'<ArtifactViewer extraTabs={tabs} showHistoryTab={false} />'
				)
			)
		).toEqual([]);
	});
});

describe('the state beside the title', () => {
	it('draws no chip among a pane header’s controls in the library', () => {
		expect(
			findings((source, rel) => (rel.endsWith('.svelte') ? statusAmongControls(source) : []), {})
		).toEqual({});
	});

	it('reads a chip in an actions snippet or slot', () => {
		expect(
			statusAmongControls(
				'<PaneHeader>{#snippet actions()}<HeaderStatus label="Draft" /><IconButton />{/snippet}</PaneHeader>'
			)
		).toHaveLength(1);
		expect(
			statusAmongControls(
				'<X><svelte:fragment slot="actions"><PaneHeaderStatus status="draft" /></svelte:fragment></X>'
			)
		).toHaveLength(1);
		expect(
			statusAmongControls(
				'<PaneHeader>{#snippet status()}<HeaderStatus label="Draft" />{/snippet}</PaneHeader>'
			)
		).toEqual([]);
	});
});

describe('one count pill', () => {
	it('draws no count pill by hand in the library', () => {
		expect(
			findings((source, rel) => (rel.endsWith('.svelte') ? handDrawnIconCounts(source) : []), {})
		).toEqual({});
	});

	it('reads a pill drawn by hand, and leaves the house pill', () => {
		expect(
			handDrawnIconCounts(
				'<span class="absolute -right-1 -top-1 flex h-4 min-w-4 rounded-full border-2 bg-blue-600 text-white">3</span>'
			)
		).toHaveLength(1);
		expect(
			handDrawnIconCounts(
				'<span class={`absolute -right-1.5 -top-1 flex h-4 min-w-4 rounded-full ${tone}`}>3</span>'
			)
		).toEqual([]);
		expect(handDrawnIconCounts('<span class="gawdux-icon-count">3</span>')).toEqual([]);
	});
});

describe('one page frame', () => {
	/** The frame's owners: the frame itself, the stylesheet that draws it, and
	 * the hosts that fill it (`page-fill`), each with what it may name. */
	const OWNERS: Record<string, RegExp> = {
		'primitives/PageFrame.svelte': /^(?:page-frame|page-frame-panel|page-frame-surface|page-command-bar|cmd-bar-zone|<main>) /,
		'styles/tokens.css': /^(?:page-frame|page-frame-panel|page-frame-surface|page-fill|page-command-bar|cmd-bar-zone) /,
		'primitives/PageTabs.svelte': /^page-fill /,
		'primitives/EditablePageScaffold.svelte': /^page-fill /,
		'primitives/TableContainer.svelte': /^page-fill /,
		// The reader names what it reads.
		'utils/surface-rules.ts': /./
	};

	it('draws no page-level surface, frame part, bar or main outside the frame', () => {
		expect(
			findings((source, rel) =>
				pageSurfacesOutsideFrame(source).filter((found) => !OWNERS[rel]?.test(found))
			)
		).toEqual({});
	});

	it('reads the page elevation only in the frame and the floating frames', () => {
		const reads = findings((source) => elevationReads(source));
		expect(reads).toEqual({
			'styles/tokens.css': [
				'.shadow-md',
				'.page-frame-panel',
				'.page-frame-panel > .page-command-bar::before, .page-frame-surface .page-command-drawer::before'
			]
		});
	});

	it('reads a retired surface, a frame part, a bar drawn by hand and a main of its own', () => {
		expect(pageSurfacesOutsideFrame('<div class="context-surface page-tabs-shell">x</div>')).toEqual([
			'context-surface (line 1)'
		]);
		expect(pageSurfacesOutsideFrame('<div class="page-shell"><main>x</main></div>')).toEqual([
			'page-shell (line 1)',
			'<main> (line 1)'
		]);
		expect(
			pageSurfacesOutsideFrame('<div class="page-command-bar"><div class="cmd-bar-zone"></div></div>')
		).toEqual(['page-command-bar (line 1)', 'cmd-bar-zone (line 1)']);
		expect(pageSurfacesOutsideFrame('<section class="page-fill flex-1">x</section>')).toEqual([
			'page-fill (line 1)'
		]);
		expect(pageSurfacesOutsideFrame('main:has(.page-command-bar) .context-surface { flex: 1; }')).toEqual(
			['page-command-bar (line 1)', 'context-surface (line 1)']
		);
		// A page's own layout classes and the frame primitive are not surfaces.
		expect(pageSurfacesOutsideFrame('<PageFrame bar={slots}><div class="documents-shell"></div></PageFrame>')).toEqual([]);
		expect(pageSurfacesOutsideFrame('<!-- <main class="context-surface"> -->')).toEqual([]);
		// A script finding the frame's bar reads it; it draws nothing.
		expect(
			pageSurfacesOutsideFrame(
				"<script>\n\tconst act = document.querySelector<HTMLElement>(\n\t\t'.page-command-bar .cmd-bar-center button:not(:disabled)'\n\t);\n\tconst bar = el.closest('.page-command-bar');\n</script>"
			)
		).toEqual([]);
	});

	it('reads the rule of each elevation read, and markup', () => {
		expect(
			elevationReads(
				'.a { box-shadow: var(--gawdux-surface-elevation); }\n.b, .c:hover { box-shadow: 0 0 0 1px red, var(--gawdux-surface-elevation); }'
			)
		).toEqual(['.a', '.b, .c:hover']);
		expect(elevationReads('<div class="shadow-[var(--gawdux-surface-elevation)]"></div>')).toEqual([
			'markup'
		]);
		expect(elevationReads(':root { --gawdux-surface-elevation: 0 1px 3px 0 rgb(0 0 0 / 0.08); }')).toEqual(
			[]
		);
	});
});

describe('one action pair in a drawer', () => {
	it('draws no Cancel of its own in a drawer or the bar, and colours none red', () => {
		expect(
			findings((source, rel) => (rel === 'primitives/PageCommandBarPair.svelte' ? [] : handDrawnCancels(source)))
		).toEqual({});
	});

	it("reads a decision's Cancel drawn by hand, and a Cancel coloured red", () => {
		expect(
			handDrawnCancels(
				'<PageCommandBarCenter><Button outline color="red" on:click={close}>Cancel</Button><Button data-action-confirm>Sign</Button></PageCommandBarCenter>'
			)
		).toEqual(['Button Cancel drawn in a drawer or the bar (line 1)']);
		expect(
			handDrawnCancels('<CommandDrawer open><button type="button" onclick={close}>Cancel</button></CommandDrawer>')
		).toEqual(['button Cancel drawn in a drawer or the bar (line 1)']);
		expect(handDrawnCancels('<Button color="alternative" data-action-cancel>Close</Button>')).toEqual([
			'Button data-action-cancel (line 1)'
		]);
		expect(handDrawnCancels('<Button size="xs" color="red" onclick={stop}>Cancel</Button>')).toEqual([
			'Button Cancel coloured red (line 1)'
		]);
		// A row's own inline Cancel in a card, neutral, is not a decision's.
		expect(
			handDrawnCancels('<Button size="xs" color="alternative" onclick={keep}>Cancel</Button>')
		).toEqual([]);
		// The pair, passed its act and what Cancel would discard, is the one way.
		expect(
			handDrawnCancels('<PageCommandBarPair label="Archive role" tone="red" onact={a} oncancel={c} />')
		).toEqual([]);
	});
});

describe('plain everyday language', () => {
	/**
	 * The library's copy modules: the files of words a person reads that are
	 * not components (a component's text and strings are read wherever it is).
	 */
	const COPY_MODULES = new Set(['alert-ops/types.ts']);
	/**
	 * A phrase of the rule used where it is the plain word, by file, with why.
	 * The reader is a backstop over the phrases a rewrite removed; it does
	 * not prove the copy is plain.
	 */
	const PLAIN_USES: Record<string, { finding: RegExp; why: string }[]> = {};

	it('uses none of the refused phrases in a string a person reads', () => {
		expect(
			findings((source, rel) =>
				rel.endsWith('.svelte') || COPY_MODULES.has(rel) || /-copy\.ts$/.test(rel)
					? plainLanguageFaults(source, rel).filter(
							(found) => !PLAIN_USES[rel]?.some((use) => use.finding.test(found))
						)
					: []
			)
		).toEqual({});
	});

	it('gives every plain use a reason', () => {
		for (const uses of Object.values(PLAIN_USES))
			for (const use of uses) expect(use.why.length).toBeGreaterThan(10);
	});

	it("reads a component's text, the attributes a person reads, its strings and a copy module", () => {
		expect(plainLanguageFaults('<p>The audit trail keeps the deletion.</p>')).toEqual([
			'the trail keeps: "The audit trail keeps the deletion." (line 1)'
		]);
		expect(plainLanguageFaults('<p>The audit trail records the deletion.</p>')).toEqual([]);
		expect(plainLanguageFaults('<CardContainer title="Who holds it" />')).toEqual([
			'holds: "Who holds it" (line 1)'
		]);
		expect(
			plainLanguageFaults("<script>let { emptyText = 'Nobody holds this Role yet.' } = $props();</script>")
		).toEqual(['holds: "Nobody holds this Role yet." (line 1)']);
		expect(plainLanguageFaults('<span title="The creator always holds this rung.">A</span>')).toHaveLength(2);
		expect(plainLanguageFaults('<input placeholder="Names no folder" />')).toHaveLength(1);
		expect(plainLanguageFaults("export const m = (t: string) => `Voiding cancels ${t} for good.`;", 'a-copy.ts')).toEqual([
			'for good: "Voiding cancels … for good." (line 1)'
		]);
		expect(plainLanguageFaults("const a = 'Never in force; kept for the record.';", 'a.ts')).toHaveLength(1);
		expect(plainLanguageFaults("const a = 'The signed copy leaves force with no successor.';", 'a.ts')).toHaveLength(1);
		expect(plainLanguageFaults("const a = `The System acts with ${n}'s authority.`;", 'a.ts')).toHaveLength(1);
		expect(plainLanguageFaults("const a = `The System acts on behalf of ${n}.`;", 'a.ts')).toEqual([]);
	});

	it('reads the word act as a noun, and leaves the verb', () => {
		expect(plainLanguageFaults("const a = 'The act names no execution.';", 'a.ts')).toEqual([
			'names no: "The act names no execution." (line 1)',
			'act as a noun: "The act names no execution." (line 1)'
		]);
		expect(plainLanguageFaults("const a = 'Every act reads as the System.';", 'a.ts')).toHaveLength(1);
		expect(plainLanguageFaults("const a = 'The System act was not completed.';", 'a.ts')).toHaveLength(1);
		expect(plainLanguageFaults("const a = 'Renaming the key acts as a delete and an add.';", 'a.ts')).toEqual([]);
		expect(plainLanguageFaults("const a = 'The System acts on behalf of the issuer.';", 'a.ts')).toEqual([]);
	});

	it("leaves a console line, a key, a class token and a word inside another", () => {
		expect(plainLanguageFaults("<script>console.error('Failed to save the item:', err);</script>")).toEqual([]);
		expect(plainLanguageFaults("<script>error = read(err, 'Failed to load the item');</script>")).toHaveLength(1);
		expect(plainLanguageFaults("const c = 'flex bg-surface text-sm';", 'a.ts')).toEqual([]);
		expect(plainLanguageFaults("const k = 'holds';", 'a.ts')).toEqual([]);
		expect(plainLanguageFaults('<p>Shareholders and households</p>')).toEqual([]);
	});

	it('reads the strings after a regular expression that holds a quote', () => {
		const source = "const m = (x) => /'/.test(x) ? 'Failed to save the rule.' : '';";
		expect(plainLanguageFaults(`<script>${source}</script>`)).toEqual(['failed to: "Failed to save the rule." (line 1)']);
		expect(plainLanguageFaults(`export ${source}`, 'a-copy.ts')).toEqual(['failed to: "Failed to save the rule." (line 1)']);
	});
});

describe('comments read in source order', () => {
	it('reads the code after a // comment holding /*', () => {
		expect(withoutComments("// every /app/* path\nconst a = 'shadow-md';\n/* note */")).toBe(
			"\nconst a = 'shadow-md';\n"
		);
		expect(surfaceShadows("// every /app/* path\nconst a = 'shadow-md';\n/* note */")).toEqual(['shadow-md']);
		// An app shell's layout: a script's line comment naming a path pattern
		// before the page's own surface and landmark.
		expect(
			pageSurfacesOutsideFrame(
				'<script>\n\t// The first item is a prefix of every /app/* path.\n\tlet open = false;\n</script>\n\n<div class="page-shell"><main>x</main></div>\n\n<style>\n\t/* the shell */\n</style>'
			)
		).toEqual(['page-shell (line 6)', '<main> (line 6)']);
		expect(
			vanishingDarkEdges(
				'<script>\n\t// every /app/* path\n</script>\n<div class="border border-gray-200 dark:border-transparent"></div>\n<style>\n\t/* x */\n</style>'
			)
		).toEqual(['border-gray-200 is dark:border-transparent on gray-800 (line 4)']);
	});

	it('keeps every line where it was', () => {
		expect(pageSurfacesOutsideFrame('<script>\n\t/*\n\t a\n\t b\n\t*/\n</script>\n<main>x</main>')).toEqual([
			'<main> (line 7)'
		]);
	});

	it('opens no comment inside a string, a template literal, a regular expression, a quoted value or text', () => {
		expect(surfaceShadows("const a = '/* not a comment';\nconst c = 'shadow-md';\nconst b = '*/';")).toEqual([
			'shadow-md'
		]);
		expect(surfaceShadows("const t = `a // b ${'shadow-md'}`;")).toEqual(['shadow-md']);
		expect(surfaceShadows("function f(s) { return /[/*]/.test(s); }\nconst c = 'shadow-md';\n/* note */")).toEqual([
			'shadow-md'
		]);
		expect(surfaceShadows("const r = /['" + '"' + "`]/; // shadow-md\nconst s = 'shadow-sm';")).toEqual(['shadow-sm']);
		expect(
			pageSurfacesOutsideFrame('<a href="/files/*">Files</a>\n<main>y</main>\n<style>\n\t/* x */\n</style>')
		).toEqual(['<main> (line 2)']);
		expect(pageSurfacesOutsideFrame('<p>a // b</p><main>x</main>')).toEqual(['<main> (line 1)']);
		// A URL's scheme in a stylesheet is no comment.
		expect(surfaceShadows('.a { background: url(https://x.test/a.png); box-shadow: 0 1px 2px red; }')).toEqual([
			'box-shadow: 0 1px 2px red'
		]);
	});

	it('reads a regular expression after an arrow, a keyword or an operator as one', () => {
		// A `/*` in it opens no comment.
		expect(surfaceShadows("const isApp = (p: string) => /^\\/app\\/*/.test(p);\nconst a = 'shadow-md';\n/* note */")).toEqual([
			'shadow-md'
		]);
		// A backtick in it opens no template literal, so the comment after it is one.
		expect(surfaceShadows("const q = (c: string) => /[`'" + '"' + "]/.test(c);\n// was shadow-md\nconst u = `https://x/`;")).toEqual(
			[]
		);
		// A `\//` in it opens no line comment.
		expect(surfaceShadows("const u = (s) => /^https?:\\/\\//.test(s) && 'shadow-md';")).toEqual(['shadow-md']);
		// In a markup expression too, where the next `*/` is a style's.
		expect(
			surfaceShadows(
				"<p class={items.some((s) => /[/*]/.test(s)) ? 'x' : 'y'}>a</p>\n<div class=\"shadow-md\">b</div>\n<style>\n\t/* x */\n</style>"
			)
		).toEqual(['shadow-md']);
		expect(surfaceShadows("const n = 2 * /[/*]/.exec(s).length;\nconst a = 'shadow-md';\n/* note */")).toEqual([
			'shadow-md'
		]);
		// A slash after a value is a division.
		expect(surfaceShadows('const x = a > b / c; const d = f<T>(x) / 2; // shadow-md')).toEqual([]);
	});

	it('reads a comment in a style attribute as CSS reads it', () => {
		expect(surfaceShadows('<div style="/* box-shadow: 0 4px 8px red */ color: red">x</div>')).toEqual([]);
		expect(insetOverrides('<div style="/* --gawdux-page-inset: 0 */">x</div>')).toEqual([]);
		expect(surfaceShadows('<div style:color="/* box-shadow: 0 4px 8px red */ red">x</div>')).toEqual([]);
		// An expression in the value is code, and the comment ends with the value.
		expect(
			surfaceShadows('<div style="color: {c}; /* box-shadow: 0 4px 8px red">x</div>\n<p class="shadow-md">y</p>')
		).toEqual(['shadow-md']);
		// A CSS string in it opens no comment.
		expect(surfaceShadows("<div style=\"content: '/*'; box-shadow: 0 4px 8px red\">x</div>")).toHaveLength(1);
		expect(surfaceShadows('<div style="box-shadow: 0 4px 8px red">x</div>')).toHaveLength(1);
	});

	it('still leaves out every comment', () => {
		expect(surfaceShadows('/* shadow-md */\n// shadow-lg\nconst a = 1;')).toEqual([]);
		expect(
			pageSurfacesOutsideFrame(
				'<!-- <main> -->\n<script>\n\t// <div class="page-shell">\n</script>\n<style>\n\t/* .page-shell {} */\n</style>'
			)
		).toEqual([]);
		expect(pageSurfacesOutsideFrame('<p>{/* class="page-shell" */ name}</p>')).toEqual([]);
	});
});

describe('no em dash or en dash in what a person reads', () => {
	const EM = String.fromCodePoint(0x2014);
	const EN = String.fromCodePoint(0x2013);
	/** The library's copy modules, as the plain-language rule reads them. */
	const COPY_MODULES = new Set(['alert-ops/types.ts']);
	/**
	 * The placeholders the library declares: its mark for an empty value in a
	 * register's cell or a record's fact (an audit row's user or comment, an
	 * alert's receiver) is one em dash alone.
	 */
	const PLACEHOLDERS = [EM];
	const read = (source: string, rel: string, placeholders?: readonly string[]) =>
		rel.endsWith('.svelte') || COPY_MODULES.has(rel) || /-copy\.ts$/.test(rel)
			? readableDashes(source, { file: rel, ...(placeholders ? { placeholders } : {}) })
			: [];

	it('writes no dash a person reads but the declared mark for an empty value', () => {
		expect(findings((source, rel) => read(source, rel, PLACEHOLDERS))).toEqual({});
	});

	it('uses the declared mark only alone', () => {
		const alone = new RegExp(`^em dash: "${EM}" \\(line \\d+\\)$`);
		for (const found of Object.values(findings((source, rel) => read(source, rel))).flat()) expect(found).toMatch(alone);
		// A separator's finding is told from the lone mark's.
		expect(readableDashes(`<script>const s = ' ${EM} ';</script>`)[0]).not.toMatch(alone);
		expect(readableDashes(`<p><b>a</b>${EM}<i>b</i></p>`)[0]).not.toMatch(alone);
	});

	it('reads a dash in text, an attribute a person reads, a string, an entity and an escape', () => {
		expect(readableDashes(`<p>Saved ${EM} reload the page.</p>`)).toEqual([
			`em dash: "Saved ${EM} reload the page." (line 1)`
		]);
		expect(readableDashes(`<span title="Monday ${EN} Friday">x</span>`)).toEqual([
			`en dash: "Monday ${EN} Friday" (line 1)`
		]);
		expect(readableDashes(`<script>\n\tconst a = 'Saved ${EM} now';\n</script>`)).toEqual([
			`em dash: "Saved ${EM} now" (line 2)`
		]);
		expect(readableDashes('<p>Saved&mdash;now, 9&#8211;5</p>')).toEqual([
			`em dash: "Saved${EM}now, 9${EN}5" (line 1)`,
			`en dash: "Saved${EM}now, 9${EN}5" (line 1)`
		]);
		expect(readableDashes("<script>const a = 'Saved " + '\\' + "u2014 now';</script>")).toEqual([
			`em dash: "Saved ${EM} now" (line 1)`
		]);
		expect(readableDashes(`<td>{a} ${EM} {b}</td>`, { placeholders: [EM] })).toEqual([
			`em dash: "… ${EM} …" (line 1)`
		]);
		expect(readableDashes(`export const range = (a: string) => \`\${a} ${EN} today\`;`, { file: 'a-copy.ts' })).toEqual([
			`en dash: "… ${EN} today" (line 1)`
		]);
	});

	it('passes a declared placeholder alone, and only alone', () => {
		const placeholders = [EM];
		expect(readableDashes(`<td>${EM}</td>`)).toEqual([`em dash: "${EM}" (line 1)`]);
		expect(readableDashes(`<td>${EM}</td>`, { placeholders })).toEqual([]);
		expect(readableDashes(`<td><span class="text-gray-300">${EM}</span></td>`, { placeholders })).toEqual([]);
		expect(readableDashes(`<td>{row.user || '${EM}'}</td>`, { placeholders })).toEqual([]);
		expect(readableDashes('<td>&mdash;</td>', { placeholders })).toEqual([]);
		expect(readableDashes(`<td>${EM} ms</td>`, { placeholders })).toEqual([`em dash: "${EM} ms" (line 1)`]);
		expect(readableDashes(`<td>${EN}</td>`, { placeholders })).toEqual([`en dash: "${EN}" (line 1)`]);
		expect(readableDashes(`<td>\n\t${EM}\n</td>`, { placeholders })).toEqual([]);
		expect(readableDashes(`<td>{#if a}{a}{:else}${EM}{/if}</td>`, { placeholders })).toEqual([]);
		expect(readableDashes(`<X emptyText="${EM}" />`, { placeholders })).toEqual([]);
	});

	it('shows a separator as the page shows it, never as a lone placeholder', () => {
		const placeholders = [EM];
		expect(readableDashes(`<script>\n\tconst sep = ' ${EM} ';\n</script>`, { placeholders })).toEqual([
			`em dash: " ${EM} " (line 2)`
		]);
		// A run between two elements: each stands as an ellipsis.
		expect(readableDashes(`<p><b>a</b> ${EM} <i>b</i></p>`, { placeholders })).toEqual([`em dash: "… ${EM} …" (line 1)`]);
		expect(readableDashes(`<p>\n\t<b>a</b>\n\t${EM}\n\t<i>b</i>\n</p>`, { placeholders })).toEqual([
			`em dash: "… ${EM} …" (line 3)`
		]);
		expect(readableDashes(`<p><b>a</b>${EM}<i>b</i></p>`, { placeholders })).toEqual([`em dash: "…${EM}…" (line 1)`]);
		expect(readableDashes(`<td>{@html a} ${EM}</td>`, { placeholders })).toEqual([`em dash: "… ${EM}" (line 1)`]);
		expect(readableDashes(`<span>a</span><span> ${EM} </span>`, { placeholders })).toEqual([
			`em dash: " ${EM} " (line 1)`
		]);
	});

	it('reads the quoted value of every attribute a person reads', () => {
		const placeholders = [EM];
		for (const attribute of ['message', 'heading', 'subtitle', 'confirmLabel', 'emptyText', 'ariaLabel', 'alt'])
			expect(readableDashes(`<X ${attribute}="Archived ${EM} restore it later" />`, { placeholders })).toEqual([
				`em dash: "Archived ${EM} restore it later" (line 1)`
			]);
		expect(readableDashes(`<X message="Saved {name} ${EN} now" />`)).toEqual([`en dash: "Saved … ${EN} now" (line 1)`]);
		expect(
			readableDashes(
				`<a class="a${EM}b" href="/a${EM}b" id="a${EM}b" data-x="a ${EM} b" bind:value="a ${EM} b" style="--x: '${EM}'">x</a>`
			)
		).toEqual([]);
	});

	it('reads a regular expression after return, an arrow or an operator as one', () => {
		expect(readableDashes(`<script>function f(x) { return /'/.test(x) ? 'Saved ${EM} now' : ''; }</script>`)).toEqual([
			`em dash: "Saved ${EM} now" (line 1)`
		]);
		expect(readableDashes(`<script>const isSep = (t) => /^['${EN}${EM}]+$/.test(t);</script>`)).toEqual([]);
		expect(readableDashes(`<script>const n = 2 * /'/.exec(s).length; const m = 'a ${EM} b';</script>`)).toEqual([
			`em dash: "a ${EM} b" (line 1)`
		]);
	});

	it('leaves comments, a console line, a regular expression and a hyphen', () => {
		expect(
			readableDashes(
				`<!-- a ${EM} b -->\n<script>\n\t// a ${EM} b\n\t/* a ${EN} b */\n\tconsole.warn('a ${EM} b');\n\tconst r = /[${EN}${EM}]/;\n</script>\n<p>A well-known 3-4 range</p>`
			)
		).toEqual([]);
	});
});
