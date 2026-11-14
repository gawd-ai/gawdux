/**
 * The house rule runner (gawdux/test-support): walk a tree's sources, apply
 * a reader to each file, and answer what it found by file, with a host's
 * exceptions named file by file, each with its reason. Lifted from a
 * consuming product's guard with the readers that guard kept for itself
 * (`stockCaptions`, `hostChoiceChrome`, `editModesWithoutDiscards`,
 * `tabActsOutsideTabHost`, `paddedTabColumns`) and their tests; the library
 * runs its own sources through it here and in house-surface-rules.test.ts.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import * as support from '../src/lib/test-support/index';
import * as utils from '../src/lib/utils/index';
import { createHouseRules, houseRuleFiles } from '../src/lib/test-support/house-rules';
import {
	editModesWithoutDiscards,
	hostChoiceChrome,
	paddedTabColumns,
	stockCaptions,
	surfaceShadows,
	tabActsOutsideTabHost,
	takesPhoneSort
} from '../src/lib/utils/surface-rules';

const TREE = mkdtempSync(path.join(tmpdir(), 'gawdux-house-rules-'));
afterAll(() => rmSync(TREE, { recursive: true, force: true }));

function write(rel: string, source: string) {
	const file = path.join(TREE, rel);
	mkdirSync(path.dirname(file), { recursive: true });
	writeFileSync(file, source);
}

write('lib/Menu.svelte', '<div class="shadow-lg">menu</div>\n<div class="shadow-md">tip</div>\n');
write('lib/Card.svelte', '<section class="rounded border">flat</section>\n');
write('lib/Raised.svelte', '<section class="shadow-sm">raised</section>\n');
write('lib/copy.ts', "export const title = 'Members';\n");
write('lib/Card.test.ts', "const s = 'shadow-lg';\n");
write('lib/Fixture.test.svelte', '<div class="shadow-lg"></div>\n');
write('lib/types.d.ts', 'export declare const shadow: string;\n');
write('lib/notes.md', 'shadow-lg\n');
write('node_modules/pkg/Thing.svelte', '<div class="shadow-lg"></div>\n');
write('marketing/Hero.svelte', '<div class="shadow-2xl"></div>\n');
write('routes/app/+page.svelte', '<p>page</p>\n');
write('routes/app/copy/+page@.svelte', '<p>print</p>\n');
write('routes/app/(print)/+layout@.svelte', '<slot />\n');
write(
	'lists/Sorted.svelte',
	'<ListSurface sort={sort}><SortableHeadCell key="name">Name</SortableHeadCell></ListSurface>\n'
);
write(
	'lists/Unsorted.svelte',
	'<ListSurface><SortableHeadCell key="name">Name</SortableHeadCell></ListSurface>\n'
);
write('lists/Heads.svelte', '<SortableHeadCell key="name">Name</SortableHeadCell>\n');
write('lists/HeadsPage.svelte', '<ListQueryBar sort={sort} /><Heads />\n');
write('lists/BarePage.svelte', '<ListQueryBar /><Heads />\n');

const shadows = (source: string) => surfaceShadows(source);

describe('walk the files', () => {
	it('reads every source under the root, in path order, tests and declarations left out', () => {
		expect(houseRuleFiles(path.join(TREE, 'lib')).map(({ rel }) => rel)).toEqual([
			'Card.svelte',
			'Menu.svelte',
			'Raised.svelte',
			'copy.ts'
		]);
		expect(houseRuleFiles(path.join(TREE, 'lib'))[0]!.source).toBe('<section class="rounded border">flat</section>\n');
	});

	it('reads the endings asked for, tests when asked, and never node_modules', () => {
		expect(houseRuleFiles(path.join(TREE, 'lib'), { extensions: ['.md'] }).map(({ rel }) => rel)).toEqual(['notes.md']);
		expect(houseRuleFiles(path.join(TREE, 'lib'), { tests: true }).map(({ rel }) => rel)).toEqual([
			'Card.svelte',
			'Card.test.ts',
			'Fixture.test.svelte',
			'Menu.svelte',
			'Raised.svelte',
			'copy.ts'
		]);
		const all = houseRuleFiles(TREE).map(({ rel }) => rel);
		expect(all.some((rel) => rel.includes('node_modules'))).toBe(false);
		expect(all).toContain('routes/app/(print)/+layout@.svelte');
	});

	it('leaves out the part of the tree a host names as outside the rules', () => {
		const rules = createHouseRules(TREE, { exclude: [/^marketing\//] });
		expect(rules.has('marketing/Hero.svelte')).toBe(false);
		expect(rules.has('lib/Menu.svelte')).toBe(true);
		expect(createHouseRules(TREE).has('marketing/Hero.svelte')).toBe(true);
	});

	it("answers a file's text, and says which file it did not read", () => {
		const rules = createHouseRules(path.join(TREE, 'lib'));
		expect(rules.source('copy.ts')).toBe("export const title = 'Members';\n");
		expect(() => rules.source('Gone.svelte')).toThrow('house rules: Gone.svelte is not among the sources read');
	});

	it('runs over sources already read', () => {
		const rules = createHouseRules([{ rel: 'A.svelte', source: '<div class="shadow"></div>' }]);
		expect(rules.findings(shadows)).toEqual({ 'A.svelte': ['shadow'] });
	});

	it('lists the routes that leave their layout', () => {
		expect(createHouseRules(TREE).layoutResets()).toEqual([
			'routes/app/(print)/+layout@.svelte',
			'routes/app/copy/+page@.svelte'
		]);
	});
});

describe('apply the readers', () => {
	const rules = createHouseRules(path.join(TREE, 'lib'));

	it('answers what a reader finds by file, a clean file left out', () => {
		expect(rules.findings(shadows)).toEqual({
			'Menu.svelte': ['shadow-lg', 'shadow-md'],
			'Raised.svelte': ['shadow-sm']
		});
		expect(rules.findings(() => [])).toEqual({});
	});

	it('hands the reader the path, and reads only the files a rule names', () => {
		expect(rules.findings((_source, rel) => [rel], { only: /\.ts$/ })).toEqual({ 'copy.ts': ['copy.ts'] });
		expect(rules.findings(shadows, { only: (rel) => rel.startsWith('R') })).toEqual({
			'Raised.svelte': ['shadow-sm']
		});
	});
});

describe('exceptions by file, each with its reason', () => {
	const rules = createHouseRules(path.join(TREE, 'lib'));

	it('leaves out what a file is allowed: all of it, or the findings named', () => {
		expect(rules.findings(shadows, { allow: { 'Menu.svelte': 'the open menu and its tooltip float' } })).toEqual({
			'Raised.svelte': ['shadow-sm']
		});
		expect(
			rules.findings(shadows, {
				allow: { 'Menu.svelte': { finding: /^shadow-lg$/, why: 'the open menu floats above the page' } }
			})
		).toEqual({ 'Menu.svelte': ['shadow-md'], 'Raised.svelte': ['shadow-sm'] });
		expect(
			rules.findings(shadows, {
				allow: {
					'Menu.svelte': [
						{ finding: /^shadow-lg$/, why: 'the open menu floats above the page' },
						{ finding: /^shadow-md$/g, why: 'its tooltip floats above the menu' }
					],
					'Raised.svelte': { why: 'a page outside the app shell' }
				}
			})
		).toEqual({});
	});

	it('finds an exception with no reason', () => {
		expect(rules.findings(shadows, { allow: { 'Raised.svelte': 'legacy' } })).toEqual({
			'Menu.svelte': ['shadow-lg', 'shadow-md'],
			'Raised.svelte': ['an exception with no reason']
		});
	});

	it('finds an exception that allows nothing, so a list never outlives what it allowed', () => {
		expect(
			rules.findings(shadows, {
				allow: {
					'Card.svelte': 'this card once drew a shadow of its own',
					'Menu.svelte': [
						{ why: 'the open menu and its tooltip float' },
						{ finding: /^shadow-2xl$/, why: 'a sheet that was removed' }
					],
					'Raised.svelte': { why: 'a page outside the app shell' }
				}
			})
		).toEqual({
			'Card.svelte': ['an exception that allows nothing: this card once drew a shadow of its own'],
			'Menu.svelte': ['an exception that allows nothing (/^shadow-2xl$/): a sheet that was removed']
		});
	});

	it('finds a file listed with no exception left, which allows nothing and gives no reason', () => {
		const allow = { 'Menu.svelte': 'the open menu and its tooltip float', 'Raised.svelte': 'a page outside the app shell' };
		// A clean file whose last exception was deleted and whose key was left behind.
		expect(rules.findings(shadows, { allow: { ...allow, 'Card.svelte': [] } })).toEqual({
			'Card.svelte': ['an exception that allows nothing: no exception is listed']
		});
		// An empty list hides nothing of a file that holds a finding.
		expect(rules.findings(shadows, { allow: { ...allow, 'Raised.svelte': [] } })).toEqual({
			'Raised.svelte': ['shadow-sm', 'an exception that allows nothing: no exception is listed']
		});
	});

	it('finds an exception for a file that is not read, or that the rule does not read', () => {
		const allow = {
			'Menu.svelte': 'the open menu and its tooltip float',
			'Raised.svelte': 'a page outside the app shell'
		};
		expect(rules.findings(shadows, { allow: { ...allow, 'Gone.svelte': 'a menu that was deleted' } })).toEqual({
			'Gone.svelte': ['an exception for a file that is not read']
		});
		expect(rules.findings(shadows, { only: /^Menu/, allow })).toEqual({
			'Raised.svelte': ['an exception for a file the rule does not read']
		});
	});
});

describe('counted by file', () => {
	const rules = createHouseRules(path.join(TREE, 'lib'));
	const allowed = {
		'Menu.svelte': { count: 2, what: 'the open menu and its tooltip' },
		'Raised.svelte': { count: 1, what: 'a page outside the app' }
	};

	it('passes the files that hold what they are allowed', () => {
		expect(rules.counted(shadows, allowed)).toEqual({});
	});

	it('finds a file with none allowed, another number than allowed, and a stale or unnamed entry', () => {
		expect(rules.counted(shadows, { 'Menu.svelte': allowed['Menu.svelte'] })).toEqual({
			'Raised.svelte': ['1 found, none allowed']
		});
		expect(
			rules.counted(shadows, {
				'Menu.svelte': { count: 1, what: 'the open menu' },
				'Raised.svelte': { count: 1, what: ' ' },
				'Card.svelte': { count: 1, what: 'a card that was raised' },
				'Gone.svelte': { count: 1, what: 'a deleted file' }
			})
		).toEqual({
			'Menu.svelte': ['2 found, 1 allowed: the open menu'],
			'Raised.svelte': ['an entry that does not say what it is'],
			'Card.svelte': ['0 found, 1 allowed: a card that was raised'],
			'Gone.svelte': ['an entry for a file that is not read']
		});
		expect(rules.counted(shadows, { ...allowed, 'Card.svelte': { count: 0, what: 'a flat card' } })).toEqual({
			'Card.svelte': ['an entry that allows none']
		});
	});
});

describe('heads sorted elsewhere look for the phone sort, a query bar’s or a list toolbar’s', () => {
	const rules = createHouseRules(path.join(TREE, 'lists'));

	it('finds every register with no phone sort, the listed files left out', () => {
		// BarePage draws no heads of its own: its bar is read only as the bar of the heads it serves.
		expect(rules.phoneSorts()).toEqual({
			'Heads.svelte': [expect.stringContaining('sortable heads with no toolbar of its own')],
			'Unsorted.svelte': ['a ListSurface with no sort (line 1)']
		});
		expect(
			rules.phoneSorts({ 'Heads.svelte': { why: 'its page hands the query bar the sort', bar: 'HeadsPage.svelte' } })
		).toEqual({ 'Unsorted.svelte': ['a ListSurface with no sort (line 1)'] });
	});

	it('lets the list hide heads with no toolbar of their own, and nothing else a listed file holds', () => {
		const heads = { 'Heads.svelte': { why: 'its page hands the query bar the sort', bar: 'HeadsPage.svelte' } };
		// A list whose own toolbar takes no sort is not heads sorted elsewhere, whatever reason is given.
		expect(rules.phoneSorts({ ...heads, 'Unsorted.svelte': { why: 'its heads are sorted by another file' } })).toEqual({
			'Unsorted.svelte': [
				'listed as heads sorted elsewhere, and its own toolbar takes no sort: a ListSurface with no sort (line 1)'
			]
		});
		const own = createHouseRules([
			{ rel: 'Bar.svelte', source: '<ListQueryBar /><SortableHeadCell key="n">N</SortableHeadCell>' },
			{
				rel: 'Snip.svelte',
				source:
					'<ListSurface sort={sort}>{#snippet mobileSort()}<select></select>{/snippet}<SortableHeadCell key="n">N</SortableHeadCell></ListSurface>'
			},
			{ rel: 'Heads.svelte', source: '<SortableHeadCell key="n">N</SortableHeadCell>' }
		]);
		const plain = own.phoneSorts();
		expect(plain['Bar.svelte']).toEqual(['a ListQueryBar with no sort (line 1)']);
		expect(plain['Snip.svelte']).toEqual(['a phone sort of its own (line 1)']);
		const why = 'its heads are sorted by another file';
		expect(own.phoneSorts({ 'Bar.svelte': { why }, 'Snip.svelte': { why }, 'Heads.svelte': { why } })).toEqual({
			'Bar.svelte': [
				'listed as heads sorted elsewhere, and its own toolbar takes no sort: a ListQueryBar with no sort (line 1)'
			],
			'Snip.svelte': [
				'listed as heads sorted elsewhere, and its own toolbar takes no sort: a phone sort of its own (line 1)'
			]
		});
	});

	it("accepts a bar that takes the list toolbar's sort, not only a query bar's", () => {
		expect(takesPhoneSort('<ListQueryBar sort={sort} />')).toBe(true);
		expect(takesPhoneSort('<ListSurface {sort}>rows</ListSurface>')).toBe(true);
		expect(takesPhoneSort('<ListPageScaffold title="Members" sort={sort} />')).toBe(true);
		expect(takesPhoneSort('<FilterBar sort={sort} />')).toBe(true);
		expect(takesPhoneSort('<ListQueryBar /><ListSurface />')).toBe(false);
		expect(takesPhoneSort('<!-- <ListQueryBar sort={sort} /> --><DataTable sort={sort} />')).toBe(false);
		expect(
			rules.phoneSorts({ 'Heads.svelte': { why: 'its list hands its toolbar the sort', bar: 'Sorted.svelte' } })
		).toEqual({ 'Unsorted.svelte': ['a ListSurface with no sort (line 1)'] });
	});

	it('finds a listed file that needs no exception, has no reason, or whose bar takes no sort', () => {
		expect(
			rules.phoneSorts({
				'Sorted.svelte': { why: 'a list that sorts by its own toolbar' },
				'Heads.svelte': { why: 'legacy', bar: 'BarePage.svelte' },
				'Gone.svelte': { why: 'a register that was deleted' }
			})
		).toEqual({
			'Sorted.svelte': ['listed as heads sorted elsewhere, and needs no exception'],
			'Unsorted.svelte': ['a ListSurface with no sort (line 1)'],
			'Heads.svelte': ['listed as heads sorted elsewhere with no reason', 'its bar takes no sort: BarePage.svelte'],
			'Gone.svelte': ['listed as heads sorted elsewhere, and not read']
		});
		expect(
			rules.phoneSorts({
				'Heads.svelte': { why: 'its page hands the query bar the sort', bar: 'Missing.svelte' }
			})
		).toEqual({ 'Unsorted.svelte': ['a ListSurface with no sort (line 1)'], 'Heads.svelte': ['its bar is not read: Missing.svelte'] });
		// A bar that is itself a register with no sort is named with what it lacks.
		expect(
			rules.phoneSorts({ 'Heads.svelte': { why: 'its list hands its toolbar the sort', bar: 'Unsorted.svelte' } })
		).toEqual({
			'Unsorted.svelte': ['a ListSurface with no sort (line 1)'],
			'Heads.svelte': [
				'its bar Unsorted.svelte: a ListSurface with no sort (line 1)',
				'its bar takes no sort: Unsorted.svelte'
			]
		});
	});
});

describe('no caption says nothing in a pane header', () => {
	it('reads a stock line given as a subtitle, a branch of one or a subtitle snippet', () => {
		expect(stockCaptions('<PaneHeader title={t} subtitle="Document view" />')).toEqual(['Document view']);
		expect(
			stockCaptions("<PaneHeader title={t} subtitle={state === 'unfiled' ? 'Unfiled document' : 'Document view'} />")
		).toEqual(["'Unfiled document'"]);
		expect(
			stockCaptions(
				"<PaneHeader title={t} subtitleContent={line} />{#snippet line()}<p>{d || 'No description'}</p>{/snippet}"
			)
		).toHaveLength(1);
		expect(
			stockCaptions(
				'<PaneHeader title={t} subtitleContent={line} />{#snippet line()}<p class="text-xs">Document view</p>{/snippet}'
			)
		).toEqual(['Document view']);
	});

	it("leaves the item's own values", () => {
		expect(stockCaptions('<PaneHeader title={t} subtitle={descriptionText || null} />')).toEqual([]);
		expect(stockCaptions("<PaneHeader title={t} subtitle={state === 'draft' ? description : null} />")).toEqual([]);
		expect(stockCaptions('<PaneHeader title={t} subtitle={`${recordTitle} · ${provenance}`} />')).toEqual([]);
		expect(
			stockCaptions(
				'<PaneHeader title={t} subtitleContent={line} />{#snippet line()}<p class="truncate">{description}</p>{/snippet}'
			)
		).toEqual([]);
		expect(
			stockCaptions(
				'<PaneHeader title={t} subtitleContent={line} />{#snippet line()}<div>Records of {form.title}</div>{/snippet}'
			)
		).toEqual([]);
		// A comment and a script's string draw no header.
		expect(stockCaptions('<!-- <PaneHeader subtitle="Document view" /> -->')).toEqual([]);
	});
});

describe("a choice of one is not drawn: the rail and the track are the library's", () => {
	it('reads a rail under a condition, a class on it, an edge on the track and a track of its own', () => {
		expect(
			hostChoiceChrome(
				'<svelte:fragment slot="rail">{#if views.length}<SavedViewsRail {views} />{/if}</svelte:fragment>'
			)
		).toEqual(['the saved views rail drawn under a condition or beside markup']);
		expect(hostChoiceChrome('{#snippet rail()}<div class="pt-2"><SavedViewsRail {views} /></div>{/snippet}')).toEqual([
			'the saved views rail drawn under a condition or beside markup'
		]);
		expect(
			hostChoiceChrome('<svelte:fragment slot="rail"><SavedViewsRail {views} className="border" /></svelte:fragment>')
		).toEqual(['a class of its own on SavedViewsRail']);
		expect(hostChoiceChrome('<FilterPillRow {pills} className="ring-1 ring-gray-200" />')).toEqual([
			'an edge of its own on FilterPillRow'
		]);
		expect(
			hostChoiceChrome('<style>.pills :global(.filter-pill-track) { border: 1px solid; }</style>')
		).toEqual(['an edge on .pills :global(.filter-pill-track)']);
		expect(hostChoiceChrome('.saved-views-rail { box-shadow: 0 0 0 1px gray; }', true)).toHaveLength(1);
		expect(hostChoiceChrome('<div class="filter-pill-track rounded border">')).toEqual(['a track of its own']);
	});

	it("leaves the rail drawn bare, a pill's colour and a commented rule", () => {
		expect(
			hostChoiceChrome(
				'<svelte:fragment slot="rail">\n<SavedViewsRail {views} current={c} allLabel="Default" />\n</svelte:fragment>'
			)
		).toEqual([]);
		expect(hostChoiceChrome('{#snippet rail()}<SavedViewsRail {views} />{/snippet}')).toEqual([]);
		expect(hostChoiceChrome('{#snippet rail()}<nav>rows</nav>{/snippet}')).toEqual([]);
		expect(
			hostChoiceChrome('<style>.x :global(.filter-pill-track > button:first-child) { color: red; }</style>')
		).toEqual([]);
		expect(hostChoiceChrome('/* .filter-pill { border: 1px solid; } */ .filter-pill { color: red; }', true)).toEqual([]);
	});

	it('takes the file as its second argument, so the runner calls it as it stands', () => {
		const rail = '{#snippet rail()}{#if x}<SavedViewsRail />{/if}{/snippet}';
		const sheet = '.saved-views-rail { box-shadow: 0 0 0 1px gray; }';
		expect(hostChoiceChrome(rail, 'routes/A.svelte')).toEqual([
			'the saved views rail drawn under a condition or beside markup'
		]);
		expect(hostChoiceChrome(sheet, 'styles/app.css')).toEqual(['an edge on .saved-views-rail']);
		expect(hostChoiceChrome(sheet, true)).toEqual(['an edge on .saved-views-rail']);
		// A component is not a stylesheet: a bare rule in its markup is no style of its.
		expect(hostChoiceChrome(sheet, 'routes/A.svelte')).toEqual([]);
		const rules = createHouseRules([
			{ rel: 'routes/A.svelte', source: rail },
			{ rel: 'routes/B.svelte', source: '{#snippet rail()}<SavedViewsRail />{/snippet}' },
			{ rel: 'styles/app.css', source: sheet }
		]);
		expect(rules.findings(hostChoiceChrome)).toEqual({
			'routes/A.svelte': ['the saved views rail drawn under a condition or beside markup'],
			'styles/app.css': ['an edge on .saved-views-rail']
		});
	});
});

