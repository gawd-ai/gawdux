import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { GlobeOutline } from 'flowbite-svelte-icons';
import IconLabel from '../src/lib/primitives/IconLabel.svelte';

afterEach(() => cleanup());

describe('IconLabel', () => {
	it('aligns an icon and a word on one line', () => {
		const { container } = render(IconLabel, {
			props: { icon: GlobeOutline, label: 'Wired', iconClass: 'text-emerald-600' }
		});
		const root = container.querySelector('.icon-label') as HTMLElement;
		expect(root.className).toContain('inline-flex');
		expect(root.className).toContain('items-center');
		const svg = root.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(root.firstElementChild).toBe(svg);
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		const iconClass = svg?.getAttribute('class') ?? '';
		expect(iconClass).toContain('h-4');
		expect(iconClass).toContain('shrink-0');
		expect(iconClass).toContain('text-emerald-600');
		expect(screen.getByText('Wired')).toBeTruthy();
	});

	it('renders the word alone when there is no icon', () => {
		const { container } = render(IconLabel, { props: { label: 'None' } });
		expect(container.querySelector('svg')).toBeNull();
		expect(container.querySelector('.icon-label')?.textContent?.trim()).toBe('None');
	});

	it('sizes the icon box to the text', () => {
		const { container } = render(IconLabel, {
			props: { icon: GlobeOutline, label: 'LTE', size: 'xs' }
		});
		const cls = container.querySelector('svg')?.getAttribute('class') ?? '';
		expect(cls).toContain('h-3');
		expect(cls).toContain('w-3');
		expect(container.querySelector('.icon-label')?.className).toContain('gap-1');
	});

	it('truncates a long word on request and carries a title', () => {
		const { container } = render(IconLabel, {
			props: { label: 'A very long carrier name', truncate: true, title: 'A very long carrier name' }
		});
		const word = screen.getByText('A very long carrier name');
		expect(word.className).toContain('truncate');
		expect(word.className).toContain('min-w-0');
		expect(container.querySelector('.icon-label')?.getAttribute('title')).toBe(
			'A very long carrier name'
		);
	});
});
