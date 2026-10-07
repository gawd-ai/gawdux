import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ServerOutline } from 'flowbite-svelte-icons';
import StatTile from '../src/lib/primitives/StatTile.svelte';
import StatTileSlotsHarness from './fixtures/StatTileSlotsHarness.svelte';
import StatTileStripHarness from './fixtures/StatTileStripHarness.svelte';

afterEach(() => cleanup());

const tile = (container: HTMLElement) => container.querySelector('.stat-tile') as HTMLElement;

describe('StatTile', () => {
	it('renders label, value and meta in the tile recipe', () => {
		const { container } = render(StatTile, {
			props: { label: 'Uplink', value: 'Wired', meta: 'Since 3d 4h', metaTitle: '2026-10-04 09:12:00' }
		});
		const root = tile(container);
		expect(root.tagName).toBe('DIV');
		expect(root.dataset.tone).toBe('neutral');
		expect(root.className).toContain('rounded-lg');
		expect(root.className).toContain('border');
		expect(root.className).toContain('p-[var(--gawdux-tile-padding,0.75rem)]');
		const label = screen.getByText('Uplink');
		expect(label.className).toContain('uppercase');
		expect(label.className).toContain('text-[10px]');
		const value = screen.getByText('Wired');
		expect(value.className).toContain('text-lg');
		expect(value.className).toContain('tabular-nums');
		expect(value.getAttribute('title')).toBe('Wired');
		expect(screen.getByText('Since 3d 4h').getAttribute('title')).toBe('2026-10-04 09:12:00');
	});

	it('tints the tile with a state tone', () => {
		const tones = {
			ok: 'bg-emerald-50',
			warn: 'bg-yellow-50',
			bad: 'bg-red-50',
			info: 'bg-blue-50'
		} as const;
		for (const [tone, cls] of Object.entries(tones)) {
			const { container } = render(StatTile, {
				props: { label: 'Health', value: 'x', tone: tone as keyof typeof tones }
			});
			expect(tile(container).dataset.tone).toBe(tone);
			expect(tile(container).className).toContain(cls);
			cleanup();
		}
	});

	it('shows a tone dot, pinging only on attention and only with motion allowed', () => {
		const { container } = render(StatTile, {
			props: { label: 'Connection', value: 'Offline', tone: 'bad', dot: true }
		});
		const dot = container.querySelector('[data-stat-tile-dot]');
		expect(dot).toBeTruthy();
		expect(dot?.querySelectorAll('span')).toHaveLength(1);
		expect(dot?.querySelector('span')?.className).toContain('bg-red-500');
		cleanup();

		const pinging = render(StatTile, {
			props: { label: 'Connection', value: 'Offline', tone: 'bad', pulse: true }
		});
		const ping = pinging.container.querySelector('[data-stat-tile-dot] span');
		expect(ping?.className).toContain('motion-safe:animate-ping');
	});

	it('drills down through a small text button, never the whole tile', async () => {
		const onclick = vi.fn();
		const { container } = render(StatTile, {
			props: { label: 'Systems', value: '4/5', meta: '1 down', onclick }
		});
		const root = tile(container);
		expect(root.tagName).toBe('DIV');
		expect(root.getAttribute('role')).toBeNull();
		const button = screen.getByRole('button', { name: /View details/ });
		expect(button.className).toContain('text-[10px]');
		await fireEvent.click(button);
		expect(onclick).toHaveBeenCalledTimes(1);
		// Clicking the tile body does nothing.
		await fireEvent.click(screen.getByText('4/5'));
		expect(onclick).toHaveBeenCalledTimes(1);
	});

	it('drills down through a link when given an href, with the host wording', () => {
		render(StatTile, {
			props: { label: 'Alerts', value: 3, href: '/alerts?open', actionLabel: 'Open alerts' }
		});
		const link = screen.getByRole('link', { name: /Open alerts/ });
		expect(link.getAttribute('href')).toBe('/alerts?open');
		expect(screen.queryByRole('button')).toBeNull();
	});

	it('renders no drill-down without a handler or target', () => {
		render(StatTile, { props: { label: 'Network', value: 2 } });
		expect(screen.queryByRole('button')).toBeNull();
		expect(screen.queryByRole('link')).toBeNull();
	});

	it('renders an icon before the label', () => {
		const { container } = render(StatTile, { props: { label: 'Devices', value: 8, icon: ServerOutline } });
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		expect(svg?.nextElementSibling?.textContent).toBe('Devices');
	});

	it('has a nested variant for tiles inside a card', () => {
		const { container } = render(StatTile, { props: { label: 'Riders', value: 12, nested: true } });
		const root = tile(container);
		expect(root.className).not.toMatch(/(^|\s)border(\s|$)/);
		expect(root.className).toContain('bg-gray-50');
		expect(root.className).toContain('p-[var(--gawdux-tile-padding-nested,0.625rem)]');
		expect(screen.getByText('12').className).toContain('text-base');
	});

	it('merges a value class over the default colour', () => {
		render(StatTile, {
			props: { label: 'Open alerts', value: 2, valueClass: 'text-red-600 dark:text-red-400' }
		});
		const value = screen.getByText('2');
		expect(value.className).toContain('text-red-600');
		expect(value.className).not.toContain('text-gray-900');
	});

	it('omits the value row when there is no value, and renders aside and body snippets', () => {
		render(StatTileSlotsHarness);
		expect(screen.getByTestId('aside').textContent).toBe('2m ago');
		expect(screen.getByTestId('body').textContent).toBe('ETH default route');
		expect(document.querySelector('.stat-tile .text-lg')).toBeNull();
	});
});

