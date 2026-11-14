/**
 * A tab is an icon and its label, one meaning one icon on every strip: every
 * tab strip's tabs (`TabTitle` in PageTabs) and a document viewer's tabs take
 * their icon from the tab icon table, keyed by the label the tab shows, so
 * History is the clock and Content the page of lines wherever they stand.
 * The table is a base an app extends; the tests moved here with it from the
 * consumer it was lifted from, its walk over that app's files now the
 * reader `tabIconFaults`, which a host runs over its own.
 */
import path from 'node:path';
import { BellOutline, ClockOutline, LayersOutline } from 'flowbite-svelte-icons';
import { describe, expect, it } from 'vitest';
import * as primitives from '../src/lib/primitives/index';
import * as utils from '../src/lib/utils/index';
import {
	TAB_ICONS,
	VIEWER_TAB_ICONS,
	extendTabIcons,
	viewerTab
} from '../src/lib/primitives/tab-icons';
import { tabIconFaults, tabsAfterHistory } from '../src/lib/utils/surface-rules';
import { createHouseRules } from '../src/lib/test-support/house-rules';

const MEANINGS = Object.keys(TAB_ICONS);

describe('the tab icon base table', () => {
	it("names a document's, a record's and a run's tabs one way", () => {
		expect(TAB_ICONS.History).not.toBe(TAB_ICONS.Versions);
		expect(TAB_ICONS.Content).not.toBe(TAB_ICONS.Types);
		expect(TAB_ICONS.History).toBe(ClockOutline);
		expect(TAB_ICONS.Versions).toBe(LayersOutline);
		expect(VIEWER_TAB_ICONS).toEqual({ content: TAB_ICONS.Content, history: TAB_ICONS.Versions });
		expect(viewerTab('audit', 'History')).toEqual({
			id: 'audit',
			label: 'History',
			icon: TAB_ICONS.History
		});
	});

	it('gives every meaning an icon, and the meanings every app shares', () => {
		for (const [meaning, icon] of Object.entries(TAB_ICONS)) expect(icon, meaning).toBeTruthy();
		expect(Object.isFrozen(TAB_ICONS)).toBe(true);
		for (const meaning of ['Content', 'Workflow', 'Process', 'Access', 'History', 'Versions', 'Details', 'Overview'])
			expect(MEANINGS, meaning).toContain(meaning);
	});

	it("builds a viewer tab of the host's with its place and its count, only when given", () => {
		expect(viewerTab('audit', 'History', { afterVersions: true, count: 2 })).toEqual({
			id: 'audit',
			label: 'History',
			icon: TAB_ICONS.History,
			afterVersions: true,
			count: 2
		});
		expect(viewerTab('workflow', 'Workflow', { count: 0 })).toEqual({
			id: 'workflow',
			label: 'Workflow',
			icon: TAB_ICONS.Workflow
		});
		// A viewer tab built by the table is one the History rule reads.
		expect(tabsAfterHistory("<script>const tabs = [viewerTab('audit', 'History')];</script><Viewer extraTabs={tabs} />")).toHaveLength(1);
		expect(
			tabsAfterHistory("<script>const tabs = [viewerTab('audit', 'History', { afterVersions: true })];</script><Viewer extraTabs={tabs} />")
		).toEqual([]);
	});

	it('is exported from gawdux/primitives, its reader from gawdux/utils', () => {
		expect(primitives.TAB_ICONS).toBe(TAB_ICONS);
		expect(primitives.extendTabIcons).toBe(extendTabIcons);
		expect(primitives.viewerTab).toBe(viewerTab);
		expect(primitives.VIEWER_TAB_ICONS).toBe(VIEWER_TAB_ICONS);
		expect(utils.tabIconFaults).toBe(tabIconFaults);
	});
});

