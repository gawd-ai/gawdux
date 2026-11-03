import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChevronRightOutline, FolderOutline } from 'flowbite-svelte-icons';
import RoomYieldHeaderHarness from './fixtures/RoomYieldHeaderHarness.svelte';
import type { BreadcrumbCrumb } from '../src/lib/utils/url-breadcrumb';

// jsdom lays nothing out, so the row is a model. The trail is the one in
// Breadcrumbs.test.ts without its chip: 802px whole, 378px with its page
// whole. The account menu is 240px, 44px as its avatar; the scope control
// 180px, 44px. The trail's box is the row less the controls as laid out.
const CHAR = 10;
const ACCOUNT = { full: 240, compact: 44 };
const SCOPE = { full: 180, compact: 44 };
const WHOLE = 802;

const TRAIL: BreadcrumbCrumb[] = [
	{ label: 'Documents', href: '#/documents', icon: FolderOutline },
	{ label: 'Reference', href: '#/documents/reference', icon: ChevronRightOutline },
	{ label: 'Quality Systems', href: '#/documents/reference/7', icon: ChevronRightOutline },
	{ label: 'Package', href: '#/documents/reference/9', icon: ChevronRightOutline },
	{ label: 'QP-001 Document Control SOP', icon: ChevronRightOutline }
];

let rowWidth = 0;
let lastTrail: number | null = null;
const observers = new Set<FakeResizeObserver>();

function accountWidth(): number {
	const root = document.querySelector('.account-box [data-user-menu]');
	if (!root) return 0;
	return root.classList.contains('compact') ? ACCOUNT.compact : ACCOUNT.full;
}

function scopeWidth(): number {
	const box = document.querySelector<HTMLElement>('.scope-box');
	if (!box) return 0;
	return box.dataset.yields === 'true' ? SCOPE.compact : SCOPE.full;
}

function trailWidth(): number {
	return rowWidth - accountWidth() - scopeWidth();
}

function modelWidth(el: Element): number {
	if (el.matches('.account-box')) return accountWidth();
	if (el.matches('.scope-box')) return scopeWidth();
	const measure = el.getAttribute('data-measure');
	const label = el.querySelector('.breadcrumb-label')?.textContent?.length ?? 0;
	if (measure === 'crumb') return (el.getAttribute('data-index') === '0' ? 36 : 24) + CHAR * label;
	if (measure === 'more') return 48;
	if (measure === 'more-lead') return 24;
	if (measure === 'first-compact') return 36;
	return 0;
}

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
			contentRect: { width: target.matches('nav') ? trailWidth() : modelWidth(target) }
		}));
		this.callback(entries as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver);
	}
}

function rowState(): string {
	const account = accountWidth() === ACCOUNT.compact ? 'avatar' : 'full';
	if (!document.querySelector('.scope-box')) return account;
	return `${account} ${scopeWidth() === SCOPE.compact ? 'avatar' : 'full'}`;
}

/**
 * Lays the row out `row` wide the way a browser would: the trail's box
 * reports each size it takes, a yield included, until it takes no new one.
 * Returns the states the row passed through; a row that oscillates never
 * settles and runs out of passes.
 */
async function layout(row: number): Promise<string[]> {
	rowWidth = row;
	const passes: string[] = [];
	for (let pass = 0; pass < 8; pass++) {
		const width = trailWidth();
		if (width === lastTrail) break;
		lastTrail = width;
		for (const observer of observers) observer.fire();
		await tick();
		await tick();
		passes.push(rowState());
	}
	return passes;
}

/** The live trail as it reads: a crumb's words, or … for the overflow button. */
function readTrail(container: HTMLElement): string[] {
	const rows = container.querySelectorAll<HTMLElement>('nav.gawdux-breadcrumbs > ol > li');
	return Array.from(rows, (li) =>
		li.querySelector('.more-button') ? '…' : (li.querySelector('.breadcrumb-label')?.textContent ?? '')
	);
}

const WHOLE_TRAIL = TRAIL.map((crumb) => crumb.label);

