import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import PageFrameHarness from './fixtures/PageFrameHarness.svelte';

afterEach(() => cleanup());

// The page's one frame: the page's main landmark holds the frame's panel, the
// content surface and, under it in the same panel, the command bar, filled
// from what the page registers. Its geometry (the seam, the gutter, the
// elevation) is drawn by tokens.css and measured in a real browser by hosts.
describe('PageFrame', () => {
	it("holds the page in its surface and the bar under it, in one panel, in the page's main", () => {
		const { container } = render(PageFrameHarness);
		const main = container.querySelector('main')!;
		expect(main.classList.contains('page-frame')).toBe(true);
		expect(main.getAttribute('data-probe')).toBe('frame');
		expect(main.getAttribute('aria-label')).toBe('Page');
		expect(container.querySelectorAll('main')).toHaveLength(1);
		const panel = main.querySelector(':scope > .page-frame-panel')!;
		const [surface, bar] = [...panel.children] as HTMLElement[];
		expect(surface!.matches('.page-frame-surface[data-page-frame-surface]')).toBe(true);
		expect(surface!.contains(screen.getByTestId('page'))).toBe(true);
		expect(bar!.matches('.page-command-bar[data-page-frame-bar]')).toBe(true);
		expect([...bar!.children].map((zone) => zone.className)).toEqual([
			'cmd-bar-zone cmd-bar-left',
			'cmd-bar-zone cmd-bar-center',
			'cmd-bar-zone cmd-bar-right'
		]);
	});

	it("draws what the page puts in the bar in its zone, and an empty bar's zones empty", async () => {
		const { container, rerender } = render(PageFrameHarness, { props: { acts: true } });
		const center = container.querySelector('.cmd-bar-center')!;
		expect(center.querySelector('button')?.textContent).toBe('Submit');
		// The page's acts are drawn in the bar, never in the page's surface.
		expect(container.querySelector('.page-frame-surface button')).toBeNull();
		await rerender({ acts: false });
		for (const zone of container.querySelectorAll('.cmd-bar-zone')) {
			expect(zone.childElementCount).toBe(0);
		}
	});

	it("draws a decision's pair in the bar: Cancel neutral, red only while it would discard input", async () => {
		const { container, rerender } = render(PageFrameHarness, { props: { pair: true } });
		const cancel = () => container.querySelector<HTMLButtonElement>('.cmd-bar-center [data-action-cancel]')!;
		const act = container.querySelector<HTMLButtonElement>('.cmd-bar-center [data-action-confirm]')!;
		expect(cancel().dataset.tone).toBe('neutral');
		expect(cancel().className).not.toMatch(/text-red-/);
		expect(act.dataset.tone).toBe('red');
		expect(act.className).toMatch(/text-red-/);
		await rerender({ pair: true, discards: true });
		expect(cancel().dataset.tone).toBe('red');
		expect(cancel().className).toMatch(/text-red-/);
		await rerender({ pair: true, discards: false });
		expect(cancel().dataset.tone).toBe('neutral');
	});
});
