import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { HeartOutline } from 'flowbite-svelte-icons';
import HeadCell from '../src/lib/primitives/HeadCell.svelte';
import PlainHeadCellHarness from './fixtures/PlainHeadCellHarness.svelte';

afterEach(() => cleanup());

/** A cell's markup without Svelte's anchor comments. */
const markup = (el: Element) => el.outerHTML.replace(/<!--[^>]*-->/g, '');

describe('HeadCell: the labelled, non-sortable header (column icons)', () => {
	it('without an icon is the bare label in the th a plain TableHeadCell renders', () => {
		const { container } = render(HeadCell, { props: { label: 'Uplink' } });
		const th = container.querySelector('th') as HTMLElement;
		expect(th.textContent?.trim()).toBe('Uplink');
		expect(th.querySelector('svg')).toBeNull();
		expect(th.querySelector('.table-head-label')).toBeNull();
		expect(th.className).toContain('whitespace-nowrap');
		const before = render(PlainHeadCellHarness, { props: { label: 'Uplink' } });
		expect(markup(th)).toBe(markup(before.container.querySelector('th')!));
	});

	it('with an icon renders the one header shape: an aria-hidden icon before the label', () => {
		const { container } = render(HeadCell, { props: { label: 'Status', icon: HeartOutline } });
		const label = container.querySelector('th > .table-head-label') as HTMLElement;
		expect(label).toBeTruthy();
		const [icon, word] = [...label.children] as HTMLElement[];
		expect(icon!.tagName.toLowerCase()).toBe('svg');
		expect(icon!.classList.contains('table-head-icon')).toBe(true);
		expect(icon!.getAttribute('aria-hidden')).toBe('true');
		expect(word!.tagName.toLowerCase()).toBe('span');
		expect(word!.textContent).toBe('Status');
		expect(label.children).toHaveLength(2);
		// The knobs size the icon; the fallback utility is the 16px it shipped at,
		// never flowbite-svelte-icons' own w-5 h-5.
		expect(icon!.getAttribute('class')).toContain('h-4');
		expect(icon!.getAttribute('class')).not.toContain('w-5');
	});

	it('aligns with its column and passes its classes to the th', () => {
		const { container } = render(HeadCell, {
			props: { label: 'Latency', icon: HeartOutline, align: 'right', className: 'w-24' }
		});
		const th = container.querySelector('th') as HTMLElement;
		expect(th.className).toContain('text-right');
		expect(th.className).toContain('w-24');
		expect(th.className).toContain('whitespace-nowrap');
		cleanup();
		const centered = render(HeadCell, { props: { label: 'Actions', align: 'center' } });
		expect(centered.container.querySelector('th')!.className).toContain('text-center');
	});

	it('keeps the same th with or without an icon, so a header row does not move', () => {
		const plain = render(HeadCell, { props: { label: 'When', className: 'w-32' } });
		const plainClass = plain.container.querySelector('th')!.className;
		cleanup();
		const iconed = render(HeadCell, { props: { label: 'When', icon: HeartOutline, className: 'w-32' } });
		expect(iconed.container.querySelector('th')!.className).toBe(plainClass);
	});
});