async function renderRow(row: number, props: Record<string, unknown> = {}) {
	const result = render(RoomYieldHeaderHarness, { props: { items: TRAIL, ...props } });
	const passes = await layout(row);
	return { ...result, passes };
}

beforeEach(() => {
	lastTrail = null;
	vi.stubGlobal('ResizeObserver', FakeResizeObserver);
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
		const width = modelWidth(this);
		return { x: 0, y: 0, top: 0, left: 0, bottom: 44, right: width, width, height: 44, toJSON() {} } as DOMRect;
	});
});

afterEach(() => {
	cleanup();
	observers.clear();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('header controls that yield their room to the trail', () => {
	it('keeps every control at full size while the trail fits whole beside them', async () => {
		const { container } = await renderRow(WHOLE + ACCOUNT.full + SCOPE.full);
		expect(rowState()).toBe('full full');
		expect(readTrail(container)).toEqual(WHOLE_TRAIL);
	});

	it('shows the account menu as its avatar when the trail needs room, and the trail reads whole', async () => {
		const { container, passes } = await renderRow(WHOLE + ACCOUNT.full + SCOPE.full - 1);
		expect(rowState()).toBe('avatar full');
		expect(readTrail(container)).toEqual(WHOLE_TRAIL);
		// One pass decides, the next sees the room the yield gave and keeps it.
		expect(passes).toEqual(['avatar full', 'avatar full']);
	});

	it('yields the next control only when the first is not enough', async () => {
		const { container } = await renderRow(900);
		// 480 at full size; 676 with the avatar; 812 with both.
		expect(rowState()).toBe('avatar avatar');
		expect(readTrail(container)).toEqual(WHOLE_TRAIL);
	});

	it('never oscillates: at every width the row settles in two passes on the rule at full size', async () => {
		const { container } = await renderRow(1400);
		for (let row = 1400; row >= 500; row -= 13) {
			const passes = await layout(row);
			const room = row - ACCOUNT.full - SCOPE.full;
			const account = WHOLE > room ? 'avatar' : 'full';
			const scope = WHOLE > room + ACCOUNT.full - ACCOUNT.compact ? 'avatar' : 'full';
			expect(passes.length, `${row}px`).toBeLessThanOrEqual(2);
			expect(rowState(), `${row}px`).toBe(`${account} ${scope}`);
			// The trail's own state after a yield is never read: firing again changes nothing.
			for (const observer of observers) observer.fire();
			await tick();
			expect(rowState(), `${row}px, again`).toBe(`${account} ${scope}`);
		}
		expect(readTrail(container)).toContain('QP-001 Document Control SOP');
	});

	it('gives the room back as soon as the trail fits beside the full-size controls', async () => {
		await renderRow(900);
		expect(rowState()).toBe('avatar avatar');
		await layout(WHOLE + ACCOUNT.full + SCOPE.full - 1);
		expect(rowState()).toBe('avatar full');
		await layout(WHOLE + ACCOUNT.full + SCOPE.full);
		expect(rowState()).toBe('full full');
	});

	it('keeps the account menu a menu button named for the person, and opens the same menu from the avatar', async () => {
		const { container } = await renderRow(1000);
		expect(rowState()).toBe('avatar avatar');
		const trigger = screen.getByRole('button', { name: 'Account menu for Ada Lovelace' });
		expect(container.querySelector('.account-box .panel')?.getAttribute('title')).toBe('Ada Lovelace');
		await fireEvent.keyDown(trigger, { key: 'ArrowDown' });
		await tick();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(rowState()).toBe('avatar avatar');
	});

	it("reads the need the host names: the trail's page whole yields less", async () => {
		await renderRow(700, { need: 'page' });
		// 280 at full size is short of 378; 476 with the avatar is enough.
		expect(rowState()).toBe('avatar full');
	});

	it('leaves a control the row does not show out of the plan', async () => {
		const { container } = await renderRow(1000, { scope: false });
		// 760 beside the full account menu, 956 beside its avatar.
		expect(rowState()).toBe('avatar');
		expect(readTrail(container)).toEqual(WHOLE_TRAIL);
	});
});