describe('every edit mode says whether cancelling would discard input', () => {
	it('reads an edit mode without discards, and never a prop type', () => {
		expect(
			editModesWithoutDiscards(
				'const editMode = $derived({\n\tisEditing: editing,\n\tonEdit: () => {},\n\tonCancel: stop\n});'
			)
		).toEqual(['edit mode without discards (line 2)']);
		expect(
			editModesWithoutDiscards('<Scaffold editMode={{ isEditing: true, discards, onEdit: () => {}, onCancel }} />')
		).toEqual([]);
		expect(editModesWithoutDiscards('const m = { isEditing: e, discards: !same(a, b), onSave };')).toEqual([]);
		expect(editModesWithoutDiscards('let { isEditing }: { isEditing: boolean } = $props();')).toEqual([]);
		// A commented edit mode is none.
		expect(editModesWithoutDiscards('/* const m = { isEditing: e }; */\nconst n = 1;', 'a.ts')).toEqual([]);
	});
});

describe('an act that names its tab stands under a tab host', () => {
	it('reads a bar act beside the scaffold in a source that publishes no tab host', () => {
		const beside =
			'<EditablePageScaffold title="Members">\n\t<PageTabs />\n</EditablePageScaffold>\n<PageCommandBarCenter tab="invitations">\n\t<Button>Invite member</Button>\n</PageCommandBarCenter>';
		expect(tabActsOutsideTabHost(beside)).toEqual(['<PageCommandBarCenter tab="invitations"> (line 4)']);
		// A comment that names the host publishes none.
		expect(tabActsOutsideTabHost(`<script>\n// todo: createPageTabHost()\n</script>\n${beside}`)).toEqual([
			'<PageCommandBarCenter tab="invitations"> (line 7)'
		]);
		expect(tabActsOutsideTabHost(`<script>/* createPageTabHost() */</script>${beside}`)).toHaveLength(1);
		expect(tabActsOutsideTabHost(`<!-- publish with createPageTabHost() later -->\n${beside}`)).toEqual([
			'<PageCommandBarCenter tab="invitations"> (line 5)'
		]);
	});

	it('leaves an act inside the scaffold, an act that names no tab and a source that publishes the host', () => {
		expect(
			tabActsOutsideTabHost(
				'<EditablePageScaffold title="Members">\n<PageCommandBarCenter tab="invitations"><Button>Invite member</Button></PageCommandBarCenter>\n</EditablePageScaffold>'
			)
		).toEqual([]);
		expect(
			tabActsOutsideTabHost('<EditablePageScaffold title="Members"></EditablePageScaffold>\n<PageCommandBarCenter><Button>Add</Button></PageCommandBarCenter>')
		).toEqual([]);
		expect(
			tabActsOutsideTabHost(
				'<script>const host = createPageTabHost();</script>\n<EditablePageScaffold title="Members"></EditablePageScaffold>\n<PageCommandBarCenter tab="invitations"><Button>Invite member</Button></PageCommandBarCenter>'
			)
		).toEqual([]);
		// A page with no scaffold publishes its tab from its own strip.
		expect(tabActsOutsideTabHost('<PageTabs /><PageCommandBarCenter tab="history" />')).toEqual([]);
	});
});