describe('StatTileStrip', () => {
	const TEMPLATE =
		'grid-cols-[repeat(auto-fit,minmax(min(100%,var(--gawdux-tile-min-width,9rem)),1fr))]';

	it('lays the tiles out on an auto-fit grid that wraps instead of clipping', () => {
		const { container } = render(StatTileStripHarness, { props: { count: 7 } });
		const strip = container.querySelector('.stat-tile-strip') as HTMLElement;
		expect(strip.getAttribute('role')).toBe('group');
		expect(strip.getAttribute('aria-label')).toBe('Release vitals');
		expect(strip.querySelectorAll('.stat-tile')).toHaveLength(7);
		expect(strip.className).toContain('grid');
		expect(strip.className).toContain(TEMPLATE);
		expect(strip.className).toContain('gap-[var(--gawdux-tile-gap,0.75rem)]');
		// Nothing that could hold the tiles on one line or scroll them sideways.
		for (const forbidden of ['flex-nowrap', 'whitespace-nowrap', 'overflow-x', 'grid-cols-7']) {
			expect(strip.className).not.toContain(forbidden);
		}
		// Every tile can shrink below its content inside its column.
		for (const tileEl of strip.querySelectorAll('.stat-tile')) {
			expect(tileEl.className).toContain('min-w-0');
		}
	});

	it('fits seven tiles inside 1024px without horizontal overflow', () => {
		// The grid's own arithmetic for repeat(auto-fit, minmax(min(100%, M), 1fr)):
		// as many M-wide tracks as fit, the occupied ones sharing the width, the
		// rest wrapping. A column is never wider than the strip (min(100%, M)).
		const width = 1024;
		const gap = 12; // gap-3
		const min = Math.min(width, 9 * 16); // 9rem
		const tracks = Math.max(1, Math.floor((width + gap) / (min + gap)));
		const perRow = Math.min(7, tracks);
		const column = (width - (perRow - 1) * gap) / perRow;
		expect(column).toBeGreaterThanOrEqual(min);
		expect(perRow * column + (perRow - 1) * gap).toBeLessThanOrEqual(width);
		expect(Math.ceil(7 / perRow)).toBe(2); // wraps onto a second row
	});

	it('takes a per-strip minimum tile width', () => {
		const { container } = render(StatTileStripHarness, { props: { count: 3, minTileWidth: '12rem' } });
		const strip = container.querySelector('.stat-tile-strip') as HTMLElement;
		expect(strip.style.getPropertyValue('--gawdux-tile-min-width')).toBe('12rem');
	});
});
