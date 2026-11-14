import { cleanup, render } from '@testing-library/svelte';
import type { Snippet } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import * as primitives from '../src/lib/primitives/index';
import { PageCommandBarZones } from '../src/lib/primitives/page-command-bar-zones.svelte';
import type { PageCommandBarSlots } from '../src/lib/primitives/page-chrome';
import PageCommandBarZonesHarness from './fixtures/PageCommandBarZonesHarness.svelte';

// The command bar's zones as state an app shell holds: the small class every
// app shell wrote for itself, beside createPageCommandBarRegistry.

afterEach(() => cleanup());

const snip = (label: string): Snippet => ({ label }) as unknown as Snippet;
const labelOf = (snippet: Snippet | null) => (snippet as unknown as { label: string } | null)?.label ?? null;

describe('PageCommandBarZones', () => {
	it('starts empty and is the slots a frame reads', () => {
		const bar = new PageCommandBarZones();
		const slots: PageCommandBarSlots = bar;
		expect([slots.left, slots.center, slots.right]).toEqual([null, null, null]);
		expect(primitives.PageCommandBarZones).toBe(PageCommandBarZones);
	});

	it('fills each zone from its registry, the newest live registration winning', () => {
		const bar = new PageCommandBarZones();
		const back = bar.context.register('left', snip('back'));
		const list = bar.context.register('center', snip('list'));
		bar.context.register('right', snip('count'));
		expect([labelOf(bar.left), labelOf(bar.center), labelOf(bar.right)]).toEqual(['back', 'list', 'count']);

		const detail = bar.context.register('center', snip('detail'));
		expect(labelOf(bar.center)).toBe('detail');
		bar.context.clear(detail);
		expect(labelOf(bar.center)).toBe('list');
		bar.context.update(list, null);
		expect(bar.center).toBeNull();
		bar.context.clear(back);
		expect(bar.left).toBeNull();
		expect(labelOf(bar.right)).toBe('count');
	});

	it('keeps each instance to itself', () => {
		const a = new PageCommandBarZones();
		const b = new PageCommandBarZones();
		a.context.register('center', snip('a'));
		expect(b.center).toBeNull();
		expect(a.context).not.toBe(b.context);
	});

	it("draws what a page puts in the bar in the frame's zones", () => {
		const { container, getByTestId } = render(PageCommandBarZonesHarness);
		const zones = container.querySelector('[data-page-frame-bar]')!;
		expect(zones.querySelector('.cmd-bar-center')?.textContent?.trim()).toBe('Edit');
		expect(zones.querySelector('.cmd-bar-right')?.textContent?.trim()).toBe('3 shown');
		expect(container.querySelector('[data-page-frame-surface]')!.contains(getByTestId('page'))).toBe(true);
	});

	it("puts a drawer's Cancel and confirm in the bar's center zone, in place of the page's acts", () => {
		const { container } = render(PageCommandBarZonesHarness, { props: { signing: true } });
		const center = container.querySelector('[data-page-frame-bar] .cmd-bar-center')!;
		expect([...center.querySelectorAll('button')].map((button) => button.textContent?.trim())).toEqual([
			'Cancel',
			'Sign QA review'
		]);
		const drawer = container.querySelector('[data-sign-drawer]')!;
		expect(container.querySelector('[data-page-frame-surface]')!.contains(drawer)).toBe(true);
		expect(drawer.querySelectorAll('button')).toHaveLength(0);
	});

	it('draws an empty bar when the page puts nothing in it', () => {
		const { container } = render(PageCommandBarZonesHarness, { props: { acts: false } });
		const zones = container.querySelector('[data-page-frame-bar]')!;
		expect(zones.querySelectorAll('button')).toHaveLength(0);
		expect(zones.textContent?.trim()).toBe('');
	});
});
