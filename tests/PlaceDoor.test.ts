// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/svelte';
import { ClockOutline } from 'flowbite-svelte-icons';
import PlaceDoor from '../src/lib/shell/PlaceDoor.svelte';

afterEach(() => cleanup());

describe('PlaceDoor', () => {
	it('captions the place alone and says what it does in its accessible name', () => {
		const { container } = render(PlaceDoor, {
			props: { place: 'History', href: '/app/history/7', icon: ClockOutline }
		});
		const door = container.querySelector<HTMLAnchorElement>('[data-place-door]')!;
		expect(door.tagName).toBe('A');
		expect(door.getAttribute('href')).toBe('/app/history/7');
		expect(door.textContent?.trim()).toBe('History');
		expect(door.getAttribute('aria-label')).toBe('Open in History');
		expect(door.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
	});

	it('carries the hook a test finds it by, and a name the host words', () => {
		const { container } = render(PlaceDoor, {
			props: {
				place: 'Records',
				href: '/app/records',
				icon: ClockOutline,
				size: 'xs',
				hook: 'data-open-records',
				label: 'Open in Records, new tab'
			}
		});
		const door = container.querySelector<HTMLElement>('[data-open-records]')!;
		expect(door).not.toBeNull();
		expect(door.getAttribute('aria-label')).toBe('Open in Records, new tab');
		expect(door.getAttribute('aria-label')).toContain(door.textContent!.trim());
	});
});
