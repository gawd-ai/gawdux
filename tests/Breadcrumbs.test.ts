import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import postcss, { type AtRule } from 'postcss';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChevronRightOutline, FolderOutline } from 'flowbite-svelte-icons';
import Breadcrumbs from '../src/lib/primitives/Breadcrumbs.svelte';
import breadcrumbsSource from '../src/lib/primitives/Breadcrumbs.svelte?raw';
import BreadcrumbsHarness from './fixtures/BreadcrumbsHarness.svelte';
import * as primitives from '../src/lib/primitives/index';
import { BREADCRUMB_STACK_QUERY, breadcrumbWords } from '../src/lib/primitives/breadcrumb-overflow';
import type { BreadcrumbCrumb } from '../src/lib/utils/url-breadcrumb';

// jsdom lays nothing out, so the widths are a model: 10px a character, a
// 36px icon in front of the first crumb, a 24px separator in front of every
// other, 48px for the overflow button with its separator and 24px for it
// alone.
// The trail below is 126 + 114 + 174 + 94 + 294 = 802px. The thresholds are
// worked through in breadcrumb-overflow.test.ts.
const CHAR = 10;

const TRAIL: BreadcrumbCrumb[] = [
	{ label: 'Documents', href: '#/documents', icon: FolderOutline },
	{ label: 'Reference', href: '#/documents/reference', icon: ChevronRightOutline },
	{ label: 'Quality Systems', href: '#/documents/reference/7', icon: ChevronRightOutline },
	{ label: 'Package', href: '#/documents/reference/9', icon: ChevronRightOutline },
	{ label: 'QP-001 Document Control SOP', icon: ChevronRightOutline }
];

let containerWidth = 0;
const observers = new Set<FakeResizeObserver>();

class FakeResizeObserver {
	targets = new Set<Element>();
	constructor(private callback: ResizeObserverCallback) {
		observers.add(this);
	}
	observe(target: Element) {
		this.targets.add(target);
	}
	unobserve(target: Element) {
		this.targets.delete(target);
	}
	disconnect() {
		this.targets.clear();
		observers.delete(this);
	}
	fire() {
		if (this.targets.size === 0) return;
		const entries = Array.from(this.targets, (target) => ({
			target,
			contentRect: { width: target.matches('nav') ? containerWidth : modelWidth(target) }
		}));
		this.callback(entries as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver);
	}
}

function labelLength(el: Element | null | undefined): number {
	return el?.querySelector('.breadcrumb-label')?.textContent?.length ?? 0;
}

function modelWidth(el: Element): number {
	const measure = el.getAttribute('data-measure');
	if (measure === 'crumb') {
		const first = el.getAttribute('data-index') === '0';
		return (first ? 36 : 24) + CHAR * labelLength(el);
	}
	if (measure === 'more') return 48;
	if (measure === 'more-lead') return 24;
	if (measure === 'first-compact') return 36;
	return 0;
}

async function resize(width: number) {
	containerWidth = width;
	for (const observer of observers) observer.fire();
	await tick();
}

/** The live trail as it reads: a crumb's words, or … for the overflow button. */
function readTrail(container: HTMLElement): string[] {
	const rows = container.querySelectorAll<HTMLElement>('nav.gawdux-breadcrumbs > ol > li');
	return Array.from(rows, (li) =>
		li.querySelector('.more-button')
			? '…'
			: (li.querySelector('.breadcrumb-label')?.textContent ?? '')
	);
}

function moreButton(): HTMLButtonElement {
	return screen.getByRole('button', { name: 'Show the hidden levels' }) as HTMLButtonElement;
}

function menuRows(): HTMLElement[] {
	return Array.from(screen.getByRole('menu').querySelectorAll<HTMLElement>('[role="menuitem"]'));
}

async function renderTrail(width: number, items: BreadcrumbCrumb[] = TRAIL) {
	const result = render(BreadcrumbsHarness, { props: { items } });
	await resize(width);
	return result;
}

/** A link in the live trail by its address. */
function trailLink(container: HTMLElement, href: string): HTMLAnchorElement {
	return container.querySelector(`nav > ol a[href="${href}"]`) as HTMLAnchorElement;
}

/** The focus moves a tick after the trail re-plans. */
async function settle() {
	await tick();
	await tick();
}

