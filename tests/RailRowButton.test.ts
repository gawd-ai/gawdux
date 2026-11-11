import { cleanup, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { FileOutline } from 'flowbite-svelte-icons';
import { afterEach, describe, expect, it } from 'vitest';
import RailRowButton from '../src/lib/primitives/RailRowButton.svelte';
import IconButton from '../src/lib/primitives/IconButton.svelte';
import TabTitle from '../src/lib/primitives/TabTitle.svelte';

afterEach(() => cleanup());

// The rail row owns its layout (the icon on the title line in the house
// icon's box, the meta line under it at the row's edge), and the icons a
// header, a tab and a rail row show are the house icon.
describe('RailRowButton', () => {
	it('lays the icon, the title and the trailing marks on one line, the meta under it at the row edge', () => {
		const trailing = createRawSnippet(() => ({ render: () => '<span data-badge>Default</span>' }));
		const { container } = render(RailRowButton, {
			props: { title: 'Audit Report', meta: 'audit_report · QA Review', icon: FileOutline, trailing }
		});
		const button = screen.getByRole('button', { name: /Audit Report/ });
		const line = button.querySelector(':scope > .rail-row-line')!;
		const meta = button.querySelector(':scope > .rail-row-meta')!;
		expect(line).toBeTruthy();
		expect(meta.textContent).toBe('audit_report · QA Review');
		expect(line.contains(meta)).toBe(false);
		const icon = line.querySelector(':scope > .rail-row-icon')!;
		expect(icon.classList.contains('gawdux-icon')).toBe(true);
		expect(icon.querySelector('svg')!.getAttribute('class')).toContain('gawdux-icon');
		expect(line.querySelector(':scope > .rail-row-title')!.textContent).toBe('Audit Report');
		expect(line.querySelector(':scope > .rail-row-trailing [data-badge]')).toBeTruthy();
		expect(container.querySelector('[data-master-detail-row]')).toBe(button);
	});

	it('draws no meta line and no icon box when it is given none', () => {
		render(RailRowButton, { props: { title: 'QA' } });
		const button = screen.getByRole('button', { name: 'QA' });
		expect(button.querySelector('.rail-row-meta')).toBeNull();
		expect(button.querySelector('.rail-row-icon')).toBeNull();
	});

	it('marks the selected row', () => {
		render(RailRowButton, { props: { title: 'QA', selected: true } });
		expect(screen.getByRole('button', { name: 'QA' }).getAttribute('aria-current')).toBe('true');
	});
});

describe('the house icon', () => {
	it("is a header icon button's icon; a row's stays 16px", () => {
		render(IconButton, { props: { icon: FileOutline, label: 'Open', size: 'md' } });
		render(IconButton, { props: { icon: FileOutline, label: 'Remove', size: 'sm' } });
		const md = screen.getByRole('button', { name: 'Open' }).querySelector('svg')!;
		const sm = screen.getByRole('button', { name: 'Remove' }).querySelector('svg')!;
		expect(md.getAttribute('class')).toContain('gawdux-icon');
		expect(md.getAttribute('class')).not.toMatch(/\bh-4\b/);
		expect(sm.getAttribute('class')).toMatch(/\bh-4\b/);
	});

	it("is a tab's icon", () => {
		const { container } = render(TabTitle, { props: { icon: FileOutline, label: 'Content' } });
		expect(container.querySelector('.gawdux-control-icon')!.classList.contains('gawdux-icon')).toBe(true);
		expect(container.querySelector('svg')!.getAttribute('class')).toContain('gawdux-icon');
	});
});
