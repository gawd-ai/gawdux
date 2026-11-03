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
// With `compactBelow` 1024 the account menu is its avatar below a 1024px
// viewport by its own rule, and its full-size probe (`data-room-full`)
// follows the same rule; the scope control has no breakpoint and no probe.
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
let viewport = 1400;
let lastTrail: number | null = null;
const observers = new Set<FakeResizeObserver>();

/** The account menu is its avatar by its own rule: below its breakpoint. */
function narrowByViewport(root: Element): boolean {
	return root.classList.contains('compact-1024') && viewport < 1024;
}

function accountWidth(): number {
	const root = document.querySelector('.account-box [data-user-menu]');
	if (!root) return 0;
	return root.classList.contains('compact') || narrowByViewport(root) ? ACCOUNT.compact : ACCOUNT.full;
}

/** The probe is the menu at full size whatever it shows: it follows the breakpoint only. */
function accountFullWidth(probe: Element): number {
	const root = probe.closest('[data-user-menu]');
	if (!root) return 0;
	return narrowByViewport(root) ? ACCOUNT.compact : ACCOUNT.full;
}

/** Whether the row yields the account menu: the host's `compact`, not its width. */
function accountYields(): boolean {
	return Boolean(document.querySelector('.account-box [data-user-menu]')?.classList.contains('compact'));
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
	if (el.matches('[data-room-full]')) return accountFullWidth(el);
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
async function layout(row: number, at: number = viewport): Promise<string[]> {
	rowWidth = row;
	viewport = at;
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
	viewport = 1400;
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
		for (let row = 500; row <= 1400; row += 13) {
			const passes = await layout(row);
			const room = row - ACCOUNT.full - SCOPE.full;
			const account = WHOLE > room ? 'avatar' : 'full';
			const scope = WHOLE > room + ACCOUNT.full - ACCOUNT.compact ? 'avatar' : 'full';
			expect(passes.length, `${row}px, widening`).toBeLessThanOrEqual(2);
			for (const pass of passes) expect(pass, `${row}px, widening`).toBe(`${account} ${scope}`);
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

// A control as narrow as its avatar by its own rule gives the trail nothing,
// so it never yields; a control whose full width changes with the viewport
// reads that width from its probe, so a breakpoint crossed while it yields
// never shows it full on the way.
describe('a control with a breakpoint of its own', () => {
	const own = { compactBelow: 1024, scope: false };

	/** The row by the rule at full size: the account's full width at this viewport. */
	function expected(row: number, at: number) {
		const full = at < 1024 ? ACCOUNT.compact : ACCOUNT.full;
		const yields = full > ACCOUNT.compact && WHOLE > row - full;
		return { yields, state: yields || full === ACCOUNT.compact ? 'avatar' : 'full' };
	}

	it('never yields below its breakpoint, where it is already its avatar', async () => {
		viewport = 900;
		await renderRow(700, own);
		// 656px beside the avatar is short of 802, but the menu has nothing more to give.
		expect(rowState()).toBe('avatar');
		expect(accountYields()).toBe(false);
		expect(document.querySelector('.account-box .panel')?.getAttribute('title')).toBe('Ada Lovelace');
	});

	it('yields the next control in its place: the one that gives the room', async () => {
		viewport = 900;
		await renderRow(900, { compactBelow: 1024 });
		// 676 beside the controls at full size; the account gives nothing; the scope 136.
		expect(rowState()).toBe('avatar avatar');
		expect(accountYields()).toBe(false);
	});

	it('keeps the avatar as the window widens past its breakpoint where the trail fits only beside it', async () => {
		viewport = 900;
		await renderRow(700, own);
		// 1100px: 660 beside the full menu, 856 beside the avatar.
		const passes = await layout(900, 1100);
		expect(passes.length).toBeGreaterThan(0);
		for (const pass of passes) expect(pass).toBe('avatar');
		expect(accountYields()).toBe(true);
	});

	it('drops the yield as the window narrows past its breakpoint, the full width read from its probe', async () => {
		await renderRow(900, { ...own });
		viewport = 1100;
		await layout(901, 1100);
		expect(accountYields()).toBe(true);
		await layout(700, 900);
		expect(rowState()).toBe('avatar');
		expect(accountYields()).toBe(false);
		// And back: the yield returns at once, the menu never full on the way.
		const passes = await layout(900, 1100);
		for (const pass of passes) expect(pass).toBe('avatar');
		expect(accountYields()).toBe(true);
	});

	it('never oscillates across the breakpoint: every pass shows the rule at full size', async () => {
		const sweep: number[] = [];
		for (let at = 1400; at >= 700; at -= 13) sweep.push(at);
		for (let at = 700; at <= 1400; at += 13) sweep.push(at);
		viewport = sweep[0]!;
		await renderRow(sweep[0]! - 300, own);
		for (const at of sweep) {
			const row = at - 300;
			const passes = await layout(row, at);
			const rule = expected(row, at);
			expect(passes.length, `${at}px`).toBeLessThanOrEqual(2);
			for (const pass of passes) expect(pass, `${at}px`).toBe(rule.state);
			expect(rowState(), `${at}px`).toBe(rule.state);
			expect(accountYields(), `${at}px`).toBe(rule.yields);
		}
	});
});