describe('a base an app extends', () => {
	it("adds an app's own meanings to the base", () => {
		const icons = extendTabIcons({ Alerts: BellOutline });
		expect(icons.Alerts).toBe(BellOutline);
		expect(icons.History).toBe(TAB_ICONS.History);
		expect(Object.keys(icons)).toEqual([...MEANINGS, 'Alerts']);
		expect(Object.isFrozen(icons)).toBe(true);
		expect(viewerTab('alerts', 'Alerts', { icons })).toEqual({ id: 'alerts', label: 'Alerts', icon: BellOutline });
		// The base is not changed by an app's table.
		expect(MEANINGS).not.toContain('Alerts');
		expect(Object.keys(TAB_ICONS)).toEqual(MEANINGS);
	});

	it("keeps the base's icon for a meaning the base holds", () => {
		expect(() => extendTabIcons({ History: BellOutline })).toThrow(/History has an icon in the base table/);
		expect(() => extendTabIcons({ History: BellOutline, Content: BellOutline })).toThrow(
			/History, Content have an icon/
		);
		// Naming a base meaning with its own icon changes nothing.
		expect(extendTabIcons({ History: TAB_ICONS.History }).History).toBe(TAB_ICONS.History);
	});

	it('refuses a viewer tab whose label the table does not hold', () => {
		expect(() => viewerTab('x', 'Alerts' as never)).toThrow(/Alerts is not in the tab icon table/);
	});
});

describe('every tab takes its icon from the table', () => {
	const read = (source: string, table?: string) =>
		tabIconFaults(source, { meanings: MEANINGS, ...(table ? { table } : {}) });

	it('reads a tab with no icon', () => {
		expect(read('<TabItem><TabTitle slot="title" label="History" /></TabItem>')).toEqual([
			'a tab with no icon: History (line 1)'
		]);
		expect(read('<TabTitle slot="title" icon={null} label={copy.alerts} />')).toEqual([
			'a tab with no icon: {copy.alerts} (line 1)'
		]);
	});

	it('reads a tab whose label the table knows and whose icon is not the table’s', () => {
		expect(read('<TabTitle slot="title" icon={ClockOutline} label="History" />')).toEqual([
			'History takes ClockOutline, not TAB_ICONS.History (line 1)'
		]);
		expect(read('\n<TabTitle\n\tslot="title"\n\ticon={TAB_ICONS.Versions}\n\tlabel="History"\n/>')).toEqual([
			'History takes TAB_ICONS.Versions, not TAB_ICONS.History (line 2)'
		]);
		expect(
			tabIconFaults('<TabTitle icon={CopyOutline} label="Signed copy" />', { meanings: ['Signed copy'] })
		).toEqual(["Signed copy takes CopyOutline, not TAB_ICONS['Signed copy'] (line 1)"]);
	});

	it("passes the table's icon, an app's own table by its name, and a label the table does not know", () => {
		expect(read('<TabTitle slot="title" icon={TAB_ICONS.History} label="History" count={waiting} />')).toEqual([]);
		expect(read("<TabTitle icon={TAB_ICONS['History']} label={'History'} />")).toEqual([]);
		expect(read('<TabTitle icon={APP_TAB_ICONS.History} label="History" />', 'APP_TAB_ICONS')).toEqual([]);
		expect(read('<TabTitle icon={TAB_ICONS.History} label="History" />', 'APP_TAB_ICONS')).toHaveLength(1);
		expect(read('<TabTitle icon={BellOutline} label="Alerts" />')).toEqual([]);
		expect(read('<TabTitle icon={BellOutline} label={copy.alertsTab} />')).toEqual([]);
		// A comment and a script's string draw no tab.
		expect(read('<!-- <TabTitle label="History" /> --><script>const s = \'<TabTitle label="History" />\';</script>')).toEqual([]);
	});

	it("gives every tab the library's own strips draw an icon, from the table where it names the meaning", () => {
		const rules = createHouseRules(path.resolve(import.meta.dirname, '../src/lib'));
		const tabs = rules.files.filter(({ source }) => /<TabTitle\b/.test(source));
		expect(tabs.length).toBeGreaterThan(0);
		expect(rules.findings((source) => read(source), { only: /\.svelte$/ })).toEqual({});
	});
});
