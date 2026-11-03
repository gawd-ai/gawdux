import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChevronRightOutline, FolderOutline } from 'flowbite-svelte-icons';
import Breadcrumbs from '../src/lib/primitives/Breadcrumbs.svelte';
import breadcrumbsSource from '../src/lib/primitives/Breadcrumbs.svelte?raw';
import BreadcrumbsHarness from './fixtures/BreadcrumbsHarness.svelte';
import * as primitives from '../src/lib/primitives/index';
import type { BreadcrumbCrumb } from '../src/lib/utils/url-breadcrumb';

// jsdom lays nothing out, so the widths are a model: 10px a character, a
// 36px icon in front of the first crumb, a 24px separator in front of every
// other, 48px for the overflow button with its separator and 24px for it
// alone.
// The trail below is 126 + 114 + 174 + 94 + 294 = 802px, and its chip
// ("In force") 80px: 882px in all. The thresholds are worked through in
// breadcrumb-overflow.test.ts.
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
	if (el.classList.contains('trailing')) return CHAR * (el.textContent?.trim().length ?? 0);
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

async function renderTrail(width: number, items: BreadcrumbCrumb[] = TRAIL, status?: string | null) {
	const result = render(BreadcrumbsHarness, { props: { items, ...(status === undefined ? {} : { status }) } });
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
	it('shows the whole trail, its chip beside the current page, and no overflow button', async () => {
		const { container } = await renderTrail(882);
		expect(readTrail(container)).toEqual([
			'Documents',
			'Reference',
			'Quality Systems',
			'Package',
			'QP-001 Document Control SOP'
		]);
		expect(screen.queryByRole('button', { name: 'Show the hidden levels' })).toBeNull();
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('.chip')?.textContent).toBe('In force');
		expect(leaf.querySelector('[title]')).toBeNull();
	});

	it('links every crumb that has an address and marks the page it stands on', async () => {
		const { container } = await renderTrail(882);
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
		const { container } = await renderTrail(800);
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
		const { container } = await renderTrail(700);
		expect(readTrail(container)).toEqual(['Documents', '…', 'Package', 'QP-001 Document Control SOP']);
		await resize(600);
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
		expect(leaf.querySelector('.chip')).not.toBeNull();
	});

	it('re-plans on every resize of its box, giving the crumbs back as room returns', async () => {
		const { container } = await renderTrail(600);
		expect(readTrail(container)).toHaveLength(3);
		await resize(756);
		expect(readTrail(container)).toHaveLength(5);
		await resize(882);
		expect(readTrail(container)).toHaveLength(5);
		expect(screen.queryByRole('button', { name: 'Show the hidden levels' })).toBeNull();
	});

	it('counts the chip beside the current page', async () => {
		const { container, rerender } = await renderTrail(882);
		expect(readTrail(container)).toHaveLength(5);
		await rerender({ items: TRAIL, status: 'In force since today' });
		await resize(882);
		expect(readTrail(container)).toContain('…');
	});

	it('measures a new trail when the page changes', async () => {
		const { container, rerender } = await renderTrail(600);
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		await rerender({ items: TRAIL.slice(0, 3).map((c, i) => (i === 2 ? { ...c, href: undefined } : c)) });
		await resize(600);
		expect(readTrail(container)).toEqual(['Documents', 'Reference', 'Quality Systems']);
	});
});

describe('Breadcrumbs: the overflow menu', () => {
	it('is a menu button that lists the folded levels in order, as links', async () => {
		await renderTrail(600);
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
		await renderTrail(600, items);
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
		await renderTrail(600);
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
		await renderTrail(600);
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
		await renderTrail(600);
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
		await renderTrail(600);
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
		await renderTrail(600);
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
		await resize(882);
		expect(screen.queryByRole('menu')).toBeNull();
	});

	it('stays closed when the trail folds again: an unfolding closes the menu, it does not hide it', async () => {
		await renderTrail(600);
		await fireEvent.click(moreButton(), { detail: 1 });
		expect(screen.queryByRole('menu')).not.toBeNull();
		await resize(882);
		expect(screen.queryByRole('menu')).toBeNull();
		await resize(600);
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
		await resize(600);
		const button = screen.getByRole('button', { name: 'Show the full path' });
		expect(button.getAttribute('title')).toBe('Show the full path');
	});
});

