import { flushSync, mount, unmount } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PageTabActsHarness from './fixtures/PageTabActsHarness.svelte';
import { createPageCommandBarRegistry } from '../src/lib/primitives/page-command-bar-registry';
import { showsOnTab } from '../src/lib/primitives/page-chrome';

// The bar holds the open tab's acts: the tab strip reports the open tab
// (PAGE_TAB_CONTEXT, published by the scaffold), every act names its tab,
// a tab with no act draws no bar, and a drawer out of the bar closes when
// the tab changes.

type Harness = {
	open(tab: 'content' | 'workflow' | 'history'): void;
	openDrawer(): void;
	openConfirm(): void;
	useScaffoldActs(next: boolean): void;
	closes(): string[];
	drawerOpen(): boolean;
	confirmOpen(): boolean;
};

let target: HTMLElement;
let view: Harness | null = null;

function start(): Harness {
	target = document.createElement('div');
	document.body.append(target);
	view = mount(PageTabActsHarness, { target }) as unknown as Harness;
	flushSync();
	return view;
}

const zone = (name: 'left' | 'center' | 'right') =>
	[...target.querySelectorAll(`[data-zone="${name}"] :is(button, span, a)`)].map(
		(node) => node.textContent?.trim() ?? ''
	);

afterEach(() => {
	if (view) unmount(view);
	view = null;
	target?.remove();
});

describe('the bar holds the open tab’s acts', () => {
	it('shows each tab’s acts while it is open, and nothing on a tab with none', () => {
		const page = start();
		expect(zone('center')).toEqual(['Edit details', 'PDF']);
		expect(zone('left')).toEqual([]);

		page.open('workflow');
		flushSync();
		expect(zone('center')).toEqual(['Submit for review', 'Discard revision']);
		expect(zone('left')).toEqual(['1 of 2 signatures']);

		page.open('history');
		flushSync();
		expect(zone('center')).toEqual([]);
		expect(zone('left')).toEqual([]);

		page.open('content');
		flushSync();
		expect(zone('center')).toEqual(['Edit details', 'PDF']);
	});

	it('scopes a scaffold’s edit bar and its lifecycle acts by their tabs', () => {
		const page = start();
		page.useScaffoldActs(true);
		flushSync();
		expect(zone('center')).toEqual(['Edit', 'Add spec', 'PDF']);
		page.open('workflow');
		flushSync();
		expect(zone('center')).toEqual(['PDF']);
		page.open('history');
		flushSync();
		expect(zone('center')).toEqual([]);
	});

	it('closes a drawer out of the bar when the tab changes', () => {
		const page = start();
		page.open('workflow');
		flushSync();
		page.openDrawer();
		flushSync();
		expect(page.drawerOpen()).toBe(true);
		page.open('content');
		flushSync();
		expect(page.drawerOpen()).toBe(false);
		expect(page.closes()).toEqual(['drawer']);
	});

	it('cancels a confirmation out of the bar when the tab changes', () => {
		const page = start();
		page.open('workflow');
		flushSync();
		page.openConfirm();
		flushSync();
		expect(zone('center')).toEqual(['Cancel', 'Discard revision']);
		page.open('history');
		flushSync();
		expect(page.confirmOpen()).toBe(false);
		expect(page.closes()).toEqual(['confirm']);
	});
});

describe('showsOnTab', () => {
	it('shows an act that names no tab everywhere, and a tab’s only on it', () => {
		expect(showsOnTab(undefined, null)).toBe(true);
		expect(showsOnTab('workflow', 'workflow')).toBe(true);
		expect(showsOnTab('workflow', 'content')).toBe(false);
		expect(showsOnTab(['content', 'history'], 'history')).toBe(true);
		expect(showsOnTab('content', null)).toBe(false);
	});
});

describe('an absent registration steps aside', () => {
	it('renders the newest present registration of the zone', () => {
		const seen: unknown[] = [];
		const bar = createPageCommandBarRegistry((_zone, snippet) => seen.push(snippet));
		const a = (() => {}) as never;
		const b = (() => {}) as never;
		bar.register('center', a);
		const second = bar.register('center', b, false);
		expect(seen.at(-1)).toBe(a);
		bar.update(second, b, true);
		expect(seen.at(-1)).toBe(b);
		bar.update(second, b, false);
		expect(seen.at(-1)).toBe(a);
	});
});

describe('the page’s open tab', () => {
	it('is the newest live claim’s report, a claim reporting none counting for nothing', async () => {
		const { createPageTabHost } = await import('../src/lib/primitives/page-chrome');
		const { get } = await import('svelte/store');
		const host = createPageTabHost();
		const first = host.claim();
		first.report('content');
		expect(get(host.open)).toBe('content');
		// A strip that replaces it mounts before it goes.
		const second = host.claim();
		second.report('workflow');
		first.release();
		expect(get(host.open)).toBe('workflow');
		// A nested strip that reports nothing leaves the page's alone.
		const nested = host.claim();
		nested.report(null);
		expect(get(host.open)).toBe('workflow');
		second.release();
		nested.release();
		expect(get(host.open)).toBeNull();
	});
});