beforeEach(() => {
	vi.stubGlobal('ResizeObserver', FakeResizeObserver);
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
		this: Element
	) {
		const width = modelWidth(this);
		return { x: 0, y: 0, top: 0, left: 0, bottom: 28, right: width, width, height: 28, toJSON() {} } as DOMRect;
	});
});

afterEach(() => {
	cleanup();
	observers.clear();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('Breadcrumbs: every crumb in full while they fit', () => {
	it('shows the whole trail and no overflow button', async () => {
		const { container } = await renderTrail(802);
		expect(readTrail(container)).toEqual([
			'Documents',
			'Reference',
			'Quality Systems',
			'Package',
			'QP-001 Document Control SOP'
		]);
		expect(screen.queryByRole('button', { name: 'Show the hidden levels' })).toBeNull();
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
	});

	it('links every crumb that has an address and marks the page it stands on', async () => {
		const { container } = await renderTrail(802);
		const links = Array.from(container.querySelectorAll<HTMLAnchorElement>('nav > ol a'));
		expect(links.map((a) => a.getAttribute('href'))).toEqual([
			'#/documents',
			'#/documents/reference',
			'#/documents/reference/7',
			'#/documents/reference/9'
		]);
		const current = container.querySelector('nav > ol [aria-current="page"]');
		expect(current?.textContent).toBe('QP-001 Document Control SOP');
		expect(container.querySelector('nav')?.getAttribute('aria-label')).toBe('Breadcrumb');
	});

	it('renders the whole trail where nothing can be measured', async () => {
		vi.stubGlobal('ResizeObserver', undefined);
		const { container } = render(BreadcrumbsHarness, { props: { items: TRAIL } });
		await tick();
		expect(readTrail(container)).toHaveLength(5);
	});
});

describe('Breadcrumbs: folding the crumbs on the way', () => {
	it('folds the middle crumb first, into one … button standing where it was', async () => {
		const { container } = await renderTrail(720);
		expect(readTrail(container)).toEqual([
			'Documents',
			'Reference',
			'…',
			'Package',
			'QP-001 Document Control SOP'
		]);
		// The button takes the separator of the crumb it stands for.
		const more = container.querySelector('nav > ol > li:has(.more-button)') as HTMLElement;
		expect(more.querySelector('svg')).not.toBeNull();
	});

	it('folds outward from the middle, the root side first, and keeps the first crumb and the page', async () => {
		const { container } = await renderTrail(620);
		expect(readTrail(container)).toEqual(['Documents', '…', 'Package', 'QP-001 Document Control SOP']);
		await resize(520);
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
	});

	it('re-plans on every resize of its box, giving the crumbs back as room returns', async () => {
		const { container } = await renderTrail(520);
		expect(readTrail(container)).toHaveLength(3);
		await resize(676);
		expect(readTrail(container)).toHaveLength(5);
		await resize(802);
		expect(readTrail(container)).toHaveLength(5);
		expect(screen.queryByRole('button', { name: 'Show the hidden levels' })).toBeNull();
	});

	it('measures a new trail when the page changes', async () => {
		const { container, rerender } = await renderTrail(520);
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		await rerender({ items: TRAIL.slice(0, 3).map((c, i) => (i === 2 ? { ...c, href: undefined } : c)) });
		await resize(520);
		expect(readTrail(container)).toEqual(['Documents', 'Reference', 'Quality Systems']);
	});
});

describe('Breadcrumbs: the overflow menu', () => {
	it('is a menu button that lists the folded levels in order, as links', async () => {
		await renderTrail(520);
		const button = moreButton();
		expect(button.getAttribute('aria-haspopup')).toBe('menu');
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(screen.queryByRole('menu')).toBeNull();

		await fireEvent.click(button, { detail: 1 });
		expect(button.getAttribute('aria-expanded')).toBe('true');
		const menu = screen.getByRole('menu');
		expect(button.getAttribute('aria-controls')).toBe(menu.id);
		const rows = menuRows();
		expect(rows.map((row) => row.textContent?.trim())).toEqual([
			'Reference',
			'Quality Systems',
			'Package'
		]);
		expect(rows.map((row) => row.getAttribute('href'))).toEqual([
			'#/documents/reference',
			'#/documents/reference/7',
			'#/documents/reference/9'
		]);
		expect(rows.every((row) => row.tagName === 'A')).toBe(true);
	});

	it('lists a level without an address as words, which the arrows pass over', async () => {
		const items = TRAIL.map((crumb, i) => (i === 2 ? { ...crumb, href: undefined } : crumb));
		await renderTrail(520, items);
		await fireEvent.click(moreButton(), { detail: 0 });
		await tick();
		const rows = menuRows();
		expect(rows[1]?.tagName).not.toBe('A');
		expect(rows[1]?.getAttribute('aria-disabled')).toBe('true');
		expect(document.activeElement).toBe(rows[0]);
		await fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
		expect(document.activeElement).toBe(rows[2]);
	});

	it('opens from the keyboard into its first row; the arrows move and wrap, Home and End jump', async () => {
		await renderTrail(520);
		// Enter and Space on a button are a click with no pointer detail.
		await fireEvent.click(moreButton(), { detail: 0 });
		await tick();
		const rows = menuRows();
		expect(document.activeElement).toBe(rows[0]);
		await fireEvent.keyDown(rows[0]!, { key: 'ArrowDown' });
		expect(document.activeElement).toBe(rows[1]);
		await fireEvent.keyDown(rows[1]!, { key: 'ArrowDown' });
		await fireEvent.keyDown(rows[2]!, { key: 'ArrowDown' });
		expect(document.activeElement).toBe(rows[0]);
		await fireEvent.keyDown(rows[0]!, { key: 'ArrowUp' });
		expect(document.activeElement).toBe(rows[2]);
		await fireEvent.keyDown(rows[2]!, { key: 'Home' });
		expect(document.activeElement).toBe(rows[0]);
		await fireEvent.keyDown(rows[0]!, { key: 'End' });
		expect(document.activeElement).toBe(rows[2]);
	});

	it('opens on ArrowDown into the first row and on ArrowUp into the last', async () => {
		await renderTrail(520);
		await fireEvent.keyDown(moreButton(), { key: 'ArrowDown' });
		await tick();
		expect(document.activeElement).toBe(menuRows()[0]);
		await fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
		await tick();
		await fireEvent.keyDown(moreButton(), { key: 'ArrowUp' });
		await tick();
		expect(document.activeElement).toBe(menuRows()[2]);
	});

	it('closes on Escape and returns the focus to the button', async () => {
		await renderTrail(520);
		const button = moreButton();
		await fireEvent.click(button, { detail: 0 });
		await tick();
		await fireEvent.keyDown(menuRows()[1]!, { key: 'Escape' });
		await tick();
		expect(screen.queryByRole('menu')).toBeNull();
		expect(button.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(button);
	});

	it('takes the Escape that closes a menu the pointer opened, wherever the focus is', async () => {
		await renderTrail(520);
		await fireEvent.click(moreButton(), { detail: 1 });
		const outside = screen.getByTestId('outside');
		outside.focus();
		const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
		let seenByPage: boolean | null = null;
		// A page handler on the window, as a dock's is: the key reaches it handled.
		const page = (event: Event) => (seenByPage = event.defaultPrevented);
		window.addEventListener('keydown', page);
		outside.dispatchEvent(escape);
		window.removeEventListener('keydown', page);
		await tick();
		expect(screen.queryByRole('menu')).toBeNull();
		expect(seenByPage).toBe(true);
		expect(document.activeElement).toBe(moreButton());
	});

	it('closes on a press outside it, on a chosen row, and when nothing is folded any more', async () => {
		await renderTrail(520);
		await fireEvent.click(moreButton(), { detail: 1 });
		await fireEvent.click(screen.getByTestId('outside'));
		await tick();
		expect(screen.queryByRole('menu')).toBeNull();

		await fireEvent.click(moreButton(), { detail: 1 });
		await fireEvent.click(menuRows()[0]!);
		await tick();
		expect(screen.queryByRole('menu')).toBeNull();

		await fireEvent.click(moreButton(), { detail: 1 });
		expect(screen.queryByRole('menu')).not.toBeNull();
		await resize(802);
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('stays closed when the trail folds again: an unfolding closes the menu, it does not hide it', async () => {
		await renderTrail(520);
		await fireEvent.click(moreButton(), { detail: 1 });
		expect(screen.queryByRole('menu')).not.toBeNull();
		await resize(802);
		expect(screen.queryByRole('menu')).toBeNull();
		await resize(520);
		expect(screen.queryByRole('menu')).toBeNull();
		expect(moreButton().getAttribute('aria-expanded')).toBe('false');
		// Closed, it listens for nothing: an Escape elsewhere leaves the focus.
		const outside = screen.getByTestId('outside');
		outside.focus();
		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(document.activeElement).toBe(outside);
	});

	it('takes the host wording for its button', async () => {
		render(BreadcrumbsHarness, { props: { items: TRAIL, moreLabel: 'Show the full path' } });
		await resize(520);
		const button = screen.getByRole('button', { name: 'Show the full path' });
		expect(button.getAttribute('title')).toBe('Show the full path');
	});
});

describe('Breadcrumbs: the current page gives way last', () => {
	it('shows the first crumb as its icon alone once the folding is not enough, still a link, named in the menu', async () => {
		const { container } = await renderTrail(420);
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		const first = container.querySelector('nav > ol > li:first-child') as HTMLElement;
		const link = first.querySelector('a') as HTMLAnchorElement;
		expect(link.getAttribute('href')).toBe('#/documents');
		expect(link.getAttribute('title')).toBe('Documents');
		expect(link.querySelector('svg')).not.toBeNull();
		// The words stay for a screen reader, out of sight.
		expect(first.querySelector('.breadcrumb-label')?.classList.contains('visually-hidden')).toBe(true);
		// The page still reads whole.
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();

		await fireEvent.click(moreButton(), { detail: 1 });
		expect(menuRows().map((row) => row.textContent?.trim())).toEqual([
			'Documents',
			'Reference',
			'Quality Systems',
			'Package'
		]);
		expect(menuRows()[0]?.getAttribute('href')).toBe('#/documents');
	});

	it('folds the first crumb before the page gives way, the page whole', async () => {
		// 24 + 294 = 318: the button alone and the page.
		const { container } = await renderTrail(320);
		expect(readTrail(container)).toEqual(['…', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
	});

	it('cuts the current page last of all, naming it in full in its tooltip and in the menu', async () => {
		const { container } = await renderTrail(300);
		expect(readTrail(container)).toEqual(['…', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')?.getAttribute('title')).toBe('QP-001 Document Control SOP');

		await fireEvent.click(moreButton(), { detail: 1 });
		const rows = menuRows();
		expect(rows.map((row) => row.textContent?.trim())).toEqual([
			'Documents',
			'Reference',
			'Quality Systems',
			'Package',
			'QP-001 Document Control SOP'
		]);
		const page = rows[4]!;
		expect(page.tagName).not.toBe('A');
		expect(page.getAttribute('aria-current')).toBe('page');
	});

	it('keeps the first crumb in words when it has no icon, then folds it before the page gives way', async () => {
		const items = TRAIL.map((crumb, i) => (i === 0 ? { ...crumb, icon: undefined } : crumb));
		const { container } = await renderTrail(468, items);
		const first = container.querySelector('nav > ol > li:first-child') as HTMLElement;
		expect(first.querySelector('.visually-hidden')).toBeNull();
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		await resize(400);
		expect(readTrail(container)).toEqual(['…', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
	});
});

describe('Breadcrumbs: the current page keeps a readable minimum', () => {
	// Four levels: the pane a chat dock leaves the trail. Package's
	// crumb is 94px; the icon, the button and the page at its 64px minimum
	// are 148px, more than the 97px the trail has.
	const FOUR: BreadcrumbCrumb[] = [
		{ label: 'Documents', href: '#/documents', icon: FolderOutline },
		{ label: 'Reference', href: '#/documents/reference', icon: ChevronRightOutline },
		{ label: 'Quality Systems', href: '#/documents/reference/7', icon: ChevronRightOutline },
		{ label: 'Package', icon: ChevronRightOutline }
	];

	it('folds the first crumb into the menu before the page would go below its minimum', async () => {
		const { container } = await renderTrail(97, FOUR);
		expect(readTrail(container)).toEqual(['…', 'Package']);
		// The button stands first: no separator before it.
		const more = container.querySelector('nav > ol > li:first-child') as HTMLElement;
		expect(more.querySelector('.more-button')).not.toBeNull();
		expect(more.querySelector('svg')).toBeNull();
		// The page keeps its separator and its minimum, named in full in its tooltip.
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('svg')).not.toBeNull();
		expect(leaf.style.getPropertyValue('--gawdux-breadcrumb-leaf-min')).toBe('64px');
		expect(leaf.querySelector('[title]')?.getAttribute('title')).toBe('Package');

		await fireEvent.click(moreButton(), { detail: 1 });
		const rows = menuRows();
		expect(rows.map((row) => row.textContent?.trim())).toEqual([
			'Documents',
			'Reference',
			'Quality Systems',
			'Package'
		]);
		expect(rows[0]?.getAttribute('href')).toBe('#/documents');
		expect(rows[3]?.getAttribute('aria-current')).toBe('page');
	});

	it('reads the page whole again when folding the first crumb frees the room', async () => {
		// 24 + 94 = 118 holds the page whole; 36 + 48 + 94 = 178 brings the
		// first crumb back as its icon.
		const { container } = await renderTrail(147, FOUR);
		expect(readTrail(container)).toEqual(['…', 'Package']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
		await resize(177);
		expect(readTrail(container)).toEqual(['…', 'Package']);
		await resize(178);
		expect(readTrail(container)).toEqual(['Documents', '…', 'Package']);
	});

	it('never sets a page no wider than the minimum wider than itself', async () => {
		const short = FOUR.map((crumb, i) => (i === 3 ? { ...crumb, label: 'QC' } : crumb));
		const { container } = await renderTrail(60, short);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		// 24 + 2 characters
		expect(leaf.style.getPropertyValue('--gawdux-breadcrumb-leaf-min')).toBe('44px');
		expect(leaf.querySelector('[title]')).toBeNull();
	});
});

describe('Breadcrumbs: the focus follows its level when the trail re-plans', () => {
	it('moves from a menu row to its crumb when the trail unfolds and the menu closes', async () => {
		const { container } = await renderTrail(520);
		await fireEvent.click(moreButton(), { detail: 0 });
		await tick();
		await fireEvent.keyDown(menuRows()[0]!, { key: 'ArrowDown' });
		expect(document.activeElement?.textContent?.trim()).toBe('Quality Systems');

		await resize(802);
		await settle();
		expect(screen.queryByRole('menu')).toBeNull();
		expect(document.activeElement).toBe(trailLink(container, '#/documents/reference/7'));
	});

	it('moves to the current page when the level it stood on has no link', async () => {
		const items = TRAIL.map((crumb, i) => (i === 2 ? { ...crumb, href: undefined } : crumb));
		const { container } = await renderTrail(520, items);
		await fireEvent.click(moreButton(), { detail: 1 });
		menuRows()[1]!.focus();

		await resize(802);
		await settle();
		const page = container.querySelector('nav > ol [aria-current="page"]');
		expect(page).not.toBeNull();
		expect(document.activeElement).toBe(page);
	});

	it('moves to the crumb and closes the menu when its level alone comes back to the trail', async () => {
		const { container } = await renderTrail(420);
		await fireEvent.click(moreButton(), { detail: 0 });
		await tick();
		expect(document.activeElement?.textContent?.trim()).toBe('Documents');

		// The first crumb shows in words again; the rest stays folded.
		await resize(520);
		await settle();
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		expect(screen.queryByRole('menu')).toBeNull();
		expect(document.activeElement).toBe(trailLink(container, '#/documents'));
	});

	it('stays on the … button when the button moves', async () => {
		await renderTrail(720);
		moreButton().focus();
		// The button stood for Quality Systems; it now stands for Reference too.
		await resize(620);
		await settle();
		expect(document.activeElement).toBe(moreButton());
	});

	it('stays on the … button when the trail widens and the button moves on', async () => {
		const { container } = await renderTrail(620);
		expect(readTrail(container)).toEqual(['Documents', '…', 'Package', 'QP-001 Document Control SOP']);
		moreButton().focus();
		// Reference comes back to the trail; the button now stands for Quality Systems.
		await resize(720);
		await settle();
		expect(readTrail(container)).toEqual([
			'Documents',
			'Reference',
			'…',
			'Package',
			'QP-001 Document Control SOP'
		]);
		expect(document.activeElement).toBe(moreButton());
	});

	it('keeps a menu opened by the pointer open, the focus on its button, as the trail widens', async () => {
		await renderTrail(620);
		// A press on the button focuses it before its click (jsdom only clicks).
		moreButton().focus();
		await fireEvent.click(moreButton(), { detail: 1 });
		expect(document.activeElement).toBe(moreButton());
		await resize(720);
		await settle();
		expect(screen.getByRole('menu')).not.toBeNull();
		expect(menuRows().map((row) => row.textContent?.trim())).toEqual(['Quality Systems']);
		expect(document.activeElement).toBe(moreButton());
	});

	it('stays on the … button when the first crumb comes back in front of it', async () => {
		const { container } = await renderTrail(377);
		expect(readTrail(container)[0]).toBe('…');
		moreButton().focus();
		await resize(378);
		await settle();
		expect(readTrail(container)[0]).toBe('Documents');
		expect(document.activeElement).toBe(moreButton());
	});

	it('moves from a crumb that folds to the … button standing for it', async () => {
		const { container } = await renderTrail(802);
		trailLink(container, '#/documents/reference/7').focus();
		await resize(720);
		await settle();
		expect(document.activeElement).toBe(moreButton());
	});

	it('leaves the focus where it is when it was not in the trail', async () => {
		await renderTrail(520);
		const outside = screen.getByTestId('outside');
		outside.focus();
		await resize(802);
		await settle();
		expect(document.activeElement).toBe(outside);
	});
});

describe('Breadcrumbs: the room it needs', () => {
	/** The harness writes the report out: the room the trail has, then what it needs whole and with its page whole. */
	const report = () => screen.getByTestId('room').textContent;

	it('reports nothing until it is measured', () => {
		render(BreadcrumbsHarness, { props: { items: TRAIL } });
		expect(report()).toBe('none');
	});

	it('reports the room it has, the room it needs to show whole and the room it needs to show its page whole', async () => {
		await renderTrail(520);
		// Whole: 802. The page whole: the first as its icon (36), the …
		// button (48) and the page (294).
		expect(report()).toBe('520 802 378');
	});

	it('needs the same whatever room it has: a resize changes only the room it has', async () => {
		await renderTrail(520);
		await resize(300);
		expect(report()).toBe('300 802 378');
		await resize(1200);
		expect(report()).toBe('1200 802 378');
	});

	it("reports a new trail's need as soon as it is measured", async () => {
		const { rerender } = await renderTrail(520);
		await rerender({ items: TRAIL.slice(0, 2) });
		await tick();
		// 126 + 114 whole; the first as its icon, 36 + 114, with the page whole.
		expect(report()).toBe('520 240 150');
	});
});

describe('Breadcrumbs: two lines at the compact width', () => {
	/** The window at or below the compact width, for this test. */
	function compactWindow(matches = true) {
		vi.stubGlobal(
			'matchMedia',
			vi.fn((query: string) => ({
				matches: matches && query === BREADCRUMB_STACK_QUERY,
				media: query,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => false
			}))
		);
	}

	it('stacks at the shell compact width', () => {
		expect(BREADCRUMB_STACK_QUERY).toBe('(max-width: 1024px)');
	});

	it('plans the path alone: the current page has a line of its own and is never cut', async () => {
		compactWindow();
		// The path is 126 + 114 + 174 + 94 = 508: it fits at 510 though the
		// whole trail (802) would not fit one line.
		const { container } = await renderTrail(510);
		expect(container.querySelector('nav')?.getAttribute('data-layout')).toBe('adaptive');
		expect(readTrail(container)).toEqual([
			'Documents',
			'Reference',
			'Quality Systems',
			'Package',
			'QP-001 Document Control SOP'
		]);
		expect(screen.queryByRole('button', { name: 'Show the hidden levels' })).toBeNull();

		// 126 + 48 + 94 = 268: the middle of the path folds, the page whole.
		await resize(300);
		expect(readTrail(container)).toEqual(['Documents', '…', 'Package', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li.leaf') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
		expect(leaf.classList.contains('cuts')).toBe(false);
	});

	it("cuts the page's parent last, naming it in the menu, and never the page", async () => {
		compactWindow();
		// 24 + 94 = 118 > 100: the button stands first and Package is cut.
		const { container } = await renderTrail(100);
		expect(readTrail(container)).toEqual(['…', 'Package', 'QP-001 Document Control SOP']);
		const parent = container.querySelector('nav > ol > li[data-level="3"]') as HTMLElement;
		expect(parent.classList.contains('cuts')).toBe(true);
		expect(parent.style.getPropertyValue('--gawdux-breadcrumb-leaf-min')).toBe('64px');
		expect(parent.querySelector('[title]')?.getAttribute('title')).toBe('Package');
		const leaf = container.querySelector('nav > ol > li.leaf') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
		await fireEvent.click(moreButton(), { detail: 1 });
		expect(menuRows().map((row) => row.textContent?.trim())).toEqual([
			'Documents',
			'Reference',
			'Quality Systems',
			'Package'
		]);
	});

	it('keeps one line where the host asks for it', async () => {
		compactWindow();
		const { container } = render(BreadcrumbsHarness, { props: { items: TRAIL, layout: 'line' } });
		await resize(510);
		expect(container.querySelector('nav')?.getAttribute('data-layout')).toBe('line');
		expect(readTrail(container)).toContain('…');
	});

	it("draws the page's words as runs that never break inside themselves", async () => {
		const items = [
			{ label: 'Change controls', href: '#/cc', icon: FolderOutline },
			{ label: 'CC-0003 · Review deployment gate-shots', icon: ChevronRightOutline }
		];
		const { container } = await renderTrail(800, items);
		const words = Array.from(
			container.querySelectorAll<HTMLElement>('nav > ol > li.leaf .word'),
			(word) => word.textContent
		);
		expect(words).toEqual(['CC-0003\u00a0·', 'Review', 'deployment', 'gate-shots']);
		expect(breadcrumbWords(' A  | B ')).toEqual(['A\u00a0|', 'B']);
	});
});

describe('Breadcrumbs: its layout', () => {
	const css = breadcrumbsSource.slice(
		breadcrumbsSource.indexOf('<style>') + 7,
		breadcrumbsSource.lastIndexOf('</style>')
	);
	const root = postcss.parse(css.replace(/:global\(([^()]*)\)/g, '$1'));
	/** The declarations of the rule for `selector`, at the top level or in a media block. */
	function rule(selector: string, media: string | null = null): Record<string, string> {
		const found: Record<string, string> = {};
		root.walkRules((node) => {
			const parent = node.parent as AtRule | undefined;
			const inMedia = parent?.type === 'atrule' ? parent.params : null;
			if (inMedia !== media || !node.selectors.map((s) => s.trim()).includes(selector)) return;
			node.walkDecls((decl) => {
				found[decl.prop] = decl.value;
			});
		});
		return found;
	}
	const COMPACT = '(max-width: 1024px)';
	const A = ".gawdux-breadcrumbs[data-layout='adaptive']";

	it('is one line above the compact width and ellipsizes only a label', () => {
		expect(rule('.trail')).toMatchObject({ 'flex-wrap': 'nowrap', 'white-space': 'nowrap' });
		expect(rule('.breadcrumb-label')).toMatchObject({ 'text-overflow': 'ellipsis' });
		expect(rule('.crumb')).toMatchObject({ flex: '0 0 auto' });
		// The crumb cut last never goes below its readable minimum, which the plan sets.
		expect(rule('.crumb.cuts')).toMatchObject({
			flex: '0 1 auto',
			'min-width': 'var(--gawdux-breadcrumb-leaf-min, 0px)'
		});
		expect(rule('.word')).toMatchObject({ 'white-space': 'nowrap' });
	});

	it('is two lines at it: a smaller muted path, the page on a line of its own wrapping between its words', () => {
		expect(rule(`${A} > .trail`, COMPACT)).toMatchObject({ 'flex-wrap': 'wrap' });
		expect(rule(`${A} .crumb:not(.leaf) .breadcrumb-title`, COMPACT)).toMatchObject({
			'font-size': '0.75rem',
			color: 'var(--gawdux-text-muted)'
		});
		expect(rule(`${A} .crumb.leaf`, COMPACT)).toMatchObject({ flex: '1 0 100%' });
		expect(rule(`${A} .crumb.leaf:not(:first-child) > .breadcrumb-chevron`, COMPACT)).toMatchObject({
			display: 'none'
		});
		expect(rule(`${A} .crumb.leaf .breadcrumb-label`, COMPACT)).toMatchObject({
			'white-space': 'normal',
			overflow: 'visible'
		});
	});
});

describe('one trail', () => {
	it('is Breadcrumbs alone: no slot adapter beside it', () => {
		expect(primitives.Breadcrumbs).toBe(Breadcrumbs);
		expect(primitives).not.toHaveProperty('BreadcrumbTrail');
	});
});