describe('Breadcrumbs: the current page gives way last', () => {
	it('shows the first crumb as its icon alone once the folding is not enough, still a link, named in the menu', async () => {
		const { container } = await renderTrail(500);
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

	it('cuts the current page last of all, naming it in full in its tooltip and in the menu', async () => {
		const { container } = await renderTrail(400);
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')?.getAttribute('title')).toBe('QP-001 Document Control SOP');
		expect(leaf.querySelector('.chip')).not.toBeNull();

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

	it('keeps the first crumb in words when it has no icon, and cuts the page instead', async () => {
		const items = TRAIL.map((crumb, i) => (i === 0 ? { ...crumb, icon: undefined } : crumb));
		const { container } = await renderTrail(480, items);
		const first = container.querySelector('nav > ol > li:first-child') as HTMLElement;
		expect(first.querySelector('.visually-hidden')).toBeNull();
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')?.getAttribute('title')).toBe('QP-001 Document Control SOP');
	});
});

describe('Breadcrumbs: the current page keeps a readable minimum', () => {
	// Four levels, no chip: the pane a chat dock leaves the trail. Package's
	// crumb is 94px; the icon, the button and the page at its 64px minimum
	// are 148px, more than the 97px the trail has.
	const FOUR: BreadcrumbCrumb[] = [
		{ label: 'Documents', href: '#/documents', icon: FolderOutline },
		{ label: 'Reference', href: '#/documents/reference', icon: ChevronRightOutline },
		{ label: 'Quality Systems', href: '#/documents/reference/7', icon: ChevronRightOutline },
		{ label: 'Package', icon: ChevronRightOutline }
	];

	it('folds the first crumb into the menu before the page would go below its minimum', async () => {
		const { container } = await renderTrail(97, FOUR, null);
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
		const { container } = await renderTrail(147, FOUR, null);
		expect(readTrail(container)).toEqual(['…', 'Package']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('[title]')).toBeNull();
		await resize(148);
		expect(readTrail(container)).toEqual(['Documents', '…', 'Package']);
	});

	it('keeps the chip beside the page at its minimum', async () => {
		// 24 + 64 + 80 = 168: the button, the page at its minimum, "In force".
		const { container } = await renderTrail(168);
		expect(readTrail(container)).toEqual(['…', 'QP-001 Document Control SOP']);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		expect(leaf.querySelector('.chip')).not.toBeNull();
		expect(leaf.style.getPropertyValue('--gawdux-breadcrumb-leaf-min')).toBe('144px');
	});

	it('never sets a page no wider than the minimum wider than itself', async () => {
		const short = FOUR.map((crumb, i) => (i === 3 ? { ...crumb, label: 'QC' } : crumb));
		const { container } = await renderTrail(60, short, null);
		const leaf = container.querySelector('nav > ol > li:last-child') as HTMLElement;
		// 24 + 2 characters
		expect(leaf.style.getPropertyValue('--gawdux-breadcrumb-leaf-min')).toBe('44px');
		expect(leaf.querySelector('[title]')).toBeNull();
	});
});

describe('Breadcrumbs: the focus follows its level when the trail re-plans', () => {
	it('moves from a menu row to its crumb when the trail unfolds and the menu closes', async () => {
		const { container } = await renderTrail(600);
		await fireEvent.click(moreButton(), { detail: 0 });
		await tick();
		await fireEvent.keyDown(menuRows()[0]!, { key: 'ArrowDown' });
		expect(document.activeElement?.textContent?.trim()).toBe('Quality Systems');

		await resize(882);
		await settle();
		expect(screen.queryByRole('menu')).toBeNull();
		expect(document.activeElement).toBe(trailLink(container, '#/documents/reference/7'));
	});

	it('moves to the current page when the level it stood on has no link', async () => {
		const items = TRAIL.map((crumb, i) => (i === 2 ? { ...crumb, href: undefined } : crumb));
		const { container } = await renderTrail(600, items);
		await fireEvent.click(moreButton(), { detail: 1 });
		menuRows()[1]!.focus();

		await resize(882);
		await settle();
		const page = container.querySelector('nav > ol [aria-current="page"]');
		expect(page).not.toBeNull();
		expect(document.activeElement).toBe(page);
	});

	it('moves to the crumb and closes the menu when its level alone comes back to the trail', async () => {
		const { container } = await renderTrail(500);
		await fireEvent.click(moreButton(), { detail: 0 });
		await tick();
		expect(document.activeElement?.textContent?.trim()).toBe('Documents');

		// The first crumb shows in words again; the rest stays folded.
		await resize(600);
		await settle();
		expect(readTrail(container)).toEqual(['Documents', '…', 'QP-001 Document Control SOP']);
		expect(screen.queryByRole('menu')).toBeNull();
		expect(document.activeElement).toBe(trailLink(container, '#/documents'));
	});

	it('stays on the … button when the button moves', async () => {
		await renderTrail(800);
		moreButton().focus();
		// The button stood for Quality Systems; it now stands for Reference too.
		await resize(700);
		await settle();
		expect(document.activeElement).toBe(moreButton());
	});

	it('stays on the … button when the trail widens and the button moves on', async () => {
		const { container } = await renderTrail(700);
		expect(readTrail(container)).toEqual(['Documents', '…', 'Package', 'QP-001 Document Control SOP']);
		moreButton().focus();
		// Reference comes back to the trail; the button now stands for Quality Systems.
		await resize(800);
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
		await renderTrail(700);
		// A press on the button focuses it before its click (jsdom only clicks).
		moreButton().focus();
		await fireEvent.click(moreButton(), { detail: 1 });
		expect(document.activeElement).toBe(moreButton());
		await resize(800);
		await settle();
		expect(screen.getByRole('menu')).not.toBeNull();
		expect(menuRows().map((row) => row.textContent?.trim())).toEqual(['Quality Systems']);
		expect(document.activeElement).toBe(moreButton());
	});

	it('stays on the … button when the first crumb comes back in front of it', async () => {
		const { container } = await renderTrail(227);
		expect(readTrail(container)[0]).toBe('…');
		moreButton().focus();
		await resize(228);
		await settle();
		expect(readTrail(container)[0]).toBe('Documents');
		expect(document.activeElement).toBe(moreButton());
	});

	it('moves from a crumb that folds to the … button standing for it', async () => {
		const { container } = await renderTrail(882);
		trailLink(container, '#/documents/reference/7').focus();
		await resize(800);
		await settle();
		expect(document.activeElement).toBe(moreButton());
	});

	it('leaves the focus where it is when it was not in the trail', async () => {
		await renderTrail(600);
		const outside = screen.getByTestId('outside');
		outside.focus();
		await resize(882);
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
		await renderTrail(600);
		// Whole: 802 + the 80px chip. The page whole: the first as its icon
		// (36), the … button (48), the page (294) and the chip (80).
		expect(report()).toBe('600 882 458');
	});

	it('needs the same whatever room it has: a resize changes only the room it has', async () => {
		await renderTrail(600);
		await resize(300);
		expect(report()).toBe('300 882 458');
		await resize(1200);
		expect(report()).toBe('1200 882 458');
	});

	it('counts the chip only when the page has one', async () => {
		await renderTrail(600, TRAIL, null);
		expect(report()).toBe('600 802 378');
	});

	it("reports a new trail's need as soon as it is measured", async () => {
		const { rerender } = await renderTrail(600);
		await rerender({ items: TRAIL.slice(0, 2) });
		await tick();
		// 126 + 114 + 80 whole; the first as its icon, 36 + 114 + 80, with the page whole.
		expect(report()).toBe('600 320 230');
	});
});

describe('Breadcrumbs: one line', () => {
	const css = breadcrumbsSource.slice(breadcrumbsSource.indexOf('<style>'));
	const rule = (selector: string) => {
		const at = css.indexOf(`${selector} {`);
		expect(at, selector).toBeGreaterThan(-1);
		return css.slice(at, css.indexOf('}', at));
	};

	it('never wraps the trail and ellipsizes only a label', () => {
		expect(rule('.trail')).toMatch(/flex-wrap:\s*nowrap/);
		expect(rule('.trail')).toMatch(/white-space:\s*nowrap/);
		expect(rule('.breadcrumb-label')).toMatch(/text-overflow:\s*ellipsis/);
		expect(css).not.toMatch(/flex-wrap:\s*wrap/);
	});

	it('keeps every crumb but the current page at its own width', () => {
		expect(rule('.crumb')).toMatch(/flex:\s*0 0 auto/);
		expect(rule('.crumb.leaf')).toMatch(/flex:\s*0 1 auto/);
		// ...and never below its readable minimum, which the plan sets.
		expect(rule('.crumb.leaf')).toMatch(/min-width:\s*var\(--gawdux-breadcrumb-leaf-min,\s*0px\)/);
		// ...and never below its readable minimum, which the plan sets.
		expect(rule('.crumb.leaf')).toMatch(/min-width:\s*var\(--gawdux-breadcrumb-leaf-min,\s*0px\)/);
		expect(rule('.trailing')).toMatch(/flex:\s*0 0 auto/);
	});
});

describe('one trail', () => {
	it('is Breadcrumbs alone: no slot adapter beside it', () => {
		expect(primitives.Breadcrumbs).toBe(Breadcrumbs);
		expect(primitives).not.toHaveProperty('BreadcrumbTrail');
	});
});
