import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { BellOutline } from 'flowbite-svelte-icons';
import StatusBadge from '../src/lib/primitives/StatusBadge.svelte';

afterEach(() => cleanup());

const badge = (container: HTMLElement) => container.querySelector('span') as HTMLSpanElement;

describe('StatusBadge', () => {
	it('renders exactly as before when no icon is given', () => {
		// The 0.13.1 class string, byte for byte: the icon is purely additive.
		const { container } = render(StatusBadge, { props: { color: 'green', label: 'Online' } });
		expect(badge(container).className).toBe(
			'inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full'
		);
		expect(badge(container).textContent).toBe('Online');
		expect(badge(container).querySelector('svg')).toBeNull();
	});

	it('renders the icon before the word, decorative, in the badge colour', () => {
		const { container } = render(StatusBadge, {
			props: { color: 'red', label: 'Critical', icon: BellOutline }
		});
		const root = badge(container);
		const svg = root.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(root.firstElementChild).toBe(svg);
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		expect(svg?.getAttribute('class')).toContain('h-3');
		expect(svg?.getAttribute('class')).toContain('w-3');
		expect(root.className).toContain('gap-1');
		expect(root.textContent?.trim()).toBe('Critical');
		expect(screen.getByText('Critical')).toBeTruthy();
	});

	it('merges an icon class over the icon defaults', () => {
		const { container } = render(StatusBadge, {
			props: { color: 'blue', label: 'Info', icon: BellOutline, iconClass: 'h-4 w-4' }
		});
		const cls = badge(container).querySelector('svg')?.getAttribute('class') ?? '';
		expect(cls).toContain('h-4');
		expect(cls).not.toMatch(/\bh-3\b/);
	});

	it('has an orange for a major severity', () => {
		const { container } = render(StatusBadge, { props: { color: 'orange', label: 'Major' } });
		const cls = badge(container).className;
		for (const token of ['bg-orange-100', 'text-orange-800', 'dark:bg-orange-900', 'dark:text-orange-300']) {
			expect(cls).toContain(token);
		}
	});

	it('still merges a caller class over the base', () => {
		const { container } = render(StatusBadge, {
			props: { color: 'dark', label: 'Unknown', rounded: false, class: 'px-1' }
		});
		const cls = badge(container).className;
		expect(cls).toContain('px-1');
		expect(cls).not.toContain('px-2.5');
		expect(cls).toContain('rounded');
	});
});