describe('a tab column pads nothing of its own', () => {
	it('reads a padded tab column, and leaves a bare one', () => {
		expect(paddedTabColumns('<div class="panel-col p-4">x</div>')).toEqual(['panel-col p-4 (line 1)']);
		expect(paddedTabColumns('<div class="panel-col-wide space-y-4 md:px-6">x</div>')).toHaveLength(1);
		expect(paddedTabColumns('<div class="panel-col space-y-4">x</div>')).toEqual([]);
		expect(paddedTabColumns('<div class="panel-column p-4">x</div>')).toEqual([]);
	});
});

describe('the runner over the library’s own sources', () => {
	const rules = createHouseRules(path.resolve(import.meta.dirname, '../src/lib'));
	const components = { only: /\.svelte$/ };

	it('reads the library', () => {
		expect(rules.files.length).toBeGreaterThan(150);
		expect(rules.has('primitives/PaneHeader.svelte')).toBe(true);
		expect(rules.has('utils/edit-mode.test.ts')).toBe(false);
		expect(rules.layoutResets()).toEqual([]);
	});

	it('gives no pane header a stock line for its second line', () => {
		expect(rules.findings((source) => stockCaptions(source), components)).toEqual({});
	});

	it('sets nothing of its own on the saved views rail or the pill track, outside their owners', () => {
		// The owners draw the rail and the track: the components themselves and the stylesheet.
		expect(
			rules.findings(hostChoiceChrome, { only: /\.(?:svelte|css)$/, allow: OWNERS })
		).toEqual({});
	});

	it('says in every edit mode it passes whether cancelling would discard input', () => {
		expect(rules.findings((source, rel) => editModesWithoutDiscards(source, rel), components)).toEqual({});
	});

	it('names no tab on an act outside a tab host, and pads no tab column', () => {
		expect(rules.findings((source) => tabActsOutsideTabHost(source), components)).toEqual({});
		expect(rules.findings((source) => paddedTabColumns(source), components)).toEqual({});
	});

	it('exports the runner from gawdux/test-support and its readers from gawdux/utils', () => {
		expect(support.createHouseRules).toBe(createHouseRules);
		expect(support.houseRuleFiles).toBe(houseRuleFiles);
		for (const name of [
			'stockCaptions',
			'hostChoiceChrome',
			'editModesWithoutDiscards',
			'tabActsOutsideTabHost',
			'paddedTabColumns',
			'takesPhoneSort',
			'tabIconFaults'
		] as const)
			expect(utils[name], name).toBeTypeOf('function');
	});
});

/** The files that draw the saved views rail and the pill track themselves. */
const OWNERS = {
	'primitives/FilterPillRow.svelte': { finding: /^a track of its own$/, why: 'the component that draws the pill track' },
	'primitives/SavedViewsRail.svelte': { finding: /^a track of its own$/, why: 'the component that draws the saved views rail' }
};
